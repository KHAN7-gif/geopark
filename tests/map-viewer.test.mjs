import test from 'node:test';
import assert from 'node:assert/strict';
import {viewerPreferences,viewportLabel,applyViewerLayers} from '../dist/map-viewer.mjs';
test('viewer settings whitelist display layers and cannot alter travel or inventory',()=>{
 const raw={layers:{missions:false,jetties:false,route:true,terrain:false},journey:{paused:true},xp:99999};const saved=JSON.stringify(raw);
 assert.deepEqual(viewerPreferences(raw),{version:1,layers:{missions:false,jetties:false,route:true}});assert.equal(JSON.stringify(raw),saved);
 assert.deepEqual(viewerPreferences({layers:{route:'false',jetties:null}}),viewerPreferences(null));
 assert.equal(viewportLabel({lat:5.3,lng:115.23,zoom:14.2,bearing:-90}),'5.30000° U · 115.23000° T · Z 14.2 · 270°');assert.equal(viewportLabel({lat:NaN}),'Paparan kamera Labuan');
});
test('layer switches hide only requested pins, decks and route drawings and restore them',()=>{
 const nodes=new Map([['G1',{hidden:false}],['J4',{hidden:false}]]),markers=new Map([...nodes].map(([id,el])=>[id,{getElement:()=>el}]));
 const ids=['labuan-mission-beacons','virtual-jetty-decks','route-halo','route-line','travelled-line'],layers=Object.fromEntries(ids.map(id=>[id,{}]));const map={getLayer:id=>layers[id],setLayoutProperty(id,key,value){layers[id][key]=value}};
 applyViewerLayers(map,markers,{missions:false,jetties:true,route:false});assert.equal(nodes.get('G1').hidden,true);assert.equal(nodes.get('J4').hidden,false);assert.equal(layers['virtual-jetty-decks'].visibility,'visible');assert.equal(layers['route-line'].visibility,'none');
 applyViewerLayers(map,markers,{missions:true,jetties:false,route:true});assert.equal(nodes.get('G1').hidden,false);assert.equal(nodes.get('J4').hidden,true);assert.equal(layers['route-line'].visibility,'visible');assert.equal(layers['virtual-jetty-decks'].visibility,'none');
 assert.doesNotThrow(()=>applyViewerLayers({getLayer:()=>null},new Map(),{}));
});
