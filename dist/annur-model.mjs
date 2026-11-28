import * as THREE from './vendor/three.module.js';
import {ANNUR_OSM,ANNUR_PLACE,ANNUR_LIGHTS} from './annur-layout.mjs?v=annur-20261128';
export {ANNUR_OSM,ANNUR_PLACE,ANNUR_LIGHTS};
// Architectural proportions are a photo-based illustration on the OSM footprint.
export function buildAnnurModel(feature,{local,heightAt=()=>0}={}){
 const root=new THREE.Group();root.name='masjid-annur';const ring=feature.geometry.coordinates[0].slice(0,-1),centre=ANNUR_PLACE.geometry.coordinates,origin=local(centre),ground=heightAt(centre)||0,axis=[.93,.368],cross=[-.368,.93],at=(u,y,v)=>[origin[0]+axis[0]*u+cross[0]*v,ground+y,origin[1]+axis[1]*u+cross[1]*v];
 const shell=new THREE.MeshLambertMaterial({color:0xdce1e4,side:THREE.DoubleSide}),wall=new THREE.MeshLambertMaterial({color:0xf1e7de,side:THREE.DoubleSide}),dark=new THREE.MeshLambertMaterial({color:0x344e59,side:THREE.DoubleSide}),trim=new THREE.MeshLambertMaterial({color:0xb8c3ca,side:THREE.DoubleSide}),green=new THREE.MeshLambertMaterial({color:0xd3ddc9,side:THREE.DoubleSide}),groups=new Map();
 const triangle=(material,a,b,c)=>{if(!groups.has(material))groups.set(material,[]);groups.get(material).push(...a,...b,...c)},quad=(m,a,b,c,d)=>{triangle(m,a,b,c);triangle(m,a,c,d)};
 const points=ring.map(local),shape=points.map(p=>new THREE.Vector2(p[0],p[1]));for(const f of THREE.ShapeUtils.triangulateShape(shape,[]))triangle(wall,...f.map(i=>[points[i][0],ground+6.2,points[i][1]]));
 for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];quad(wall,[a[0],ground,a[1]],[b[0],ground,b[1]],[b[0],ground+6.2,b[1]],[a[0],ground+6.2,a[1]])}
 function lathe(m,cx,cz,profile,segments=32){for(let j=1;j<profile.length;j++)for(let n=0;n<segments;n++){const angle=n*Math.PI*2/segments,next=(n+1)*Math.PI*2/segments,p=(a,k)=>at(cx+Math.cos(a)*profile[k][0],profile[k][1],cz+Math.sin(a)*profile[k][0]);quad(m,p(angle,j-1),p(next,j-1),p(next,j),p(angle,j))}}
 // Eight flared concrete petals: semicircular mouths and raised central ribs.
 for(let petal=0;petal<8;petal++){
  const angle=petal*Math.PI/4,radial=[Math.cos(angle),Math.sin(angle)],tangent=[-radial[1],radial[0]],point=(t,s)=>{const radius=24-15*t,width=(1-t)*8.3+t*3.25,arch=Math.sqrt(Math.max(0,1-s*s));return at(radial[0]*radius+tangent[0]*s*width,7+17*t+(1-t)*5*arch,radial[1]*radius+tangent[1]*s*width)};
  for(let j=0;j<12;j++)for(let k=0;k<16;k++){const t=j/12,t2=(j+1)/12,s=-1+k/8,s2=s+1/8;quad(shell,point(t,s),point(t,s2),point(t2,s2),point(t2,s))}
  // A dark recessed glass screen under each open petal, with silver mullions.
  const aperture=(s,up)=>{const r=23.8,w=7.8,arch=Math.sqrt(Math.max(0,1-s*s));return at(radial[0]*r+tangent[0]*s*w,6.5+up*5*arch,radial[1]*r+tangent[1]*s*w)};
  for(let k=0;k<20;k++){const a=-1+k/10,b=a+.1;quad(dark,aperture(a,0),aperture(b,0),aperture(b,1),aperture(a,1));if(k>0)quad(trim,aperture(a-.009,0),aperture(a+.009,0),aperture(a+.009,1),aperture(a-.009,1))}
 }
 lathe(dark,0,0,[[8.8,23.3],[8.8,25.2]]);lathe(shell,0,0,[[9,24.8],[9.4,26],[9.1,28],[8.1,31],[6.6,34],[4.4,37],[1.7,39.5],[0,41]],48);
 // Thin zigzag bands follow the egg-shaped dome rather than a flat texture.
 const domeProfile=[[9,24.8],[9.4,26],[9.1,28],[8.1,31],[6.6,34],[4.4,37],[1.7,39.5],[0,41]];
 const domePoint=(a,y)=>{let r=0;for(let i=1;i<domeProfile.length;i++){const [r0,y0]=domeProfile[i-1],[r1,y1]=domeProfile[i];if(y>=y0&&y<=y1){r=r0+(r1-r0)*(y-y0)/(y1-y0);break}}return at(Math.cos(a)*(r+.065),y,Math.sin(a)*(r+.065))};
 for(let band=0;band<5;band++)for(let n=0;n<48;n++){const y=26+band*2.25,a=n*Math.PI/24,b=(n+1)*Math.PI/24,y2=y+(n%2?.75:-.75);quad(trim,domePoint(a,y),domePoint(b,y2),domePoint(b,y2+.13),domePoint(a,y+.13))}

 lathe(trim,0,0,[[.12,40.5],[.12,42],[0,43]],12);
 for(const u of [-25,25]){
  const v=17;lathe(wall,u,v,[[3.4,0],[3.4,1],[1.25,6],[1.05,41],[2.9,45],[3.15,46],[3.15,47.1],[1.55,47.5],[.75,54],[0,59]],32);
  lathe(trim,u,v,[[3.2,45.8],[3.2,46.1],[3.3,47],[3.3,47.3]],32);
  for(let n=0;n<10;n++){const a=n*Math.PI/5,b=a+.16;quad(dark,at(u+Math.cos(a)*1.5,41.8,v+Math.sin(a)*1.5),at(u+Math.cos(b)*1.5,41.8,v+Math.sin(b)*1.5),at(u+Math.cos(b)*2.7,44.8,v+Math.sin(b)*2.7),at(u+Math.cos(a)*2.7,44.8,v+Math.sin(a)*2.7));quad(green,at(u+Math.cos(a)*1.75,42.1,v+Math.sin(a)*1.75),at(u+Math.cos(b)*1.75,42.1,v+Math.sin(b)*1.75),at(u+Math.cos(b)*2.1,43,v+Math.sin(b)*2.1),at(u+Math.cos(a)*2.1,43,v+Math.sin(a)*2.1))}
 }
 for(let n=-8;n<=8;n++){const x=n*2.4;quad(dark,at(x-.6,2.3,25),at(x+.6,2.3,25),at(x+.6,4.8,25),at(x-.6,4.8,25))}
 for(const [material,vertices]of groups){const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.computeVertexNormals();const mesh=new THREE.Mesh(geometry,material);mesh.frustumCulled=false;root.add(mesh)}
 let mood='day',colour='cyan';function paint(){const night=mood==='night';shell.color.set(night?ANNUR_LIGHTS[colour]:0xdce1e4);shell.emissive.set(night?ANNUR_LIGHTS[colour]:0);shell.emissiveIntensity=night?.8:0;trim.emissive.set(night?ANNUR_LIGHTS[colour]:0);trim.emissiveIntensity=night?.32:0;green.emissive.set(night?0x29ff5c:0);green.emissiveIntensity=night?1:0}
 return {root,stats:{annurMosques:1,annurPetals:8,annurMinarets:2},setMood(id){mood=id;paint()},setNightColour(id){colour=ANNUR_LIGHTS[id]?id:'cyan';paint()},dispose(){for(const mesh of root.children)mesh.geometry.dispose();for(const m of groups.keys())m.dispose();root.clear()}};
}
