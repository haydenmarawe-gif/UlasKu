const { cmd, getCard, saveCard, hashPin, cleanCode, body, checkPin } = require('../lib/db');
const okUrl = (u) => { try { return new URL(u).protocol === 'https:'; } catch { return false; } };
const okPin = (p) => /^\d{4,6}$/.test(String(p || ''));
const out = (res, s, o) => res.status(s).json(o);

module.exports = async (req, res) => {
  if (req.method !== 'POST') return out(res, 405, { error: 'Method not allowed' });
  const b = body(req); const code = cleanCode(b.code);
  const card = code && (await getCard(code));
  if (!card) return out(res, 404, { error: 'Kode kartu tidak ditemukan.' });

  if (b.action === 'status') return out(res, 200, { active: !!card.active });

  if (b.action === 'activate') {
    if (card.active) return out(res, 409, { error: 'Kartu ini sudah aktif.' });
    if (!String(b.name || '').trim()) return out(res, 400, { error: 'Nama bisnis wajib diisi.' });
    if (!okUrl(b.reviewUrl)) return out(res, 400, { error: 'Link Google Review harus diawali https://' });
    if (!okPin(b.pin)) return out(res, 400, { error: 'PIN harus 4–6 angka.' });
    Object.assign(card, { active: true, name: b.name.trim().slice(0, 80), reviewUrl: b.reviewUrl.trim(), pinHash: hashPin(code, b.pin), activatedAt: Date.now() });
    await saveCard(code, card);
    return out(res, 200, { ok: true });
  }

  if (!card.active) return out(res, 409, { error: 'Kartu belum diaktifkan.' });
  const p = await checkPin(code, card, b.pin);
  if (p === 'locked') return out(res, 429, { error: 'Terlalu banyak salah PIN. Coba lagi 15 menit lagi.' });
  if (p === 'wrong') return out(res, 401, { error: 'PIN salah.' });

  if (b.action === 'load') {
    const scans = Number(await cmd('GET', 'scans:' + code)) || 0;
    return out(res, 200, { name: card.name, reviewUrl: card.reviewUrl, scans });
  }
  if (b.action === 'update') {
    if (!String(b.name || '').trim()) return out(res, 400, { error: 'Nama bisnis wajib diisi.' });
    if (!okUrl(b.reviewUrl)) return out(res, 400, { error: 'Link Google Review harus diawali https://' });
    if (b.newPin && !okPin(b.newPin)) return out(res, 400, { error: 'PIN baru harus 4–6 angka.' });
    card.name = b.name.trim().slice(0, 80); card.reviewUrl = b.reviewUrl.trim();
    if (b.newPin) card.pinHash = hashPin(code, b.newPin);
    await saveCard(code, card);
    return out(res, 200, { ok: true });
  }
  if (b.action === 'reset') {
    await saveCard(code, { code, active: false, createdAt: card.createdAt, batch: card.batch });
    await cmd('DEL', 'scans:' + code);
    return out(res, 200, { ok: true });
  }
  out(res, 400, { error: 'Aksi tidak dikenal.' });
};
