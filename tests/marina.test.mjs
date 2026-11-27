import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {MARINA_VIEW,MARINA_BERTHS,MARINA_PONTOONS,berthHullPoints,marinaRouteClearance} from '../dist/marina-layout.mjs';
import {landAt,toXY} from '../dist/marine-geometry.mjs';
import {MARINE_DATA} from '../dist/marine-data.mjs';
import {buildVillageScene} from '../dist/village-model.mjs';
test('moored yachts follow the existing marina pontoons and leave the J3 boat corridor clear',()=>{
 const before=JSON.stringify(MARINE_DATA),roads=JSON.parse(readFileSync(new URL('../dist/environment/game-roads.geojson',import.meta.url)));for(const pier of MARINA_PONTOONS){const source=roads.features.find(f=>f.properties.osm===pier.osm);assert.deepEqual(pier.path,source.geometry.coordinates)}
 assert.ok(MARINA_BERTHS.length>=12);assert.ok(MARINA_BERTHS.some(b=>b.kind==='vip'));assert.ok(MARINA_BERTHS.some(b=>b.kind==='sail'));
 for(const boat of MARINA_BERTHS){assert.ok(Number.isFinite(marinaRouteClearance(boat.position)));assert.ok(marinaRouteClearance(boat.position)>boat.length/2+14);assert.ok(berthHullPoints(boat).every(p=>landAt([p[1],p[0]])<0));for(const other of MARINA_BERTHS){if(boat===other)continue;const a=toXY([boat.position[1],boat.position[0]]),b=toXY([other.position[1],other.position[0]]);assert.ok(Math.hypot(a[0]-b[0],a[1]-b[1])>(boat.length+other.length)/2+1)}}assert.equal(JSON.stringify(MARINE_DATA),before);
});
test('marina scenery batches boats, masts and pontoons, respects the quality budget and disposes all meshes',()=>{
 const data={type:'FeatureCollection',features:[]};for(const limit of [6,10,12]){const scene=buildVillageScene(data,MARINA_VIEW,{marinaLimit:limit});assert.equal(scene.stats.marinaBoats,limit);assert.ok(scene.stats.marinaSailboats>=3);assert.ok(scene.stats.marinaVIPBoats>=1);assert.equal(scene.stats.marinaPontoons,2);assert.ok(scene.root.children.length<25);let count=0,disposed=0;scene.root.traverse(o=>{if(o.isMesh){count++;assert.ok([...o.geometry.attributes.position.array].every(Number.isFinite));o.geometry.addEventListener('dispose',()=>disposed++)}});scene.dispose();assert.equal(disposed,count);assert.equal(scene.root.children.length,0)}const far=buildVillageScene(data,[115.24,5.36]);assert.equal(far.stats.marinaBoats,undefined);far.dispose();
});
