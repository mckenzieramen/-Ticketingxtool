'use strict';
chrome.commands.onCommand.addListener(async command=>{
 if(command!=='instant-stamp')return;
 try{
  const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
  if(tab?.id)chrome.tabs.sendMessage(tab.id,{type:'INSTANT_STAMP'}).catch(()=>{});
 }catch{}
});