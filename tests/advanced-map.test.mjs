import test from 'node:test';
import assert from 'node:assert/strict';
import {cameraPose,qualityProfile,applyAdvancedQuality,switchBasemap} from '../dist/advanced-map.mjs';
import {createCameraDirector} from '../dist/camera-director.mjs';

test('camera presets retain geographic position and use the shortest bearing transition',()=>{
 const position=[5.3,115.23],close=cameraPose({position,heading:1,currentBearing:359}),drone=cameraPose({position,mode:'drone'}),orbit=cameraPose({position,mode:'orbit',heading:20,orbitDegrees:80});
 assert.deepEqual(close.center,[115.23,5.3]);assert.equal(close.bearing,361);
 assert.ok(drone.zoom<close.zoom);assert.ok(drone.pitch<close.pitch);
 assert.equal(orbit.bearing,100);assert.deepEqual(position,[5.3,115.23]);
});

test('quality caps resolution and basemap switches only visibility',()=>{
 assert.equal(qualityProfile('auto',{memory:2,cores:4,ratio:3}).level,'eco');
 assert.equal(qualityProfile('auto',{ratio:3}).pixelRatio,1.5);
 assert.equal(qualityProfile('high',{ratio:3}).pixelRatio,2);
 const changes=[],map={getLayer:()=>true,setPixelRatio:r=>changes.push(['ratio',r]),setLayoutProperty:(...args)=>changes.push(args),setLayerZoomRange:(...args)=>changes.push(args)};
 switchBasemap(map,'satellite');assert.deepEqual(changes[0],['base','visibility','none']);assert.deepEqual(changes[1],['base-satellite','visibility','visible']);
 applyAdvancedQuality(map,qualityProfile('eco',{ratio:3}),true);
 assert.ok(changes.some(c=>c[0]==='labuan-roofs'&&c[2]==='none'));
 assert.ok(changes.every(c=>!['route','travelled','elevation'].includes(c[0])));
});

test('orbit animation stops on interaction and releases its frame on teardown',()=>{
 const previous=globalThis.window,frames=new Map();let seq=0;
 globalThis.window={innerWidth:390,requestAnimationFrame:cb=>{frames.set(++seq,cb);return seq},cancelAnimationFrame:id=>frames.delete(id)};
 const state={position:[5.3,115.23]},snapshot=JSON.stringify(state),views=[];
 const map={getBearing:()=>359,easeTo:v=>views.push(v),jumpTo:v=>views.push(v)};
 const director=createCameraDirector(map,{getState:()=>state,isReady:()=>true});
 try{
  director.follow(state.position,359);director.setMode('orbit');assert.equal(frames.size,1);
  for(const time of [1000,1200]){const [id,cb]=frames.entries().next().value;frames.delete(id);cb(time)}
  assert.ok(views.some(v=>v.bearing>359));assert.equal(JSON.stringify(state),snapshot);
  director.setFollowing(false);assert.equal(frames.size,0);
  director.follow(state.position,0);assert.equal(frames.size,1);
 }finally{director.destroy();globalThis.window=previous}
 assert.equal(frames.size,0);
});

test('reduced motion keeps orbit static and does not start an animation loop',()=>{
 const previous=globalThis.window;let frames=0,last;
 globalThis.window={innerWidth:1024,requestAnimationFrame(){frames++;return 1},cancelAnimationFrame(){}};
 const director=createCameraDirector({getBearing:()=>0,easeTo:v=>last=v},{getState:()=>({position:[5.3,115.23]}),isReady:()=>true,reducedMotion:true});
 try{director.setMode('orbit');director.follow([5.3,115.23],90);assert.equal(frames,0);assert.equal(last.duration,0);assert.equal(last.bearing,125)}finally{director.destroy();globalThis.window=previous}
});
