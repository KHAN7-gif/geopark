export const SUPERADMIN_KEY='jelajah-labuan-superadmin-mode';
export const SUPERADMIN_XP=1000000;
const PROGRESS_KEYS=new Set(['jelajah-labuan-v1','jelajah-labuan-player','jelajah-labuan-profile-v1','jelajah-labuan-timed-travel-v1','jelajah-labuan-shop-v1','jelajah-labuan-travel-rewards-v1','jelajah-labuan-roam-v1']);
export function superadminEnabled(storage,search=''){const mode=new URLSearchParams(search).get('mode');if(mode==='superadmin')return true;if(mode==='player')return false;try{return storage.getItem(SUPERADMIN_KEY)==='on'}catch{return false}}
export function scopedGameStorage(storage,enabled){const key=name=>enabled&&PROGRESS_KEYS.has(name)?'superadmin:'+name:name;return {getItem:name=>storage.getItem(key(name)),setItem:(name,value)=>storage.setItem(key(name),value),removeItem:name=>storage.removeItem(key(name))}}
export function superadminURL(href,enabled){const url=new URL(href);url.searchParams.set('mode',enabled?'superadmin':'player');return url.href}
export function superadminInventory(transports,selected='walk'){return {version:1,owned:Object.values(transports).filter(m=>m.available).map(m=>m.id),selected:transports[selected]?.available?selected:'walk'}}
export function superadminPreviewRecords(sites,records,now=Date.now()){return Object.fromEntries(sites.map(s=>[s.id,{...records[s.id],arrived:records[s.id]?.arrived||now,done:records[s.id]?.done||now}]))}
