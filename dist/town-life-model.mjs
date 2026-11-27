import * as THREE from './vendor/three.module.js';
export function buildTownActor(mode='walk',variant=0){
 const root=new THREE.Group(),materials=new Map(),animated=[],colours=[0xcb7054,0x638b91,0xdbba65,0x7c9b66,0xe0d9c3,0x6e83a8],colour=colours[variant%colours.length];
 const material=c=>{if(!materials.has(c))materials.set(c,new THREE.MeshLambertMaterial({color:c,flatShading:true,transparent:true}));return materials.get(c)};
 function mesh(g,c,x,y,z,parent=root){const o=new THREE.Mesh(g,material(c));o.position.set(x,y,z);o.frustumCulled=false;parent.add(o);return o}
 const box=(w,h,d,c,x,y,z,p)=>mesh(new THREE.BoxGeometry(w,h,d),c,x,y,z,p);
 if(mode==='walk'){
  box(.55,.65,.32,colour,0,1.12,0);mesh(new THREE.IcosahedronGeometry(.23,1),variant%2?0xd0a077:0xefd1ae,0,1.68,0);box(.38,.13,.35,0x39413c,0,1.88,.02);
  for(const side of [-1,1]){for(const arm of [false,true]){const joint=new THREE.Group();joint.position.set(side*(arm?.36:.15),arm?1.4:.85,0);root.add(joint);box(arm?.16:.22,arm?.52:.72,arm?.19:.28,arm?colour:0x3b4f4e,0,arm?-.24:-.34,0,joint);animated.push({joint,phase:arm?-side:side})}}
 }else{
  const bus=mode==='bus',motor=mode==='motor',w=motor?.55:bus?2.1:1.7,l=motor?1.9:bus?6.5:3.9;
  box(w,bus?1.8:.65,l,colour,0,bus?1.4:.85,0);box(w*.85,bus?.8:.65,l*.6,0x548597,0,bus?2:1.4,-.15);box(w*.9,.1,l*.65,colour,0,bus?2.45:1.78,-.15);
  for(const side of motor?[0]:[-1,1])for(const z of [-l*.32,l*.32]){const wheel=mesh(new THREE.CylinderGeometry(bus?.4:.28,bus?.4:.28,.18,8),0x26322e,side*w*.5,.38,z);wheel.rotation.z=Math.PI/2;animated.push({wheel})}
  for(const side of [-1,1])box(.2,.14,.06,0xf7e4a7,side*w*.33,.85,-l*.51);
  if(motor){box(.4,.5,.3,0x707b45,0,1.65,0);mesh(new THREE.IcosahedronGeometry(.23,1),0xd9b894,0,2,0)}
 }
 return {root,animate(time,moving,opacity=1){for(const m of materials.values()){m.opacity=opacity}for(const a of animated){if(a.wheel)a.wheel.rotation.x=moving?time*6:0;else a.joint.rotation.x=moving?Math.sin(time*7)*.4*a.phase:0}},dispose(){root.traverse(o=>o.geometry?.dispose());for(const m of materials.values())m.dispose();root.clear()}};
}
