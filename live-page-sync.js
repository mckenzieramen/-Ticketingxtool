(()=>{'use strict';
const KEY='premiumTicketTracker.v1';
let frame=0,last='';
const readRaw=()=>localStorage.getItem(KEY)||'[]';
function emit(reason,force=false){const raw=readRaw();if(!force&&raw===last)return;last=raw;window.dispatchEvent(new CustomEvent('ticket-live-sync',{detail:{reason}}))}
function immediate(reason='change'){if(frame){cancelAnimationFrame(frame);frame=0}emit(reason,true)}
function schedule(reason='change'){if(frame)return;frame=requestAnimationFrame(()=>{frame=0;emit(reason,false)})}
last=readRaw();
// One storage bridge only: a real ticket-data change emits one live-sync event.
const nativeSet=Storage.prototype.setItem,nativeRemove=Storage.prototype.removeItem,nativeClear=Storage.prototype.clear;
Storage.prototype.setItem=function(k,v){const isTicket=this===localStorage&&String(k)===KEY;const before=isTicket?readRaw():null;const out=nativeSet.apply(this,arguments);if(isTicket&&String(v)!==before)immediate('ticket-save');return out};
Storage.prototype.removeItem=function(k){const isTicket=this===localStorage&&String(k)===KEY,had=isTicket&&localStorage.getItem(KEY)!==null;const out=nativeRemove.apply(this,arguments);if(had)immediate('ticket-remove');return out};
Storage.prototype.clear=function(){const had=this===localStorage&&localStorage.getItem(KEY)!==null;const out=nativeClear.apply(this,arguments);if(had)immediate('ticket-clear');return out};
window.addEventListener('firebase-memory-write',e=>{if(e.detail?.key===KEY||e.detail?.key==='*')schedule('firebase-memory-write')});
window.addEventListener('storage',e=>{if(!e.key||e.key===KEY)immediate('remote-storage')});
window.addEventListener('pageshow',()=>schedule('pageshow'));
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')schedule('visible')});
})();