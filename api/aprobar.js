const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// POST { key, id, accion }   accion: 'aprobar' (por defecto) | 'rechazar'
// -> { ok:true }
module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, motivo: 'metodo_invalido' });

  try {
    var body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }

    var key = (body && body.key) || '';
    if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
      return res.status(401).json({ ok: false, motivo: 'no_autorizado' });
    }

    var id = body && body.id;
    var accion = (body && body.accion) || 'aprobar';
    if (!id) return res.status(200).json({ ok: false, motivo: 'falta_id' });

    if (accion === 'rechazar') {
      var del = await supabase.from('usuarios').delete().eq('id', id);
      if (del.error) return res.status(200).json({ ok: false, motivo: 'error_servidor' });
      return res.status(200).json({ ok: true });
    }

    var upd = await supabase.from('usuarios').update({ aprobado: true }).eq('id', id);
    if (upd.error) return res.status(200).json({ ok: false, motivo: 'error_servidor' });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(200).json({ ok: false, motivo: 'error_servidor' });
  }
};
