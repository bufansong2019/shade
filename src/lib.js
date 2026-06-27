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
