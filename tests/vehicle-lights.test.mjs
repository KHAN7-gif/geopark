import test from 'node:test';
import assert from 'node:assert/strict';
import {buildExplorerModel} from '../dist/explorer-model.mjs';
import {buildTownActor} from '../dist/town-life-model.mjs';

test('player and town vehicles switch front and rear lamps with night and retain their direction',()=>{
 for(const build of [buildExplorerModel,buildTownActor])for(const mode of ['car','bus','motor']){
  const model=build(mode),front=[],rear=[];model.root.traverse(o=>{if(o.name==='head-light')front.push(o);if(o.name==='tail-light')rear.push(o)});
  assert.equal(front.length,mode==='motor'?1:2);assert.equal(rear.length,front.length);assert.ok(front.every(o=>o.position.z<0));assert.ok(rear.every(o=>o.position.z>0));
  const beams=model.root.getObjectByName('night-road-glow');assert.equal(beams.visible,false);model.setMood('night');assert.equal(beams.visible,true);assert.ok(front.every(o=>o.material.color.getHexString()==='fff8df'));assert.ok(rear.every(o=>o.material.color.getHexString()==='ff2420'));assert.equal(front[0].material.isMeshBasicMaterial,true);
  model.root.rotation.y=Math.PI/2;model.animate(1,false,1);assert.equal(beams.visible,true);assert.equal(beams.parent.parent,model.root);model.setMood('day');assert.equal(beams.visible,false);model.dispose();
 }
 for(const build of [buildExplorerModel,buildTownActor]){const person=build('walk');person.setMood('night');assert.equal(person.root.getObjectByName('vehicle-lights'),undefined);person.dispose()}
});
test('traffic light fades cannot leave ghost glow and every lighting resource is released',()=>{
 const model=buildTownActor('car'),beams=model.root.getObjectByName('night-road-glow'),materials=new Set();let geometryDisposals=0,materialDisposals=0,meshes=0;
 model.root.traverse(o=>{if(o.isMesh){meshes++;o.geometry.addEventListener('dispose',()=>geometryDisposals++);materials.add(o.material)}});for(const material of materials)material.addEventListener('dispose',()=>materialDisposals++);
 model.setMood('night');model.animate(1,true,.5);assert.equal(beams.material.opacity,.16);model.animate(2,true,0);assert.equal(beams.visible,false);model.animate(3,false,1);assert.equal(beams.visible,true);model.setMood('day');model.animate(4,true,1);assert.equal(beams.visible,false);
 model.dispose();assert.equal(geometryDisposals,meshes);assert.equal(materialDisposals,materials.size);
});
