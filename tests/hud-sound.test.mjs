import test from 'node:test';
import assert from 'node:assert/strict';
import {hudPreferences,toggleHudPart} from '../dist/hud-preferences.mjs';
import {createGameSound,SOUND_CUES} from '../dist/game-sound.mjs';

test('compact info and time preferences restore independently without changing travel',()=>{
 const defaults=hudPreferences(null);assert.equal(defaults.infoCollapsed,true);assert.equal(defaults.timerCollapsed,true);
 const open=toggleHudPart(defaults,'infoCollapsed');assert.equal(open.infoCollapsed,false);assert.equal(open.timerCollapsed,true);
 const focused={...open,focus:true},restored=toggleHudPart(focused,'timerCollapsed');assert.equal(restored.focus,false);assert.equal(restored.timerCollapsed,false);assert.equal(restored.infoCollapsed,false);
 assert.deepEqual(hudPreferences(JSON.parse(JSON.stringify(restored))),restored);
 assert.deepEqual(hudPreferences({focus:'yes',sound:0}),defaults);
});

test('travel cues require an audio unlock, deduplicate events and obey mute',async()=>{
 const contexts=[],oscillators=[];
 class AudioContext{
  constructor(){this.state='suspended';this.currentTime=20;this.destination={};contexts.push(this)}
  async resume(){this.state='running'}async suspend(){this.state='suspended'}async close(){this.state='closed'}
  createOscillator(){const node={frequency:{setValueAtTime(hz){node.hz=hz}},connect(){},disconnect(){},start(time){node.started=time},stop(time){node.stops??=[];node.stops.push(time)}};oscillators.push(node);return node}
  createGain(){return {gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}}}
 }
 const sound=createGameSound({AudioContextClass:AudioContext});
 assert.equal(await sound.play('arrive',{key:'offline'}),false);assert.equal(contexts.length,0);
 assert.equal(await sound.play('depart',{gesture:true,key:'depart:trip1'}),true);
 assert.equal(oscillators.length,3);assert.equal(oscillators[0].hz,SOUND_CUES.depart[0].hz);
 assert.equal(await sound.play('depart',{key:'depart:trip1'}),false);assert.equal(oscillators.length,3);
 assert.equal(await sound.play('arrive',{key:'arrive:trip1'}),true);assert.equal(oscillators.length,7);
 sound.setEnabled(false);assert.ok(oscillators.every(node=>node.stops.length>=2));
 assert.equal(await sound.play('depart',{gesture:true,key:'depart:trip2'}),false);assert.equal(oscillators.length,7);
 sound.setEnabled(true);assert.equal(await sound.play('preview',{gesture:true}),true);assert.equal(oscillators.length,9);
 sound.close();assert.equal(contexts[0].state,'closed');
});

test('unsupported or rejected audio stays silent without breaking the game',async()=>{
 const unavailable=createGameSound({AudioContextClass:null});assert.equal(await unavailable.play('depart',{gesture:true}),false);
 class BlockedAudio{constructor(){this.state='suspended'}resume(){return Promise.reject(Error('Autoplay blocked'))}}
 const blocked=createGameSound({AudioContextClass:BlockedAudio});assert.equal(await blocked.unlock(),false);assert.equal(await blocked.play('depart',{gesture:true}),false);assert.equal(await blocked.play('arrive'),false);
});

test('user activation resumes an interrupted mobile audio context',async()=>{
 let resumed=0;class MobileAudio{constructor(){this.state='interrupted'}async resume(){resumed++;this.state='running'}}const sound=createGameSound({AudioContextClass:MobileAudio});assert.equal(await sound.unlock(),true);assert.equal(resumed,1);assert.equal(sound.audioContext().state,'running');
});
