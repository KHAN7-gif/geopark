import {addPerbadananFacades} from './perbadanan-model.mjs?v=explore-20261127';
import {addMerdekaRoundabout} from './merdeka-model.mjs?v=explore-20261127';
import {merdekaDistance,merdekaTreeAllowed} from './merdeka-layout.mjs?v=explore-20261127';
import {addMarlinMonument} from './marlin-model.mjs?v=explore-20261127';
import {marlinDistance,marlinTreeAllowed} from './marlin-layout.mjs?v=explore-20261127';
import {DATARAN_LAYOUT,dataranPoint,dataranTreeAllowed} from './dataran-layout.mjs?v=explore-20261127';
import {addDataranStructures} from './dataran-model.mjs?v=explore-20261127';
import {TOWN_DATA} from './environment/town-data.mjs?v=explore-20261127';
import {plazaCentre} from './town-scene.mjs?v=explore-20261127';
import {buildingStyle,buildingHeight} from './building-types.mjs?v=explore-20261127';
import * as THREE from './vendor/three.module.js';
import {buildingPalette,treeVariant,treeCentre} from './world-palette.mjs?v=explore-20261127';
import {landAt} from './marine-geometry.mjs?v=explore-20261127';
const SY=111320;
export function buildVillageScene(data,anchor,{heightAt=()=>0,radius=420,buildingLimit=80,treeLimit=100,roads=null}={}){
 const sx=SY*Math.cos(anchor[1]*Math.PI/180),local=p=>[(p[0]-anchor[0])*sx,(anchor[1]-p[1])*SY],world=p=>[anchor[0]+p[0]/sx,anchor[1]-p[1]/SY];
 const root=new THREE.Group(),batches=new Map(),stats={buildings:0,pitchedRoofs:0,windows:0,trees:0,illustrativeRoadTrees:0,byType:{},shopfronts:0,officeBands:0,policeBands:0,plazas:0};
 const batch=colour=>{if(!batches.has(colour))batches.set(colour,[]);return batches.get(colour)};
 const triangle=(colour,a,b,c)=>batch(colour).push(...a,...b,...c);
 const quad=(colour,a,b,c,d)=>{triangle(colour,a,b,c);triangle(colour,a,c,d)};
 const geometries={box:new THREE.BoxGeometry(1,1,1),crown:new THREE.IcosahedronGeometry(1,1),trunk:new THREE.CylinderGeometry(.16,.25,1,6),palmTrunk:new THREE.CylinderGeometry(.13,.22,1,7)};
 function solid(geometry,colour,position,scale){const matrix=new THREE.Matrix4().compose(new THREE.Vector3(...position),new THREE.Quaternion(),new THREE.Vector3(...scale)),index=geometry.index,attr=geometry.attributes.position,v=new THREE.Vector3(),out=batch(colour);for(let i=0;i<(index?index.count:attr.count);i++){v.fromBufferAttribute(attr,index?index.getX(i):i).applyMatrix4(matrix);out.push(v.x,v.y,v.z)}}
 const buildings=data.features.filter(f=>f.properties.kind==='building').map(f=>({f,ring:f.geometry.coordinates[0].slice(0,-1).map(local)}));
 for(const b of buildings){b.center=b.ring.reduce((sum,p)=>[sum[0]+p[0]/b.ring.length,sum[1]+p[1]/b.ring.length],[0,0]);b.distance=Math.hypot(...b.center)}
 buildings.sort((a,b)=>a.distance-b.distance);
 const distSegment=(p,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/(dx*dx+dz*dz||1)));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz)};
 const streetSegments=(roads?.features||[]).filter(f=>!f.properties.foot).flatMap(f=>{const line=f.geometry.coordinates.map(local);return line.slice(1).map((b,i)=>[line[i],b]).filter(([a,b])=>Math.hypot((a[0]+b[0])/2,(a[1]+b[1])/2)<radius+200)});

 for(const {f,ring,center,distance}of buildings){if(distance>radius||stats.buildings>=buildingLimit)break;stats.buildings++;
  const p=f.properties,style=buildingStyle(p),height=buildingHeight(p),ground=heightAt(world(center))||0,top=ground+height+.08,palette=buildingPalette(p.osm);palette.roof=style.roof||palette.roof;stats.byType[style.kind]=(stats.byType[style.kind]||0)+1;
  if(style.kind==='perbadanan'){addPerbadananFacades({ring,center,ground,triangle,quad,stats});continue}
  if(style.pitched&&ring.length===4&&height<=14){let longest=0;for(let i=1;i<4;i++)if(Math.hypot(...ring[(i+1)%4].map((v,j)=>v-ring[i][j]))>Math.hypot(...ring[(longest+1)%4].map((v,j)=>v-ring[longest][j])))longest=i;
   const [a,b,c,d]=Array.from({length:4},(_,i)=>ring[(i+longest)%4]),mid=(u,v)=>[(u[0]+v[0])/2,(u[1]+v[1])/2],ad=mid(a,d),bc=mid(b,c),rise=Math.min(3,Math.max(.9,Math.hypot(a[0]-d[0],a[1]-d[1])*.28)),point=(q,y)=>[q[0],y,q[1]];
   quad(palette.roof,point(a,top),point(b,top),point(bc,top+rise),point(ad,top+rise));quad(palette.roof,point(d,top),point(c,top),point(bc,top+rise),point(ad,top+rise));triangle('#f0dfba',point(a,top),point(d,top),point(ad,top+rise));triangle('#f0dfba',point(b,top),point(c,top),point(bc,top+rise));stats.pitchedRoofs++;
  }else{const outline=ring.map(p=>new THREE.Vector2(...p)),faces=THREE.ShapeUtils.triangulateShape(outline,[]);for(const face of faces)triangle(palette.roof,...face.map(i=>[ring[i][0],top,ring[i][1]]))}

  const area=ring.reduce((sum,a,i)=>{const b=ring[(i+1)%ring.length];return sum+a[0]*b[1]-b[0]*a[1]},0),sign=area>=0?1:-1;
  let frontage=0,bestStreet=Infinity;if(['shop','mixed'].includes(style.kind))for(let i=0;i<ring.length;i++){const a=ring[i],b=ring[(i+1)%ring.length],mid=[(a[0]+b[0])/2,(a[1]+b[1])/2];for(const [u,v]of streetSegments){const distance=distSegment(mid,u,v);if(distance<bestStreet){bestStreet=distance;frontage=i}}}
  for(let i=0;i<ring.length;i++){
   const a=ring[i],b=ring[(i+1)%ring.length],length=Math.hypot(b[0]-a[0],b[1]-a[1]);if(length<4)continue;const ux=(b[0]-a[0])/length,uz=(b[1]-a[1])/length,nx=uz*sign,nz=-ux*sign;
   const pane=(t,width,y,height,colour,offset)=>{const cx=a[0]+ux*t+nx*offset,cz=a[1]+uz*t+nz*offset;quad(colour,[cx-ux*width/2,y,cz-uz*width/2],[cx+ux*width/2,y,cz+uz*width/2],[cx+ux*width/2,y+height,cz+uz*width/2],[cx-ux*width/2,y+height,cz-uz*width/2])};
   const count=Math.min(['office','mixed'].includes(style.kind)?8:5,Math.floor(length/(['office','mixed'].includes(style.kind)?2.8:3.5))),floors=Math.min(style.floors,Math.max(1,Math.floor((height-1)/3)));
   if(style.band){pane(length/2,length,ground+2.7,.55,style.band,.12);if(style.kind==='police')stats.policeBands++}
   if(['mixed','urban','office','hotel','civic','police','shop'].includes(style.kind))pane(length/2,length,top-.45,.4,style.roof,.13);
   for(let floor=0;floor<floors;floor++)for(let n=0;n<count;n++){const t=length*(n+1)/(count+1),y=ground+1.9+floor*3;const width=['office','mixed'].includes(style.kind)?Math.min(2.3,length/(count+1)-.2):1.45;pane(t,width,y,1.45,style.frame,.07);pane(t,width-.25,y+.15,1.15,style.window,.09);stats.windows++}
   if(['office','mixed'].includes(style.kind)){for(let floor=1;floor<=floors;floor++){pane(length/2,length,ground+floor*3-.45,.25,'#e1e6dc',.12);stats.officeBands++}}
   if(['shop','mixed'].includes(style.kind)&&i===frontage){
    const units=Math.max(1,Math.min(5,Math.floor(length/4.5))),unitWidth=length/units;
    for(let n=0;n<units;n++){const t=unitWidth*(n+.5);pane(t,unitWidth-.25,ground+.2,2.3,'#e5d8b8',.12);pane(t,unitWidth-.55,ground+.45,1.9,style.window,.14);pane(t,unitWidth-.12,ground+2.8,.65,n%2?'#527d77':'#aa6847',.15);
     const cx=a[0]+ux*t,cz=a[1]+uz*t,w=unitWidth*.48,near=[cx+nx*.2,ground+2.8,cz+nz*.2],far=[cx+nx*1.25,ground+2.55,cz+nz*1.25];quad(n%2?'#e0c588':style.awning,[near[0]-ux*w,near[1],near[2]-uz*w],[near[0]+ux*w,near[1],near[2]+uz*w],[far[0]+ux*w,far[1],far[2]+uz*w],[far[0]-ux*w,far[1],far[2]-uz*w]);stats.shopfronts++}
   }else if(i===0)pane(length/2,style.kind==='police'?1.6:.95,ground+.1,2.1,style.kind==='police'?style.band:'#805b3b',.1);

  }
 }
 function tree(point,variant,illustrative=false){if(!dataranTreeAllowed(point)||!marlinTreeAllowed(point)||!merdekaTreeAllowed(point))return;const [x,z]=local(point),g=heightAt(point)||0,h=variant.height,colour=variant.colour;
  if(variant.type==='palm'){
   solid(geometries.palmTrunk,'#997146',[x,g+h/2,z],[1,h,1]);
   for(let n=0;n<7;n++){const angle=n*Math.PI*2/7+(variant.seed%10)*.1,dir=[Math.cos(angle),Math.sin(angle)],side=[-dir[1],dir[0]],at=(r,w,y)=>[x+dir[0]*r+side[0]*w,g+h+y,z+dir[1]*r+side[1]*w];quad(colour,at(0,.1,0),at(2.2,.6,.5),at(4.3,0,-.8),at(2.2,-.6,.5))}
  }else{
   solid(geometries.trunk,'#88613d',[x,g+1.9,z],[1,3.8,1]);
   for(const [dx,dz,dy,r]of [[0,0,0,2.5],[-1.3,.3,-.7,1.9],[1.1,-.6,-.5,2],[0,.8,1,1.7]])solid(geometries.crown,colour,[x+dx,g+h-1+dy,z+dz],[r,r*.9,r]);
  }
  stats.trees++;if(illustrative)stats.illustrativeRoadTrees++;
 }
 const trees=data.features.filter(f=>f.properties.kind==='canopy').map(f=>({f,p:treeCentre(f)})).map(o=>({...o,d:Math.hypot(...local(o.p))})).filter(o=>o.d<radius&&dataranTreeAllowed(o.p)&&marlinTreeAllowed(o.p)&&merdekaTreeAllowed(o.p)).sort((a,b)=>a.d-b.d);
 for(const {f,p}of trees.slice(0,treeLimit))tree(p,treeVariant(f));
 // Additional palms are game scenery, restricted to mapped land and clear of
 // mapped building footprints / road surfaces. They are not surveyed trees.
 if(roads&&stats.trees<treeLimit){const nearby=roads.features.filter(f=>!f.properties.foot&&!f.properties.tunnel).map(f=>({f,line:f.geometry.coordinates.map(local)})).filter(o=>o.line.some(p=>Math.hypot(...p)<radius+40));
  const inside=(p,ring)=>{let yes=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])yes=!yes}return yes};
  const segmentDistance=(p,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/(dx*dx+dz*dz||1)));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz)};
  for(const {f,line}of nearby){if(stats.illustrativeRoadTrees>=24||stats.trees>=treeLimit)break;for(let i=1;i<line.length;i++){const a=line[i-1],b=line[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let t=15;t<length;t+=45){if(stats.illustrativeRoadTrees>=24||stats.trees>=treeLimit)break;const offset=f.properties.width/2+5,p=[a[0]+(b[0]-a[0])*t/length-(b[1]-a[1])/length*offset,a[1]+(b[1]-a[1])*t/length+(b[0]-a[0])/length*offset],w=world(p);
    if(Math.hypot(...p)>radius||landAt([w[1],w[0]])<0||buildings.some(o=>inside(p,o.ring))||nearby.some(o=>o.line.slice(1).some((b,i)=>segmentDistance(p,o.line[i],b)<o.f.properties.width/2+2)))continue;
    tree(w,{type:'palm',height:7.5,colour:stats.trees%2?'#4c9b52':'#70b24d',seed:stats.trees},true);
   }}
  }
 }
 for(const feature of TOWN_DATA.features.filter(f=>f.geometry.type==='Polygon')){
  const point=plazaCentre(feature.geometry.coordinates[0]);if(Math.hypot(...local(point))>radius)continue;stats.plazas++;
  addDataranStructures({local,heightAt,solid,quad,triangle,geometries,stats});
  const flagPoint=dataranPoint(DATARAN_LAYOUT.flag.u,DATARAN_LAYOUT.flag.v),[x,z]=local(flagPoint),ground=(heightAt(dataranPoint(DATARAN_LAYOUT.monument.u,DATARAN_LAYOUT.monument.v))||0)+DATARAN_LAYOUT.monument.platformHeight;
  solid(geometries.trunk,'#e5e5d6',[x,ground+5,z],[.65,10,.65]);
  const flag=(left,bottom,width,height,colour,offset=0)=>quad(colour,[x+left,ground+bottom,z+offset],[x+left+width,ground+bottom,z+offset],[x+left+width,ground+bottom+height,z+offset],[x+left,ground+bottom+height,z+offset]);
  for(let i=0;i<14;i++)flag(.1,9.65-(i+1)*1.55/14,3.1,1.55/14,i%2?'#f4ead2':'#c73e42');for(const side of [-1,1])flag(.1,9.65-1.55/2,1.55,1.55/2,'#254984',side*.025);
  const disc=(cx,cy,r,colour,offset)=>{for(let n=0;n<24;n++){const a=n*Math.PI/12,b=(n+1)*Math.PI/12;triangle(colour,[x+cx,ground+cy,z+offset],[x+cx+Math.cos(a)*r,ground+cy+Math.sin(a)*r,z+offset],[x+cx+Math.cos(b)*r,ground+cy+Math.sin(b)*r,z+offset])}};
  for(const side of [-1,1]){disc(.65,9.25,.26,'#efcf4f',side*.04);disc(.73,9.29,.23,'#254984',side*.055);}
  for(const side of [-1,1])for(let n=0;n<28;n++){const a=n*Math.PI/14,b=(n+1)*Math.PI/14,ra=n%2?.075:.16,rb=(n+1)%2?.075:.16;triangle('#efcf4f',[x+1.15,ground+9.25,z+side*.06],[x+1.15+Math.cos(a)*ra,ground+9.25+Math.sin(a)*ra,z+side*.06],[x+1.15+Math.cos(b)*rb,ground+9.25+Math.sin(b)*rb,z+side*.06])}
 }
 if(merdekaDistance(anchor)<radius)addMerdekaRoundabout({local,heightAt,triangle,quad,stats});
 if(marlinDistance(anchor)<radius)addMarlinMonument({local,heightAt,triangle,quad,stats});
 for(const [colour,points]of batches){const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(points,3));geometry.computeVertexNormals();const material=new THREE.MeshLambertMaterial({color:colour,side:THREE.DoubleSide,flatShading:true}),mesh=new THREE.Mesh(geometry,material);mesh.frustumCulled=false;root.add(mesh)}
 for(const geometry of Object.values(geometries))geometry.dispose();
 return {root,stats,dispose(){root.traverse(o=>{o.geometry?.dispose();o.material?.dispose()});root.clear()}};
}
