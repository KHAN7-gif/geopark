import test from 'node:test';
import assert from 'node:assert/strict';
import {createJourney3D,routeFeature,TERRAIN_TILES} from '../dist/journey-3d.mjs';

test('3D view preserves route coordinates, destination pins and teardown',async()=>{
  const path=[[5.381444,115.255608],[5.32,115.23],[5.27,115.25]];
  const snapshot=JSON.stringify(path);
  const nodes=[];
  const element=()=>({classList:{add(){},remove(){}},dataset:{},style:{setProperty(){}},children:[],setAttribute(){},append(n){this.children.push(n)},replaceChildren(){this.children=[]}});
  const document={createElement:element,head:{append(){}}};
  let map,selected,failed,interactions=0;const controlEvents=new Map();const container={addEventListener(name,fn){controlEvents.set(name,fn)},removeEventListener(name,fn){if(controlEvents.get(name)===fn)controlEvents.delete(name)}};const basemapChanges=[];const previousFetch=globalThis.fetch;globalThis.fetch=async()=>({ok:true,json:async()=>({type:"FeatureCollection",features:[]})});
  class FakeMap{
    constructor(options){this.options=options;this.layers=Object.fromEntries(options.style.layers.map(l=>[l.id,l]));this.events={};this.sources={};map=this}
    on(event,callback){this.events[event]=callback}
    getContainer(){return container}stop(){this.stops=(this.stops||0)+1}addControl(){} getCanvas(){return {addEventListener:(name,cb)=>{this.contextLost=cb}}}
    getLayer(id){return this.layers?.[id]} setLayoutProperty(id,key,value){this.layers[id][key]=value}
    addSource(id,source){this.sources[id]={...source,setData(data){this.data=data}}}
    getSource(id){return this.sources[id]} addLayer(layer){this.layers??={};this.layers[layer.id]=layer} getBearing(){return 0}
    fitBounds(bounds,options){this.bounds=bounds;this.fit=options} resize(){} jumpTo(options){this.camera=options} easeTo(options){this.camera=options}
    setTerrain(terrain){this.terrain=terrain} remove(){this.removed=true}
  }
  class FakeMarker{
    constructor(options){this.element=options.element;nodes.push(this)}setLngLat(point){this.point=point;return this}addTo(){return this}remove(){this.removed=true}getElement(){return this.element}
  }
  const window={innerWidth:390,maplibregl:{Map:FakeMap,Marker:FakeMarker,NavigationControl:class{},LngLatBounds:class{constructor(){this.points=[]}extend(point){this.points.push(point)}}}};
  globalThis.window=window;globalThis.document=document;
  const view=await createJourney3D({element:element(),onSelect:s=>selected=s,onInteract(){interactions++},onNotice(){},onFailure:msg=>failed=msg,onBasemapChange:id=>basemapChanges.push(id),reducedMotion:true});
  try{
    const sites=[{id:'G1',name:'Mula',lat:path[0][0],lng:path[0][1]},{id:'G2',name:'Destinasi',lat:path[2][0],lng:path[2][1]}];
    view.sync({sites,records:{G1:{done:1}},journey:{toId:'G2',route:{path}},position:path[1],index:1,profile:{name:'Aiman',avatar:'rimba'},vehicle:'🚶'});
    view.follow(path[1],true);map.events.load();assert.ok(map.sources['marina-scenery'].data.features.filter(f=>f.properties.part==='hull').length>=6);assert.equal(map.layers['marina-parked-boats'].layout.visibility,'visible');assert.equal(map.camera.zoom,19.1);assert.equal(map.camera.pitch,67);await new Promise(resolve=>setTimeout(resolve,0));view.setSurroundings(false);assert.equal(map.layers['labuan-buildings'].visibility,'none');assert.equal(map.layers['marina-parked-boats'].layout.visibility,'visible','boats survive scenery fallback / light mode');assert.notEqual(map.layers['marina-parked-boats'].visibility,'none');view.setQuality('eco');assert.equal(map.sources['marina-scenery'].data.features.filter(f=>f.properties.part==='hull').length,6);view.setQuality('auto');view.setSurroundings(true);assert.equal(map.layers['labuan-buildings'].visibility,'visible');
    assert.equal(map.options.style.terrain.exaggeration,1);
    assert.equal(map.options.style.sources.elevation.encoding,'terrarium');
    assert.ok(TERRAIN_TILES.startsWith('https://'));
    assert.deepEqual(map.sources.route.data,routeFeature(path));
    assert.deepEqual(nodes[0].point,[115.255608,5.381444]);
    assert.equal(nodes[0].element.textContent,'G1 ✓');
    assert.ok(nodes[1].element.className.includes('target'));
    nodes[1].element.onclick();assert.equal(selected.id,'G2');
    assert.deepEqual(nodes[11].point,[115.23,5.32]);
    view.setLayers({missions:false,jetties:false,route:false});assert.equal(nodes[0].element.hidden,true);assert.equal(nodes[2].element.hidden,true);assert.equal(map.layers['route-line'].visibility,'none');assert.deepEqual(map.sources.route.data,routeFeature(path));
    view.setLayers({missions:true,jetties:true,route:true});assert.equal(nodes[0].element.hidden,false);assert.equal(nodes[2].element.hidden,false);assert.equal(map.layers['route-line'].visibility,'visible');
    assert.equal(nodes[2].element.textContent,'⚓ J1');nodes[2].element.onclick();assert.equal(selected.id,'J1');assert.equal(map.sources['virtual-jetties'].data.features.length,18);view.follow(path[1],true);assert.equal(map.camera.duration,0);
    assert.deepEqual(map.camera.center,[115.23,5.32]);
    // Native zoom buttons must release following before their animation, even
    // when no fresh zoomstart event arrives during a camera transition.
    const state={sites,records:{G1:{done:1}},journey:{toId:'G2',route:{path}},position:path[1],index:1,profile:{name:'Aiman',avatar:'rimba'},vehicle:'🚶'};
    for(const control of ['maplibregl-ctrl-zoom-in','maplibregl-ctrl-zoom-out']){
      view.follow(path[1],true);const before=interactions;
      controlEvents.get('click')({target:{closest:selector=>selector.includes(control)?{}:null},detail:0});
      assert.equal(interactions,before+1);assert.ok(map.stops>0);
      map.camera={zoom:control.endsWith('in')?20:18};const manual=map.camera;
      view.sync(state);assert.equal(map.camera,manual,'follow must not restore preset zoom after manual +/-');assert.deepEqual(map.sources.route.data,routeFeature(path));
    }
    view.focusPlace([115.24334281764924,5.277003319599451],19.1);assert.equal(map.camera.zoom,19.1);assert.deepEqual(map.sources.route.data,routeFeature(path));
    view.previewVillage();assert.equal(map.camera.pitch,52);assert.equal(map.camera.zoom,18.4);assert.deepEqual(map.camera.center,[115.246,5.284]);assert.deepEqual(map.sources.route.data,routeFeature(path));
    const before=interactions;controlEvents.get('pointerdown')({target:{closest:()=>null}});assert.equal(interactions,before);

    const routeBefore=JSON.stringify(map.sources.route.data),pendingBefore=JSON.stringify(state);
    const roaming=view.startFreeRoam([5.27625,115.2449]);assert.equal(map.camera.pitch,65);assert.equal(map.camera.zoom,19.2);
    const step=view.moveFreeRoam({x:0,y:-1,bearing:0},.1);assert.ok(step.position[0]>roaming.position[0]);
    view.sync(state);assert.deepEqual(nodes[11].point,[step.position[1],step.position[0]],'mission ticks must not replace manual avatar position');
    assert.equal(JSON.stringify(map.sources.route.data),routeBefore);assert.equal(JSON.stringify(state),pendingBefore);
    view.stopFreeRoam();assert.deepEqual(nodes[11].point,[115.23,5.32]);
    for(let i=0;i<3;i++)map.events.error({sourceId:'satellite'});assert.deepEqual(basemapChanges,['street']);assert.equal(map.layers.base.visibility,'visible');assert.equal(map.layers['base-satellite'].visibility,'none');map.contextLost();assert.ok(failed.includes('2D'));
    assert.equal(JSON.stringify(path),snapshot);
  }finally{view.destroy();delete globalThis.window;delete globalThis.document;globalThis.fetch=previousFetch}
  assert.equal(map.removed,true);assert.equal(controlEvents.size,0);
});
