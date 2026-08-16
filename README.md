# Cuchito Army Oficial

Frontend del sitio oficial de Cuchito Army — rediseño **"Black Edition"**: Astro + TypeScript estricto, sin frameworks pesados, sin JS innecesario.

## Stack

- [Astro](https://astro.build) — renderiza HTML estático, cero JS por defecto.
- **TypeScript strict** — tipado en datos, componentes y scripts de cliente.
- CSS moderno con **design tokens** (`src/styles/tokens.css`), sin librerías de utilidades.
- JS de cliente puntual (búsqueda, menú móvil, reveal-on-scroll) escrito en TS, sin dependencias.

## Comandos

```bash
npm install
npm run dev       # servidor local
npm run build     # typecheck + build de producción -> dist/
npm run preview   # sirve dist/ localmente
npm run typecheck # solo TypeScript, sin build
```

## Estructura

```text
src/
├── assets/        # imágenes optimizadas por Astro (astro:assets)
├── components/
│   ├── layout/    # Header, Footer
│   ├── sections/  # Hero, Services, Premium, Comunidad, etc.
│   └── ui/        # Button, ServiceCard, ChannelCard, Icon...
├── data/          # contenido tipado (servicios, canales, nav)
├── layouts/       # BaseLayout (head, SEO, estructura de página)
├── pages/         # index.astro
├── scripts/       # TS de cliente (mobile-nav, chocobets-modal, reveal)
├── styles/        # tokens.css + global.css
└── types/         # Service, Channel, NavItem
```

## Contenido y enlaces

Todo el contenido vive en `src/data/*.ts`, tipado. Para actualizar un enlace, número
de contacto o texto de una tarjeta, edita el objeto correspondiente ahí — nunca el
markup de los componentes.

`src/data/services.ts` y `src/data/channels.ts` documentan en comentarios los
`CONTENT_CONFLICT` detectados entre este repo y el sitio en producción (números/
enlaces distintos); revísalos si algo no coincide con lo esperado.

## Despliegue

Este build genera salida estática en `dist/`. **No está conectado a Vercel/DNS
todavía** — el cutover de producción se hace en una fase aparte.
