# La Perla · Indicadores

Dashboard de gestión del Centro de Bienestar Animal La Perla. Consulta por año, mes, semana y especie; comparación entre años; registro semanal protegido; carga de Excel e informes PDF. Se excluyen los operadores y clínicas externas (CES, FUNCUAN).

**Sitio en funcionamiento:** https://la-perla-indicadores-2026.esumer-3704.chatgpt.site/

## Qué publica este paquete

- `docs/`: sitio listo para GitHub Pages, con logo, gráficos y descarga de PDF. No requiere instalar herramientas para publicarlo.
- `app/`: código de la interfaz, cálculos, importación de Excel, filtros y PDF.
- `worker/`, `db/`, `drizzle/`: código del servicio de datos, estructura y migraciones de base de datos.
- `scripts/`: construcción, exportación a Pages y pruebas.
- `manuales/`: tres manuales PDF y su contenido editable.
- `package.json` y `package-lock.json`: dependencias y versiones.

GitHub Pages aloja archivos estáticos; no ejecuta el servicio de datos. Esta entrega conserva el servicio actual de Sites para guardar los cambios y validar la cuenta administradora. La página de GitHub consulta los datos públicos actualizados; el botón **Administrar** abre el sitio protegido en otra pestaña. Después de guardar, recarga la página de GitHub. No hay actualización en tiempo real mientras una pestaña permanece abierta.

**Esto no migra la base de datos ni la autenticación a GitHub.** El código completo permite mantener y estudiar la solución, pero publicar `worker/` en Pages no lo ejecuta. La copia descargada no es un respaldo de las cargas ni de los registros guardados en producción. Los Excel originales subidos y los datos persistidos siguen en el servicio actual. Para independizarlo de Sites habría que desplegar otro servicio y adaptar la identidad; no basta con cambiar una URL ni copiar cabeceras de autenticación.

## Publicar en GitHub Pages — sin consola

1. Descarga y descomprime `La-Perla-GitHub.zip`.
2. En GitHub, crea un repositorio, por ejemplo `la-perla-indicadores`. Para GitHub Free, utiliza un repositorio público. La interfaz contiene los indicadores que ya se consultan públicamente; no añadas historias clínicas ni datos personales.
3. Abre **Add file > Upload files** y sube el contenido de la carpeta descomprimida, conservando las subcarpetas. `README.md`, `package.json`, `app/` y `docs/` deben quedar directamente en la raíz del repositorio. No subas el ZIP sin descomprimir ni una carpeta adicional que envuelva todo. Si el navegador limita la carga, usa GitHub Desktop para publicar esa carpeta.
4. Guarda con **Commit changes** en la rama `main`.
5. Ve a **Settings > Pages > Build and deployment**. En **Source** elige **Deploy from a branch**; selecciona `main`, carpeta `/docs`, y pulsa **Save**.
6. Espera a que **Actions** muestre la publicación completada. Abre **Visit site** desde Settings > Pages.
7. El enlace será `https://TU-USUARIO.github.io/la-perla-indicadores/` si usas ese nombre. Es un ejemplo: sustituye TU-USUARIO por tu cuenta y copia el enlace real que muestre GitHub.
8. Comparte ese enlace para consultar, filtrar, comparar y descargar PDF. Desde el mismo dashboard puedes pulsar **Administrar** para abrir la edición protegida. La clave de edición no debe escribirse en el repositorio, README, configuración ni manuales públicos.

La URL exacta de GitHub solo existe después de crear el repositorio y completar la publicación. No se ha creado un repositorio en tu cuenta mediante esta entrega.

## Consultar una semana

1. Elige el año en la parte superior.
2. Selecciona el mismo mes en **Desde** y **Hasta**.
3. En **Semana del mes**, elige una de las semanas que muestra el archivo, con su rango o etiqueta.
4. Las tarjetas, gráficos, tablas y comparación usan esa semana. **Todas las semanas** recupera el resultado mensual.

Son semanas dentro del mes, no semanas ISO del año. La semana 1 puede contener distinta cantidad de días en cada año. Por eso no se muestra un cambio porcentual entre años al consultar una semana. El detalle por comuna y los diagnósticos solo existen por mes: no se reparten artificialmente entre semanas. El promedio mensual de alimentos se muestra al consultar Todas las semanas y usa meses completos. Los informes PDF tienen su propio selector de año y mes y no heredan el filtro semanal.

## Actualizar información

**Administrar > Abrir administración protegida** (en GitHub Pages). Inicia sesión con la cuenta autorizada del proyecto y usa la clave entregada por el responsable. En el sitio actual, Administración activa directamente la sesión de edición.

- **Registro semanal:** elige año, mes y semana. Para corregir, usa **Revisar y editar semanas > Editar**. Guarda y espera el mensaje de confirmación. No se duplica la misma combinación año/mes/semana.
- **Cargar Excel:** archivo `.xlsx` de hasta 5 MB con el formato mensual del consolidado. Indica el año real, revisa la vista previa y confirma. Las correcciones semanales tienen prioridad sobre el Excel reemplazado.
- **Cerrar edición:** úsalo al terminar. La sesión termina después de una hora.
- **GitHub:** vuelve a la pestaña de consulta y recarga. No hay que volver a subir el código para cada actualización de datos.

El servicio actual debe permanecer publicado con lectura pública para que Pages pueda consultar `/api/data`. Si se restringe o se elimina, Pages mostrará una advertencia y conservará el histórico incorporado, que podría estar desactualizado.

## Modificar diseño o código

Requiere Node.js 24 y npm. Desde la raíz de la carpeta:

```sh
npm ci
npm run build:pages
```

Edita `app/` y vuelve a ejecutar `npm run build:pages`; sube tanto el código modificado como `docs/`. La publicación desde la rama no compila `app/` automáticamente. No edites solo `docs/index.html`: sus cambios se pierden al regenerarlo. `docs/config.js` contiene únicamente URLs públicas. El generador `scripts/export-pages.mjs` define sus valores.

Para el conjunto de pruebas con el Excel original de referencia de enero a septiembre de 2026:

```sh
node scripts/verify.mjs "/ruta/al/2026. INDICADORES DISCRIMINADOS ANUAL CONSOLIDADO.xlsx"
```

El archivo de referencia no se incluye. Estas pruebas contrastan valores concretos de esa versión y crean una base temporal; no deben ejecutarse esperando los mismos totales con un Excel posterior. Las pruebas de interfaz usan una simulación del documento, no un navegador móvil real.

## Servicio protegido y seguridad

El servicio usa Cloudflare Workers, D1 para registros y R2 para archivos. La identidad llega de la plataforma Sites. El servidor exige cuenta autorizada, clave secreta, sesión válida y origen propio antes de escribir. La sesión usa una cookie HttpOnly/Secure; hay límite de intentos y control de revisión para evitar sobrescribir cambios de otra sesión. La lectura pública desde Pages no envía cookies; solo `/api/data` permite lectura entre dominios. Ocultar botones no es la protección de los datos.

No subas secretos, `.env`, sesiones, bases reales, credenciales ni la carpeta `node_modules`. El manifiesto `.openai/hosting.json` distribuido no contiene la identidad del proyecto existente. La publicación de backend requiere configurar bindings, aplicar migraciones y una identidad confiable: no desplegar directamente un Worker que acepte cabeceras de usuario desde Internet.

## Comprobaciones de entrega — 15 de octubre de 2026

- Importación contrastada con el Excel original; 38 indicadores y 9 meses.
- Guardado, corrección, conflicto de revisiones y acceso protegido comprobados en una base temporal.
- Filtro semanal: meses de 4, 5 y 6 semanas, especies, cambio de año/mes, datos faltantes y semanas no consecutivas.
- Cliente Pages: consulta sin credenciales, administración derivada al sitio protegido y recursos con rutas relativas.
- PDF: manuales revisados por páginas; el generador de informes anual/mensual se mantiene.
- No se hizo publicación en tu GitHub ni prueba visual en navegador móvil; revisa el enlace final en tu teléfono al publicarlo.

## Referencias oficiales

Consultadas el 15 de octubre de 2026:

- https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

Las dependencias ExcelJS y jsPDF conservan sus licencias en `docs/assets/`. El logo y los datos pertenecen a sus respectivos titulares.
