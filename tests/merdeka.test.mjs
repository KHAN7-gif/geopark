import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {MERDEKA_LAYOUT as layout,MERDEKA_ROAD_IDS,MERDEKA_ROAD_RING,MERDEKA_PLACE,merdekaDistance,merdekaTreeAllowed} from '../dist/merdeka-layout.mjs';
import {MARLIN_MONUMENT} from '../dist/marlin-layout.mjs';
import {addMerdekaRoundabout} from '../dist/merdeka-model.mjs';
import {TOWN_PLACES} from '../dist/town-scene.mjs';
test('Bulatan Merdeka uses its actual joined road ring and remains separate from the marlin roundabout',async()=>{
 const roads=JSON.parse(await readFile(new URL('../dist/environment/game-roads.geojson',import.meta.url)));const ring=[];
 for(const id of MERDEKA_ROAD_IDS){const c=roads.features.find(f=>f.properties.osm===id).geometry.coordinates;if(ring.length)assert.deepEqual(ring.at(-1),c[0]);ring.push(...(ring.length?c.slice(1):c))}assert.deepEqual(ring,MERDEKA_ROAD_RING);assert.deepEqual(ring[0],ring.at(-1));assert(merdekaDistance(MARLIN_MONUMENT.centre)>250);assert.equal(TOWN_PLACES.filter(p=>p.properties.name==='Bulatan Merdeka').length,1);assert.deepEqual(MERDEKA_PLACE.geometry.coordinates,layout.centre);
});
test('reference model has four cellular lattice umbrellas and a central fountain, with all geometry inside the road island',()=>{
 const points=[],stats={};const triangle=(c,...p)=>points.push(...p);addMerdekaRoundabout({local:()=>[0,0],heightAt:()=>2,triangle,quad:(c,a,b,d,e)=>{triangle(c,a,b,d);triangle(c,a,d,e)},stats});assert.equal(stats.merdekaUmbrellas,4);assert.equal(stats.merdekaFountains,1);assert.equal(stats.merdekaGlobes,1);assert(stats.merdekaCanopyCells>500);assert.equal(layout.umbrellas.length,4);assert.equal(new Set(layout.umbrellas.map(t=>`${Math.sign(t.x)}:${Math.sign(t.z)}`)).size,4);for(let i=0;i<4;i++)for(let j=i+1;j<4;j++){const a=layout.umbrellas[i],b=layout.umbrellas[j];assert(Math.hypot(a.x-b.x,a.z-b.z)>a.radius+b.radius)}assert.equal(stats.merdekaRoundabouts,1);assert(points.every(p=>p.every(Number.isFinite)));
 const sx=111320*Math.cos(layout.centre[1]*Math.PI/180),line=MERDEKA_ROAD_RING.map(p=>[(p[0]-layout.centre[0])*sx,(p[1]-layout.centre[1])*111320]);let radius=Infinity;
 for(let i=1;i<line.length;i++){const a=line[i-1],b=line[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,-(a[0]*dx+a[1]*dz)/(dx*dx+dz*dz)));radius=Math.min(radius,Math.hypot(a[0]+t*dx,a[1]+t*dz))}
 let maxRadius=0,maxHeight=0,minHeight=Infinity;for(const p of points){maxRadius=Math.max(maxRadius,Math.hypot(p[0],p[2]));maxHeight=Math.max(maxHeight,p[1]);minHeight=Math.min(minHeight,p[1])}assert(maxRadius<radius-layout.roadWidth/2);assert(maxHeight>9&&maxHeight<10);assert.equal(minHeight,2);
});
test('automatic trees do not obscure the designed roundabout structures',()=>{assert.equal(merdekaTreeAllowed(layout.centre),false);for(const t of layout.umbrellas)assert(Math.hypot(t.x,t.z)+t.radius<layout.islandRadius);assert.equal(merdekaTreeAllowed([layout.centre[0]+.001,layout.centre[1]]),true)});
