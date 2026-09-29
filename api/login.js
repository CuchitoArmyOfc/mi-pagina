const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// POST { usuario, password }
// -> { ok:true }                              credenciales correctas y cuenta aprobada
// -> { ok:false, motivo:'pendiente' }          existe pero un admin no la aprobó todavía
// -> { ok:false, motivo:'no_existe' }          no hay cuenta con ese usuario
// -> { ok:false, motivo:'clave_incorrecta' }   usuario existe, contraseña no coincide
module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, motivo: 'metodo_invalido' });

  try {
    var body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
    var usuario = String((body && body.usuario) || '').trim().toLowerCase();
    var password = String((body && body.password) || '');
    if (!usuario || !password) return res.status(200).json({ ok: false, motivo: 'datos_invalidos' });

    var sel = await supabase.from('usuarios').select('*').eq('usuario', usuario).maybeSingle();
    if (sel.error || !sel.data) return res.status(200).json({ ok: false, motivo: 'no_existe' });

    var match = await bcrypt.compare(password, sel.data.password_hash);
    if (!match) return res.status(200).json({ ok: false, motivo: 'clave_incorrecta' });

    if (!sel.data.aprobado) return res.status(200).json({ ok: false, motivo: 'pendiente' });

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(200).json({ ok: false, motivo: 'error_servidor' });
  }
};
