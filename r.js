// Dibuka saat kartu di-tap / QR di-scan: /r/KODE
const { cmd, getCard, cleanCode } = require('../lib/db');
module.exports = async (req, res) => {
  const code = cleanCode(req.query.code);
  const card = code && (await getCard(code));
  res.setHeader('Cache-Control', 'no-store');
  if (card && card.active) {
    cmd('INCR', 'scans:' + code).catch(() => {});
    return res.redirect(302, card.reviewUrl);
  }
  res.redirect(302, '/aktivasi?code=' + code + (card ? '' : '&x=1'));
};
