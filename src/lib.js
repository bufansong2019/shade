export function generateKey() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const rand = new Uint8Array(5);
  crypto.getRandomValues(rand);
  return Array.from(rand, b => chars[b % chars.length]).join('');
}

export async function createUniqueKey(kv) {
  for (let i = 0; i < 10; i++) {
    const key = generateKey();
    const existing = await kv.get(`share:${key}`);
    if (!existing) return key;
  }
  const key = generateKey() + generateKey();
  return key;
}

export function getFileList(share) {
  if (share.files && share.files.length > 0) return share.files;
  if (share.fileKey) return [{ name: share.fileName, size: share.fileSize, type: share.fileType, key: share.fileKey }];
  return [];
}

export async function hashPassword(password) {
  const enc = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, '0')).join('');
}

export async function signToken(payload, secret) {
  const enc = new TextEncoder().encode(JSON.stringify(payload));
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc);
  const sigHex = Array.from(new Uint8Array(sig), b => b.toString(16).padStart(2, '0')).join('');
  const payloadB64url = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return payloadB64url + '.' + sigHex;
}

export async function verifyToken(token, secret) {
  const dot = token.indexOf('.');
  if (dot === -1) return null;
  const payloadB64url = token.slice(0, dot);
  const sigHex = token.slice(dot + 1);
  const payloadB64 = payloadB64url.replace(/-/g, '+').replace(/_/g, '/');
  const padding = (4 - payloadB64.length % 4) % 4;
  const payloadStr = atob(payloadB64 + '='.repeat(padding));
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadStr));
  const expectedSigHex = Array.from(new Uint8Array(sig), b => b.toString(16).padStart(2, '0')).join('');
  if (sigHex !== expectedSigHex) return null;
  const payload = JSON.parse(payloadStr);
  if (payload.exp && Date.now() / 1000 > payload.exp) return null;
  return payload;
}

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}

export function notFound(msg = 'Not found') {
  return json({ error: msg }, 404);
}

export function badRequest(msg = 'Bad request') {
  return json({ error: msg }, 400);
}

export function unauthorized(msg = 'Unauthorized') {
  return json({ error: msg }, 401);
}

export function serverError(msg = 'Internal server error') {
  return json({ error: msg }, 500);
}
