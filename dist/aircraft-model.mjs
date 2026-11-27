import * as THREE from './vendor/three.module.js';
export function buildAircraftModel(type='Boeing 737-800',airline=''){
 const root=new THREE.Group(),propellers=[],gear=[],props=/ATR|Dash|DHC/i.test(type),length=props?27:37,span=props?27:35,materials=new Map();
 const colour=/AirAsia/i.test(airline)?0xc3463b:/MASwings|AirBorneo/i.test(airline)?0x40857c:0x3c6d9b;
 const material=c=>{if(!materials.has(c))materials.set(c,new THREE.MeshLambertMaterial({color:c,flatShading:true,side:THREE.DoubleSide}));return materials.get(c)};
 const mesh=(geometry,c,x,y,z,parent=root)=>{const m=new THREE.Mesh(geometry,material(c));m.position.set(x,y,z);m.frustumCulled=false;parent.add(m);return m};
 const box=(w,h,d,c,x,y,z,parent)=>mesh(new THREE.BoxGeometry(w,h,d),c,x,y,z,parent);
 const body=mesh(new THREE.SphereGeometry(1,18,10),0xeff0e2,0,3.1,0);body.scale.set(props?1.4:1.8,props?1.5:1.8,length/2);
 const cockpit=mesh(new THREE.SphereGeometry(1,12,6),0x35627a,0,3.75,-length*.4);cockpit.scale.set(1.15,.6,1.4);
 function surface(points,c){if(points.length===4)points=[points[0],points[1],points[2],points[0],points[2],points[3]];const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points.flat(),3));g.computeVertexNormals();return mesh(g,c,0,0,0)}
 for(const sign of [-1,1]){
  const x=sign*span/2;surface([[0,2.5,-4],[x,props?3.4:3.3,3],[sign*(span/2-1.5),props?3.4:3.3,5],[0,2.5,3]],0xd6dfd9);
  surface([[0,3.2,length*.27],[sign*7,3.6,length*.43],[sign*6,3.6,length*.48],[0,3.2,length*.4]],0xd6dfd9);
  const engine=mesh(new THREE.CylinderGeometry(props ? .58 : 1.05,props ? .64 : 1.15,props?3.7:4,12),props?0xe4e9df:0xbacbd0,sign*(props?5:6),props?2.9:1.65,-.4);engine.rotation.x=Math.PI/2;
  if(props){const prop=new THREE.Group();prop.position.set(sign*5,2.9,-2.4);root.add(prop);for(let n=0;n<6;n++){const blade=box(.18,2.25,.12,0x33454b,0,0,0,prop);blade.rotation.z=n*Math.PI/3}propellers.push(prop)}
  for(let n=0;n<9;n++)box(.05,.33,.4,0x35627a,sign*(props?1.36:1.74),3.8,-length*.25+n*1.3);
  gear.push(box(.18,1.3,.18,0x6d7a76,sign*2.1,1,3));const wheel=mesh(new THREE.CylinderGeometry(.43,.43,.32,10),0x263736,sign*2.1,.38,3);wheel.rotation.z=Math.PI/2;gear.push(wheel);
 }
 surface([[0,4,length*.24],[0,props?8.6:10.3,length*.41],[0,props?8.6:10.3,length*.48],[0,3.8,length*.45]],colour);
 gear.push(box(.12,1.2,.12,0x6d7a76,0,1,-length*.32));const front=mesh(new THREE.CylinderGeometry(.3,.3,.25,10),0x263736,0,.3,-length*.32);front.rotation.z=Math.PI/2;gear.push(front);
 return {root,animate(t,moving=true,gearDown=true){for(const part of gear)part.visible=gearDown;for(const prop of propellers)prop.rotation.z=moving?t*32:0},dispose(){root.traverse(o=>o.geometry?.dispose());for(const m of materials.values())m.dispose();root.clear()}};
}
