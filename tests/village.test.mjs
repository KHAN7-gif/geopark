import {addAirportWorld} from '../dist/airport-world.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {buildVillageScene} from '../dist/village-model.mjs';
import {addGameWorld,GAME_MAP_LAYERS} from '../dist/game-world.mjs';
import {switchBasemap,cameraPose} from '../dist/advanced-map.mjs';
const data=JSON.parse(await readFile(new URL('../dist/environment/labuan.geojson',import.meta.url))),roads=JSON.parse(await readFile(new URL('../dist/environment/game-roads.geojson',import.meta.url)));
test('game world uses an attributed Labuan road snapshot and switches without altering travel sources',async()=>{
 const meta=JSON.parse(await readFile(new URL('../dist/environment/game-roads-metadata.json',import.meta.url)));assert.equal(meta.roads,roads.features.length);assert.ok(meta.osmTimestamp);assert.equal(meta.license,'ODbL-1.0');assert.ok(roads.features.length>4000);
 for(const f of roads.features){assert.match(f.properties.osm,/^way\/\d+$/);assert.ok(f.properties.width>=1&&f.properties.width<=20);assert.ok(f.geometry.coordinates.length>=2);for(const [lng,lat]of f.geometry.coordinates){assert.ok(lng>115&&lng<115.5);assert.ok(lat>5&&lat<5.6)}}
 const layers=new Map(['base','base-satellite','relief','route-halo'].map(id=>[id,{}])),sources=new Map(),changes=[];const map={getLayer:id=>layers.get(id),addSource:(id,source)=>sources.set(id,source),addLayer:layer=>layers.set(layer.id,layer),setLayoutProperty(id,key,value){changes.push(id);layers.get(id)[key]=value}};
 addGameWorld(map,roads);addAirportWorld(map,JSON.parse(await readFile(new URL('../dist/environment/airport.geojson',import.meta.url))));switchBasemap(map,'game');assert.equal(layers.get('base').visibility,'none');for(const id of GAME_MAP_LAYERS)assert.equal(layers.get(id).visibility,'visible');assert.equal(sources.get('game-roads').data,roads);assert.ok(!changes.includes('route-halo'));
 switchBasemap(map,'satellite');assert.equal(layers.get('base-satellite').visibility,'visible');for(const id of GAME_MAP_LAYERS)assert.equal(layers.get(id).visibility,'none');
 const pose=cameraPose({mode:'village',position:[5.284,115.246],heading:0});assert.equal(pose.pitch,52);assert.equal(pose.bearing,25);assert.equal(pose.zoom,18.4);
});
test('village roofs, facade windows and tropical trees are bounded, batched and dispose without mutating OSM data',()=>{
 const before=JSON.stringify(data),model=buildVillageScene(data,[115.246,5.284],{roads,buildingLimit:30,treeLimit:35,heightAt:()=>7});
 assert.equal(model.stats.buildings,30);assert.ok(model.stats.pitchedRoofs>5);assert.ok(model.stats.windows>50);assert.ok(model.stats.trees<=35);assert.ok(model.stats.illustrativeRoadTrees<=24);assert.ok(model.root.children.length<30,'batch draw calls by material instead of one per window');
 let disposed=0,meshes=0;model.root.traverse(o=>{if(o.isMesh){meshes++;assert.ok([...o.geometry.attributes.position.array].every(Number.isFinite));o.geometry.addEventListener('dispose',()=>disposed++)}});model.dispose();assert.equal(disposed,meshes);assert.equal(model.root.children.length,0);assert.equal(JSON.stringify(data),before);
 const empty=buildVillageScene({type:'FeatureCollection',features:[]},[115.246,5.284]);assert.equal(empty.stats.buildings,0);empty.dispose();
});
