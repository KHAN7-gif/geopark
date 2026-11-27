import test from 'node:test';
import assert from 'node:assert/strict';
import {SUPERADMIN_KEY,SUPERADMIN_XP,superadminEnabled,scopedGameStorage,superadminURL,superadminInventory,superadminPreviewRecords} from '../dist/superadmin.mjs';
import {TRANSPORTS,validateShop} from '../dist/transport-shop.mjs';
test('Superadmin routes are explicit and a player route overrides a saved admin preference',()=>{
 const storage={getItem:()=> 'on'};assert.ok(superadminEnabled(storage));assert.ok(superadminEnabled({getItem:()=>null},'?mode=superadmin'));assert.equal(superadminEnabled(storage,'?mode=player'),false);const url=new URL(superadminURL('https://example.test/geopark/?v=latest#map',true));assert.equal(url.searchParams.get('mode'),'superadmin');assert.equal(url.searchParams.get('v'),'latest');assert.equal(url.hash,'#map');assert.equal(new URL(superadminURL(url.href,false)).searchParams.get('mode'),'player');
});
test('admin gameplay writes cannot overwrite normal records, shop, route, profile or free-walk position',()=>{
 const data=new Map(),base={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)},player=scopedGameStorage(base,false),admin=scopedGameStorage(base,true),keys=['jelajah-labuan-v1','jelajah-labuan-player','jelajah-labuan-profile-v1','jelajah-labuan-timed-travel-v1','jelajah-labuan-shop-v1','jelajah-labuan-travel-rewards-v1','jelajah-labuan-roam-v1'];for(const key of keys){player.setItem(key,'original:'+key);admin.setItem(key,'admin:'+key);assert.equal(player.getItem(key),'original:'+key);assert.equal(admin.getItem(key),'admin:'+key)}admin.removeItem(keys[0]);assert.equal(player.getItem(keys[0]),'original:'+keys[0]);admin.setItem('jelajah-labuan-ambient-v1','shared-settings');assert.equal(player.getItem('jelajah-labuan-ambient-v1'),'shared-settings');assert.ok(SUPERADMIN_KEY);
});
test('all transports are available in a valid admin inventory without altering the original catalogue',()=>{
 const before=JSON.stringify(TRANSPORTS),inventory=superadminInventory(TRANSPORTS,'boat_vip');assert.equal(inventory.owned.length,7);assert.equal(inventory.selected,'boat_vip');assert.deepEqual(validateShop(inventory,SUPERADMIN_XP),inventory);assert.equal(superadminInventory(TRANSPORTS,'invalid').selected,'walk');assert.equal(JSON.stringify(TRANSPORTS),before);
});
test('full access collection previews never mark actual mission records as completed',()=>{
 const sites=[{id:'G1'},{id:'B1'}],records={G1:{arrived:100,done:150}},before=JSON.stringify(records),preview=superadminPreviewRecords(sites,records,1000);assert.equal(preview.B1.done,1000);assert.equal(preview.G1.done,150);assert.equal(JSON.stringify(records),before);assert.notEqual(preview.G1,records.G1);
});
