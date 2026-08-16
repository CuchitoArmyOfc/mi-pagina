import type { Channel } from '@/types/channel';

/**
 * Community channels. Grouped by "group" so the section can render two
 * clearly separated clusters instead of one undifferentiated wall of cards.
 */
export const communityChannels: Channel[] = [
  {
    id: 'telegram-oficial',
    platform: 'telegram',
    title: 'Telegram Oficial',
    description: 'Canal principal de la comunidad: novedades y contenido exclusivo.',
    category: 'Canal principal',
    href: 'https://t.me/cuchitoarmy_oficial_peru',
    cta: 'Entrar al Telegram',
    accent: 'blue',
    icon: 'send',
  },
  {
    id: 'grupo-whatsapp',
    platform: 'whatsapp',
    title: 'Grupo de WhatsApp',
    description: 'Debate abierto y chat general con toda la Army.',
    category: 'Grupo',
    href: 'https://chat.whatsapp.com/C1phafMwVDX7qrs3jpAdHI?s=cl&p=a&ilr=0',
    cta: 'Unirme al grupo',
    accent: 'green',
    icon: 'users',
  },
  {
    id: 'chat-whatsapp',
    platform: 'whatsapp',
    title: 'Chat de WhatsApp',
    description: 'Espacio de interacción directa con la comunidad.',
    // CONTENT_CONFLICT: mi-pagina enlazaba a un invite distinto
    // (G3wyFUultJE0viTjmGg7J6). Se usa el invite vigente en producción.
    category: 'Chat directo',
    href: 'https://chat.whatsapp.com/CSJehlNCqtr36pcwBtoH0j?s=cl&p=a&mlu=4',
    cta: 'Abrir chat',
    accent: 'green',
    icon: 'chat',
  },
  {
    id: 'canal-whatsapp',
    platform: 'whatsapp',
    title: 'Canal de WhatsApp',
    description: 'Anuncios y avisos oficiales, directo en tu WhatsApp.',
    category: 'Anuncios',
    href: 'https://www.whatsapp.com/channel/0029VbBhVrN9sBI6GbQcES0g',
    cta: 'Seguir canal',
    accent: 'green',
    icon: 'broadcast',
  },
  {
    id: 'telegram-fijas',
    platform: 'telegram',
    title: 'Telegram de Fijas',
    description: 'Pronósticos y jugadas del día, directo en Telegram.',
    category: 'Pronósticos',
    href: 'https://t.me/Fijascuchitobets',
    cta: 'Ver pronósticos',
    accent: 'blue',
    icon: 'target',
  },
  {
    id: 'whatsapp-fijas',
    platform: 'whatsapp',
    title: 'WhatsApp de Fijas',
    description: 'El mismo servicio de pronósticos, en formato canal de WhatsApp.',
    category: 'Pronósticos',
    href: 'https://whatsapp.com/channel/0029Vb8ViaQ5PO0svEnBL51i',
    cta: 'Seguir fijas',
    accent: 'green',
    icon: 'target',
  },
];
