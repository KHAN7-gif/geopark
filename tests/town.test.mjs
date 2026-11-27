import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {buildingType,buildingStyle,buildingHeight} from '../dist/building-types.mjs';
import {decorateEnvironment} from '../dist/world-palette.mjs';
import {buildVillageScene} from '../dist/village-model.mjs';
import {TOWN_PLACES,townGround} from '../dist/town-scene.mjs';
const data=JSON.parse(await readFile(new URL('../dist/environment/labuan.geojson',import.meta.url))),roads=JSON.parse(await readFile(new URL('../dist/environment/game-roads.geojson',import.meta.url)));
test('town enrichment preserves all original building footprints and explicitly identifies police / mixed office use',()=>{
 const buildings=data.features.filter(f=>f.properties.kind==='building');
 const hash=createHash('sha256').update(JSON.stringify(buildings.map(f=>[f.properties.osm,f.geometry]))).digest('hex');assert.equal(hash,'39337691d59d4ee1cc665be55f05189496ced012be7bc8d2a68cc66af393bc88');
 const police=buildings.filter(f=>buildingType(f.properties)==='police');assert.ok(police.length>0);assert.ok(police.every(f=>f.properties.poiRefs.includes('way/1307657531')));
 assert.equal(buildingType(buildings.find(f=>f.properties.osm==='way/305216106').properties),'mixed');
 assert.ok(TOWN_PLACES.some(p=>p.properties.kind==='police'));assert.ok(TOWN_PLACES.some(p=>p.properties.name==='Dataran Labuan'));assert.ok(TOWN_PLACES.some(p=>p.properties.name==='Financial Park'));
});
test('function styling distinguishes a shop, office, police, civic, housing and unknown urban block without inventing a function',()=>{
 for(const [tags,type]of [[{shop:'convenience'},'shop'],[{office:'company'},'office'],[{amenity:'police'},'police'],[{amenity:'post_office'},'civic'],[{building:'house'},'residential']])assert.equal(buildingType({tags}),type);
 assert.equal(buildingType({inTown:true,tags:{building:'yes'}}),'urban');assert.equal(buildingType({inTown:false,tags:{building:'yes'}}),'residential');
 assert.equal(buildingHeight({height:21,heightSource:'height',tags:{office:'company'}}),21);assert.equal(buildingHeight({height:6,heightSource:'estimate',tags:{office:'company'}}),12);
 assert.equal(buildingStyle({tags:{amenity:'police'}}).band,'#284b8a');assert.equal(buildingStyle({tags:{shop:'yes'}}).pitched,false);assert.equal(buildingStyle({tags:{building:'house'}}).pitched,true);
 const decorated=decorateEnvironment(data);const b=decorated.features.find(f=>f.properties.buildingType==='police');assert.equal(b.properties.facadeColor,'#e7e9e1');
});
test('the town scene has storefronts, office ribbons, police bands and one open dataran without mutating mapped data',()=>{
 const snapshot=JSON.stringify(data),model=buildVillageScene(data,[115.246,5.276],{roads,buildingLimit:80});
 assert.ok(model.stats.shopfronts>0);assert.ok(model.stats.officeBands>0);assert.ok(model.stats.policeBands>0);assert.equal(model.stats.plazas,1);assert.ok(model.stats.pitchedRoofs<model.stats.buildings/2,'town should not look like a village of identical pitched houses');
 assert.ok(Object.keys(model.stats.byType).length>=5);assert.equal(JSON.stringify(data),snapshot);model.dispose();
 const ground=townGround();assert.equal(ground.features.filter(f=>f.properties.part==='grass').length,1);assert.ok(ground.features.every(f=>f.geometry.type!=='Point'));assert.equal(data.features.some(f=>f.properties.name==='Dataran Labuan'&&f.properties.kind==='building'),false);
});
