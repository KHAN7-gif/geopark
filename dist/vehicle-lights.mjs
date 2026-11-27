import * as THREE from './vendor/three.module.js';
// Unlit lenses and inexpensive ground glow stay visible without adding a
// shadow-casting light for every traffic car on mobile devices. Forward is -Z.
export function addVehicleLights(root,{width=1.8,length=4,motor=false,height=.94}={}){
 const group=new THREE.Group();group.name='vehicle-lights';root.add(group);
 const front=new THREE.MeshBasicMaterial({color:0xa6a999,transparent:true}),rear=new THREE.MeshBasicMaterial({color:0x74352f,transparent:true}),glow=new THREE.MeshBasicMaterial({color:0xffffff,vertexColors:true,transparent:true,opacity:.32,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
 const sides=motor?[0]:[-1,1];
 for(const side of sides)for(const back of [false,true]){const lens=new THREE.Mesh(new THREE.BoxGeometry(motor?.18:.26,.16,.08),back?rear:front);lens.name=back?'tail-light':'head-light';lens.position.set(side*width*.32,height,(back?1:-1)*(length*.5+.055));lens.frustumCulled=false;group.add(lens)}
 const points=[],colours=[];
 function fan(x,z,direction,distance,spread,colour){const origin=[x,.045,z],left=[x-spread,.045,z+direction*distance],right=[x+spread,.045,z+direction*distance];points.push(...origin,...left,...right);const c=new THREE.Color(colour);colours.push(c.r,c.g,c.b,.8,c.r,c.g,c.b,0,c.r,c.g,c.b,0)}
 for(const side of sides){fan(side*width*.32,-length*.5-.1,-1,motor?8:12,motor?1.5:2.2,0xfff4ce);fan(side*width*.32,length*.5+.1,1,1.8,.7,0xff2420)}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(points,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colours,4));const beams=new THREE.Mesh(geometry,glow);beams.name='night-road-glow';beams.frustumCulled=false;beams.renderOrder=2;beams.visible=false;group.add(beams);
 let night=false;
 return {group,setMood(id){night=id==='night';front.color.set(night?0xfff8df:0xa6a999);rear.color.set(night?0xff2420:0x74352f);beams.visible=night},setOpacity(value){front.opacity=rear.opacity=value;glow.opacity=.32*value;beams.visible=night&&value>.01},dispose(){front.dispose();rear.dispose();glow.dispose()}};
}
