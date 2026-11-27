import {journeyAt} from './travel-engine.mjs?v=explore-20261127';
import * as THREE from './vendor/three.module.js';

export function buildExplorerModel(mode='walk',avatar='rimba'){
  const root=new THREE.Group(),animated=[];
  const colours={rimba:0x568a4d,pesisir:0x418cb5,warisan:0xa77a4e};
  const materials=new Map();
  const material=colour=>{if(!materials.has(colour))materials.set(colour,new THREE.MeshLambertMaterial({color:colour,flatShading:true}));return materials.get(colour)};
  function mesh(geometry,colour,x,y,z,parent=root){const object=new THREE.Mesh(geometry,material(colour));object.position.set(x,y,z);object.frustumCulled=false;parent.add(object);return object}
  const box=(w,h,d,c,x,y,z,parent)=>mesh(new THREE.BoxGeometry(w,h,d),c,x,y,z,parent);
  if(mode==='walk'){
    box(.6,.65,.35,colours[avatar]||colours.rimba,0,1.17,0);
    mesh(new THREE.IcosahedronGeometry(.25,1),0xd9ae80,0,1.77,-.02);
    mesh(new THREE.CylinderGeometry(.36,.36,.08,10),0xc0aa77,0,1.98,0);
    mesh(new THREE.CylinderGeometry(.23,.28,.22,8),0xc0aa77,0,2.08,0);
    box(.42,.53,.22,0x775d40,0,1.23,.27);
    for(const sign of [-1,1]){
      const leg=new THREE.Group();leg.position.set(sign*.17,.9,0);root.add(leg);box(.23,.65,.25,0x354c42,0,-.33,0,leg);box(.26,.16,.4,0x32322a,0,-.72,-.07,leg);animated.push({object:leg,phase:sign});
      const arm=new THREE.Group();arm.position.set(sign*.4,1.45,0);root.add(arm);box(.19,.54,.2,colours[avatar]||colours.rimba,0,-.24,0,arm);mesh(new THREE.IcosahedronGeometry(.11,0),0xd9ae80,0,-.58,0,arm);animated.push({object:arm,phase:-sign});
    }
  }else if(['perahu','boat','boat_vip'].includes(mode)){
    const small=mode==='perahu',vip=mode==='boat_vip',length=small?4:vip?9:7,width=small?1.2:vip?3:2.4;
    const hull=mesh(new THREE.SphereGeometry(1,12,6),small?0x925d33:0xf5f0d9,0,.35,0);hull.scale.set(width/2,.65,length/2);
    box(width*.85,.16,length*.8,small?0xc28b50:vip?0xc5a458:0x287da0,0,.65,0);
    if(small){for(const z of [-1,0,1])box(1,.12,.3,0xe7bc7d,0,.85,z);for(const sign of [-1,1]){const oar=box(.09,.09,3,0x74512f,sign*.9,.9,0);oar.rotation.y=sign*.7;animated.push({object:oar,phase:sign})}}
    else{box(width*.7,1.2,length*.45,0x5ba8b9,0,1.3,-.3);box(width*.85,.15,length*.5,vip?0xd9b55d:0xfaf5dc,0,1.95,-.3);if(vip)box(width*.5,.8,length*.23,0xf5efda,0,2.4,.2)}
  }else{
    const bus=mode==='bus',motor=mode==='motor';const width=motor ? .6 : bus ? 2.25 : 1.8,length=motor?1.8:bus?7:4;
    box(width,motor ? .45 : bus ? 2.15 : .85,length,motor?0xa66e3d:bus?0x406950:0xd7b97c,0,bus?1.6:.85,0);
    if(!motor){box(width*.86,bus ? .85 : .78,length*.58,0x5b8996,0,bus?2.1:1.55,-.22);box(width*.93,.12,length*.65,bus?0xceb984:0xddd4b8,0,bus?2.62:1.99,-.22)}
    else{box(.45,.5,.45,colours[avatar]||colours.rimba,0,1.55,0);mesh(new THREE.IcosahedronGeometry(.24,1),0xe8d4aa,0,2,0)}
    for(const z of [-length*.32,length*.32])for(const sign of motor?[0]:[-1,1]){
      const wheel=mesh(new THREE.CylinderGeometry(bus ? .43 : .31,bus ? .43 : .31,.2,10),0x252d2c,sign*width*.51,.45,z);wheel.rotation.z=Math.PI/2;animated.push({object:wheel,wheel:true});
    }
    for(const sign of [-1,1])box(.25,.16,.06,0xf6e9bd,sign*width*.3,.94,-length*.51);
  }
  root.traverse(object=>{if(object.isMesh)object.frustumCulled=false});
  return {root,animate(time,moving){for(const part of animated){if(part.wheel)part.object.rotation.x=moving?time*5:0;else part.object.rotation.x=moving?Math.sin(time*8)*.45*part.phase:0}},dispose(){root.traverse(object=>object.geometry?.dispose());for(const value of materials.values())value.dispose()}};
}

export function createExplorerLayer(glLibrary,{reducedMotion=false,onFailure=()=>{}}={}){
  let repaintTimer=null,frameRate=30;
  let map,renderer,scene,camera,model,ambient,sun,state=null,key='',disposed=false;
  const layer={id:'labuan-explorer-model',type:'custom',renderingMode:'3d',
    onAdd(owner,context){
      map=owner;scene=new THREE.Scene();camera=new THREE.Camera();
      ambient=new THREE.AmbientLight(0xffffff,1.5);scene.add(ambient);sun=new THREE.DirectionalLight(0xffedcf,2.2);sun.position.set(-20,60,-30);scene.add(sun);
      renderer=new THREE.WebGLRenderer({canvas:owner.getCanvas(),context,antialias:true});renderer.autoClear=false;
    },
    render(context,args){
      if(disposed||!state?.position||!renderer)return;
      try{
        const identity=`${state.mode}:${state.avatar}`;
        if(identity!==key){key=identity;if(model){scene.remove(model.root);model.dispose()}model=buildExplorerModel(state.mode,state.avatar);scene.add(model.root)}
        const live=state.journey?journeyAt(state.journey):null,position=live?.position||state.position;
        const point=[position[1],position[0]],altitude=['perahu','boat','boat_vip'].includes(live?.mode||state.mode)?0:map.queryTerrainElevation?.(point)||0;
        const origin=glLibrary.MercatorCoordinate.fromLngLat(point,altitude+.3),scale=origin.meterInMercatorCoordinateUnits()*(state.mode==='walk'?2.8:1.5);
        const local=new THREE.Matrix4().makeTranslation(origin.x,origin.y,origin.z).scale(new THREE.Vector3(scale,-scale,scale)).multiply(new THREE.Matrix4().makeRotationX(Math.PI/2));
        const projection=new THREE.Matrix4().fromArray(args.defaultProjectionData?.mainMatrix||args);
        camera.projectionMatrix.copy(projection.multiply(local));
        model.root.rotation.y=-(state.heading||0)*Math.PI/180;model.animate(performance.now()/1000,state.moving&&!live?.arrived&&!reducedMotion);
        renderer.resetState();renderer.setViewport(0,0,map.getCanvas().width,map.getCanvas().height);renderer.render(scene,camera);
        if(state.moving&&!live?.arrived&&!reducedMotion&&repaintTimer===null)repaintTimer=setTimeout(()=>{repaintTimer=null;if(!disposed&&state?.moving)map.triggerRepaint()},1000/frameRate);
      }catch(error){disposed=true;onFailure(error)}
    },
    onRemove(){disposed=true;clearTimeout(repaintTimer);model?.dispose();renderer?.dispose();renderer=null;scene=null;state=null}
  };
  return {layer,setFrameRate(rate){frameRate=Math.max(15,Math.min(60,rate))},setMood(id){if(!ambient||!sun)return;ambient.intensity=id==='night'?.9:id==='dusk'?1.2:1.5;sun.intensity=id==='night'?.8:2.2;sun.color.set(id==='night'?0xa6c5e9:id==='dusk'?0xffc17d:0xffedcf)},sync(next){state=next;if(!state?.moving){clearTimeout(repaintTimer);repaintTimer=null}if(map&&!disposed)map.triggerRepaint()}};
}
