export interface TrustItem {
  value: string;
  label: string;
}

/** Brand messaging, not live telemetry — presented as such, never as a counter. */
export const trustItems: TrustItem[] = [
  { value: '24/7', label: 'Siempre online' },
  { value: '100%', label: 'Comunidad activa' },
  { value: '∞', label: 'Contenido premium' },
];
