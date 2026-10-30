(()=>{'use strict';
const KEY='premiumTicketTracker.v1';
let syncing=false,lastRaw='';
function sync(reason='live'){if(syncing)return;const raw=localStorage.getItem(KEY)||'[]';if(raw===lastRaw&&reason!=='force')return;let next;try{next=JSON.parse(raw)}catch{return}if(!Array.isArray(next))return;syncing=true;try{
  // app.js uses a global lexical `tickets` binding. Keep that in-memory source aligned
  // with persistence before rendering, so Save Stamp never needs a reload.
  tickets=next;lastRaw=raw;render();
  window.dispatchEvent(new CustomEvent('ticket-records-rendered',{detail:{reason}}));
}catch(e){console.error('Instant ticket record sync failed',e)}finally{syncing=false}}
window.instantTicketRecordSync=()=>sync('force');
window.addEventListener('ticket-data-updated',()=>sync('data'));
window.addEventListener('ticket-live-sync',()=>sync('live'));
window.addEventListener('storage',e=>{if(!e.key||e.key===KEY)sync('storage')});
window.addEventListener('firebase-data-saved',()=>sync('firebase'));
// Save Stamp is intercepted by the inbound handler before app.js in some paths.
// Run after that same click turn and render directly from the newly saved record.
document.addEventListener('click',e=>{if(e.target.closest?.('#saveStampBtn'))queueMicrotask(()=>sync('force'))},true);
document.addEventListener('submit',e=>{if(e.target?.id==='ticketForm')queueMicrotask(()=>sync('force'))},true);
lastRaw=localStorage.getItem(KEY)||'[]';
})();