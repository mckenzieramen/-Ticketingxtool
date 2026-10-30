(()=>{
  'use strict';
  const STAMP_KEY='ticketTrackerQuickStamp';
  const isTracker=location.hostname==='ticketing-1n5.pages.dev';
  const isOwl=location.hostname==='owl.xtool.com';
  let lastNonce='';

  const pad=n=>String(n).padStart(2,'0');
  const phTime=timestamp=>{
    const parts=new Intl.DateTimeFormat('en-CA',{
      timeZone:'Asia/Manila',year:'numeric',month:'2-digit',day:'2-digit',
      hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'
    }).formatToParts(new Date(timestamp));
    const get=t=>parts.find(p=>p.type===t)?.value||'';
    return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')}`;
  };

  function showNotice(text){
    let el=document.getElementById('quickStampNotice');
    if(!el){
      el=document.createElement('div');el.id='quickStampNotice';
      Object.assign(el.style,{position:'fixed',right:'18px',bottom:'18px',zIndex:'2147483647',background:'#0b4f82',color:'#fff',padding:'11px 15px',borderRadius:'10px',font:'700 12px Inter,Arial,sans-serif',boxShadow:'0 10px 30px rgba(0,0,0,.22)',transition:'opacity .2s'});
      document.documentElement.appendChild(el);
    }
    el.textContent=text;el.style.opacity='1';clearTimeout(el._timer);el._timer=setTimeout(()=>el.style.opacity='0',1800);
  }

  function applyStamp(stamp){
    if(!isTracker||!stamp?.timestamp||stamp.nonce===lastNonce)return;
    const input=document.getElementById('stampedTime');
    if(!input)return;
    lastNonce=stamp.nonce||String(stamp.timestamp);
    input.value=phTime(stamp.timestamp);
    input.dispatchEvent(new Event('input',{bubbles:true}));
    input.dispatchEvent(new Event('change',{bubbles:true}));
    showNotice(`Call stamped: ${input.value}`);
  }

  if(isOwl){
    document.addEventListener('keydown',event=>{
      if(event.ctrlKey&&event.code==='Space'&&!event.altKey&&!event.metaKey){
        event.preventDefault();event.stopImmediatePropagation();
        chrome.runtime.sendMessage({type:'QUICK_STAMP',timestamp:Date.now()});
        showNotice('Call time stamped');
      }
    },true);
  }

  if(isTracker){
    chrome.storage.local.get(STAMP_KEY,result=>applyStamp(result[STAMP_KEY]));
    chrome.storage.onChanged.addListener((changes,area)=>{
      if(area==='local'&&changes[STAMP_KEY]?.newValue)applyStamp(changes[STAMP_KEY].newValue);
    });
  }
})();
