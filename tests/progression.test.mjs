import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {modeDuration,validateRoute,combineRouteLegs,journeyAt,creditRewards,defaultRewards,distanceTotals,rewardTotals,validateRewards,mergeRewards,travelOptions,requiresWalkingApproach} from '../dist/travel-engine.mjs';
const start=1700000000000;
const sites=JSON.parse(await readFile(new URL('../dist/locations.json',import.meta.url)));
function leg(mode,a,b,distance,seconds=900){return validateRoute({mode,path:[a,b],segmentSeconds:[seconds],durationSeconds:modeDuration(mode,distance,seconds),sourceSeconds:seconds,distanceMetres:distance,startAccessMetres:0,endAccessMetres:0})}
const points=[[5.30,115.20],[5.301,115.201],[5.32,115.22],[5.321,115.221]];
const trip=route=>({version:1,fromId:'G1',toId:'G2',route,startedAt:start,pausedAt:null,pausedMs:0});

test('all available land modes earn 10 XP per five moving game minutes',()=>{
 for(const mode of ['walk','bus','motor','car']){
  const route=leg(mode,points[0],points[3],30000,1800),j=trip(route),wait=mode==='bus'?40000:0;
  const early=creditRewards(defaultRewards(),j,start+wait+299999);
  assert.equal(rewardTotals(early).xp,0,mode);
  const ledger=creditRewards(early,j,start+wait+300000);
  assert.equal(rewardTotals(ledger).xp,10,mode);
  assert.ok(distanceTotals(ledger).byMode[mode]>0,mode);
  assert.equal(rewardTotals(creditRewards(ledger,j,start+wait+300000)).xp,10);
 }
});

test('forest access walks before and after the vehicle leg, including bus waiting at boarding',()=>{
 const walkIn=leg('walk',points[0],points[1],500),bus=leg('bus',points[1],points[2],5000),walkOut=leg('walk',points[2],points[3],250);
 const route=combineRouteLegs([walkIn,bus,walkOut]),j=trip(route);
 assert.equal(journeyAt(j,start+60000).mode,'walk');
 const waiting=journeyAt(j,start+150000);assert.equal(waiting.mode,'bus');assert.equal(waiting.waiting,true);
 assert.equal(journeyAt(j,start+200000).mode,'bus');
 assert.equal(journeyAt(j,start+420000).mode,'walk');
 assert.equal(journeyAt(j,start+460000).arrived,true);
 assert.equal(rewardTotals(creditRewards(defaultRewards(),j,start+300000)).xp,0);
 assert.equal(rewardTotals(creditRewards(defaultRewards(),j,start+340000)).xp,10);
 const complete=creditRewards(defaultRewards(),j,start+460000),totals=distanceTotals(complete);
 assert.ok(Math.abs(totals.byMode.walk-750)<.01);assert.ok(Math.abs(totals.byMode.bus-5000)<.01);
 assert.ok(Math.abs(totals.totalMetres-5750)<.01);
 assert.deepEqual(validateRoute(JSON.parse(JSON.stringify(route))),route);
});

test('paused time and replayed imports cannot increase XP or duplicate kilometres',()=>{
 const j=trip(leg('walk',points[0],points[3],5000));j.pausedAt=start+300000;
 const paused=creditRewards(defaultRewards(),j,start+900000);
 assert.equal(rewardTotals(paused).xp,10);
 assert.equal(distanceTotals(creditRewards(paused,j,start+1800000)).totalMetres,distanceTotals(paused).totalMetres);
 const restored=validateRewards(JSON.parse(JSON.stringify(paused)),sites);
 assert.deepEqual(mergeRewards(paused,restored,sites),restored);
 const legacy=JSON.parse(JSON.stringify(paused));for(const entry of Object.values(legacy.entries)){delete entry.routeMetres;delete entry.distanceByMode}
 assert.equal(distanceTotals(validateRewards(legacy,sites)).totalMetres,0);
 const bad=JSON.parse(JSON.stringify(paused));Object.values(bad.entries)[0].distanceByMode.walk=999999;
 assert.throws(()=>validateRewards(bad,sites));
});

test('destination options distinguish mainland, forest approaches and island transfers',()=>{
 const by=id=>sites.find(s=>s.id===id);
 assert.deepEqual(travelOptions(by('C5'),by('G2')),['walk','bus','motor','car']);
 assert.equal(requiresWalkingApproach(by('B1'),'car'),true);
 assert.equal(requiresWalkingApproach(by('G9'),'walk'),false);
 assert.deepEqual(travelOptions(by('C5'),by('G6')),['boat','boat_vip']);
 assert.deepEqual(travelOptions(by('G6'),by('C9')),['walk']);
 assert.deepEqual(travelOptions(by('G6'),by('G7')),['boat','boat_vip']);
});
