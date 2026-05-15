import { createUniqueKey, hashPassword, json, badRequest, serverError, unauthorized, notFound, signToken, verifyToken, getFileList, generateKey } from './lib.js';
import { viewPage, errorPage, renderShareContent } from './html.js';

const MAX_TEXT_SIZE = 10000;

export async function createShare(request, env, ctx) {
  try {
    // 频率限制：每分钟 5 次
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rlKey = `rl:${ip}`;
    const rlCount = await env.SHARES_KV.get(rlKey);
    if (rlCount && parseInt(rlCount) >= 5) {
      return json({ error: '请求过于频繁，请稍后重试' }, 429);
    }
    await env.SHARES_KV.put(rlKey, String((parseInt(rlCount) || 0) + 1), { expirationTtl: 60 });
    const ct = request.headers.get('Content-Type') || '';
    let type, content, expire, password;
    const uploadedFiles = [];

    if (ct.includes('multipart/form-data')) {
      const form = await request.formData();
      type = form.get('type');
      expire = form.get('expire') || '30m';
      password = form.get('password') || null;
      if (type === 'file') {
        for (const f of form.getAll('file')) {
          if (f instanceof File && f.size > 0) uploadedFiles.push(f);
        }
      }
    } else {
      const body = await request.json();
      type = body.type;
      content = body.content;
      expire = body.expire || '30m';
      password = body.password || null;
    }

    if (!type || !['text', 'file'].includes(type)) return badRequest('类型无效');
    if (type === 'text' && !content?.trim()) return badRequest('内容不能为空');
    if (type === 'text' && content.length > MAX_TEXT_SIZE) return badRequest('文本内容超出最大字符限制');
    if (type === 'file' && uploadedFiles.length === 0) return badRequest('请至少选择一个文件');
    if (type === 'file' && uploadedFiles.length > 5) return badRequest('最多 5 个文件');

    if (type === 'file') {
      const maxBytes = parseInt(env.MAX_UPLOAD_SIZE_MB || '50', 10) * 1024 * 1024;
      for (const f of uploadedFiles) {
        if (f.size > maxBytes) return badRequest(`文件 "${f.name}" 超出大小限制`);
      }
    }

    const ttlMap = { '30m': 1800, '1h': 3600, '6h': 21600, '12h': 43200 };
    if (expire && !Object.hasOwn(ttlMap, expire)) return badRequest('过期时间无效');
    const ttl = ttlMap[expire] || undefined;

    const key = await createUniqueKey(env.SHARES_KV);
    const now = Math.floor(Date.now() / 1000);

    const shareData = {
      type,
      content: type === 'text' ? content : null,
      hasPassword: !!password,
      createdAt: now,
      expiresAt: ttl ? now + ttl : null,
      expireLabel: expire,
    };

    if (password) {
      await env.SHARES_KV.put(`pass:${key}`, await hashPassword(password), { expirationTtl: ttl });
    }

    let totalSize = 0;
    if (type === 'file' && uploadedFiles.length > 0) {
      const files = [];
      for (let i = 0; i < uploadedFiles.length; i++) {
        const f = uploadedFiles[i];
        const r2Key = `files/${key}/${i}-${f.name}`;
        await env.BUCKET_R2.put(r2Key, await f.arrayBuffer(), {
          httpMetadata: { contentType: f.type },
          customMetadata: { filename: f.name },
        });
        files.push({ name: f.name, size: f.size, type: f.type, key: r2Key });
        totalSize += f.size;
      }
      shareData.files = files;
    }

    await env.SHARES_KV.put(`share:${key}`, JSON.stringify(shareData), { expirationTtl: ttl });

    return json({
      key, type,
      hasPassword: !!password,
      expire,
      charCount: type === 'text' ? (content?.length || 0) : undefined,
      size: type === 'file' ? totalSize : undefined,
      fileCount: type === 'file' ? uploadedFiles.length : undefined,
    });
  } catch (e) {
    return serverError('服务器内部错误');
  }
}

async function serveFile(share, env, fileName) {
  const files = getFileList(share);
  const fileInfo = fileName ? files.find(f => f.name === fileName) : files[0];
  if (!fileInfo) return notFound('文件未找到');

  const fileObj = await env.BUCKET_R2.get(fileInfo.key);
  if (!fileObj) return notFound('文件未找到');
  return new Response(fileObj.body, {
    headers: {
      'Content-Type': fileInfo.type || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${fileInfo.name.replace(/"/g, "'")}"`,
      'Content-Length': String(fileInfo.size),
      'X-Filename': fileInfo.name,
    }
  });
}

async function checkTerminalAuth(request, env) {
  const header = request.headers.get('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return null;
  try {
    return await verifyToken(token, env.SECRET_KEY);
  } catch {
    return null;
  }
}

export async function terminalAuth(request, env) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const rlKey = `rl-term:${ip}`;
  const rlCount = await env.SHARES_KV.get(rlKey);
  if (rlCount && parseInt(rlCount) >= 10) {
    return json({ error: '操作过于频繁，请稍后重试' }, 429);
  }
  await env.SHARES_KV.put(rlKey, String((parseInt(rlCount) || 0) + 1), { expirationTtl: 60 });

  const body = await request.json().catch(() => ({}));
  if (!body.password) return json({ error: 'Password required' }, 400);

  const storedHash = await env.SHARES_KV.get('term:pass');
  const submitted = await hashPassword(body.password);
  const expected = storedHash || await hashPassword(env.SECRET_KEY);
  if (submitted !== expected) return json({ error: 'Login incorrect' }, 401);

  const token = await signToken(
    { role: 'admin', exp: Math.floor(Date.now() / 1000) + 3600 },
    env.SECRET_KEY
  );
  return json({ token });
}

export async function terminalStats(request, env) {
  const auth = await checkTerminalAuth(request, env);
  if (!auth) return json({ error: 'Unauthorized' }, 401);

  let cursor, textShares = 0, fileShares = 0, totalSizeBytes = 0, expiredShares = 0;
  const now = Math.floor(Date.now() / 1000);
  do {
    const listed = await env.SHARES_KV.list({ prefix: 'share:', cursor, limit: 1000 });
    cursor = listed.cursor;
    for (const { name } of listed.keys) {
      const raw = await env.SHARES_KV.get(name);
      if (!raw) continue;
      try {
        const share = JSON.parse(raw);
        if (share.expiresAt && now > share.expiresAt) { expiredShares++; continue; }
        if (share.type === 'text') textShares++;
        else fileShares++;
        if (share.files) totalSizeBytes += share.files.reduce((s, f) => s + (f.size || 0), 0);
        else if (share.fileSize) totalSizeBytes += share.fileSize;
      } catch {}
    }
  } while (cursor);

  return json({ textShares, fileShares, totalShares: textShares + fileShares, totalSizeBytes, expiredShares });
}

export async function terminalCleanup(request, env) {
  const auth = await checkTerminalAuth(request, env);
  if (!auth) return json({ error: 'Unauthorized' }, 401);

  let cursor, cleaned = 0, freedBytes = 0;
  const now = Math.floor(Date.now() / 1000);
  do {
    const listed = await env.SHARES_KV.list({ prefix: 'share:', cursor, limit: 1000 });
    cursor = listed.cursor;
    for (const { name } of listed.keys) {
      const raw = await env.SHARES_KV.get(name);
      if (!raw) continue;
      try {
        const share = JSON.parse(raw);
        if (share.expiresAt && now > share.expiresAt) {
          if (share.files) freedBytes += share.files.reduce((s, f) => s + (f.size || 0), 0);
          else if (share.fileSize) freedBytes += share.fileSize;
          await cleanupShare(name.replace('share:', ''), env);
          cleaned++;
        }
      } catch {}
    }
  } while (cursor);

  await cleanupOrphanedFiles(env);
  return json({ cleaned, freedBytes });
}

export async function checkKey(key, env) {
  const data = await env.SHARES_KV.get(`share:${key}`);
  if (!data) return json({ exists: false });
  let share;
  try { share = JSON.parse(data); } catch { return json({ exists: false, error: '数据损坏' }); }
  if (share.expiresAt && Date.now() / 1000 > share.expiresAt) {
    await cleanupShare(key, env);
    return json({ exists: false, expired: true });
  }
  return json({ exists: true, hasPassword: share.hasPassword, type: share.type });
}

async function cleanupShare(key, env) {
  await env.SHARES_KV.delete(`share:${key}`);
  await env.SHARES_KV.delete(`pass:${key}`);
  try {
    const objects = await env.BUCKET_R2.list({ prefix: `files/${key}/` });
    for (const obj of objects.objects) {
      await env.BUCKET_R2.delete(obj.key);
    }
  } catch (e) { /* ignore R2 cleanup errors */ }
}

async function cleanupOrphanedFiles(env) {
  try {
    let cursor;
    do {
      const listed = await env.BUCKET_R2.list({ prefix: 'files/', limit: 1000, cursor });
      cursor = listed.cursor;
      const keys = new Set();
      for (const obj of listed.objects) {
        const parts = obj.key.split('/');
        if (parts.length >= 2) keys.add(parts[1]);
      }
      for (const key of keys) {
        const share = await env.SHARES_KV.get(`share:${key}`);
        if (!share) {
          const objects = await env.BUCKET_R2.list({ prefix: `files/${key}/` });
          for (const obj of objects.objects) {
            await env.BUCKET_R2.delete(obj.key);
          }
        }
      }
    } while (cursor);
  } catch (e) { /* ignore orphan cleanup errors */ }
}

async function throttledCleanup(env) {
  try {
    const lastCleanup = await env.SHARES_KV.get('meta:cleanup');
    const now = Math.floor(Date.now() / 1000);
    if (lastCleanup && now - parseFloat(lastCleanup) < 300) return;
    await env.SHARES_KV.put('meta:cleanup', String(now));
    await cleanupOrphanedFiles(env);
  } catch (e) { /* ignore */ }
}

export async function retrieveShare(key, request, env, ctx) {
  const host = new URL(request.url).host;
  const data = await env.SHARES_KV.get(`share:${key}`);
  if (!data) return new Response(errorPage('Not found', '此分享不存在', host), {
    status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });

  let share;
  try { share = JSON.parse(data); } catch {
    return new Response(errorPage('错误', '此分享数据已损坏。', host), {
      status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  if (share.expiresAt && Date.now() / 1000 > share.expiresAt) {
    await cleanupShare(key, env);
    return new Response(errorPage('已过期', '此分享已过期并已删除。', host), {
      status: 410, headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  ctx.waitUntil(throttledCleanup(env));

  const url = new URL(request.url);
  const isDownload = url.searchParams.has('download');
  const fileName = url.searchParams.get('file');

  if (share.hasPassword) {
    // Password protected
    const ct = request.headers.get('Content-Type') || '';
    let body = {};
    if (ct.includes('multipart/form-data')) {
      const form = await request.formData().catch(() => new FormData());
      body = { password: form.get('password'), fileName: form.get('fileName'), token: form.get('token') };
    } else if (ct.includes('application/x-www-form-urlencoded')) {
      const text = await request.text().catch(() => '');
      const params = new URLSearchParams(text);
      body = { password: params.get('password'), fileName: params.get('fileName'), token: params.get('token') };
    } else {
      body = await request.json().catch(() => ({}));
    }

    // Session token check (for authenticated downloads from multi-file page)
    if (body.token) {
      const sessKey = await env.SHARES_KV.get(`sess:${body.token}`);
      if (sessKey === key) {
        if (share.type === 'file' && body.fileName) return serveFile(share, env, body.fileName);
        const newToken = generateKey();
        await env.SHARES_KV.put(`sess:${newToken}`, key, { expirationTtl: 300 });
        return new Response(renderShareContent({ ...share, key, sessionToken: newToken }, host), {
          status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      }
    }

    // Password protected — reject direct ?download
    if (isDownload) return unauthorized('需要密码');

    if (!body.password) {
      return new Response(viewPage({ ...share, key }, host), {
        status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    const storedHash = await env.SHARES_KV.get(`pass:${key}`);
    const submittedHash = await hashPassword(body.password);
    if (submittedHash !== storedHash) return unauthorized('密码错误');

    // Password valid — generate short-lived session token
    const sessionToken = generateKey();
    await env.SHARES_KV.put(`sess:${sessionToken}`, key, { expirationTtl: 300 });

    // Text share — render content
    if (share.type === 'text') {
      return new Response(renderShareContent({ ...share, key }, host), {
        status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    // Serve specific file if requested
    if (body.fileName) return serveFile(share, env, body.fileName);

    // Single file → serve directly
    const files = getFileList(share);
    if (files.length <= 1) return serveFile(share, env);

    // Multiple files → show file list with session token (not the raw password)
    return new Response(renderShareContent({ ...share, key, sessionToken }, host), {
      status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  // No password
  if (share.type === 'text') {
    return new Response(renderShareContent({ ...share, key }, host), {
      status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  if (isDownload) {
    return serveFile(share, env, fileName);
  }
  return new Response(renderShareContent({ ...share, key }, host), {
    status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}
