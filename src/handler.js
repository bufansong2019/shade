import { createUniqueKey, hashPassword, json, badRequest, serverError, unauthorized, notFound, getFileList, generateKey } from './lib.js';
import { viewPage, errorPage, renderShareContent } from './html.js';

const MAX_TEXT_SIZE = 10000;
// ===== Helper Factories =====
function htmlResponse(body, status = 200) {
  return new Response(body, { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

async function checkRateLimit(env, ip, prefix, limit = 5, windowSec = 60) {
  const rlKey = prefix + ip;
  const count = Number(await env.SHARES_KV.get(rlKey) || 0);
  if (count >= limit) return false;
  await env.SHARES_KV.put(rlKey, String(count + 1), { expirationTtl: windowSec });
  return true;
}

function scheduleBurnCleanup(share, key, ctx, env) {
  if (share.expireLabel === "burn") ctx.waitUntil(cleanupShare(key, env));
}

export async function createShare(request, env, ctx) {
  try {
    // 频率限制：每分钟 5 次
    if (!await checkRateLimit(env, request.headers.get('CF-Connecting-IP') || 'unknown', 'rl:'))
      return json({ error: '请求过于频繁，请稍后重试' }, 429);
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
    if (expire === 'burn' && type === 'file' && uploadedFiles.length > 1) return badRequest('阅后即焚模式最多支持 1 个文件');
        if (password && !/^.{1,6}$/.test(password)) return badRequest('密码最多 6 位字符');

    if (type === 'file') {
      const maxBytes = parseInt(env.MAX_UPLOAD_SIZE_MB || '200', 10) * 1024 * 1024;
      for (const f of uploadedFiles) {
        if (f.size > maxBytes) return badRequest(`文件 "${f.name}" 超出大小限制`);
      }
    }

    const ttlMap = { '30m': 1800, '1h': 3600, '6h': 21600, '12h': 43200, 'burn': 86400 };
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
  if (!fileInfo) return htmlResponse(errorPage('404', '文件未找到', ''), 404);

  const fileObj = await env.BUCKET_R2.get(fileInfo.key);
  if (!fileObj) return htmlResponse(errorPage('404', '文件未找到', ''), 404);
  return new Response(fileObj.body, {
    headers: {
      'Content-Type': fileInfo.type || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${fileInfo.name.replace(/"/g, "'")}"`,
      'Content-Length': String(fileInfo.size),
      'X-Filename': fileInfo.name,
    }
  });
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
  } catch (e) { console.error('R2 cleanup error for ' + key + ':', e.message); }
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

  // 频率限制：密码验证每分钟 5 次
  if (request.method === 'POST') {
    const ct = request.headers.get('Content-Type') || '';
    // Skip rate limit for session-token form submissions (already authenticated)
    if (!ct.includes('multipart/form-data')) {
      if (!await checkRateLimit(env, request.headers.get('CF-Connecting-IP') || 'unknown', 'rl:retrieve:'))
        return json({ error: '请求过于频繁，请稍后重试' }, 429);
    }
  }
  const data = await env.SHARES_KV.get(`share:${key}`);
  if (!data) return htmlResponse(errorPage('404', '此链接不存在或已被销毁', host), 404);

  let share;
  try { share = JSON.parse(data); } catch {
    return htmlResponse(errorPage('错误', '此链接数据已损坏', host), 500);
  }

  if (share.expiresAt && Date.now() / 1000 > share.expiresAt) {
    await cleanupShare(key, env);
    return htmlResponse(errorPage('已过期', '此链接已过期并已被销毁', host), 410);
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
        if (share.type === 'file') return serveFile(share, env, body.fileName);
        const newToken = generateKey();
        await env.SHARES_KV.put(`sess:${newToken}`, key, { expirationTtl: 300 });
        return htmlResponse(renderShareContent({...share, key, sessionToken: newToken}, host));
      }
    }

    // Password protected — reject direct ?download
    if (isDownload) return unauthorized('需要密码');

    if (!body.password) {
      return htmlResponse(viewPage({...share, key}, host));
    }

    const storedHash = await env.SHARES_KV.get(`pass:${key}`);
    const submittedHash = await hashPassword(body.password);
    if (submittedHash !== storedHash) return unauthorized('密码错误');

    // Password valid — generate short-lived session token
    const sessionToken = generateKey();
    await env.SHARES_KV.put(`sess:${sessionToken}`, key, { expirationTtl: 300 });

    // Text share — render content
    if (share.type === 'text') {
      scheduleBurnCleanup(share, key, ctx, env);
      return htmlResponse(renderShareContent({...share, key}, host));

    }

    // Serve specific file if requested
    if (body.fileName) {
      scheduleBurnCleanup(share, key, ctx, env);
      return serveFile(share, env, body.fileName);
    }

    // Single file → show content page with download button
    const files = getFileList(share);
    if (files.length <= 1) {
      scheduleBurnCleanup(share, key, ctx, env);
      return htmlResponse(renderShareContent({...share, key, sessionToken}, host));
    }

    // Multiple files → show file list with session token (not the raw password)
    return htmlResponse(renderShareContent({...share, key, sessionToken}, host));
  }

  // No password
  if (share.type === 'text') {
    scheduleBurnCleanup(share, key, ctx, env);
    return htmlResponse(renderShareContent({...share, key}, host));
  }

  if (isDownload) {
    scheduleBurnCleanup(share, key, ctx, env);
    return serveFile(share, env, fileName);
  }
  scheduleBurnCleanup(share, key, ctx, env);
  return htmlResponse(renderShareContent({...share, key}, host));

}
