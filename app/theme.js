/* Mejoras de interfaz opcionales (sin dependencias): contadores y revelado de gráficos.
   Si este script no se carga, el tema funciona igual (solo sin contadores). */
(function(){
  'use strict';
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* 1) .chart-anim[data-reveal] -> .is-visible al entrar en pantalla */
  var io='IntersectionObserver' in window?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}})},{threshold:.15}):null;
  function watch(root){(root.querySelectorAll?root.querySelectorAll('.chart-anim:not(.is-visible)'):[]).forEach(function(n){if(io)io.observe(n);else n.classList.add('is-visible')})}
  /* 2) Contador animado de .kpi-value (formato es-CO). El texto final es siempre el original. */
  /* Guarda el último valor ya animado de cada KPI: así los cambios de texto del propio
     contador (que el MutationObserver también ve) no reinician la animación en bucle. */
  var shown=new WeakMap();
  function count(el){
    if(reduce||el.dataset.anim)return;
    var txt=el.textContent.trim();
    if(shown.get(el)===txt)return;
    shown.set(el,txt);
    if(!/^-?[\d.]+(,\d+)?$/.test(txt)){return}
    var target=parseFloat(txt.replace(/\./g,'').replace(',','.')),dec=(txt.split(',')[1]||'').length;
    if(!isFinite(target)||target===0)return;
    el.dataset.anim='1';
    var nf=new Intl.NumberFormat('es-CO',{minimumFractionDigits:dec,maximumFractionDigits:dec}),t0=performance.now(),d=900;
    (function step(t){var p=Math.min(1,(t-t0)/d),e=1-Math.pow(1-p,3);el.textContent=p>=1?txt:nf.format(target*e);if(p<1)requestAnimationFrame(step);else el.dataset.anim=''})(t0);
  }
  function scan(root){root.querySelectorAll&&root.querySelectorAll('.kpi-value').forEach(count);watch(root)}
  var busy=false;
  new MutationObserver(function(){if(busy)return;busy=true;requestAnimationFrame(function(){busy=false;scan(document)})}).observe(document.body||document.documentElement,{childList:true,subtree:true});
  function init(){scan(document)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  /* 3) Selector de tema (Claro / Oscuro / Sistema). El script del <head> ya fijó data-theme antes de pintar. */
  (function(){
    var root=document.documentElement,mq=window.matchMedia?window.matchMedia('(prefers-color-scheme: dark)'):null;
    function pref(){var p='system';try{p=localStorage.getItem('laperla-theme')||'system'}catch(e){}return p==='light'||p==='dark'?p:'system'}
    function apply(p){
      var t=p==='system'?(mq&&mq.matches?'dark':'light'):p;
      root.setAttribute('data-theme',t);root.setAttribute('data-theme-pref',p);root.style.colorScheme=t;
      document.querySelectorAll('[data-theme-choice]').forEach(function(b){b.setAttribute('aria-pressed',String(b.getAttribute('data-theme-choice')===p))});
    }
    function bind(){
      document.querySelectorAll('[data-theme-choice]').forEach(function(b){b.addEventListener('click',function(){
        var p=b.getAttribute('data-theme-choice');try{localStorage.setItem('laperla-theme',p)}catch(e){}apply(p)})});
      apply(pref());
    }
    if(mq){var on=function(){if(pref()==='system')apply('system')};if(mq.addEventListener)mq.addEventListener('change',on);else if(mq.addListener)mq.addListener(on)}
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
  })();
})();
