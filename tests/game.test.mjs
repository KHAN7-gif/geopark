import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {normaliseRoadResponse,journeyAt,validateJourney,defaultRewards,creditRewards,rewardTotals,mergeRewards,defaultShop,purchaseTransport,availableXP,certificateState,certificateSVG,challengeSpec,scoreChallenge} from '../dist/travel-engine.mjs';
const sites=JSON.parse(await readFile(new URL('../dist/locations.json',import.meta.url)));
const road=JSON.parse(await readFile(new URL('fixtures/road-route.json',import.meta.url)));
const foot=JSON.parse(await readFile(new URL('fixtures/foot-route.json',import.meta.url)));
const route=normaliseRoadResponse(road);
const startedAt=1700000000000;
const journey={version:1,fromId:'G1',toId:'G2',route,startedAt,pausedMs:0,pausedAt:null};

test('all 25 destinations have playable challenges and bundled photographs',async()=>{
  assert.equal(new Set(sites.map(s=>s.id)).size,25);
  for(const [prefix,count] of [['G',11],['B',4],['C',10]]) for(let i=1;i<=count;i++) assert.ok(sites.some(s=>s.id===prefix+i));
  for(const site of sites){
    assert.ok(site.photos.length>0);
    for(const photo of site.photos) await access(new URL('../dist/'+photo.src,import.meta.url));
    const spec=challengeSpec(site);
    const answers=spec.type==='match'?spec.pairs.map(p=>p.answer):[spec.answer];
    assert.equal(scoreChallenge(spec,answers).correct,true,site.id);
    assert.equal(scoreChallenge(spec,[]).correct,false,site.id);
  }
});

test('road travel uses the 3:1 ratio and preserves paused progress',()=>{
  const j=validateJourney(journey,sites,startedAt);
  const duration=Math.ceil(route.durationSeconds/3*1000);
  assert.equal(journeyAt(j,startedAt).fraction,0);
  assert.equal(journeyAt(j,startedAt+duration).arrived,true);
  assert.deepEqual(journeyAt(j,startedAt+duration).position,route.path.at(-1));
  const paused={...j,pausedAt:startedAt+10000};
  assert.equal(journeyAt(paused,startedAt+300000).fraction,journeyAt(j,startedAt+10000).fraction);
  assert.throws(()=>validateJourney({...j,toId:'C6'},sites,startedAt));
});

test('walking follows the foot route and bus waits before moving',()=>{
  const walk=normaliseRoadResponse(foot,'walk');
  assert.ok(Math.abs(walk.durationSeconds-walk.distanceMetres/5000*3600)<.01);
  const bus={...journey,route:normaliseRoadResponse(road,'bus')};
  assert.equal(journeyAt(bus,startedAt+39999).waiting,true);
  assert.equal(journeyAt(bus,startedAt+40001).waiting,false);
});

test('travel rewards accumulate every five minutes without duplicate credit',()=>{
  const j={...journey,route:normaliseRoadResponse(foot,'walk')};
  const ledger=creditRewards(defaultRewards(),j,startedAt+300000);
  assert.equal(rewardTotals(ledger).xp,10);
  assert.equal(rewardTotals(creditRewards(ledger,j,startedAt+300000)).xp,10);
  assert.equal(rewardTotals(mergeRewards(ledger,ledger,sites)).xp,10);
  assert.equal(rewardTotals(creditRewards(defaultRewards(),{...j,pausedAt:startedAt+150000},startedAt+900000)).xp,0);
});

test('transport purchases respect XP balance and cannot be charged twice',()=>{
  const shop=purchaseTransport(defaultShop(),'bus',200);
  assert.equal(availableXP(shop,200),50);
  assert.deepEqual(purchaseTransport(shop,'bus',200),shop);
  assert.throws(()=>purchaseTransport(shop,'car',200));
  assert.throws(()=>purchaseTransport(shop,'boat',100));
});

test('certificate requires all missions and escapes the player name',()=>{
  const records=Object.fromEntries(sites.map(s=>[s.id,{done:startedAt}]));
  assert.equal(certificateState(sites,{},{}).eligible,false);
  assert.equal(certificateState(sites,records,{}).eligible,true);
  assert.throws(()=>certificateSVG(sites,{}, {name:'Penjelajah'}));
  const svg=certificateSVG(sites,records,{name:'Ali & <B>'});
  assert.ok(svg.includes('Ali &amp; &lt;B&gt;'));
});
