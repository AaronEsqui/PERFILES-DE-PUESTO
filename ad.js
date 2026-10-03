const { redis, isAdmin, bodyOf } = require('./_lib');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') {
      const id = String((req.query && req.query.id) || '');
      if (!id || id.length > 120) return res.status(400).json({ error: 'Id inválido' });
      const img = await redis(['GET', 'dae:ad:' + id]);
      return res.status(200).json({ img: img || null });
    }
    if (req.method === 'PUT') {
      if (!isAdmin(req)) return res.status(401).json({ error: 'No autorizado' });
      const { id, img } = bodyOf(req);
      if (!id || String(id).length > 120) return res.status(400).json({ error: 'Id inválido' });
      if (img === null) {
        await redis(['DEL', 'dae:ad:' + id]);
      } else {
        if (typeof img !== 'string' || !img.startsWith('data:image/') || img.length > 900000)
          return res.status(400).json({ error: 'Imagen inválida o demasiado pesada' });
        await redis(['SET', 'dae:ad:' + id, img]);
      }
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Método no permitido' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
