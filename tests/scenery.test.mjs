import {dataranTreeAllowed} from '../dist/dataran-layout.mjs';
import {treeCentre} from '../dist/world-palette.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {SCENE_LOOKS,applySceneLook,scenicDetails,missionBeacons} from '../dist/scenery.mjs';
const environment=JSON.parse(await readFile(new URL('../dist/environment/labuan.geojson',import.meta.url)));
const coast=JSON.parse(await readFile(new URL('../dist/environment/shoreline.geojson',import.meta.url)));
function inside([x,y],ring){let hit=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit}return hit}

test('coastal scenery excludes mapped Labuan land and uses real shore lines',()=>{
 const sea=coast.features.find(f=>f.properties.kind==='sea');
 const rings=sea.geometry.coordinates;
 const isSea=point=>inside(point,rings[0])&&!rings.slice(1).some(ring=>inside(point,ring));
 assert.equal(isSea([115.23,5.30]),false);
 assert.equal(isSea([115.10,5.30]),true);
 assert.equal(isSea([115.27,5.253]),false);
 assert.ok(rings.length>=7);
 for(const feature of coast.features.filter(f=>f.properties.kind==='shore')){assert.equal(feature.geometry.type,'LineString');assert.ok(feature.properties.osmWays.length>0);assert.deepEqual(feature.geometry.coordinates[0],feature.geometry.coordinates.at(-1))}
});

test('roof and crown decorations preserve source geography',()=>{
 const snapshot=JSON.stringify(environment),details=scenicDetails(environment);
 assert.equal(JSON.stringify(environment),snapshot);
 assert.equal(details.features.filter(f=>f.properties.kind==='roof').length,2189);
 assert.equal(details.features.filter(f=>f.properties.kind==='crown-top').length,environment.features.filter(f=>f.properties.kind==='canopy'&&dataranTreeAllowed(treeCentre(f))).length);
 for(const feature of details.features){assert.ok(feature.properties.height>feature.properties.base);const ring=feature.geometry.coordinates[0];assert.deepEqual(ring[0],ring.at(-1));for(const [lng,lat]of ring){assert.ok(lng>115&&lng<115.4);assert.ok(lat>5.1&&lat<5.5)}}
 const sites=[{id:'G1',lat:5.3,lng:115.23},{id:'B1',lat:5.28,lng:115.21}],before=JSON.stringify(sites);
 const beacons=missionBeacons(sites,{},'B1');
 assert.ok(beacons.features[1].properties.height>beacons.features[0].properties.height);
 assert.equal(JSON.stringify(sites),before);
});

test('visual lighting changes do not touch travel sources or terrain',()=>{
 const changes=[],sky=[],lights=[];
 const map={getLayer:()=>true,setSky:value=>sky.push(value),setLight:value=>lights.push(value),setPaintProperty:(id,key,value)=>changes.push({id,key,value})};
 applySceneLook(map,'day');applySceneLook(map,'dusk');applySceneLook(map,'night');
 assert.equal(sky.length,3);assert.equal(lights.length,3);
 assert.ok(changes.every(c=>!['route','travelled','elevation'].includes(c.id)));
 assert.ok(SCENE_LOOKS.night.brightness<SCENE_LOOKS.day.brightness);
 assert.notEqual(sky[0]['sky-color'],sky[2]['sky-color']);
});
