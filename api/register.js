import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

async function notifyTelegram(text) {
  var token = process.env.TG_BOT_TOKEN, chat = process.env.TG_CHAT_ID;
  if (!token || !chat) return;
  try {
    await fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text: text })
    });
  } catch (e) {}
}

// POST { usuario, password }
// -> { ok:true }                                cuenta creada, queda pendiente de aprobación
// -> { ok:false, motivo:'usuario_invalido' }
// -> { ok:false, motivo:'password_invalida' }
// -> { ok:false, motivo:'usuario_existe' }
export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, motivo: 'metodo_invalido' });

  try {
    var body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
    var usuario = String((body && body.usuario) || '').trim().toLowerCase();
    var password = String((body && body.password) || '');

    if (usuario.length < 3 || usuario.length > 40 || !/^[a-z0-9_.]+$/.test(usuario)) {
      return res.status(200).json({ ok: false, motivo: 'usuario_invalido' });
    }
    if (password.length < 4 || password.length > 100) {
      return res.status(200).json({ ok: false, motivo: 'password_invalida' });
    }

    var sel = await supabase.from('usuarios').select('id').eq('usuario', usuario).maybeSingle();
    if (sel.data) return res.status(200).json({ ok: false, motivo: 'usuario_existe' });

    var hash = await bcrypt.hash(password, 10);
    var ins = await supabase.from('usuarios').insert({ usuario: usuario, password_hash: hash, aprobado: false });
    if (ins.error) return res.status(200).json({ ok: false, motivo: 'error_servidor' });

    // Se espera a que termine antes de responder: en Vercel la función puede
    // cortarse apenas se envía la respuesta, y un fetch "en segundo plano"
    // sin await se pierde a mitad de camino.
    await notifyTelegram(
      '🆕 Nueva cuenta pendiente de aprobación — Cuchito TV\n' +
      '👤 Usuario: ' + usuario + '\n\n' +
      'Entra al panel admin.html para aprobarla o rechazarla.'
    );

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(200).json({ ok: false, motivo: 'error_servidor' });
  }
}
