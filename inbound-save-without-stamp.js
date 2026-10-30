(()=>{'use strict';
const KEY='premiumTicketTracker.v1';
const btn=document.getElementById('saveStampBtn');
if(!btn)return;
const pad=n=>String(n).padStart(2,'0');
const fmt=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
const cleanUTC=v=>String(v||'').trim().replace(/\s*UTC\s*$/i,'').replace('T',' ');
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}};
const syncVisibleUI=t=>{
 // Keep one explicit record event for the direct renderer. The storage bridge emits the
 // single live-sync event, avoiding several full-page refresh reactions for one save.
 window.dispatchEvent(new CustomEvent('ticket-record-saved',{detail:{tickets:t,source:'inbound-save'}}));
};
const write=t=>{localStorage.setItem(KEY,JSON.stringify(t));syncVisibleUI(t)};
const toast=msg=>{const el=document.getElementById('toast');if(!el)return;el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2200)};
function life(t,status,now){if(status==='Solved'&&t?.status!=='Solved'){const d=new Date();d.setTime(Date.now()+86400000);return{solvedTime:now,expectedClose:fmt(d),closedTime:'',closeReason:''}}if(status==='Merged')return{solvedTime:t?.solvedTime||'',expectedClose:'',closedTime:now,closeReason:'Merged'};if(!['Solved','Merged','Closed'].includes(status)&&t?.status!=='Closed')return{solvedTime:'',expectedClose:'',closedTime:'',closeReason:''};return{solvedTime:t?.solvedTime||'',expectedClose:t?.expectedClose||'',closedTime:t?.closedTime||'',closeReason:t?.closeReason||''}}
btn.addEventListener('click',e=>{
 const number=(document.getElementById('stampTicket')?.value||'').trim();
 const stamped=(document.getElementById('stampedTime')?.value||'').trim();
 const answerRaw=(document.getElementById('answerTime')?.value||'').trim();
 if(!number)return;
 let tickets=read();let t=tickets.find(x=>String(x.number||'').toLowerCase()===number.toLowerCase());
 if(t&&t.callType!=='Inbound Call'){e.preventDefault();e.stopImmediatePropagation();toast('This ticket already exists as an Outbound Call.');return}
 const status=document.getElementById('stampStatus')?.value||'Open',now=fmt(new Date());
 if(stamped&&answerRaw){
   const sec=typeof window.calculatePickup==='function'?window.calculatePickup():null;
   if(sec===null||!Number.isFinite(Number(sec)))return;
   e.preventDefault();e.stopImmediatePropagation();
   const answerUTC=cleanUTC(answerRaw),lifecycle=life(t,status,now);
   if(!t){t={id:crypto.randomUUID(),number,callType:'Inbound Call',creation:answerUTC,status,...lifecycle,pickupSeconds:Number(sec),stampedTime:stamped,answerTime:answerUTC};tickets.unshift(t)}
   else{Object.assign(t,{callType:'Inbound Call',creation:answerUTC,status,...lifecycle,pickupSeconds:Number(sec),stampedTime:stamped,answerTime:answerUTC})}
   write(tickets);
   document.getElementById('stampTicket').value='';document.getElementById('answerTime').value='';document.getElementById('stampedTime').value='';document.getElementById('stampStatus').value='Open';
   const box=document.getElementById('pickupResult');if(box){box.className='pickup-result empty';box.innerHTML='<div><span class="bolt">ϟ</span><div><small>Pickup Time</small><strong>Waiting for timestamps</strong><em>Enter the PH answer stamp and UTC call time.</em></div></div>'}
   toast('Inbound ticket saved. Ticket Creation uses System / Answer Time (UTC).');
   return;
 }
 if(stamped||answerRaw)return;
 e.preventDefault();e.stopImmediatePropagation();
 if(!t){t={id:crypto.randomUUID(),number,callType:'Inbound Call',creation:now,status,...life(null,status,now),pickupSeconds:null,stampedTime:'',answerTime:''};tickets.unshift(t)}
 else{Object.assign(t,{callType:'Inbound Call',status,...life(t,status,now),pickupSeconds:null,stampedTime:'',answerTime:''});if(!t.creation)t.creation=now}
 write(tickets);
 document.getElementById('stampTicket').value='';document.getElementById('stampStatus').value='Open';
 toast('Inbound ticket saved without timestamps. Pickup rate not counted.');
},true);
})();