import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createTownInteractions,townInteractionCard,INTERACTION_RADIUS} from '../dist/town-interactions.mjs';
import {TOWN_PLACES} from '../dist/town-scene.mjs';
import {toXY,fromXY} from '../dist/marine-geometry.mjs';
const data=JSON.parse(readFileSync(new URL('../dist/environment/labuan.geojson',import.meta.url))),index=createTownInteractions(TOWN_PLACES,data);
test('Dataran can be interacted with from its open field, with distances to building exteriors',()=>{
 const near=index.nearby([5.27625,115.2449]);assert.equal(near[0].place.properties.name,'Dataran Labuan');assert.equal(near[0].distance,0);
 const p=toXY([5.28,115.244]),ring=[[-50,-50],[50,-50],[50,50],[-50,50],[-50,-50]].map(([x,y])=>{const q=fromXY([p[0]+x,p[1]+y]);return [q[1],q[0]]}),place={type:'Feature',properties:{osm:'way/123',kind:'office',name:'Pejabat'},geometry:{type:'Point',coordinates:[115.244,5.28]}},building={type:'Feature',properties:{osm:'way/123',kind:'building'},geometry:{type:'Polygon',coordinates:[ring]}},large=createTownInteractions([place],{features:[building]});
 const doorstep=fromXY([p[0]+55,p[1]]);assert.ok(large.nearby(doorstep)[0].distance<5.01,'the player can stand outside rather than enter a large building');assert.equal(createTownInteractions([place]).nearby(doorstep).length,0);
});
test('interaction range rejects distant or malformed positions and leaves all source data intact',()=>{
 const before=JSON.stringify(data),places=JSON.stringify(TOWN_PLACES);for(const p of [null,[NaN,115.24],[5.3],[Infinity,Infinity]])assert.deepEqual(index.nearby(p),[]);assert.deepEqual(index.nearby([5.2,115.2]),[]);
 for(const p of TOWN_PLACES){const [lng,lat]=p.geometry.coordinates;for(const item of index.nearby([lat,lng])){assert.ok(item.distance<=INTERACTION_RADIUS);assert.ok(TOWN_PLACES.includes(item.place))}}
 assert.equal(JSON.stringify(data),before);assert.equal(JSON.stringify(TOWN_PLACES),places);
});
test('location cards use existing landmark references and public place tags',()=>{
 const card=name=>townInteractionCard(TOWN_PLACES.find(p=>p.properties.name===name));assert.ok(card('Dataran Labuan').facts.some(f=>f.includes('tiang bendera di tengah')));assert.ok(card('Bulatan Merdeka').intro.includes('empat'));assert.ok(card('Menara Perbadanan Labuan').facts.some(f=>f.includes('11 tingkat')));assert.ok(card('Monumen Ikan Marlin').observe.includes('marlin'));
 for(const place of TOWN_PLACES){const c=townInteractionCard(place);assert.equal(c.name,place.properties.name);assert.ok(c.label&&c.intro&&c.observe);assert.ok(Array.isArray(c.facts))}
});
