(()=>{'use strict';
/* Performance guard: stop the dashboard's unnecessary 5-second full recalculation. */
const nativeSetInterval=window.setInterval.bind(window);
window.setInterval=function(fn,delay,...args){
  if(delay===5000&&typeof fn==='function'&&fn.name==='renderDaily') return 0;
  return nativeSetInterval(fn,delay,...args);
};
/* Coalesce bursts of ticket events into one paint frame without changing app behavior. */
let queued=false;
const refresh=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;window.dispatchEvent(new Event('ticket-performance-refresh'))})};
window.addEventListener('ticket-data-updated',refresh,{passive:true});
window.addEventListener('call-attempt-updated',refresh,{passive:true});
})();