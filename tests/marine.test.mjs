import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {MARINE_DATA,prepareMarineRoute,TRANSPORTS,defaultShop,purchaseTransport,validateShop,validateJourney,journeyAt,validateRoute} from '../dist/travel-engine.mjs';
import {validSeaPath,pathMetres} from '../dist/marine-geometry.mjs';
import {creditRewards,defaultRewards,rewardTotals,distanceTotals} from '../dist/travel-rewards.mjs';
import {buildExplorerModel} from '../dist/explorer-model.mjs';
import {jettyFeatures} from '../dist/jetty-scene.mjs';
const sites=JSON.parse(await readFile(new URL('../dist/locations.json',import.meta.url))),by=id=>sites.find(s=>s.id===id);
const mock=async url=>{const port=MARINE_DATA.ports.find(p=>url.includes(`${p.lng},${p.lat}`));assert.ok(port);const fixture=JSON.parse(await readFile(new URL(`./fixtures/port-${port.id}.json`,import.meta.url)));if(url.includes(`driving/${port.lng},${port.lat};`)){fixture.routes[0].geometry.coordinates.reverse();fixture.routes[0].legs[0].annotation.duration.reverse();fixture.waypoints.reverse()}return {ok:true,json:async()=>fixture}};
test('three user pins provide distinct vessels and slower affordable perahu',()=>{
 assert.deepEqual(MARINE_DATA.ports.map(p=>[p.name,p.lat,p.lng]),[['Jeti Kampung Bebuloh Laut',5.2745941,115.1939112],['Terminal Feri Antarabangsa',5.2769788,115.2409645],['Marina Labuan',5.2732596,115.2486685]]);
 assert.ok(TRANSPORTS.perahu.speed<TRANSPORTS.boat.speed&&TRANSPORTS.boat.speed<TRANSPORTS.boat_vip.speed);
 let shop=defaultShop();for(const id of Object.keys(TRANSPORTS))shop=purchaseTransport(shop,id,3000);assert.equal(validateShop(shop,3000).owned.length,7);assert.equal(jettyFeatures().features.length,6);
});
test('all marine corridors avoid mapped land, and water-crossing imports are validated',()=>{for(const r of Object.values(MARINE_DATA.routes))assert.ok(validSeaPath(r.path),`${r.from}:${r.to}`);assert.equal(validSeaPath([[5.27,115.16],[5.35,115.29]]),false)});
test('vessels walk to their assigned jetty, cross sea, walk inland, restore and accrue XP / km',async()=>{
 for(const mode of ['perahu','boat','boat_vip']){
  const route=await prepareMarineRoute(by('C5'),by('C9'),mode,{fetcher:mock});assert.equal(route.legs.length,3);assert.equal(route.legs[1].mode,mode);assert.equal(route.provider,'GEOPARK-MIXED');
  const port=MARINE_DATA.ports.find(p=>p.mode===mode);assert.deepEqual(route.legs[1].path[0],[port.lat,port.lng]);
  const start=Date.now()-86400000,j=validateJourney({version:1,fromId:'C5',toId:'C9',route,startedAt:start,pausedMs:0,pausedAt:null},sites);
  const end=start+route.durationSeconds/3*1000+10;assert.equal(journeyAt(j,end).arrived,true);
  const rewards=creditRewards(defaultRewards(),j,end),totals=distanceTotals(rewards);assert.ok(totals.byMode.walk>0);assert.ok(totals.byMode[mode]>0);assert.ok(Math.abs(totals.totalMetres-route.distanceMetres)<2);assert.ok(rewardTotals(rewards).xp>0);
  const back=await prepareMarineRoute(by('C9'),by('C5'),mode,{fetcher:mock});assert.deepEqual(back.path[0],[by('C9').lat,by('C9').lng]);
  const sea=route.legs[1];assert.throws(()=>validateRoute({...sea,path:[[5.27,115.16],[5.35,115.29]],segmentSeconds:[1],distanceMetres:pathMetres([[5.27,115.16],[5.35,115.29]])}));
 }
});
test('same-island walking and offshore observation use separate access; all boat models dispose',async()=>{
 const walking=await prepareMarineRoute(by('G6'),by('C9'),'walk');assert.equal(walking.mode,'walk');
 const crossing=await prepareMarineRoute(by('G7'),by('B4'),'perahu');assert.equal(crossing.mode,'perahu');
 for(const mode of ['perahu','boat','boat_vip']){const model=buildExplorerModel(mode);assert.ok(model.root.children.length>2);model.animate(1,true);model.dispose()}
});
test('each sea mode earns exactly 10 XP per five moving minutes and excludes pauses',async()=>{
 for(const mode of ['perahu','boat','boat_vip']){
  const route=await prepareMarineRoute(by('C5'),by('C9'),mode,{fetcher:mock});const sea=route.legs.find(l=>l.mode===mode);const start=Date.now()-86400000,j={version:1,fromId:'C5',toId:'C9',route:sea,startedAt:start,pausedMs:0,pausedAt:null};
  // Use a repeated long sea route to cover a full reward interval even with the fastest boat.
  const longPath=[...sea.path,...sea.path.slice(0,-1).reverse(),...sea.path.slice(1)];const distance=pathMetres(longPath);j.route={...sea,path:longPath,distanceMetres:distance,durationSeconds:distance/TRANSPORTS[mode].speed*3.6,sourceSeconds:distance/TRANSPORTS[mode].speed*3.6,segmentSeconds:longPath.slice(1).map((p,i)=>pathMetres([longPath[i],p]))};
  assert.equal(rewardTotals(creditRewards(defaultRewards(),j,start+299999)).xp,0);const first=creditRewards(defaultRewards(),j,start+300000);assert.equal(rewardTotals(first).xp,10);
  const paused={...j,pausedAt:start+300000};assert.equal(rewardTotals(creditRewards(first,paused,start+900000)).xp,10);
 }
});
