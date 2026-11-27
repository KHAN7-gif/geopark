import test from 'node:test';
import assert from 'node:assert/strict';
import {depthShadows,paintDepthShadows} from '../dist/depth-scene.mjs';
const polygon=(kind,height)=>({type:'Feature',properties:{kind,height,osm:'test'},geometry:{type:'Polygon',coordinates:[[[115.24,5.27],[115.2401,5.27],[115.2401,5.2701],[115.24,5.2701],[115.24,5.27]]]}});
test('world shadows scale with height, change with sun and preserve geographic input',()=>{
 const data={type:'FeatureCollection',features:[polygon('building',10),polygon('canopy',5),polygon('green',0)]},before=JSON.stringify(data);
 const day=depthShadows(data,'day'),dusk=depthShadows(data,'dusk');assert.equal(day.features.length,2);assert.notDeepEqual(day,dusk);assert.equal(JSON.stringify(data),before);
 const extent=f=>Math.max(...f.geometry.coordinates[0].map(p=>p[0]))-115.2401;
 assert.ok(extent(day.features[0])>extent(day.features[1]));
 for(const f of day.features){const ring=f.geometry.coordinates[0];assert.deepEqual(ring[0],ring.at(-1));assert.ok(ring.flat().every(Number.isFinite))}
});
test('weather softens shadows and repeated weather refresh does not regenerate geometry',()=>{
 const data={features:[polygon('building',10)]},source={updates:0,setData(){this.updates++}},paint=[];
 const map={getSource:()=>source,getLayer:()=>true,setPaintProperty:(...v)=>paint.push(v)};
 paintDepthShadows(map,data,'day',{cloudCover:0});const clear=paint.at(-1)[2];
 paintDepthShadows(map,data,'day',{cloudCover:100,raining:true});assert.equal(source.updates,1);assert.ok(paint.at(-1)[2]<clear);
 paintDepthShadows(map,data,'dusk');assert.equal(source.updates,2);
});
