import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ambientPreferences,createAmbientMap,ambientMix} from '../dist/ambient-scene.mjs';
import {createAmbientAudio} from '../dist/ambient-audio.mjs';
import {createGameSound} from '../dist/game-sound.mjs';
test('ambient classification distinguishes sea, town, green areas and local night without GPS',()=>{
 const data=JSON.parse(readFileSync(new URL('../dist/environment/labuan.geojson',import.meta.url))),before=JSON.stringify(data),map=createAmbientMap(data);assert.equal(map.at([5.2,115.2]).sea,1);assert.ok(map.at([5.27625,115.2449]).town);assert.equal(ambientMix({sea:1},{night:true}).crickets,0);assert.equal(ambientMix({sea:0,green:true},{night:true}).birds,0);assert.equal(ambientMix({sea:0,green:true}).birds,1);
 const moving=ambientMix({town:true},{mode:'car',moving:true}),paused=ambientMix({town:true},{mode:'car',moving:false});assert.equal(moving.engine,1);assert.equal(paused.engine,0);assert.equal(ambientMix({},{mode:'walk',moving:true}).footsteps,1);assert.equal(ambientMix({},{mode:'walk',moving:false}).footsteps,0);assert.equal(JSON.stringify(data),before);assert.deepEqual(map.at([Infinity,NaN]),{sea:0,green:false,town:false});
});
test('preferences start muted, retain volume and clamp unsafe values',()=>{
 assert.deepEqual(ambientPreferences(null),{enabled:false,volume:35});assert.deepEqual(ambientPreferences({enabled:true,volume:999}),{enabled:true,volume:100});assert.equal(ambientPreferences({volume:-20}).volume,0);assert.equal(ambientPreferences({volume:NaN}).volume,35);
});
function fakeContext(){const all=[],param=()=>({value:0,values:[],setValueAtTime(v){this.values.push(v)},setTargetAtTime(v){assert.ok(Number.isFinite(v));this.values.push(v)},exponentialRampToValueAtTime(v){this.values.push(v)}}),node=()=>{const n={gain:param(),frequency:param(),Q:param(),connect(){},disconnect(){this.disconnected=true},start(){this.started=true},stop(){this.stopped=true;this.onended?.()}};all.push(n);return n};return {all,state:'running',currentTime:0,sampleRate:4000,destination:{},createGain:node,createBiquadFilter:node,createOscillator:node,createBufferSource:node,createBuffer(channels,length){return {getChannelData:()=>new Float32Array(length)}}}}
test('ambient audio reuses one unlocked context and stops every source when muted or hidden',()=>{
 const context=fakeContext(),audio=createAmbientAudio({getContext:()=>context}),mix=ambientMix({sea:1},{mode:'boat',moving:true});assert.equal(audio.update(mix,{enabled:false}),false);assert.equal(context.all.length,0);assert.equal(audio.update(mix,{enabled:true,volume:35}),true);const count=context.all.length;audio.update(mix,{enabled:true,volume:55});assert.equal(context.all.length,count,'updating volume does not start more loops');assert.equal(audio.isRunning(),true);context.currentTime=10;audio.update(ambientMix({green:true},{mode:'walk',moving:true}),{enabled:true});assert.ok(context.all.length>count);audio.stop();assert.ok(context.all.filter(n=>n.started).every(n=>n.stopped));assert.ok(context.all.every(n=>n.disconnected));assert.equal(audio.isRunning(),false);audio.update(mix,{enabled:true});audio.update(mix,{enabled:true,volume:0});assert.equal(audio.isRunning(),false);audio.destroy();
});
test('audio failures and suspended contexts remain silent without breaking game cues',()=>{
 const context=fakeContext(),audio=createAmbientAudio({getContext:()=>context}),mix=ambientMix({sea:1});context.state='suspended';assert.equal(audio.update(mix,{enabled:true}),false);const failed=createAmbientAudio({getContext(){throw Error('blocked')}});assert.equal(failed.update(mix,{enabled:true}),false);
 const unavailable=createGameSound({AudioContextClass:null});assert.equal(unavailable.audioContext(),null);
});
