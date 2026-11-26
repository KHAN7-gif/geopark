import test from 'node:test';
import assert from 'node:assert/strict';
import {compassHeading,navigationHUD} from '../dist/navigation-hud.mjs';

test('compass labels match geographic directions',()=>{
  assert.equal(compassHeading([5.3,115.2],[5.4,115.2]).label,'U');
  assert.equal(compassHeading([5.3,115.2],[5.3,115.3]).label,'T');
  assert.equal(compassHeading([5.3,115.2],[5.2,115.2]).label,'S');
  assert.equal(compassHeading([5.3,115.2],[5.3,115.1]).label,'B');
});

test('remaining distance follows the route and paused or waiting players have zero speed',()=>{
  const path=[[5.3,115.2],[5.3,115.3]];
  const journey={pausedAt:null,route:{path,mode:'walk',distanceMetres:10000,durationSeconds:7200}};
  const state={position:[5.3,115.25],index:0,waiting:false,arrived:false};
  const snapshot=JSON.stringify(journey);
  const hud=navigationHUD(journey,state);
  assert.ok(Math.abs(hud.remainingMetres-5000)<1);
  assert.equal(hud.speedKmh,5);assert.equal(hud.heading.label,'T');
  assert.equal(navigationHUD({...journey,pausedAt:1},state).speedKmh,0);
  assert.equal(navigationHUD(journey,{...state,waiting:true}).speedKmh,0);
  assert.equal(navigationHUD(journey,{...state,position:path[1],arrived:true}).remainingMetres,0);
  assert.equal(navigationHUD(journey,{...state,position:path[1],arrived:true}).speedKmh,0);
  assert.equal(JSON.stringify(journey),snapshot);
  assert.equal(navigationHUD(null,null).remainingMetres,null);
});
