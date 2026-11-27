import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PERBADANAN_TOWER as tower,PERBADANAN_PLACE} from '../dist/perbadanan-layout.mjs';
import {buildingType,buildingStyle,buildingHeight} from '../dist/building-types.mjs';
import {decorateEnvironment} from '../dist/world-palette.mjs';
import {buildVillageScene} from '../dist/village-model.mjs';
import {TOWN_PLACES} from '../dist/town-scene.mjs';
const environment=JSON.parse(await readFile(new URL('../dist/environment/labuan.geojson',import.meta.url))),feature=environment.features.find(f=>f.properties.osm===tower.osm);
test('11-storey Menara Perbadanan uses its named OSM footprint and white / navy reference palette',()=>{
 assert.equal(feature.properties.tags.name,'Menara Perbadanan Labuan');assert.equal(buildingType(feature.properties),'perbadanan');const style=buildingStyle(feature.properties);assert.equal(style.floors,11);assert.equal(style.facade,'#e5e9e9');assert.equal(style.window,'#2c405b');assert.equal(style.pitched,false);assert.equal(buildingHeight(feature.properties),35.2);
 const before=JSON.stringify(feature),decorated=decorateEnvironment({type:'FeatureCollection',features:[feature]});assert.equal(decorated.features[0].properties.height,35.2);assert.equal(decorated.features[0].properties.facadeColor,tower.facade);assert.equal(JSON.stringify(feature),before);
 const wisma=environment.features.find(f=>f.properties.osm==='way/1412136978');assert.notEqual(buildingType(wisma.properties),'perbadanan');assert.equal(TOWN_PLACES.filter(p=>p.properties.osm===tower.osm).length,1);assert.equal(PERBADANAN_PLACE.properties.referenceFloors,11);
});
test('tower geometry renders all eleven ribbon-window levels and leaves one side as a white wall',()=>{
 const before=JSON.stringify(feature),model=buildVillageScene({type:'FeatureCollection',features:[feature]},tower.centre,{heightAt:()=>4,buildingLimit:1,treeLimit:0});assert.equal(model.stats.perbadananTowers,1);assert.equal(model.stats.perbadananFloors,11);assert.equal(model.stats.perbadananGlassBands,33);assert.deepEqual(model.stats.perbadananBandsByFloor,Array(11).fill(3));assert.equal(model.stats.perbadananBlankFacades,1);assert.equal(model.stats.pitchedRoofs,0);
 let maximum=0;model.root.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++){assert(Number.isFinite(p.getX(i))&&Number.isFinite(p.getY(i))&&Number.isFinite(p.getZ(i)));maximum=Math.max(maximum,p.getY(i))}});assert(maximum>39&&maximum<43);assert.equal(JSON.stringify(feature),before);model.dispose();
});
