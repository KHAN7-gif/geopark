import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DATARAN_LAYOUT,DATARAN_RING,dataranPoint,dataranUV,dataranTreeAllowed,insideDataran,dataranForecourt} from '../dist/dataran-layout.mjs';
import {decorateEnvironment,treeCentre} from '../dist/world-palette.mjs';
import {scenicDetails} from '../dist/scenery.mjs';
import {townGround} from '../dist/town-scene.mjs';
import {buildVillageScene} from '../dist/village-model.mjs';
const environment=JSON.parse(await readFile(new URL('../dist/environment/labuan.geojson',import.meta.url)));
test('Dataran open field excludes automatic trees in basic and detailed renderers while keeping the source geography',()=>{
 const before=JSON.stringify(environment),decorated=decorateEnvironment(environment),details=scenicDetails(environment);
 for(const [u,v]of [[60,-45],[112,-45],[170,-45],[100,-20],[100,-70]]){const p=dataranPoint(u,v);assert(insideDataran(p));assert.equal(dataranTreeAllowed(p),false)}
 const removed=environment.features.filter(f=>f.properties.kind==='canopy'&&!dataranTreeAllowed(treeCentre(f)));assert.equal(removed.length,29);
 for(const f of decorated.features.filter(f=>['canopy','trunk'].includes(f.properties.kind)))assert(dataranTreeAllowed(treeCentre(f)));
 const tops=details.features.filter(f=>f.properties.kind==='crown-top');assert.equal(tops.length,501);assert.equal(JSON.stringify(environment),before);
 assert.equal(dataranTreeAllowed([115.23,5.3]),true);
});
test('monument and flag are at the western end, grandstand is at the southern side, and no central plinth remains',()=>{
 const {monument:m,flag:f,grandstand:g}=DATARAN_LAYOUT;assert(m.u<40&&f.u<40);assert.equal(f.u,m.u+m.platformOffset);assert.equal(f.v,m.v);assert(g.u>80&&g.v<-80);for(const p of [m,f,g])assert(insideDataran(dataranPoint(p.u,p.v)));
 const forecourt=dataranForecourt();assert(forecourt.every(insideDataran));assert(forecourt.every(p=>dataranUV(p)[0]<40));
 const ground=townGround(),plinth=ground.features.find(f=>f.properties.part==='plinth');assert.deepEqual(plinth.geometry.coordinates[0],forecourt);assert.deepEqual(ground.features.find(f=>f.properties.part==='grass').geometry.coordinates[0],DATARAN_RING);
});
test('reference-based grandstand and monument geometry leave the middle of the field empty',()=>{
 const anchor=dataranPoint(112,-46),model=buildVillageScene({type:'FeatureCollection',features:[]},anchor),sx=111320*Math.cos(anchor[1]*Math.PI/180);assert.equal(model.stats.grandstands,1);assert.equal(model.stats.monuments,1);
 const pole=model.root.children.find(mesh=>mesh.material.color.getHexString()==='e5e5d6');assert(pole);const attr=pole.geometry.attributes.position,centre=dataranPoint(DATARAN_LAYOUT.flag.u,DATARAN_LAYOUT.flag.v);let minY=Infinity;for(let i=0;i<attr.count;i++){const point=[anchor[0]+attr.getX(i)/sx,anchor[1]-attr.getZ(i)/111320];assert(Math.hypot((point[0]-centre[0])*sx,(point[1]-centre[1])*111320)<.3);minY=Math.min(minY,attr.getY(i))}assert(Math.abs(minY-DATARAN_LAYOUT.monument.platformHeight)<.01);
 let centralVertices=0;model.root.traverse(o=>{if(!o.isMesh)return;const a=o.geometry.attributes.position;for(let i=0;i<a.count;i++){assert(Number.isFinite(a.getY(i)));const point=[anchor[0]+a.getX(i)/sx,anchor[1]-a.getZ(i)/111320],[u,v]=dataranUV(point);if(u>45&&u<185&&v>-75&&v<-15)centralVertices++}});assert.equal(centralVertices,0);model.dispose();
});
