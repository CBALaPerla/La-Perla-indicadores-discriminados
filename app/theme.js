/* Mejoras de interfaz opcionales (sin dependencias): contadores y revelado de gráficos.
   Si este script no se carga, el tema funciona igual (solo sin contadores). */
(function(){
  'use strict';
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* 1) .chart-anim[data-reveal] -> .is-visible al entrar en pantalla */
  var io='IntersectionObserver' in window?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}})},{threshold:.15}):null;
  function watch(root){(root.querySelectorAll?root.querySelectorAll('.chart-anim:not(.is-visible)'):[]).forEach(function(n){if(io)io.observe(n);else n.classList.add('is-visible')})}
  /* 2) Contador animado de .kpi-value (formato es-CO). El texto final es siempre el original. */
  function count(el){
    if(reduce||el.dataset.anim)return;
    var txt=el.textContent.trim();
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
})();
