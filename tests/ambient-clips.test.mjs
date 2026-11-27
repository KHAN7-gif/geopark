import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ambientDemoURL} from '../dist/ambient-scene.mjs';
test('all six direct audio previews are playable non-silent PCM WAV files',()=>{
 for(const code of ['sea','birds','night','town','steps','engine']){const url=ambientDemoURL(code),data=readFileSync(new URL(url));assert.equal(data.toString('ascii',0,4),'RIFF');assert.equal(data.toString('ascii',8,12),'WAVE');assert.equal(data.readUInt16LE(20),1);assert.equal(data.readUInt16LE(22),1);assert.equal(data.readUInt32LE(24),16000);assert.equal(data.readUInt16LE(34),16);const count=data.readUInt32LE(40)/2;assert.ok(count/16000>=4&&count/16000<=8);let energy=0,peak=0;for(let i=0;i<count;i++){const value=data.readInt16LE(44+i*2)/32768;energy+=value*value;peak=Math.max(peak,Math.abs(value))}assert.ok(Math.sqrt(energy/count)>.02,code+' must be audible, not an empty placeholder');assert.ok(peak>.5&&peak<.56);assert.equal(data.length,44+count*2)}assert.equal(ambientDemoURL('../../other'),null);
});
