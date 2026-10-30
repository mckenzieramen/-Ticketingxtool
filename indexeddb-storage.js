(()=>{'use strict';
const DB_NAME='premiumTicketTrackerDB',DB_VERSION=1,STORE='appData';
const KEYS=['premiumTicketTracker.v1','premiumTicketTracker.attendance.v1','premiumTicketTracker.monthlyArchives.v1'];
let dbPromise=null,writeTimers=new Map();
function openDB(){if(dbPromise)return dbPromise;dbPromise=new Promise((resolve,reject)=>{if(!('indexedDB'in window)){reject(new Error('IndexedDB unavailable'));return}const req=indexedDB.open(DB_NAME,DB_VERSION);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE)};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)});return dbPromise}
async function put(key,value){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(value,key);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)})}
async function get(key){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readonly'),req=tx.objectStore(STORE).get(key);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
function parse(raw,fallback){try{return JSON.parse(raw??JSON.stringify(fallback))}catch{return fallback}}
function queueMirror(key,raw){if(!KEYS.includes(key))return;clearTimeout(writeTimers.get(key));writeTimers.set(key,setTimeout(()=>{put(key,parse(raw,key==='premiumTicketTracker.monthlyArchives.v1'?{}:[])).catch(()=>{})},120))}
async function migrate(){try{await openDB();for(const key of KEYS){const raw=localStorage.getItem(key),existing=await get(key);if(existing===undefined&&raw!==null)await put(key,parse(raw,key==='premiumTicketTracker.monthlyArchives.v1'?{}:[]))}window.dispatchEvent(new CustomEvent('indexeddb-storage-ready'))}catch(e){console.warn('IndexedDB storage fallback active',e)}}
const nativeSet=Storage.prototype.setItem,nativeRemove=Storage.prototype.removeItem,nativeClear=Storage.prototype.clear;
Storage.prototype.setItem=function(key,value){const out=nativeSet.call(this,key,value);if(this===localStorage)queueMirror(String(key),String(value));return out};
Storage.prototype.removeItem=function(key){const out=nativeRemove.call(this,key);if(this===localStorage&&KEYS.includes(String(key)))queueMirror(String(key),null);return out};
Storage.prototype.clear=function(){const out=nativeClear.call(this);if(this===localStorage)KEYS.forEach(k=>queueMirror(k,null));return out};
window.TicketDB={get,put,ready:()=>openDB(),getTickets:()=>get('premiumTicketTracker.v1'),getAttendance:()=>get('premiumTicketTracker.attendance.v1'),getArchives:()=>get('premiumTicketTracker.monthlyArchives.v1')};
migrate();
})();