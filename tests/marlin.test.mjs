import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {MARLIN_MONUMENT as m,MARLIN_PLACE,marlinDistance,marlinTreeAllowed} from '../dist/marlin-layout.mjs';
import {addMarlinMonument} from '../dist/marlin-model.mjs';
import {TOWN_PLACES} from '../dist/town-scene.mjs';
test('marlin statue is centred on the existing roundabout and its geometry stays off the road',async()=>{
 const roads=JSON.parse(await readFile(new URL('../dist/environment/game-roads.geojson',import.meta.url))),road=roads.features.find(f=>f.properties.osm===m.roadOsm);assert(road);assert.deepEqual(road.geometry.coordinates[0],road.geometry.coordinates.at(-1));
 const sx=111320*Math.cos(m.centre[1]*Math.PI/180),line=road.geometry.coordinates.map(p=>[(p[0]-m.centre[0])*sx,(p[1]-m.centre[1])*111320]);let centreDistance=Infinity;
 for(let i=1;i<line.length;i++){const a=line[i-1],b=line[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,-(a[0]*dx+a[1]*dz)/(dx*dx+dz*dz)));centreDistance=Math.min(centreDistance,Math.hypot(a[0]+t*dx,a[1]+t*dz))}
 assert(centreDistance>12&&centreDistance<13);const points=[],stats={};const tri=(c,a,b,d)=>points.push(a,b,d);
 addMarlinMonument({local:()=>[0,0],heightAt:()=>3,triangle:tri,quad:(c,a,b,d,e)=>{tri(c,a,b,d);tri(c,a,d,e)},stats});assert.equal(stats.marlinMonuments,1);assert.equal(stats.marlinFish,3);
 const radius=Math.max(...points.map(p=>Math.hypot(p[0],p[2])));assert(radius<centreDistance-road.properties.width/2,'base, fish and planting must fit inside the road island');assert(points.every(p=>p.every(Number.isFinite)));assert.equal(Math.min(...points.map(p=>p[1])),3);assert(Math.max(...points.map(p=>p[1]))>11);
});
test('marlin has a camera-only place label and keeps automatic trees clear of the sculpture',()=>{
 assert.equal(TOWN_PLACES.filter(p=>p.properties.name===MARLIN_PLACE.properties.name).length,1);assert.equal(MARLIN_PLACE.properties.kind,'landmark');assert.deepEqual(MARLIN_PLACE.geometry.coordinates,m.centre);assert.equal(marlinDistance(m.centre),0);assert.equal(marlinTreeAllowed(m.centre),false);assert.equal(marlinTreeAllowed([m.centre[0]+.001,m.centre[1]]),true);
});
