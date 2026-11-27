import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {MARINA_VIEW,MARINA_BERTHS,MARINA_PONTOONS,berthHullPoints,marinaRouteClearance} from '../dist/marina-layout.mjs';
import {landAt,toXY} from '../dist/marine-geometry.mjs';
import {MARINE_DATA} from '../dist/marine-data.mjs';
import {marinaFeatures,addMarinaLayers,setMarinaQuality,MARINA_LAYERS} from '../dist/marina-map.mjs';
test('moored yachts follow the existing marina pontoons and leave the J3 boat corridor clear',()=>{
 const before=JSON.stringify(MARINE_DATA),roads=JSON.parse(readFileSync(new URL('../dist/environment/game-roads.geojson',import.meta.url)));for(const pier of MARINA_PONTOONS){const source=roads.features.find(f=>f.properties.osm===pier.osm);assert.deepEqual(pier.path,source.geometry.coordinates)}
 assert.ok(MARINA_BERTHS.length>=12);assert.ok(MARINA_BERTHS.some(b=>b.kind==='vip'));assert.ok(MARINA_BERTHS.some(b=>b.kind==='sail'));
 for(const boat of MARINA_BERTHS){assert.ok(Number.isFinite(marinaRouteClearance(boat.position)));assert.ok(marinaRouteClearance(boat.position)>boat.length/2+14);assert.ok(berthHullPoints(boat).every(p=>landAt([p[1],p[0]])<0));for(const other of MARINA_BERTHS){if(boat===other)continue;const a=toXY([boat.position[1],boat.position[0]]),b=toXY([other.position[1],other.position[0]]);assert.ok(Math.hypot(a[0]-b[0],a[1]-b[1])>(boat.length+other.length)/2+1)}}assert.equal(JSON.stringify(MARINE_DATA),before);
});
test('native marina layers show boats at the reported zoom without loading the village renderer',()=>{
 const sources=new Map(),layers=new Map(),map={addSource(id,s){sources.set(id,{...s,setData(data){this.data=data}})},addLayer(layer){layers.set(layer.id,layer)},getSource:id=>sources.get(id)};addMarinaLayers(map);const boatCount=()=>sources.get('marina-scenery').data.features.filter(f=>f.properties.part==='hull').length;assert.equal(boatCount(),10);for(const id of MARINA_LAYERS){const l=layers.get(id);assert.equal(l.type,'fill-extrusion');assert.ok(l.minzoom<16.3);assert.equal(l.layout.visibility,'visible');assert.equal(l.paint['fill-extrusion-opacity'],1)}setMarinaQuality(map,'eco');assert.equal(boatCount(),6);setMarinaQuality(map,'high');assert.equal(boatCount(),12);
});
test('native hulls, cabins, masts and VIP decks contain valid independent extrusion geometry',()=>{
 for(const quality of ['eco','balanced','high']){const data=marinaFeatures(quality);assert.ok(data.features.some(f=>f.properties.part==='mast'));assert.ok(data.features.some(f=>f.properties.part==='flybridge'));for(const f of data.features){const {base,height}=f.properties;assert.ok(Number.isFinite(base)&&Number.isFinite(height)&&height>base&&base>=0);const ring=f.geometry.coordinates[0];assert.deepEqual(ring[0],ring.at(-1));assert.ok(ring.length>=5);for(const [lng,lat]of ring){assert.ok(Number.isFinite(lng)&&Number.isFinite(lat));assert.ok(lng>115.24&&lng<115.26&&lat>5.27&&lat<5.28)}}}
});
