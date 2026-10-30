(()=>{'use strict';
const TARGET=20,KEY='premiumTicketTracker.v1';
const getStamp=()=>document.getElementById('stampedTime'),getAnswer=()=>document.getElementById('answerTime'),getBox=()=>document.getElementById('pickupResult');
const oldAnswer=getAnswer();if(oldAnswer&&!oldAnswer.dataset.instantInput){const fresh=oldAnswer.cloneNode(true);fresh.dataset.instantInput='1';fresh.setAttribute('inputmode','text');fresh.setAttribute('autocomplete','off');fresh.placeholder='YYYY-MM-DD HH:mm:ss UTC';oldAnswer.replaceWith(fresh)}
function parts(v,suffix){const clean=String(v||'').trim().replace(suffix,'').trim();const m=clean.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/);if(!m)return null;return m.slice(1).map(Number)}
function parsePH(v){const p=parts(v,/\s*(?:PH|PHT|PH\s*Time)\s*$/i);if(!p)return null;const [y,mo,d,h,mi,s]=p;return Date.UTC(y,mo-1,d,h-8,mi,s)}
function parseUTC(v){const p=parts(v,/\s*UTC\s*$/i);if(!p)return null;const [y,mo,d,h,mi,s]=p;return Date.UTC(y,mo-1,d,h,mi,s)}
function waiting(box){if(!box||box.dataset.pickupState==='waiting')return;box.dataset.pickupState='waiting';box.className='pickup-result empty';box.innerHTML='<div><span class="bolt">ϟ</span><div><small>Pickup Time</small><strong>Waiting for timestamps</strong><em>Press STAMP TIME in PH time, then paste System / Answer Time in UTC.</em></div></div>'}
function calculate(){const stamp=getStamp(),answer=getAnswer(),box=getBox();if(!stamp||!answer||!box)return null;const a=parsePH(stamp.value),b=parseUTC(answer.value);if(a==null||b==null){waiting(box);return null}const sec=Math.round(Math.abs(a-b)/1000),ok=sec<=TARGET,state=`${sec}|${ok}`;if(box.dataset.pickupState!==state){box.dataset.pickupState=state;box.className='pickup-result '+(ok?'':'late');box.innerHTML=`<div><span class="bolt">ϟ</span><div><small>Pickup Time</small><strong>${sec} second${sec===1?'':'s'} · ${ok?'Within Target':'Over Target'}</strong><em>PH stamp normalized to UTC automatically · Target: ≤ ${TARGET} seconds</em></div></div>`}return sec}
window.calculatePickup=calculate;
let frame=0;function schedule(){if(frame)return;frame=requestAnimationFrame(()=>{frame=0;const s=getStamp()?.value.trim()||'',a=getAnswer()?.value.trim()||'';if(s.length>=19&&a.replace(/\s*UTC\s*$/i,'').trim().length>=19)calculate()})}
function normalizeAnswer(){const input=getAnswer();if(!input)return;const v=input.value.trim(),m=v.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\s*UTC)?$/i);if(m){const next=`${m[1]}-${m[2]}-${m[3]} ${m[4]}:${m[5]}:${m[6]} UTC`;if(input.value!==next)input.value=next}schedule()}
document.addEventListener('input',e=>{if(e.target?.id==='stampedTime'||e.target?.id==='answerTime')schedule()},{passive:true});
document.addEventListener('change',e=>{if(e.target?.id==='answerTime')normalizeAnswer()},{passive:true});
document.addEventListener('blur',e=>{if(e.target?.id==='answerTime')normalizeAnswer()},true);
document.addEventListener('paste',e=>{if(e.target?.id==='answerTime')requestAnimationFrame(normalizeAnswer);else if(e.target?.id==='stampedTime')requestAnimationFrame(schedule)},{passive:true});
let syncing=false,lastRaw=localStorage.getItem(KEY)||'[]';
function syncRecords(force=false){if(syncing)return;const raw=localStorage.getItem(KEY)||'[]';if(!force&&raw===lastRaw)return;let next;try{next=JSON.parse(raw)}catch{return}if(!Array.isArray(next))return;syncing=true;try{tickets=next;lastRaw=raw;render();window.dispatchEvent(new CustomEvent('ticket-records-rendered'))}catch(e){console.error('Instant record sync failed',e)}finally{syncing=false}}
window.instantTicketRecordSync=()=>syncRecords(true);
window.addEventListener('ticket-data-updated',()=>syncRecords());
window.addEventListener('ticket-live-sync',()=>syncRecords());
window.addEventListener('storage',e=>{if(!e.key||e.key===KEY)syncRecords()});
document.addEventListener('click',e=>{if(e.target.closest?.('#saveStampBtn'))queueMicrotask(()=>syncRecords(true))},true);
document.addEventListener('submit',e=>{if(e.target?.id==='ticketForm')queueMicrotask(()=>syncRecords(true))},true);
queueMicrotask(calculate);
})();