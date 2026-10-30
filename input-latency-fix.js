(()=>{'use strict';
// app.js attached a synchronous pickup renderer directly to #answerTime before the
// timezone-aware runtime loads. Replace only that input node once so normal typing/paste
// is handled by the browser immediately; all save handlers resolve the field by id.
const old=document.getElementById('answerTime');if(!old||old.dataset.instantInput==='1')return;
const input=old.cloneNode(true);input.dataset.instantInput='1';input.setAttribute('inputmode','text');input.setAttribute('autocomplete','off');input.placeholder='YYYY-MM-DD HH:mm:ss UTC';old.replaceWith(input);
let frame=0;
function schedule(){if(frame)return;frame=requestAnimationFrame(()=>{frame=0;const value=input.value.trim();if(value.replace(/\s*UTC\s*$/i,'').trim().length>=19&&typeof window.calculatePickup==='function')window.calculatePickup()})}
function normalize(){const v=input.value.trim();const m=v.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\s*UTC)?$/i);if(m){const next=`${m[1]}-${m[2]}-${m[3]} ${m[4]}:${m[5]}:${m[6]} UTC`;if(input.value!==next)input.value=next}schedule()}
input.addEventListener('input',schedule,{passive:true});
input.addEventListener('change',normalize,{passive:true});
input.addEventListener('blur',normalize,{passive:true});
input.addEventListener('paste',()=>requestAnimationFrame(normalize),{passive:true});
})();