const { sign, safeEq, isAdmin, bodyOf } = require('./_lib');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'GET') {
    return isAdmin(req) ? res.status(200).json({ ok: true }) : res.status(401).json({ error: 'No autorizado' });
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
  if (!process.env.ADMIN_PASSWORD) return res.status(500).json({ error: 'Falta configurar ADMIN_PASSWORD en Vercel.' });
  const pw = String(bodyOf(req).password || '');
  await new Promise((r) => setTimeout(r, 400)); // frena intentos repetidos
  if (!safeEq(pw, process.env.ADMIN_PASSWORD)) return res.status(401).json({ error: 'Contraseña incorrecta.' });
  return res.status(200).json({ token: sign(12) });
};
