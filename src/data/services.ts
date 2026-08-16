import type { Service } from '@/types/service';

/**
 * Core services grid (excludes the dedicated Premium section and the
 * community channels list, which live in premium.ts and channels.ts).
 *
 * Content precedence applied while merging sources:
 *   1. Approved visual identity / naming direction
 *   2. Verifiably live content from cuchitoarmyoficial.com (production)
 *   3. Legacy content only present in this repo (mi-pagina)
 *
 * "Servicios Doxeo" was renamed to "Investigación Digital" (OSINT). The
 * destination link is unchanged; only the public-facing label/copy was
 * softened to avoid marketing language that reads as doxxing/harassment.
 */
export const services: Service[] = [
  {
    id: 'investigacion-digital',
    title: 'Investigación Digital',
    description:
      'Servicio profesional de investigación y análisis OSINT, disponible 24/7 por canal privado.',
    category: 'OSINT',
    href: 'https://t.me/+sJ8rwwujS5IxMjMx',
    cta: 'Contactar canal',
    accent: 'orange',
    icon: 'shield',
    featured: true,
    external: true,
  },
  {
    id: 'bot-whatsapp',
    title: 'Bot de WhatsApp',
    description: 'Asistente automatizado con respuestas instantáneas, activo todo el día.',
    // CONTENT_CONFLICT: mi-pagina tenía +63 945 632 9599; producción sirve
    // +56 9 4508 8740. Se usa el número de producción por ser el vigente.
    category: 'Automatización',
    href: 'https://wa.me/56945088740',
    cta: '+56 9 4508 8740',
    accent: 'green',
    icon: 'bot',
    external: true,
  },
  {
    id: 'contenido-videos',
    title: 'Contenido de Videos',
    description: 'Material audiovisual exclusivo para la comunidad, publicado sin cortes.',
    category: 'Contenido',
    href: 'https://t.me/ofcslayer',
    cta: 'Ver canal',
    accent: 'blue',
    icon: 'video',
    external: true,
  },
];
