import {readFile,mkdir,writeFile,rm} from 'node:fs/promises';
let html=await readFile('app/index.html','utf8');
const schema=JSON.parse(await readFile('app/weekly-schema.json','utf8'));
const base=JSON.parse(html.match(/<script id="dashboard-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
const logo=html.match(/<img src="(data:image\/png;base64,[^"]+)"/)[1];
html=html.replace('__WEEKLY_SCHEMA__',JSON.stringify(schema));
html=html.replace('__IMPORT_ALIASES__',JSON.stringify(JSON.parse(await readFile('app/import-aliases.json','utf8'))));
html=html.replace('__LOGO_DATA_URL__',JSON.stringify(logo));
html=html.replace('__EXCEL_IMPORT__',(await readFile('app/excel-import.js','utf8')).replace(/^export /gm,''));
html=html.replace('__REPORT_PDF__',(await readFile('app/report-pdf.js','utf8')).replace(/^export /gm,''));
html=html.replace('__WEEKLY_CORE__',(await readFile('app/weekly-core.js','utf8')).replace(/^export /gm,''));
html=html.replace('__PAGES_CONFIG__',await readFile('app/pages-config.js','utf8'));
html=html.replace('__WEEK_FILTER__',await readFile('app/week-filter.js','utf8'));
html=html.replace('__WEEKLY_CLIENT__',await readFile('app/weekly-client.js','utf8'));
html=html.replace('__MULTIYEAR_CLIENT__',await readFile('app/multiyear-client.js','utf8'));
html=html.replace('/* WEEKLY_CSS */',await readFile('app/weekly.css','utf8'));
html=html.replace('/* MULTIYEAR_CSS */',await readFile('app/multiyear.css','utf8'));
// Tema visual y gráficos (archivos opcionales: si no existen se deja vacío).
const optional=async f=>{try{return await readFile(f,'utf8')}catch{return ''}};
const inlineAssets=async css=>{for(const m of [...css.matchAll(/url\(["']?(assets\/[^"')]+)["']?\)/g)]){const f='app/'+m[1];const ext=f.split('.').pop().toLowerCase();const type={woff2:'font/woff2',woff:'font/woff',svg:'image/svg+xml',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp'}[ext];if(!type)continue;const data=(await readFile(f)).toString('base64');css=css.split(m[0]).join(`url("data:${type};base64,${data}")`)}return css};
html=html.split('/* THEME_CSS */').join(await inlineAssets(await optional('app/theme.css')));
html=html.split('/* CHARTS_CSS */').join(await inlineAssets(await optional('app/charts.css')));
html=html.split('__CHARTS_CLIENT__').join(await optional('app/charts.js'));
// Geometría simplificada de comunas y corregimientos (mapa de calor territorial).
html=html.split('__GEO_MEDELLIN__').join(JSON.stringify(JSON.parse(await readFile('app/geo-medellin.json','utf8'))).replace(/</g,'\\u003c'));
// Animaciones del tema (opcional): se agrega como script inline al final del body; su hash entra en la CSP.
const themeJs=await optional('app/theme.js');
if(themeJs.trim())html=html.replace(/<\/body>(?![\s\S]*<\/body>)/,`<script>\n${themeJs}\n</script>\n</body>`);
const assets={'/assets/exceljs.js':await readFile('node_modules/exceljs/dist/exceljs.min.js','utf8'),'/assets/jspdf.js':await readFile('node_modules/jspdf/dist/jspdf.umd.min.js','utf8')};
const worker=await readFile('worker/index.js','utf8');
await rm('dist',{recursive:true,force:true});
await mkdir('dist/server',{recursive:true});
await mkdir('dist/client',{recursive:true});
await writeFile('dist/client/index.html',html);
// El analizador HTML normaliza CRLF a LF antes de calcular el hash, por eso se normaliza igual aquí.
// Hashes SHA-256 de cada <script> en línea ejecutable del HTML final (para la CSP del Worker).
import {createHash} from 'node:crypto';
const scriptHashes=[...html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)].filter(m=>!/type=["']application\/(json|ld\+json)["']/.test(m[1])).map(m=>'sha256-'+createHash('sha256').update(m[2].replace(/\r\n?/g,'\n'),'utf8').digest('base64'));
await writeFile('dist/server/index.js',`const CSP_SCRIPT_HASHES=${JSON.stringify(scriptHashes)};\nconst HTML=${JSON.stringify(html)};\nconst FORM_SCHEMA=${JSON.stringify(schema)};\nconst BASE_DATA=${JSON.stringify(base)};\nconst BROWSER_ASSETS=${JSON.stringify(assets)};\n${worker}`);
const source=await readFile('dist/server/index.js','utf8');
const module=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
if(typeof module.default?.fetch!=='function')throw new Error('Worker must export fetch');
console.log('Dashboard, protected data APIs, Excel import and PDF reports built in dist/. Deploy with: npx wrangler deploy');
