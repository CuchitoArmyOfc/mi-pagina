# Cuentas propias para Cuchito TV — instalación del backend

Esto agrega un sistema de "Crear cuenta" dentro de la app. Los usuarios pueden
registrarse ellos mismos, pero la cuenta queda **pendiente de aprobación**
hasta que tú la apruebes desde un panel web. El usuario/contraseña maestro
que ya usas sigue funcionando exactamente igual que antes, sin cambios.

## 1) Crear la base de datos (Supabase)

1. Entra a https://supabase.com, crea un proyecto gratuito (o usa uno que ya tengas).
2. Ve a **SQL Editor** y ejecuta esto una sola vez:

```sql
create extension if not exists pgcrypto;

create table usuarios (
  id uuid primary key default gen_random_uuid(),
  usuario text unique not null,
  password_hash text not null,
  aprobado boolean not null default false,
  creado_en timestamptz not null default now()
);
```

3. Ve a **Project Settings → API** y copia dos valores:
   - **Project URL** → será `SUPABASE_URL`
   - **service_role key** (¡no la "anon", la "service_role"!) → será `SUPABASE_SERVICE_KEY`

## 2) Subir los archivos a tu proyecto (Vercel + GitHub)

En tu repositorio `CuchitoArmyOfc/mi-pagina`, copia estos archivos manteniendo
la misma ruta relativa:

```
api/login.js
api/register.js
api/pendientes.js
api/aprobar.js
admin.html
```

(Los archivos `api/*.js` van en una carpeta `api/` en la raíz del proyecto —
Vercel los detecta automáticamente como funciones, sin importar qué framework
uses para el resto del sitio. `admin.html` es una página normal, va en la raíz
o en `public/` según cómo esté armado tu proyecto.)

## 3) Agregar las dependencias

En el `package.json` de tu proyecto (el de `mi-pagina`), agrega estas dos
dependencias (si no existen ya):

```json
"dependencies": {
  "@supabase/supabase-js": "^2.45.0",
  "bcryptjs": "^2.4.3"
}
```

Si usas npm, basta con correr esto dentro del proyecto y luego subir el
`package.json`/`package-lock.json` resultante:

```
npm install @supabase/supabase-js bcryptjs
```

## 4) Variables de entorno en Vercel

En tu proyecto de Vercel → **Settings → Environment Variables**, agrega:

| Nombre | Valor |
|---|---|
| `SUPABASE_URL` | el Project URL que copiaste |
| `SUPABASE_SERVICE_KEY` | la service_role key que copiaste |
| `TG_BOT_TOKEN` | `8937160425:AAGOj_4KQOOfGooQUdGr7l8A9FqjONfHZRk` (el mismo bot que ya usas) |
| `TG_CHAT_ID` | `6762319597` (el mismo chat que ya usas) |
| `ADMIN_KEY` | una clave secreta que inventes tú, solo para ti (ej: una frase larga tipo `cuchito-admin-2026-xyz`) |

Guarda y vuelve a desplegar (redeploy) el proyecto para que tome las variables.

## 5) Aprobar cuentas nuevas

Cuando alguien crea una cuenta desde la app, te llega un aviso a tu Telegram
(el mismo bot de siempre) avisando que hay una cuenta pendiente.

Para aprobarla o rechazarla, abre en el navegador:

```
https://cuchitoarmyoficial.com/admin.html
```

Escribe tu `ADMIN_KEY` (la que pusiste en el paso 4) y pulsa "Cargar". Vas a
ver la lista de cuentas pendientes con botones **Aprobar** / **Rechazar**.

Guarda ese link en un lugar tuyo — no está enlazado desde ningún lado de tu
sitio ni de la app, así que solo tú (con la clave) puedes entrar.

## Cómo funciona desde la app (ya está integrado)

- En la pantalla de inicio de sesión hay un enlace **"¿No tienes cuenta? Crear cuenta"**.
- El usuario elige un usuario y contraseña; la app los manda a `/api/register`.
- La cuenta queda "pendiente" hasta que la apruebas en `admin.html`.
- Cuando el usuario intenta iniciar sesión y ya fue aprobado, la app lo deja
  entrar normalmente (llama a `/api/login`).
- El usuario/contraseña maestro que ya tenías sigue funcionando igual, sin
  tocar el servidor para nada — es completamente independiente de esto.
