(()=>{'use strict';
const KEY='premiumTicketTracker.v1',TARGET=20;
const read=()=>{try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}};
function update(){
 const tickets=read(),inbound=tickets.filter(t=>t.callType==='Inbound Call'),pickups=inbound.map(t=>Number(t.pickupSeconds)).filter(Number.isFinite),passed=pickups.filter(v=>v<=TARGET).length,failed=pickups.filter(v=>v>=21).length,total=pickups.length,rate=total?passed/total*100:null;
 const rateEl=document.getElementById('pickupRate'),sub=document.getElementById('pickupRateSub'),avg=document.getElementById('avgPickup'),avgSub=document.getElementById('avgPickupSub');
 if(rateEl)rateEl.textContent=rate==null?'—':`${rate.toFixed(2)}%`;
 if(sub)sub.textContent=total?`${passed} Passed (≤20s) · ${failed} Failed (≥21s) · ${total} Total`:'No stamped inbound tickets';
 if(avgSub){if(total){const average=pickups.reduce((a,b)=>a+b,0)/total;avgSub.textContent=`Average ${average.toFixed(1)} sec · Rate is based on individual Passed/Failed tickets`;}else avgSub.textContent='Inbound calls';}
 document.querySelectorAll('#ticketTableBody tr').forEach(row=>{const cells=row.querySelectorAll('td');if(cells.length<10)return;const type=(cells[2]?.textContent||'').trim(),pill=cells[9]?.querySelector('.pickup-pill');if(type!=='Inbound Call'||!pill)return;const m=(pill.textContent||'').match(/(-?\d+(?:\.\d+)?)\s*sec/i);if(!m)return;const sec=Number(m[1]),ok=sec<=TARGET;pill.dataset.pickupResult=ok?'passed':'failed';pill.title=ok?'Passed — pickup time is 20 seconds or less':'Failed — pickup time is 21 seconds or more';});
}
const style=document.createElement('style');style.textContent='#ticketTableBody .pickup-pill[data-pickup-result="passed"]{background:#d9f8e7!important;color:#087a43;font-weight:800}#ticketTableBody .pickup-pill[data-pickup-result="failed"]{background:#ffe1df!important;color:#c52b27;font-weight:800}';document.head.appendChild(style);
let queued=false;function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;update()})}
window.addEventListener('ticket-data-updated',schedule);window.addEventListener('storage',schedule);document.getElementById('ticketTableBody')&&new MutationObserver(schedule).observe(document.getElementById('ticketTableBody'),{childList:true,subtree:true});update();
})();