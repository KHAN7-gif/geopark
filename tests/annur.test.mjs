import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {buildAnnurModel,ANNUR_OSM,ANNUR_PLACE,ANNUR_LIGHTS} from '../dist/annur-model.mjs';
import {buildVillageScene} from '../dist/village-model.mjs';
const data=JSON.parse(await readFile(new URL('../dist/environment/labuan.geojson',import.meta.url))),feature=data.features.find(f=>f.properties.osm===ANNUR_OSM),anchor=ANNUR_PLACE.geometry.coordinates;
const local=p=>[(p[0]-anchor[0])*111320*Math.cos(anchor[1]*Math.PI/180),(anchor[1]-p[1])*111320];
test('An-Nur has flared petal roof, egg dome and two tall minarets on its existing mapped site',()=>{
 const before=JSON.stringify(data),model=buildAnnurModel(feature,{local,heightAt:()=>7});assert.equal(model.stats.annurMinarets,2);assert.equal(model.stats.annurPetals,8);assert.ok(model.root.children.length<=5);let max=-Infinity,min=Infinity,disposed=0;
 const tops=[];for(const mesh of model.root.children){const a=mesh.geometry.attributes.position;assert.ok([...a.array].every(Number.isFinite));for(let i=0;i<a.count;i++){min=Math.min(min,a.getY(i));max=Math.max(max,a.getY(i));if(a.getY(i)>65.5)tops.push([a.getX(i),a.getZ(i)])}mesh.geometry.addEventListener('dispose',()=>disposed++)}
 assert.equal(min,7);assert.ok(max>=66);assert.ok(tops.some(p=>p[0]<-10)&&tops.some(p=>p[0]>10));assert.equal(JSON.stringify(data),before);const meshes=model.root.children.length;model.dispose();assert.equal(disposed,meshes);
});
test('night colours include green and revert to the silver day appearance',()=>{
 const model=buildAnnurModel(feature,{local});const shell=model.root.children.find(m=>m.material.color.getHex()===0xdce1e4);assert.ok(shell);
 for(const [id,hex]of Object.entries(ANNUR_LIGHTS)){model.setNightColour(id);model.setMood('night');assert.equal(shell.material.emissive.getHex(),hex);assert.equal(shell.material.emissiveIntensity,.8)}model.setMood('day');assert.equal(shell.material.color.getHex(),0xdce1e4);assert.equal(shell.material.emissiveIntensity,0);model.dispose();
});
test('mosque detail remains available even when the nearby building quality budget is exhausted',()=>{
 const model=buildVillageScene(data,anchor,{buildingLimit:0,treeLimit:0});assert.equal(model.stats.annurMosques,1);model.setNightColour('green');model.setMood('night');assert.ok(model.root.getObjectByName('masjid-annur'));model.dispose();assert.equal(model.root.children.length,0);
});
