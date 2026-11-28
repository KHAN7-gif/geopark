import {addVehicleLights} from './vehicle-lights.mjs?v=annur-20261128';
import * as THREE from './vendor/three.module.js';
export function buildTownActor(mode='walk',variant=0){
 const root=new THREE.Group(),materials=new Map(),animated=[],colours=[0xcb7054,0x638b91,0xdbba65,0x7c9b66,0xe0d9c3,0x6e83a8],colour=colours[variant%colours.length];let lights=null;
 const material=c=>{if(!materials.has(c))materials.set(c,new THREE.MeshLambertMaterial({color:c,flatShading:true,transparent:true}));return materials.get(c)};
 function mesh(g,c,x,y,z,parent=root){const o=new THREE.Mesh(g,material(c));o.position.set(x,y,z);o.frustumCulled=false;parent.add(o);return o}
 const box=(w,h,d,c,x,y,z,p)=>mesh(new THREE.BoxGeometry(w,h,d),c,x,y,z,p);
 if(mode==='walk'){
  box(.55,.65,.32,colour,0,1.12,0);mesh(new THREE.IcosahedronGeometry(.23,1),variant%2?0xd0a077:0xefd1ae,0,1.68,0);if(variant%3!==1)box(.38,.13,.35,variant%2?0xd1ae6b:0x39413c,0,1.88,.02);if(variant%3===1)box(.4,.45,.18,0x8d7056,0,1.18,.24);
  for(const side of [-1,1]){for(const arm of [false,true]){const joint=new THREE.Group();joint.position.set(side*(arm?.36:.15),arm?1.4:.85,0);root.add(joint);box(arm?.16:.22,arm?.52:.72,arm?.19:.28,arm?colour:0x3b4f4e,0,arm?-.24:-.34,0,joint);animated.push({joint,phase:arm?-side:side})}}
 }else{
  const bus=mode==='bus',motor=mode==='motor',sport=mode==='sport',pickup=mode==='pickup',truck=mode==='truck',taxi=mode==='taxi';
  const w=motor?.55:truck?2.15:bus?2.1:sport?1.85:pickup?1.9:1.7,l=motor?1.9:truck?7.2:bus?6.5:pickup?4.8:sport?4.25:3.9;
  root.userData.vehicle={mode,width:w,length:l};
  if(truck){
   box(w,1.4,2.15,colour,0,1.15,-l*.33);box(w*.88,.68,1.5,0x548597,0,1.95,-l*.35);box(w,.14,2.1,colour,0,2.36,-l*.33);
   box(w*.98,2.3,4.5,0xd9ded6,0,1.65,l*.17);box(w,.13,4.55,0x758c91,0,2.85,l*.17);
   for(const side of [-1,1])box(.04,.2,4.3,colour,side*w*.505,1.35,l*.17);
  }else if(pickup){
   box(w,.65,l,colour,0,.9,0);box(w*.9,.85,2.15,0x548597,0,1.55,-.72);box(w,.14,2.25,colour,0,2.03,-.72);
   box(w*.78,.12,1.65,0x364b4b,0,1.25,1.35);for(const side of [-1,1])box(.18,.48,1.85,colour,side*w*.45,1.42,1.2);box(w,.48,.15,colour,0,1.42,l*.48);
  }else if(sport){
   box(w,.45,l,colour,0,.67,0);box(w*.78,.45,l*.45,0x355e72,0,1.1,.1);box(w*.85,.1,l*.4,colour,0,1.36,.12);
   for(const side of [-1,1]){box(.1,.38,.1,0x354448,side*w*.35,1.08,l*.36);box(.11,.025,1,0xf0e6ce,side*.17,.905,-1.1)}box(w*1.05,.11,.38,colour,0,1.3,l*.36);
  }else{
   box(w,bus?1.8:.65,l,taxi?0xe2b348:colour,0,bus?1.4:.85,0);box(w*.85,bus?.8:.65,l*.6,0x548597,0,bus?2:1.4,-.15);box(w*.9,.1,l*.65,taxi?0xe2b348:colour,0,bus?2.45:1.78,-.15);
   if(taxi)box(.6,.22,.35,0xffedb2,0,1.96,-.1);
  }
  for(const side of motor?[0]:[-1,1])for(const z of truck?[-l*.34,l*.18,l*.36]:[-l*.32,l*.32]){const r=truck?.43:bus?.4:sport?.27:.28,wheel=mesh(new THREE.CylinderGeometry(r,r,.18,10),0x26322e,side*w*.5,truck?.45:.38,z);wheel.rotation.z=Math.PI/2;animated.push({wheel})}
  lights=addVehicleLights(root,{width:w,length:l,motor,height:sport?.72:truck?1:.85});
  if(motor){box(.4,.5,.3,0x707b45,0,1.65,0);mesh(new THREE.IcosahedronGeometry(.23,1),0xd9b894,0,2,0);mesh(new THREE.SphereGeometry(.26,8,5),colour,0,2.12,0)}

 }
 return {root,setMood(id){lights?.setMood(id)},animate(time,moving,opacity=1){lights?.setOpacity(opacity);for(const m of materials.values()){m.opacity=opacity}for(const a of animated){if(a.wheel)a.wheel.rotation.x=moving?time*6:0;else a.joint.rotation.x=moving?Math.sin(time*7)*.4*a.phase:0}},dispose(){lights?.dispose();root.traverse(o=>o.geometry?.dispose());for(const m of materials.values())m.dispose();root.clear()}};
}
