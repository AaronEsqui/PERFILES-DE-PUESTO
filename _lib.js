const crypto = require('crypto');

const KV_URL = () => process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = () => process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const SECRET = () => process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || '';

async function redis(cmd) {
  if (!KV_URL() || !KV_TOKEN()) throw new Error('Falta conectar la base de datos (Upstash Redis) en Vercel.');
  const r = await fetch(KV_URL(), {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + KV_TOKEN(), 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd)
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}

const b64 = (s) => Buffer.from(s).toString('base64url');
const hmac = (s) => crypto.createHmac('sha256', SECRET()).update(s).digest('base64url');

function sign(hours = 12) {
  const body = b64(JSON.stringify({ exp: Date.now() + hours * 3600 * 1000 }));
  return body + '.' + hmac(body);
}

function safeEq(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function isAdmin(req) {
  try {
    if (!SECRET()) return false;
    const h = req.headers.authorization || '';
    const tok = h.startsWith('Bearer ') ? h.slice(7) : '';
    const [body, sig] = tok.split('.');
    if (!body || !sig || !safeEq(sig, hmac(body))) return false;
    return JSON.parse(Buffer.from(body, 'base64url').toString()).exp > Date.now();
  } catch (e) { return false; }
}

function bodyOf(req) {
  const b = req.body;
  if (b && typeof b === 'object') return b;
  try { return JSON.parse(b || '{}'); } catch (e) { return {}; }
}

module.exports = { redis, sign, safeEq, isAdmin, bodyOf };
