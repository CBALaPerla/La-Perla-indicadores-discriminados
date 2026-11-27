# Seguridad

Este documento resume cómo se protege el tablero de indicadores del CBA La Perla, qué riesgos se consideran y qué hacer ante un problema.

## Qué se protege

- **Lectura pública:** cualquier persona puede ver los indicadores (`/` y `/api/data`). No contienen datos personales.
- **Edición protegida:** registrar semanas, cargar Excel, crear años y restaurar copias exigen identidad, palabra clave y una sesión vigente.
- **Secretos:** la palabra clave (`LAPERLA_ADMIN_PASSWORD`) y, con Cloudflare Access, los correos autorizados (`ADMIN_EMAILS`) viven solo como secretos de Cloudflare.

## Modelo de amenazas (resumen)

| Amenaza | Medida |
| --- | --- |
| Adivinar la palabra clave | Mínimo 12 caracteres en modo `password`; máximo 5 intentos cada 15 minutos por IP (o por cuenta con Access); comparación en tiempo constante. |
| Robo de sesión | Cookie `__Host-perla_admin`: `HttpOnly`, `Secure`, `SameSite=Strict`, una hora; solo se guarda su hash en D1. |
| Peticiones forzadas desde otro sitio (CSRF) | Las escrituras exigen cookie `SameSite=Strict`, `Origin` propio y `Sec-Fetch-Site` igual a `same-origin`. |
| Suplantación con Access | El Worker valida firma, audiencia, emisor y vencimiento del token; no confía en cabeceras de correo. |
| Datos manipulados | Toda entrada se valida (tipos, rangos, tamaño, indicadores conocidos, semanas únicas). Control de versiones por `revision` para evitar sobrescrituras. |
| Inyección SQL | Todas las consultas a D1 usan parámetros enlazados (`bind`); no se arma SQL con texto del usuario. |
| Archivos maliciosos | Solo `.xlsx` de hasta 5 MB con firma ZIP; el archivo se interpreta en el navegador de quien lo carga y el servidor solo guarda cifras validadas (y, si hay R2, el original sin abrirlo). |
| XSS | Texto de usuario o del Excel se escapa con `esc()` antes de usar `innerHTML`; CSP sin `unsafe-inline` ni `unsafe-eval` en scripts. |
| Clickjacking, rastreo, sniffing | `frame-ancestors 'none'` y `X-Frame-Options: DENY`, `Referrer-Policy`, `X-Content-Type-Options`, `Permissions-Policy`, HSTS. |
| Fuga entre dominios | CORS abierto solo para lectura de `/api/data` (sin credenciales) para la copia en GitHub Pages. |

Riesgos aceptados: en modo `password` la palabra clave es la única barrera (la opción con Cloudflare Access es más fuerte); la limitación de intentos por IP puede compartirse entre personas de una misma red.

## Cabeceras y CSP

El Worker agrega las cabeceras en `worker/index.js` (función `secure`). Los scripts en línea del HTML se autorizan con hashes SHA-256 que `scripts/build.mjs` calcula sobre el HTML final; por eso **cualquier cambio en un script en línea requiere recompilar** (`npm run build`). Los estilos en línea se permiten (`style-src 'unsafe-inline'`) porque los gráficos generan atributos `style` en tiempo de ejecución y no pueden ejecutar código. No se permiten orígenes externos. Si agregas una librería, súbela a `/assets/` en lugar de cargarla desde un CDN.

## Rotar la palabra clave

1. Elige una frase nueva de al menos 12 caracteres, única (no reutilizada).
2. `npx wrangler secret put LAPERLA_ADMIN_PASSWORD` y escribe la nueva frase.
3. Las sesiones abiertas siguen vigentes hasta una hora. Para cerrarlas ya, borra las sesiones: `npx wrangler d1 execute la-perla-indicadores --remote --command "DELETE FROM admin_sessions"`.
4. Comunica la frase nueva por un canal privado; no la envíes por correo ni la escribas en el repositorio.

Rota la palabra clave cada 6 meses, cuando alguien deje de necesitar acceso o ante cualquier sospecha. Con Access, retira también el correo de la política y de `ADMIN_EMAILS`.

## Cómo reportar un problema

Si encuentras una falla de seguridad o sospechas que se expuso un secreto, avisa de inmediato a la persona administradora del tablero en el CBA (canal interno, no en un issue público). Incluye qué viste, cuándo y los pasos para reproducirlo; no incluyas la palabra clave ni datos reales. Si hubo exposición de un secreto: rótalo primero y reporta después.

## Lista de verificación antes de publicar

- [ ] `npm run build` termina sin errores.
- [ ] `node scripts/verify.mjs "<ruta al Excel>"` pasa completo (incluye cabeceras y CSP).
- [ ] `git status` no muestra `.dev.vars`, `.env`, Excel ni copias de la base.
- [ ] No hay correos reales, palabras clave ni tokens en el código, README ni `docs/`.
- [ ] `AUTH_MODE` y `wrangler.toml` son los esperados; `database_id` es el de la cuenta correcta.
- [ ] Los secretos están cargados (`npx wrangler secret list`).
- [ ] Se revisó que no se agregaron scripts, estilos o fuentes de dominios externos.
- [ ] Tras `npm run deploy`: abrir el sitio, revisar que carguen gráficos, descargar un PDF y probar activar y cerrar la edición. Revisar las cabeceras con las herramientas del navegador (Network).
- [ ] `CHANGELOG.md` actualizado.
