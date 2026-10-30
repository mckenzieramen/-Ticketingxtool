(()=>{'use strict';
// Firebase-only persistence bridge.
// One-time startup migration copies any old browser application cache into RAM, then deletes it from disk.
// After this file loads, all premiumTicketTracker.* reads/writes are RAM-only; Firestore is the permanent database.
const prefix='premiumTicketTracker.';
const memory=new Map();
const native={get:Storage.prototype.getItem,set:Storage.prototype.setItem,remove:Storage.prototype.removeItem,clear:Storage.prototype.clear,key:Storage.prototype.key};
const isAppKey=k=>String(k).startsWith(prefix);
const isLocal=s=>s===window.localStorage;
// Preserve the old cache only long enough for the existing UI to boot safely, then physically remove it.
try{
 const old=[];
 for(let i=0;i<localStorage.length;i++){const k=native.key.call(localStorage,i);if(k&&isAppKey(k))old.push(k)}
 for(const k of old){const v=native.get.call(localStorage,k);if(v!==null)memory.set(k,v)}
 for(const k of old)native.remove.call(localStorage,k);
}catch(e){console.warn('Firebase-only cache migration skipped',e)}
Storage.prototype.getItem=function(k){if(isLocal(this)&&isAppKey(k))return memory.has(String(k))?memory.get(String(k)):null;return native.get.call(this,k)};
Storage.prototype.setItem=function(k,v){if(isLocal(this)&&isAppKey(k)){memory.set(String(k),String(v));window.dispatchEvent(new CustomEvent('firebase-memory-write',{detail:{key:String(k)}}));return}return native.set.call(this,k,v)};
Storage.prototype.removeItem=function(k){if(isLocal(this)&&isAppKey(k)){memory.delete(String(k));window.dispatchEvent(new CustomEvent('firebase-memory-write',{detail:{key:String(k)}}));return}return native.remove.call(this,k)};
Storage.prototype.clear=function(){if(isLocal(this)){for(const k of [...memory.keys()])memory.delete(k);window.dispatchEvent(new CustomEvent('firebase-memory-write',{detail:{key:'*'}}));return}return native.clear.call(this)};
window.FirebaseOnlyMemory={get:k=>memory.get(String(k))??null,set:(k,v)=>memory.set(String(k),String(v)),remove:k=>memory.delete(String(k)),entries:()=>Object.fromEntries(memory),isApplicationKey:isAppKey};
})();