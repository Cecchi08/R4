# Portfolio

React + TypeScript + Vite; API Express POST y PostgreSQL/Supabase. Los visitantes no tienen cuentas. El comando `admin` abre el acceso administrativo.

## Desarrollo

Node.js 24. En cada carpeta ejecutar `npm ci`.
- Backend: copiar `.env.example` a `.env`, completar DB_URL y JWT_SECRET; ejecutar `npm run dev`.
- Frontend: copiar `.env.example` a `.env.local`; ejecutar `npm run dev`. VITE_API_URL vacío usa el proxy local; también admite el origen http://localhost:3001.
- Comprobaciones: `npm run build` en ambas carpetas y `npm run lint` en frontend.

## Vercel

Crear dos proyectos del mismo repositorio:
- Root Directory `backend`: framework Express, Node 24. `src/server.js` exporta la aplicación; `src/local.js` es sólo para desarrollo. Configurar DB_URL (pooler Supabase), DB_SSL=true, JWT_SECRET y CORS_ORIGIN con el origen HTTPS exacto del frontend, sin barra final. CORS_ORIGIN permite varios orígenes separados por coma.
- Root Directory `frontend`: framework Vite, build `npm run build`, output `dist`, Node 24. Configurar VITE_API_URL con el origen HTTPS del backend, sin /api, antes del build. Redesplegar si cambia.

No se necesita vercel.json: Express tiene detección nativa y la navegación de esta SPA no utiliza rutas de navegador. La API mantiene el prefijo /api. Los .env locales están excluidos del despliegue y de Git.

Cookies admin: HttpOnly, Secure y SameSite=None en producción; credentials incluido en fetch y CORS. Para navegadores que bloquean cookies de terceros, usar dominios propios del mismo sitio (por ejemplo portfolio.example.com y api.example.com). No usar comodines para CORS.

La preparación se valida localmente; publicar requiere configurar los dos proyectos y sus variables en Vercel.

## Administrador

La tabla users se conserva para evitar pérdida de datos; el backend sólo acepta role=admin y rechaza las cuentas antiguas normales. No hay registro ni promoción por HTTP.

Para crear explícitamente una cuenta nueva desde un entorno privado, establecer temporalmente ADMIN_EMAIL, ADMIN_USERNAME y ADMIN_PASSWORD y ejecutar `npm run admin:create` en backend. La contraseña se guarda con bcrypt; no se muestran secretos ni se reemplazan cuentas existentes. Quitar ADMIN_PASSWORD del entorno al terminar. No definir estas variables en el frontend ni guardarlas en Git.

## Base de datos

schema.sql es la definición de referencia. No volver a ejecutar sus INSERT sobre una base poblada: algunos seeds no son idempotentes. No se ejecutan migraciones durante un despliegue ni al iniciar Express.

Referencia: [Express en Vercel](https://vercel.com/docs/frameworks/backend/express).
