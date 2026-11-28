import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {prepareTownPaths,selectTownActors,townPathPose,townActorState,LIFE_LIMITS} from '../dist/town-life.mjs';
import {buildTownActor} from '../dist/town-life-model.mjs';
import {toXY,fromXY,landAt} from '../dist/marine-geometry.mjs';
const roads=JSON.parse(readFileSync(new URL('../dist/environment/game-roads.geojson',import.meta.url))),paths=prepareTownPaths(roads),anchor=[115.2449,5.27625];
test('town life stays on mapped streets and plaza perimeter, and respects local quality budgets',()=>{
 const before=JSON.stringify(roads);for(const quality of ['eco','balanced','high']){const actors=selectTownActors(paths,anchor,quality);assert.ok(actors.length<=LIFE_LIMITS[quality]);assert.ok(actors.some(a=>a.mode==='walk'));assert.ok(actors.some(a=>a.mode==='car'));assert.equal(new Set(actors.map(a=>a.id)).size,actors.length);assert.deepEqual(actors,selectTownActors(paths,anchor,quality));for(const a of actors){assert.ok(a.path.source.startsWith('way/'));if(a.mode==='walk')assert.ok(a.path.foot);else assert.equal(a.path.foot,false)}}
 assert.deepEqual(selectTownActors(paths,[115.3,5.4]),[]);assert.deepEqual(prepareTownPaths(null),[]);assert.equal(JSON.stringify(roads),before);
 const nearby=selectTownActors(paths,anchor);assert.ok(nearby.filter(a=>a.path.promenade).length>=2,'people are visible near Dataran instead of all being distant');
});
test('vehicle lanes stay on the left for either travel direction',()=>{
 const a=toXY([5.27625,115.2449]),b=[a[0],a[1]+100],path={points:[a,b],lengths:[100],length:100,width:7,foot:false};const north=townPathPose(path,50,1),south=townPathPose(path,50,-1);assert.ok(north.position[0]<115.2449);assert.ok(south.position[0]>115.2449);assert.equal(north.heading,0);assert.equal(south.heading,180);
 const walk=townPathPose({...path,foot:true},50);assert.ok(Math.abs(walk.position[0]-115.2449)<1e-9);
});
test('ambient motion is clock based, bounded and fades at route ends without changing player state',()=>{
 const actors=selectTownActors(paths,anchor);for(const actor of actors){const before=JSON.stringify(actor),states=[];for(let t=0;t<120;t+=2){const s=townActorState(actor,t);if(s){assert.ok(s.position.every(Number.isFinite));assert.ok(s.opacity>=0&&s.opacity<=1);assert.ok(landAt([s.position[1],s.position[0]])>=0);states.push(s)}}assert.ok(states.length>0);assert.notDeepEqual(states[0].position,states[3].position);assert.equal(JSON.stringify(actor),before)}
 const actor=actors[0],time=-actor.offset*((actor.path.length-10)/actor.speed+4);assert.ok(townActorState(actor,time).opacity<.001);
});
test('people and different vehicle meshes animate and release all geometry',()=>{
 for(const mode of ['walk','car','bus','motor']){const model=buildTownActor(mode,3);let meshes=0,disposed=0;model.root.traverse(o=>{if(o.isMesh){meshes++;assert.ok([...o.geometry.attributes.position.array].every(Number.isFinite));o.geometry.addEventListener('dispose',()=>disposed++)}});assert.ok(meshes>=7&&meshes<15);model.animate(1,true,.5);let faded=false;model.root.traverse(o=>{if(o.material){assert.equal(o.material.opacity,o.name==='night-road-glow'?.16:.5);faded=true}});assert.ok(faded);model.animate(2,false,1);model.dispose();assert.equal(disposed,meshes);assert.equal(model.root.children.length,0)}
});

test('expanded town fleet has distinct sports cars, pickups and lorries within road and density budgets',()=>{
 const actors=selectTownActors(paths,anchor,'balanced'),modes=new Set(actors.map(a=>a.mode));for(const mode of ['car','sport','pickup','truck','motor','bus','taxi','walk'])assert.ok(modes.has(mode),mode);
 assert.ok(actors.filter(a=>a.mode==='walk').length>=10);assert.ok(actors.length<=LIFE_LIMITS.balanced);
 for(const a of actors.filter(a=>['truck','bus'].includes(a.mode))){assert.ok(a.path.width>=7);assert.ok(a.path.length>=70)}
 const models=['sport','pickup','truck','taxi'].map(mode=>buildTownActor(mode));
 try{assert.ok(models[0].root.userData.vehicle.length<models[1].root.userData.vehicle.length);assert.ok(models[2].root.userData.vehicle.length>models[1].root.userData.vehicle.length);for(const m of models){m.setMood('night');assert.equal(m.root.getObjectByName('night-road-glow').visible,true);let n=0;m.root.traverse(o=>{if(o.isMesh){n++;assert.ok([...o.geometry.attributes.position.array].every(Number.isFinite))}});assert.ok(n<32);m.animate(1,true,.5)}}finally{for(const m of models)m.dispose()}
});
