# Perfiles de puesto · DAE Ingeniería

Sitio estático (`index.html`) + funciones serverless (`api/`) para Vercel.

- **Público:** ve e imprime los perfiles y los anuncios. No puede editar.
- **Administrador:** entra con contraseña (botón "Acceso administrador"), edita, agrega, duplica, elimina puestos y sube la imagen del anuncio. Todo queda guardado para todos.

## Cómo publicarlo

1. Sube TODO el contenido de esta carpeta a tu repositorio de GitHub (`index.html`, `package.json` y la carpeta `api/`).
2. En Vercel importa el repositorio (Add New → Project). No necesita build.
3. En el proyecto de Vercel: **Storage → Create / Marketplace → Upstash Redis** (plan gratis) y conéctalo al proyecto. Esto crea solas las variables `KV_REST_API_URL` y `KV_REST_API_TOKEN`.
4. En **Settings → Environment Variables** agrega:
   - `ADMIN_PASSWORD` = la contraseña del administrador
   - `SESSION_SECRET` = una cadena larga y aleatoria (más de 32 caracteres)
5. **Deployments → Redeploy** para que tome las variables.

## Notas
- La primera vez que el administrador edite algo, se guardan en la base de datos los 15 perfiles originales con ese cambio.
- La sesión del administrador dura 12 horas y se cierra al cerrar la pestaña.
- Para cambiar la contraseña: cambia `ADMIN_PASSWORD` en Vercel y haz Redeploy.
