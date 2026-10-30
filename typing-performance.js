(()=>{'use strict';
const ids=['ticketNumber','stampTicket','stampedTime','answerTime'];
const inputs=ids.map(id=>document.getElementById(id)).filter(Boolean);
if(!inputs.length)return;
// Keep the typing path native: no per-key DOM rendering, storage work, or animation bookkeeping.
for(const el of inputs){
 el.style.transition='border-color .05s ease, box-shadow .05s ease';
 el.style.willChange='auto';
 el.style.contain='layout style';
}
const complete=v=>/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\s*UTC)?$/i.test(String(v||'').trim());
let idleTimer=0;
function schedulePickup(){
 clearTimeout(idleTimer);
 idleTimer=setTimeout(()=>{
  const s=document.getElementById('stampedTime'),a=document.getElementById('answerTime');
  if(s&&a&&complete(s.value)&&complete(a.value)&&typeof window.calculatePickup==='function')window.calculatePickup();
 },180);
}
// Only timestamp fields need a post-typing calculation. Ticket-number fields have zero input listeners here.
document.getElementById('stampedTime')?.addEventListener('input',schedulePickup,{passive:true});
document.getElementById('answerTime')?.addEventListener('input',schedulePickup,{passive:true});
})();