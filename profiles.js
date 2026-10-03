const { redis, isAdmin, bodyOf } = require('./_lib');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') {
      const raw = await redis(['GET', 'dae:profiles']);
      return res.status(200).json({ profiles: raw ? JSON.parse(raw) : null });
    }
    if (req.method === 'PUT') {
      if (!isAdmin(req)) return res.status(401).json({ error: 'No autorizado' });
      const profiles = bodyOf(req).profiles;
      if (!Array.isArray(profiles) || profiles.length < 1 || profiles.length > 300)
        return res.status(400).json({ error: 'Datos inválidos' });
      const raw = JSON.stringify(profiles);
      if (raw.length > 900000) return res.status(413).json({ error: 'Demasiados datos' });
      await redis(['SET', 'dae:profiles', raw]);
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Método no permitido' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
