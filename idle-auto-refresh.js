(()=>{'use strict';
const IDLE_MS=5*60*1000;
let timer=0;
function hardRestart(){
  // Force a fresh document request after five minutes of real inactivity.
  // The changing query value prevents the browser from reusing the current HTML document.
  const url=new URL(window.location.href);
  url.searchParams.set('_hardRestart',Date.now().toString());
  window.location.replace(url.toString());
}
function arm(){
  clearTimeout(timer);
  timer=setTimeout(()=>{
    if(document.visibilityState==='visible')hardRestart();
    else arm();
  },IDLE_MS);
}
function isActiveControl(target){return !!target?.closest?.('.premium-tabs button[data-view], .status-pill, .inline-status, .inline-status-menu, .status-menu, select, button, input, textarea, [role="button"], [data-status], [data-view]')}
function activity(e){if(e?.type==='tracker-view-changed'||e?.type==='ticket-data-updated'||e?.type==='call-attempt-updated'||isActiveControl(e?.target))arm()}
window.addEventListener('tracker-view-changed',activity);
window.addEventListener('ticket-data-updated',activity);
window.addEventListener('call-attempt-updated',activity);
document.addEventListener('pointerdown',e=>{if(isActiveControl(e.target))activity(e)},{passive:true});
document.addEventListener('change',e=>{if(isActiveControl(e.target))activity(e)},{passive:true});
document.addEventListener('input',e=>{if(isActiveControl(e.target))activity(e)},{passive:true});
document.addEventListener('keydown',e=>{if(isActiveControl(e.target))activity(e)});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')arm()});
arm();
})();