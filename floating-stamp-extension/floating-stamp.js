(()=>{'use strict';
if(window.__ticketFloatingStampInstalled)return;
window.__ticketFloatingStampInstalled=true;

const pad=n=>String(n).padStart(2,'0');
const phStamp=()=>{
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Manila',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date());
 const p=Object.fromEntries(parts.map(x=>[x.type,x.value]));
 return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second}`;
};

function mount(){
 if(document.getElementById('__ticketFloatingStamp'))return;
 const host=document.createElement('div');
 host.id='__ticketFloatingStamp';
 host.style.cssText='position:fixed;right:18px;bottom:18px;z-index:2147483647;font-family:Inter,Arial,sans-serif;user-select:none;touch-action:none;';
 const shadow=host.attachShadow({mode:'open'});
 shadow.innerHTML=`<style>
 *{box-sizing:border-box}.wrap{display:flex;align-items:center;gap:8px;padding:7px;background:rgba(13,53,93,.94);border:1px solid rgba(255,255,255,.18);border-radius:16px;box-shadow:0 12px 35px rgba(0,0,0,.28);backdrop-filter:blur(10px)}
 button{border:0;cursor:pointer}.stamp{min-width:126px;height:48px;padding:0 16px;border-radius:11px;background:linear-gradient(135deg,#6734e9,#8731f0);color:#fff;font:800 13px Arial,sans-serif;letter-spacing:.2px;box-shadow:0 6px 16px rgba(113,55,237,.35)}.stamp:active{transform:scale(.97)}
 .drag{width:34px;height:48px;border-radius:10px;background:rgba(255,255,255,.1);color:#dbeafe;font-size:18px;cursor:grab}.drag:active{cursor:grabbing}.time{display:none;max-width:190px;color:#fff;font:700 11px Arial,sans-serif;padding:0 7px;white-space:nowrap}.wrap.done .time{display:block}.wrap.done .stamp{min-width:88px}.flash{animation:flash .25s ease}@keyframes flash{50%{transform:scale(1.04)}}
 </style><div class="wrap"><button class="drag" type="button" title="Drag">⋮⋮</button><button class="stamp" type="button">◷ STAMP TIME</button><span class="time"></span></div>`;
 document.documentElement.appendChild(host);
 const wrap=shadow.querySelector('.wrap'),stamp=shadow.querySelector('.stamp'),time=shadow.querySelector('.time'),drag=shadow.querySelector('.drag');
 let hideTimer=0;
 function capture(){
  const value=phStamp();
  const epoch=Date.now();
  time.textContent=value;wrap.classList.add('done','flash');setTimeout(()=>wrap.classList.remove('flash'),260);
  clearTimeout(hideTimer);hideTimer=setTimeout(()=>wrap.classList.remove('done'),3500);
  try{chrome.storage.local.set({ticketFloatingStamp:{value,epoch}})}catch{}
  window.postMessage({type:'TICKET_FLOATING_STAMP',value,epoch},'*');
  const field=document.getElementById('stampedTime');
  if(field){field.value=value;field.dataset.preciseEpoch=String(epoch);field.dispatchEvent(new Event('input',{bubbles:true}));}
 }
 stamp.addEventListener('pointerdown',e=>{if(e.button!==undefined&&e.button!==0)return;e.preventDefault();capture()},{capture:true});
 chrome.runtime.onMessage.addListener(msg=>{if(msg&&msg.type==='INSTANT_STAMP')capture()});
 let moving=false,sx=0,sy=0,left=0,top=0;
 drag.addEventListener('pointerdown',e=>{moving=true;const r=host.getBoundingClientRect();sx=e.clientX;sy=e.clientY;left=r.left;top=r.top;host.style.right='auto';host.style.bottom='auto';host.style.left=left+'px';host.style.top=top+'px';drag.setPointerCapture(e.pointerId);e.preventDefault()});
 drag.addEventListener('pointermove',e=>{if(!moving)return;const x=Math.max(6,Math.min(innerWidth-host.offsetWidth-6,left+e.clientX-sx));const y=Math.max(6,Math.min(innerHeight-host.offsetHeight-6,top+e.clientY-sy));host.style.left=x+'px';host.style.top=y+'px'});
 drag.addEventListener('pointerup',()=>{moving=false});
}
if(document.documentElement)mount();else document.addEventListener('DOMContentLoaded',mount,{once:true});
})();