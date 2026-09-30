import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// GET /api/pendientes?key=TU_ADMIN_KEY
// -> { ok:true, usuarios: [{id, usuario, aprobado, creado_en}, ...] }   (todas las cuentas)
export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  var key = (req.query && req.query.key) || '';
  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ ok: false, motivo: 'no_autorizado' });
  }

  try {
    var sel = await supabase
      .from('usuarios')
      .select('id,usuario,aprobado,creado_en')
      .order('creado_en', { ascending: true });
    if (sel.error) return res.status(200).json({ ok: false, motivo: 'error_servidor' });
    return res.status(200).json({ ok: true, usuarios: sel.data });
  } catch (e) {
    return res.status(200).json({ ok: false, motivo: 'error_servidor' });
  }
}
