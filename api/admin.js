// Khusus pemilik bisnis: buat kode kartu massal & lihat daftar. Wajib header x-admin-key.
const crypto = require('crypto');
const { cmd, getCard, body } = require('../lib/db');
const ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // tanpa 0/O/1/I biar tidak salah baca
const rnd = () => Array.from(crypto.randomBytes(6), (x) => ABC[x % ABC.length]).join('');

module.exports = async (req, res) => {
  if (!process.env.ADMIN_KEY || req.headers['x-admin-key'] !== process.env.ADMIN_KEY) return res.status(401).json({ error: 'Admin key salah.' });
  const b = body(req);
  if (b.action === 'generate') {
    const n = Math.min(Math.max(parseInt(b.count) || 1, 1), 500), codes = [];
    while (codes.length < n) {
      const c = rnd();
      if (await cmd('SET', 'card:' + c, JSON.stringify({ code: c, active: false, createdAt: Date.now(), batch: String(b.batch || '').slice(0, 40) }), 'NX')) {
        codes.push(c); await cmd('SADD', 'cards', c);
      }
    }
    return res.json({ codes });
  }
  if (b.action === 'list') {
    const codes = (await cmd('SMEMBERS', 'cards')) || [];
    const rows = await Promise.all(codes.map(async (c) => {
      const k = await getCard(c); const s = Number(await cmd('GET', 'scans:' + c)) || 0;
      return { code: c, active: !!(k && k.active), name: (k && k.name) || '', batch: (k && k.batch) || '', scans: s, createdAt: (k && k.createdAt) || 0 };
    }));
    return res.json({ rows: rows.sort((a, z) => z.createdAt - a.createdAt) });
  }
  res.status(400).json({ error: 'Aksi tidak dikenal.' });
};
