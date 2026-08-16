/**
 * Semantic accent used across the design system.
 * orange  -> brand / primary CTA
 * green   -> community / online / positive state
 * purple  -> premium / VIP / exclusive
 * blue    -> Telegram / digital / tech
 */
export type Accent = 'orange' | 'green' | 'purple' | 'blue';

export type ServiceIcon =
  | 'shield'
  | 'bot'
  | 'crown'
  | 'video'
  | 'send'
  | 'users'
  | 'chat'
  | 'broadcast'
  | 'target'
  | 'lifebuoy';

export interface Service {
  /** Stable internal identifier, never shown in the UI. */
  id: string;
  title: string;
  description: string;
  category: string;
  href: string;
  cta: string;
  accent: Accent;
  icon: ServiceIcon;
  /** Featured services render larger inside the bento grid. */
  featured?: boolean;
  external?: boolean;
}
