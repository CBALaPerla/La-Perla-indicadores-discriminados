// GitHub Pages: public reading uses the hosted service; editing stays there.
const PAGES_CONFIG=globalThis.PERLA_CONFIG||{};
async function apiFetch(path,options={}){
 if(!PAGES_CONFIG.apiBase)return globalThis.fetch(path,options);
 if(path==='/api/admin/status')return {ok:true,json:async()=>({signedIn:false,canUnlock:false,unlocked:false,expiresAt:null})};
 if(path!=='/api/data'||(options.method&&options.method!=='GET'))throw new Error('Abre Administrar para editar en el sitio protegido.');
 return globalThis.fetch(PAGES_CONFIG.apiBase.replace(/\/$/,'')+path,{...options,credentials:'omit'});
}
function pagesAdminGate(target){$(target).innerHTML=`<section class="card panel admin-gate"><h2>Actualizar los datos</h2><p>La consulta está alojada en GitHub Pages. La carga de archivos y la edición se realizan en el sitio protegido de La Perla.</p><a class="primary-action action-link" href="${esc(PAGES_CONFIG.adminUrl)}" target="_blank" rel="noopener">Abrir administración protegida</a><p class="note">Después de guardar, regresa a esta página y recárgala para ver los cambios.</p></section>`;}
