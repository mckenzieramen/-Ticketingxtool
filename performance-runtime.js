(()=>{'use strict';
const TICKET_KEY='premiumTicketTracker.v1';
const nativeSetItem=Storage.prototype.setItem;
let nextSolvedDue=Infinity,refreshQueued=false,checkTimer=null;
function parseLocal(v){const m=String(v||'').match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/);if(!m)return NaN;return new Date(+m[1],+m[2]-1,+m[3],+m[4],+m[5],+m[6]).getTime()}
function refreshNextDue(){nextSolvedDue=Infinity;try{const rows=JSON.parse(localStorage.getItem(TICKET_KEY)||'[]');for(const t of rows){if(t?.status!=='Solved'||!t.expectedClose)continue;const due=parseLocal(t.expectedClose);if(Number.isFinite(due)&&due<nextSolvedDue)nextSolvedDue=due}}catch{nextSolvedDue=Infinity}}
function queueRefresh(){if(refreshQueued)return;refreshQueued=true;queueMicrotask(()=>{refreshQueued=false;refreshNextDue();scheduleDueCheck()})}
function scheduleDueCheck(){if(checkTimer!==null){clearTimeout(checkTimer);checkTimer=null}if(!Number.isFinite(nextSolvedDue))return;const wait=Math.max(250,Math.min(nextSolvedDue-Date.now()+50,2147483000));checkTimer=setTimeout(()=>{checkTimer=null;if(Date.now()>=nextSolvedDue){window.dispatchEvent(new CustomEvent('ticket-solved-due'));refreshNextDue()}scheduleDueCheck()},wait)}
refreshNextDue();scheduleDueCheck();
// Keep storage interception lightweight. The header clock is intentionally NOT handled here;
// accurate-current-time.js is the single owner of #todayDate and #currentTime.
Storage.prototype.setItem=function(k,v){const out=nativeSetItem.call(this,k,v);if(this===localStorage&&String(k)===TICKET_KEY)queueRefresh();return out};
})();