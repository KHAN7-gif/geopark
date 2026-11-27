import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {buildExplorerModel} from '../dist/explorer-model.mjs';
import {addSurroundingLayers,setSurroundingsVisible,SURROUNDING_LAYERS} from '../dist/surroundings.mjs';
const data=JSON.parse(await readFile(new URL('../dist/environment/labuan.geojson',import.meta.url)));
const meta=JSON.parse(await readFile(new URL('../dist/environment/metadata.json',import.meta.url)));

test('surroundings use attributed Labuan footprints with explicit estimated heights',()=>{
  const buildings=data.features.filter(f=>f.properties.kind==='building');
  assert.equal(buildings.length,2189);assert.equal(meta.stats.buildings,buildings.length);
  assert.equal(meta.stats.mappedTrees,110);assert.equal(meta.stats.greenAreas,22);
  assert.ok(meta.osmTimestamp);assert.equal(meta.license,'ODbL-1.0');
  assert.equal(buildings.filter(f=>f.properties.heightSource==='estimate').length,meta.stats.estimatedHeights);
  for(const feature of data.features){
    const ring=feature.geometry.coordinates[0];assert.deepEqual(ring[0],ring.at(-1));
    assert.match(feature.properties.osm,/^(way|node)\/[0-9]+$/);
    for(const [lng,lat]of ring){assert.ok(lng>=115.08&&lng<=115.37);assert.ok(lat>=5.1&&lat<=5.44)}
    if(feature.properties.kind==='building')assert.ok(feature.properties.height>feature.properties.base);
  }
});

test('all environment layers can be disabled without changing the route or terrain',()=>{
  const layers=new Map(),changes=[],sources=[];
  const map={addSource(id){sources.push(id)},addLayer(layer){layers.set(layer.id,layer)},getLayer:id=>layers.get(id),setLayoutProperty(id,key,value){changes.push([id,key,value])}};
  addSurroundingLayers(map,data);setSurroundingsVisible(map,false);
  assert.ok(layers.has('labuan-roofs'));assert.ok(layers.has('labuan-crown-tops'));assert.deepEqual(sources,['labuan-surroundings','labuan-depth-shadows','labuan-details']);
  assert.equal(changes.length,layers.size);assert.ok(changes.every(([id,key,value])=>SURROUNDING_LAYERS.includes(id)&&key==='visibility'&&value==='none'));
  setSurroundingsVisible(map,true);assert.ok(changes.slice(layers.size).every(c=>c[2]==='visible'));
});

test('original 3D explorer and unlocked transport models animate and release their geometry',()=>{
  for(const mode of ['walk','car','bus','motor']){
    const model=buildExplorerModel(mode,'rimba');let meshes=0,disposed=0;
    model.root.traverse(object=>{if(object.isMesh){meshes++;assert.equal(object.frustumCulled,false);object.geometry.addEventListener('dispose',()=>disposed++)}});
    assert.ok(meshes>=7);model.animate(.2,true);model.animate(.3,false);
    model.dispose();assert.equal(disposed,meshes);
  }
});
