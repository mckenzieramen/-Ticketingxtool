(()=>{'use strict';
const KEY='premiumTicketTracker.v1';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const statusColor=s=>({'Open':'#39a7e8','Pending':'#f7b916','On Hold':'#ef4c4c','Solved':'#16b86c','Closed':'#728296','Merged':'#7c3aed'}[s]||'#728296');
const typeColor=s=>s==='Inbound Call'?'#13b76a':'#7145e8';
function parse(v){const m=String(v||'').match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/);return m?new Date(+m[1],+m[2]-1,+m[3],+m[4],+m[5],+m[6]):null}
function days(a,b){a=parse(a);b=parse(b);return !a||!b||b<a?'—':`${((b-a)/86400000).toFixed(2)} days`}
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}}
function filtered(list){const q=($('searchInput')?.value||'').trim().toLowerCase(),type=$('typeFilter')?.value||'',status=$('statusFilter')?.value||'';return list.filter(t=>(!q||String(t.number||'').toLowerCase().includes(q))&&(!type||t.callType===type)&&(!status||t.status===status))}
function row(t,i){const pickup=t.pickupSeconds==null?'—':`${t.pickupSeconds} sec`,pickupBg=t.pickupSeconds==null?'#eef2f6':t.pickupSeconds<=20?'#d9f8e7':'#ffe1df';return `<tr><td>${i+1}</td><td><b>${esc(t.number)}</b></td><td><span class="type-pill" style="background:${typeColor(t.callType)}20;color:${typeColor(t.callType)}">${esc(t.callType)}</span></td><td>${esc(t.creation||'—')}</td><td><span class="status-pill" style="background:${statusColor(t.status)};color:#fff">${esc(t.status)}</span></td><td>${esc(t.solvedTime||'—')}</td><td>${esc(t.expectedClose||'—')}</td><td>${esc(t.closedTime||'—')}</td><td><b>${t.closedTime?days(t.creation,t.closedTime):'—'}</b></td><td><span class="pickup-pill" style="background:${pickupBg}">${pickup}</span></td><td><button class="action-btn edit" onclick="editTicket('${esc(t.id)}')">✎</button><button class="action-btn view" onclick="viewTicket('${esc(t.id)}')">◉</button><button class="action-btn delete" onclick="deleteTicket('${esc(t.id)}')">×</button></td></tr>`}
function renderRecords(list=read()){
 const body=$('ticketTableBody');if(!body)return;
 const rows=filtered(list);body.innerHTML=rows.map(row).join('');
 const empty=$('emptyState');if(empty)empty.style.display=rows.length?'none':'block';
 window.dispatchEvent(new CustomEvent('ticket-records-rendered',{detail:{count:rows.length}}));
}
function sync(e){const list=Array.isArray(e?.detail?.tickets)?e.detail.tickets:read();renderRecords(list)}
window.addEventListener('ticket-record-saved',sync);
window.addEventListener('ticket-data-updated',e=>{if(e.detail?.source==='inbound-save')sync(e)});
window.instantRenderTicketRecords=renderRecords;
})();