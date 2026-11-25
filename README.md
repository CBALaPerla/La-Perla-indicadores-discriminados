# La Perla · Indicadores

Dashboard de gestión del Centro de Bienestar Animal La Perla. Consulta por año, mes, semana y especie; comparación entre años; registro semanal protegido; carga de Excel e informes PDF. Se excluyen los operadores y clínicas externas.

Funciona en una cuenta propia de **Cloudflare** (plan gratuito): un Worker sirve el dashboard y los datos, D1 guarda los registros y la edición se protege con una **palabra clave** (modo sin tarjeta) o, de forma opcional, con **Cloudflare Access** (inicio de sesión por correo). Ya no depende de ChatGPT Sites.

## Qué contiene

- `app/`: interfaz, cálculos, importación de Excel, filtros e informes PDF.
- `worker/`: servicio de datos (lectura pública, edición protegida, restauración de copias).
- `db/`, `drizzle/`: estructura y migraciones de la base de datos D1.
- `wrangler.toml`: configuración de Cloudflare (nombre del servicio, base de datos, inicio de sesión).
- `scripts/`: construcción, exportación a GitHub Pages y pruebas.
- `docs/`: copia de consulta para GitHub Pages (opcional).
- `manuales/`: manuales PDF y su contenido editable.

## Publicar en Cloudflare (una sola vez)

Necesitas Node.js 24, una cuenta gratuita en https://dash.cloudflare.com y esta carpeta. Los comandos se escriben en PowerShell, dentro de la carpeta del proyecto.

1. **Instalar y entrar a Cloudflare**
   ```
   npm ci
   npx wrangler login
   ```
2. **Crear la base de datos.** Copia el `database_id` que muestra el comando y pégalo en `wrangler.toml`, en lugar de `REEMPLAZAR_CON_EL_ID_DE_D1`.
   ```
   npx wrangler d1 create la-perla-indicadores
   npm run db:migrate
   ```
3. **Publicar el servicio.** Al terminar, aparece la dirección, por ejemplo `https://la-perla-indicadores.TU-CUENTA.workers.dev`.
   ```
   npm run deploy
   ```
   Desde ese momento la consulta ya funciona con los datos incorporados del Excel 2026.
4. **Elegir cómo se protege la edición.** La consulta es pública en ambos casos. `AUTH_MODE` en `wrangler.toml` define el modo:
   - **Opción A: solo palabra clave (no pide tarjeta).** Es el modo que viene por defecto (`AUTH_MODE = "password"`). No hay que configurar Access: salta al paso 5 y carga solo `LAPERLA_ADMIN_PASSWORD`. La palabra clave debe tener **mínimo 12 caracteres**; usa una frase larga y única. Es la única barrera, así que no la compartas ni la reutilices.
   - **Opción B: Cloudflare Access (más segura, exige método de pago).** Cloudflare pide una tarjeta para activar Zero Trust aunque el plan Free no cobre hasta 50 usuarios. Para usarla, cambia en `wrangler.toml` a `AUTH_MODE = ""` y sigue los puntos de abajo. Puedes pasar de la A a la B en cualquier momento sin perder datos.

   **Configuración de la opción B (Cloudflare Access):**
   1. En el panel de Cloudflare abre **Zero Trust**. La primera vez te pide un nombre de equipo, por ejemplo `laperla`, y elegir el plan **Free**.
   2. Ve a **Access → Applications → Add an application → Self-hosted**.
   3. Nombre: `La Perla administración`. En **Public hostname** usa la dirección del paso 3 y agrega estas rutas: `admin`, `api/admin/session`, `api/admin/restore`, `api/weeks` y `api/import`. No protejas la raíz `/`, `api/data` ni `api/admin/status`: son la consulta pública.
   4. Crea una política **Allow** con la regla **Emails** y escribe los correos que podrán editar. Como método de acceso deja **One-time PIN**: Cloudflare envía un código al correo.
   5. Guarda. En la ficha de la aplicación copia el **Application Audience (AUD) Tag**.
   6. En `wrangler.toml` completa `ACCESS_TEAM_DOMAIN` (por ejemplo `https://laperla.cloudflareaccess.com`) y `ACCESS_AUD` con el valor copiado.
5. **Cargar los secretos.** Cada comando pide el valor; no queda escrito en ningún archivo.
   ```
   npx wrangler secret put LAPERLA_ADMIN_PASSWORD
   npx wrangler secret put ADMIN_EMAILS
   ```
   `LAPERLA_ADMIN_PASSWORD` es la palabra clave para activar la edición (obligatoria en ambas opciones; mínimo 12 caracteres en la opción A). `ADMIN_EMAILS` solo se usa con Cloudflare Access (opción B): son los correos con permiso de edición, separados por coma, iguales a los de la política de Access. Con la opción A no hace falta.
6. **Publicar de nuevo** con la configuración completa: `npm run deploy`.
7. **Restaurar los datos del sitio anterior.** Mientras el sitio de ChatGPT siga en línea, abre `https://la-perla-indicadores-2026.esumer-3704.chatgpt.site/api/data` en el navegador y guárdalo como `copia-perla.json` (Ctrl+S). En el nuevo dashboard entra a **Administración** (con la opción B, primero **Iniciar sesión con el correo autorizado** y escribe el código que llega al correo), activa la edición con la palabra clave y usa **Restaurar una copia de datos** con ese archivo. Solo funciona sobre una base vacía, así que hazlo antes de registrar semanas nuevas. Los Excel originales que estaban guardados en el sitio anterior no se pueden recuperar por esta vía; las cifras sí.

Para guardar también una copia de cada Excel cargado, activa R2 en la cuenta, crea un bucket y descomenta el bloque `r2_buckets` de `wrangler.toml`. Sin R2, la carga de Excel funciona igual y guarda las cifras.

### Dominio propio (opcional)

Si la Alcaldía asigna un subdominio, agrégalo en **Workers & Pages → la-perla-indicadores → Settings → Domains & Routes** y repite el paso 4.3 con ese dominio.

## Consultar una semana

1. Elige el año en la parte superior.
2. Selecciona el mismo mes en **Desde** y **Hasta**.
3. En **Semana del mes**, elige una de las semanas que muestra el archivo, con su rango o etiqueta.
4. Las tarjetas, gráficos, tablas y comparación usan esa semana. **Todas las semanas** recupera el resultado mensual.

Son semanas dentro del mes, no semanas ISO del año. La semana 1 puede contener distinta cantidad de días en cada año. Por eso no se muestra un cambio porcentual entre años al consultar una semana. El detalle por comuna y los diagnósticos solo existen por mes: no se reparten artificialmente entre semanas. El promedio mensual de alimentos se muestra al consultar Todas las semanas y usa meses completos. Los informes PDF tienen su propio selector de año y mes y no heredan el filtro semanal.

## Actualizar información

**Administración.** Con la opción A (solo palabra clave) escribe la palabra clave y pulsa **Activar edición**. Con la opción B (Cloudflare Access) usa antes **Iniciar sesión con el correo autorizado**: Cloudflare pide el correo y envía un código; después activa la edición con la palabra clave.

- **Registro semanal:** elige año, mes y semana. Para corregir, usa **Revisar y editar semanas → Editar**. Guarda y espera el mensaje de confirmación. No se duplica la misma combinación año/mes/semana.
- **Cargar Excel:** archivo `.xlsx` de hasta 5 MB con el formato mensual del consolidado. Indica el año real, revisa la vista previa y confirma. Las correcciones semanales tienen prioridad sobre el Excel reemplazado.

### Subir información de años anteriores

1. Entra a **Administración**, activa la edición (palabra clave) y abre **Cargar Excel** en el menú.
2. En **Año de estos datos** escribe el año real del archivo (por ejemplo `2024`), elige el `.xlsx` de ese año y pulsa **Revisar archivo**.
3. Revisa la vista previa (meses con datos, indicadores reconocidos y avisos) y confirma para guardar. Repite con cada año: 2020, 2021, 2022, 2023, 2024, 2025…
4. El año aparece en la tabla **Años disponibles**, en el selector de año y en **Comparar años**.

Se admiten los consolidados con hojas de nombre completo (`Enero`, `Febrero`…) y con abreviaturas (`ENE`, `FEB`, `SEPT`, `DIC`…), y los encabezados `EJECUCIÓN TOTAL` o `EJECUCIÓN TOTAL ENERO`. Los años anteriores tienen menos indicadores que 2025 y 2026; los que no existen en ese archivo se muestran como "sin dato", no como cero. Si cargas de nuevo un año ya cargado, se reemplaza su Excel base (hay que marcar la confirmación). Antes de cargar un año debes cargar su Excel para poder registrar semanas de ese año.
- **Cerrar edición:** úsalo al terminar. La sesión termina después de una hora. **Cerrar sesión** sale también de la cuenta de Cloudflare.
- **Copia de seguridad:** abre `/api/data` en el dashboard y guarda el archivo. Sirve para restaurar en una base nueva.

## Copia de consulta en GitHub Pages (opcional)

`docs/` es una versión de solo consulta que lee los datos del servicio de Cloudflare. Para regenerarla con la dirección nueva:

```
npm run build:pages -- https://la-perla-indicadores.TU-CUENTA.workers.dev
```

Sube `docs/` y en GitHub ve a **Settings → Pages → Deploy from a branch → main → /docs**. El botón **Administrar** de esa copia abre `/admin` en Cloudflare.

## Modificar diseño o código

Edita `app/` o `worker/` y publica con `npm run deploy`. No edites solo `dist/` ni `docs/index.html`: se regeneran.

Prueba local: crea un archivo `.dev.vars` (no se sube) con `LAPERLA_ADMIN_PASSWORD=...`, aplica las migraciones con `npx wrangler d1 migrations apply la-perla-indicadores --local` y ejecuta `npm run dev`. Con `AUTH_MODE = "password"` puedes editar localmente con la palabra clave (mínimo 12 caracteres en `.dev.vars`). Con `AUTH_MODE = ""` y sin Access configurado, la consulta funciona y la edición queda bloqueada.

Pruebas automáticas con el Excel original de referencia de enero a septiembre de 2026:

```
npm run build
node scripts/verify.mjs "C:/ruta/al/2026. INDICADORES DISCRIMINADOS ANUAL CONSOLIDADO.xlsx"
```

Comprueban la importación, los cálculos, los filtros, el inicio de sesión de Access (firma, audiencia, emisor y vencimiento del token), la palabra clave, la sesión, la restauración de copias y la carga sin R2. Crean una base temporal y no tocan la de Cloudflare.

Para regenerar los manuales con la dirección nueva: `$env:PERLA_SITE_URL="https://..."; python scripts/create-manuals.py`.

## Servicio protegido y seguridad

- **Opción A (`AUTH_MODE = "password"`):** la edición exige la palabra clave (mínimo 12 caracteres; si es más corta, el servicio rechaza el acceso), una sesión vigente (cookie HttpOnly/Secure de una hora), origen propio y un límite de cinco intentos cada 15 minutos por dirección IP. Es la única barrera, así que usa una frase larga y única.
- **Opción B (`AUTH_MODE = ""`):** la identidad la da **Cloudflare Access**. El Worker verifica por su cuenta el token firmado (firma con las llaves públicas del equipo, audiencia `ACCESS_AUD`, emisor `ACCESS_TEAM_DOMAIN` y vencimiento). No confía en cabeceras de correo simples. Si `ACCESS_TEAM_DOMAIN`, `ACCESS_AUD` o `ADMIN_EMAILS` faltan, nadie puede editar.
- Además del correo autorizado, la edición exige la palabra clave, una sesión vigente (cookie HttpOnly/Secure de una hora), origen propio y un límite de cinco intentos cada 15 minutos.
- Solo `/api/data` permite lectura desde otros dominios (para GitHub Pages).
- No subas `.dev.vars`, `.env`, contraseñas, bases reales ni `node_modules`. Los correos autorizados y la palabra clave son secretos de Cloudflare, no van en el repositorio.

