import type { Service } from '@/types/service';

/** Single entry powering the dedicated Premium section. */
export const premiumFeature: Service = {
  id: 'contenido-premium',
  title: 'Contenido Premium',
  description: 'Material exclusivo para miembros: acceso prioritario, sin límites y sin anuncios.',
  category: 'VIP',
  href: 'https://t.me/+5ji09KzUxatlNGMx',
  cta: 'Unirme al Premium',
  accent: 'purple',
  icon: 'crown',
  featured: true,
  external: true,
};

export const premiumBenefits: string[] = [
  'Acceso inmediato al canal privado VIP',
  'Contenido publicado en primicia, antes que en canales públicos',
  'Soporte prioritario para miembros premium',
];
