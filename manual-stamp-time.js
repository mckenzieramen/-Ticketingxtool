(()=>{'use strict';
const input=document.getElementById('stampedTime');
if(!input)return;
const STAMP_DRAFT_KEY='premiumTicketTracker.currentStampDraft.v1';
input.readOnly=false;input.placeholder='YYYY-MM-DD HH:mm:ss';input.setAttribute('autocomplete','off');input.setAttribute('inputmode','numeric');input.setAttribute('aria-label','Stamped Time in PH Time. Press STAMP TIME or Ctrl+Space for immediate capture, or enter manually.');
const phParts=d=>Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Manila',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(d).map(x=>[x.type,x.value]));
const saveDraft=()=>{try{const value=input.value.trim();if(value)localStorage.setItem(STAMP_DRAFT_KEY,JSON.stringify({value,preciseEpoch:input.dataset.preciseEpoch||'',savedAt:Date.now()}));else localStorage.removeItem(STAMP_DRAFT_KEY)}catch{}};
const refreshPickup=()=>{if(typeof window.calculatePickup==='function')window.calculatePickup()};
const restoreDraft=()=>{try{const d=JSON.parse(localStorage.getItem(STAMP_DRAFT_KEY)||'null');if(d&&d.value){input.value=d.value;if(d.preciseEpoch)input.dataset.preciseEpoch=String(d.preciseEpoch)}}catch{}};
let noticeTimer=null;
const showStampedNotice=value=>{let n=document.getElementById('instantStampNotice');if(!n){n=document.createElement('div');n.id='instantStampNotice';n.setAttribute('role','status');n.setAttribute('aria-live','polite');Object.assign(n.style,{position:'fixed',top:'18px',left:'50%',transform:'translateX(-50%) translateY(-12px)',zIndex:'1000000',background:'#0f7a4d',color:'#fff',padding:'10px 16px',borderRadius:'10px',font:'700 13px Inter,system-ui,sans-serif',boxShadow:'0 10px 28px rgba(0,0,0,.22)',opacity:'0',transition:'opacity .1s ease,transform .1s ease',pointerEvents:'none',whiteSpace:'nowrap'});document.body.appendChild(n)}n.textContent=`✓ STAMPED · ${value} PH`;clearTimeout(noticeTimer);requestAnimationFrame(()=>{n.style.opacity='1';n.style.transform='translateX(-50%) translateY(0)'});noticeTimer=setTimeout(()=>{n.style.opacity='0';n.style.transform='translateX(-50%) translateY(-8px)'},1100)};
let lastStampAt=0;
const instantStamp=()=>{const d=new Date(),p=phParts(d),epoch=d.getTime();lastStampAt=performance.now();const value=`${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second}`;input.value=value;input.dataset.preciseEpoch=String(epoch);input.dataset.stampedAtPerformance=String(lastStampAt);saveDraft();refreshPickup();showStampedNotice(value);return epoch;};
window.instantTicketStamp=instantStamp;window.clearTicketStampDraft=()=>{try{localStorage.removeItem(STAMP_DRAFT_KEY)}catch{}};
const stampBtn=document.getElementById('stampBtn');
if(stampBtn){
 const capture=e=>{if(e.isPrimary===false)return;if(e.button!==undefined&&e.button!==0)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();instantStamp();stampBtn.dataset.instantStamped='1';};
 stampBtn.addEventListener('pointerdown',capture,{capture:true,passive:false});
 stampBtn.addEventListener('mousedown',e=>{if(stampBtn.dataset.instantStamped==='1'||e.button!==0)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();instantStamp();stampBtn.dataset.instantStamped='1';},{capture:true});
 stampBtn.addEventListener('touchstart',e=>{if(stampBtn.dataset.instantStamped==='1')return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();instantStamp();stampBtn.dataset.instantStamped='1';},{capture:true,passive:false});
 stampBtn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();if(performance.now()-lastStampAt>250)instantStamp();delete stampBtn.dataset.instantStamped;},{capture:true});
 stampBtn.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&!e.repeat){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();instantStamp();}},{capture:true});
}
document.addEventListener('keydown',e=>{if(!e.ctrlKey||e.altKey||e.metaKey||e.code!=='Space'||e.repeat)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();instantStamp();if(stampBtn){stampBtn.classList.add('shortcut-stamped');setTimeout(()=>stampBtn.classList.remove('shortcut-stamped'),100)}},{capture:true});
const normalize=()=>{const v=input.value.trim();if(!v){saveDraft();refreshPickup();return}const m=v.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/);if(m)input.value=`${m[1]}-${m[2]}-${m[3]} ${m[4]}:${m[5]}:${m[6]}`;saveDraft();refreshPickup();};
// Native typing has no storage/render handler. Persist only when the edit is committed.
input.addEventListener('change',normalize);input.addEventListener('blur',normalize);input.addEventListener('paste',()=>setTimeout(normalize,0),{passive:true});
restoreDraft();
})();