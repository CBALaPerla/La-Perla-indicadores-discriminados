import {readFile,writeFile,mkdir,cp} from 'node:fs/promises';
// Dirección pública del servicio en Cloudflare, por ejemplo https://la-perla-indicadores.TU-CUENTA.workers.dev
const base=(process.env.PERLA_API_BASE||process.argv[2]||'').trim().replace(/\/+$/,'');
if(!/^https:\/\/[^/]+$/.test(base))throw new Error('Indica la dirección del servicio: npm run build:pages -- https://la-perla-indicadores.TU-CUENTA.workers.dev');
await mkdir('docs/assets',{recursive:true});
let html=await readFile('dist/client/index.html','utf8');
html=html.replace('<script>','<script src="./config.js"></script>\n<script>');
await writeFile('docs/index.html',html);
await writeFile('docs/config.js','// Public URLs only. Never put passwords or tokens here.\nwindow.PERLA_CONFIG='+JSON.stringify({apiBase:base,adminUrl:base+'/admin'},null,2)+';\n');
await writeFile('docs/.nojekyll','');
for(const [name,path]of [['jspdf','jspdf/dist/jspdf.umd.min.js'],['exceljs','exceljs/dist/exceljs.min.js']])await cp('node_modules/'+path,'docs/assets/'+name+'.js');
await cp('node_modules/jspdf/LICENSE','docs/assets/LICENSE-jspdf.txt');
await cp('node_modules/exceljs/LICENSE','docs/assets/LICENSE-exceljs.txt');
console.log('GitHub Pages generated in docs/. Backend and secrets are not copied.');
