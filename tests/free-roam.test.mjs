import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createWalkingWorld,walkStep,walkingSpawn,joystickVector,ROAM_START} from '../dist/free-roam.mjs';
import {metres,toXY,fromXY} from '../dist/marine-geometry.mjs';
import {createRoamControls} from '../dist/roam-controls.mjs';
const data=JSON.parse(readFileSync(new URL('../dist/environment/labuan.geojson',import.meta.url))),world=createWalkingWorld(data),empty=createWalkingWorld(null);
const initial=()=>({position:[...ROAM_START],heading:0,distance:0});
test('walking follows analog input and camera direction at equal speed diagonally, without changing input state',()=>{
 const start=initial(),before=JSON.stringify(start),forward=walkStep(start,{x:0,y:-1,bearing:0},.1,world),right=walkStep(start,{x:0,y:-1,bearing:90},.1,world),diagonal=walkStep(start,{x:1,y:-1,bearing:0},.1,world);
 assert.ok(forward.position[0]>start.position[0]);assert.ok(right.position[1]>start.position[1]);assert.ok(Math.abs(forward.distance-5/3.6*.1)<.002);assert.ok(Math.abs(forward.distance-diagonal.distance)<.002);assert.equal(JSON.stringify(start),before);
 const run=walkStep(start,{x:0,y:-1,run:true},.1,world);assert.ok(Math.abs(run.distance/forward.distance-2)<.01);assert.ok(walkStep(start,{x:0,y:-.5},.1,world).distance<forward.distance);
 assert.equal(walkStep(start,{x:0,y:0},.1,world).distance,0);assert.ok(walkStep(start,{x:0,y:-1},100,world).distance<.15);assert.equal(walkStep(start,{x:0,y:-1},-1,world).distance,0);
});
test('spawn rejects ocean and mapped buildings and permits courtyards',()=>{
 assert.ok(world.walkable(ROAM_START));assert.equal(world.walkable([5.20,115.20]),false);assert.deepEqual(walkingSpawn([Infinity,NaN],world),ROAM_START);assert.deepEqual(walkingSpawn(null,world),ROAM_START);
 const p=toXY(ROAM_START),ring=(r)=>[[ -r,-r],[r,-r],[r,r],[-r,r],[-r,-r]].map(([x,y])=>{const [lat,lng]=fromXY([p[0]+x,p[1]+y]);return [lng,lat]});
 const f={type:'Feature',properties:{kind:'building'},geometry:{type:'Polygon',coordinates:[ring(4)]}},block=createWalkingWorld({features:[f]});assert.equal(block.walkable(ROAM_START),false);assert.ok(block.walkable(walkingSpawn(ROAM_START,block)));
 const courtyard=createWalkingWorld({features:[{...f,geometry:{type:'Polygon',coordinates:[ring(4),ring(2)]}}]});assert.ok(courtyard.walkable(ROAM_START));assert.ok(empty.walkable(ROAM_START));
});
test('blocked movement stops and does not award distance',()=>{
 const stopped=walkStep(initial(),{x:0,y:-1},.1,{walkable:()=>false});assert.equal(stopped.distance,0);assert.equal(stopped.moving,false);assert.equal(stopped.blocked,true);assert.deepEqual(stopped.position,ROAM_START);
 const v=joystickVector(10000,-10000);assert.ok(Math.abs(Math.hypot(v.x,v.y)-1)<1e-9);assert.deepEqual(joystickVector(1,1),{x:0,y:0});
});
function target(){const handlers=new Map();return {handlers,style:{},addEventListener(k,fn){handlers.set(k,fn)},removeEventListener(k){handlers.delete(k)},fire(k,e={}){handlers.get(k)?.({preventDefault(){},...e})},setAttribute(){},getBoundingClientRect(){return {left:0,top:0,width:136,height:136}},setPointerCapture(){}}}
test('joystick handles capture, keyboard, focus loss, dialogs, hidden tabs and teardown',()=>{
 const pad=target(),stick=target(),run=target(),document=target(),window=target();let frame=null,blocked=false,calls=[];window.requestAnimationFrame=fn=>{frame=fn;return 1};window.cancelAnimationFrame=()=>{frame=null};let heading=90;
 const controls=createRoamControls({pad,stick,run,document,window,getBearing:()=>heading,move:(input,dt)=>{calls.push({input,dt});return {}},onUpdate(){},isBlocked:()=>blocked});controls.start();frame(0);
 pad.fire('pointerdown',{pointerId:2,button:0,clientX:68,clientY:0});heading=180;frame(100);assert.equal(calls.at(-1).input.bearing,90);assert.equal(calls.at(-1).input.y,-1);
 pad.fire('pointercancel',{pointerId:2});frame(200);assert.equal(calls.at(-1).input.y,0);
 document.fire('keydown',{key:'w',target:{tagName:'DIV'}});frame(300);assert.equal(calls.at(-1).input.y,-1);assert.equal(calls.at(-1).input.bearing,180);
 document.fire('keyup',{key:'w'});document.fire('keydown',{key:'s',target:{tagName:'INPUT'}});frame(400);assert.equal(calls.at(-1).input.y,0);
 document.fire('keydown',{key:'ArrowUp',target:{tagName:'DIV'}});blocked=true;frame(500);blocked=false;frame(600);assert.equal(calls.at(-1).input.y,0);
 pad.fire('pointerdown',{pointerId:3,clientX:136,clientY:68});window.fire('blur');frame(700);assert.equal(calls.at(-1).input.x,0);
 document.fire('keydown',{key:'w',target:{tagName:'DIV'}});document.hidden=true;document.fire('visibilitychange');frame(800);document.hidden=false;frame(900);assert.equal(calls.at(-1).input.y,0);controls.destroy();assert.equal(frame,null);assert.equal(pad.handlers.size,0);assert.equal(document.handlers.size,0);
});
