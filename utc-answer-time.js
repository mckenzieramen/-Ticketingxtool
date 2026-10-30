(()=>{'use strict';
const originalParse=window.parseDate;
function parseUTCAnswer(value){const v=String(value||'').trim();const m=v.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\s*UTC)?$/i);if(!m)return null;return new Date(Date.UTC(+m[1],+m[2]-1,+m[3],+m[4],+m[5],+m[6]));}
window.parseDate=function(value){const v=String(value||'').trim();if(/UTC$/i.test(v))return parseUTCAnswer(v);return originalParse?originalParse(v):null;};
const input=document.getElementById('answerTime');if(!input)return;
input.setAttribute('inputmode','text');input.setAttribute('aria-label','System / Answer Time in UTC');input.placeholder='YYYY-MM-DD HH:mm:ss UTC';
const calculate=()=>{if(typeof window.calculatePickup==='function')window.calculatePickup()};
const normalize=()=>{const v=input.value.trim();if(!v){calculate();return}const m=v.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\s*UTC)?$/i);if(m){const next=`${m[1]}-${m[2]}-${m[3]} ${m[4]}:${m[5]}:${m[6]} UTC`;if(input.value!==next)input.value=next}calculate();};
// No input listener here: native typing paints first. Calculation is handled after typing settles by typing-performance.js.
input.addEventListener('change',normalize);
input.addEventListener('blur',normalize);
input.addEventListener('paste',()=>setTimeout(normalize,0),{passive:true});
})();