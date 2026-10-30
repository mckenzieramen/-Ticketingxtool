(()=>{'use strict';
const date=document.getElementById('todayDate'),clock=document.getElementById('currentTime');if(!date&&!clock)return;
let timer=null,lastDate='';
const dateFmt=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Manila',month:'long',day:'numeric',year:'numeric'});
const timeFmt=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Manila',hour:'numeric',minute:'2-digit',second:'2-digit'});
function paint(){
  const now=new Date();
  if(clock)clock.textContent=timeFmt.format(now);
  if(date){const next=dateFmt.format(now);if(next!==lastDate){lastDate=next;date.textContent=next}}
}
function schedule(){
  if(timer!==null)clearTimeout(timer);
  paint();
  const delay=Math.max(50,1000-(Date.now()%1000)+20);
  timer=setTimeout(schedule,delay);
}
function resync(){if(timer!==null)clearTimeout(timer);timer=null;schedule()}
schedule();
document.addEventListener('visibilitychange',()=>{if(!document.hidden)resync()});
window.addEventListener('focus',resync);
})();