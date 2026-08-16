import type { Accent, ServiceIcon } from './service';

export type Platform = 'telegram' | 'whatsapp';

export interface Channel {
  id: string;
  platform: Platform;
  title: string;
  description: string;
  category: string;
  href: string;
  cta: string;
  accent: Accent;
  icon: ServiceIcon;
}
