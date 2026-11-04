// Upstash Redis via REST (gratis, tanpa library). Tambahkan lewat Vercel > Storage > Upstash Redis.
const URL_ = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const crypto = require('crypto');

async function cmd(...args) {
  const r = await fetch(URL_, { method: 'POST', headers: { Authorization: 'Bearer ' + TOKEN }, body: JSON.stringify(args) });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}
const getCard = async (code) => { const v = await cmd('GET', 'card:' + code); return v ? JSON.parse(v) : null; };
const saveCard = (code, c) => cmd('SET', 'card:' + code, JSON.stringify(c));
const hashPin = (code, pin) => crypto.createHash('sha256').update(code + ':' + pin + ':' + (process.env.ADMIN_KEY || '')).digest('hex');
const cleanCode = (c) => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
const body = (req) => (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {});

// Batasi tebak PIN: 5x salah => kunci 15 menit
async function checkPin(code, card, pin) {
  const k = 'fail:' + code;
  if (Number(await cmd('GET', k)) >= 5) return 'locked';
  if (card.pinHash === hashPin(code, String(pin || ''))) { await cmd('DEL', k); return 'ok'; }
  await cmd('INCR', k); await cmd('EXPIRE', k, 900);
  return 'wrong';
}
module.exports = { cmd, getCard, saveCard, hashPin, cleanCode, body, checkPin };
