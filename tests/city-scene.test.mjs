import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {buildVillageScene} from '../dist/village-model.mjs';
import {surfacePixels} from '../dist/surface-textures.mjs';
import {cameraPose} from '../dist/advanced-map.mjs';
const data=JSON.parse(await readFile(new URL('../dist/environment/labuan.geojson',import.meta.url))),roads=JSON.parse(await readFile(new URL('../dist/environment/game-roads.geojson',import.meta.url)));
test('town details follow source buildings, retain landmarks and release shared textures',()=>{
 const before=JSON.stringify(data),roadsBefore=JSON.stringify(roads),model=buildVillageScene(data,[115.24275,5.27724],{roads,buildingLimit:75,treeLimit:40}),textures=new Set();let textureDisposals=0;
 assert.ok(model.stats.cityFacades>40);assert.ok(model.stats.cityCanopies>20);assert.ok(model.stats.pavements>0);assert.ok(model.stats.streetLamps>0);assert.ok(model.stats.airConditioners>0);assert.equal(model.stats.merdekaUmbrellas,4);assert.equal(model.stats.perbadananFloors,11);assert.ok(model.stats.drawCalls<=3);
 for(const mesh of model.root.children){assert.equal(mesh.geometry.attributes.uv.count,mesh.geometry.attributes.position.count);assert.equal(mesh.geometry.attributes.color.count,mesh.geometry.attributes.position.count);assert.ok([...mesh.geometry.attributes.uv.array].every(Number.isFinite));if(mesh.material.map)textures.add(mesh.material.map)}
 assert.equal(textures.size,2);for(const texture of textures)texture.addEventListener('dispose',()=>textureDisposals++);
 model.dispose();assert.equal(textureDisposals,2);assert.equal(model.root.children.length,0);assert.equal(JSON.stringify(data),before);assert.equal(JSON.stringify(roads),roadsBefore);
});
test('local textures are deterministic and the street camera follows geographic route position',()=>{
 const asphalt=surfacePixels('asphalt');assert.equal(asphalt.data.length,64*64*4);assert.deepEqual(asphalt,surfacePixels('asphalt'));assert.notDeepEqual(asphalt,surfacePixels('roof'));assert.ok(new Set(asphalt.data).size>20);
 const position=[5.27724,115.24275],pose=cameraPose({mode:'street',position,heading:110,currentBearing:110});assert.deepEqual(pose.center,[115.24275,5.27724]);assert.equal(pose.pitch,75);assert.equal(pose.zoom,20);assert.equal(pose.bearing,110);assert.deepEqual(position,[5.27724,115.24275]);
});

test('native road texture stays on vehicular roads and follows basemap visibility',async()=>{
 const {addGameWorld}=await import('../dist/game-world.mjs'),{switchBasemap}=await import('../dist/advanced-map.mjs'),layers=new Map(),sources=new Map(),images=new Map();
 const map={getLayer:id=>layers.get(id),addImage:(id,image)=>images.set(id,image),addSource:(id,source)=>sources.set(id,source),addLayer:layer=>layers.set(layer.id,layer),setLayoutProperty(id,key,value){layers.get(id)[key]=value}};
 addGameWorld(map,roads);assert.equal(images.get('labuan-asphalt').data.length,64*64*4);assert.equal(layers.get('game-asphalt').paint['line-pattern'],'labuan-asphalt');assert.deepEqual(layers.get('game-asphalt').filter,['==',['get','foot'],false]);assert.equal(sources.get('game-roads').data,roads);
 switchBasemap(map,'game');assert.equal(layers.get('game-asphalt').visibility,'visible');switchBasemap(map,'satellite');assert.equal(layers.get('game-asphalt').visibility,'none');
});
