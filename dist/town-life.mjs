import {DATARAN_RING} from './dataran-layout.mjs?v=townlife-20261128';
import {toXY,fromXY,landAt} from './marine-geometry.mjs?v=townlife-20261128';
const metres=(a,b)=>Math.hypot(b[0]-a[0],b[1]-a[1]);
const town=([lng,lat])=>lng>115.235&&lng<115.258&&lat>5.268&&lat<5.289;
export const LIFE_LIMITS={eco:12,balanced:24,high:36};
export function prepareTownPaths(roads){
 const paths=(roads?.features||[]).filter(f=>f.geometry?.type==='LineString'&&!f.properties.tunnel&&!f.properties.bridge&&(f.properties.foot||/^(primary|secondary|tertiary|residential|unclassified)$/.test(f.properties.highway))).flatMap(f=>{
  const chunks=[];let points=[];for(const p of f.geometry.coordinates){if(town(p))points.push(toXY([p[1],p[0]]));else if(points.length){chunks.push(points);points=[]}}if(points.length)chunks.push(points);
  return chunks.filter(p=>p.length>1).map((points,i)=>{const lengths=points.slice(1).map((p,n)=>metres(points[n],p)),length=lengths.reduce((a,b)=>a+b,0);return {id:f.properties.osm+':'+i,points,lengths,length,foot:!!f.properties.foot,width:f.properties.width||6,source:f.properties.osm}}).filter(p=>p.length>35);
 });
 // Perimeter promenade follows the mapped plaza outline, never the open field.
 if(roads?.features?.length){const centre=DATARAN_RING.slice(0,-1).reduce((a,p)=>[a[0]+p[0]/(DATARAN_RING.length-1),a[1]+p[1]/(DATARAN_RING.length-1)],[0,0]);let points=[],length=0,index=0;
  function add(){if(length>15){const lengths=points.slice(1).map((p,n)=>metres(points[n],p));paths.push({id:'plaza-promenade:'+index++,source:'way/221184312',promenade:true,points,lengths,length,foot:true,width:2})}points=[];length=0}
  const ring=DATARAN_RING.map(p=>toXY([p[1]*.985+centre[1]*.015,p[0]*.985+centre[0]*.015]));
  for(let i=0;i<ring.length-1;i++){const a=ring[i],b=ring[i+1],steps=Math.max(1,Math.ceil(metres(a,b)/55));for(let n=0;n<steps;n++){const from=[a[0]+(b[0]-a[0])*n/steps,a[1]+(b[1]-a[1])*n/steps],to=[a[0]+(b[0]-a[0])*(n+1)/steps,a[1]+(b[1]-a[1])*(n+1)/steps];if(!points.length)points.push(from);points.push(to);length+=metres(from,to);if(length>=55)add()}}add();
 }
 return paths;
}
export function townPathPose(path,distance,direction=1){
 let before=0;distance=Math.max(0,Math.min(path.length,distance));for(let n=0;n<path.lengths.length;n++){const len=path.lengths[n];if(len>0&&(before+len>=distance||n===path.lengths.length-1)){const a=path.points[n],b=path.points[n+1],q=(distance-before)/len,ux=(b[0]-a[0])/len,uy=(b[1]-a[1])/len,lane=path.foot?0:Math.min(1.8,path.width*.23),point=[a[0]+(b[0]-a[0])*q-uy*lane*direction,a[1]+(b[1]-a[1])*q+ux*lane*direction],pos=fromXY(point);return {position:[pos[1],pos[0]],heading:(Math.atan2(ux*direction,uy*direction)*180/Math.PI+360)%360}}before+=len}return null;
}
const usablePaths=new WeakMap();
function usablePath(path){if(usablePaths.has(path))return usablePaths.get(path);const usable=[.2,.4,.6,.8].some(q=>{const pose=townPathPose(path,path.length*q);return pose&&landAt([pose.position[1],pose.position[0]])>=0});usablePaths.set(path,usable);return usable}
const hash=id=>[...id].reduce((sum,c)=>(sum*31+c.charCodeAt(0))>>>0,17);
export function selectTownActors(paths,anchor,quality='balanced'){
 if(!town(anchor))return [];const origin=toXY([anchor[1],anchor[0]]),limit=LIFE_LIMITS[quality]||24;
 const distanceToPath=path=>Math.min(...path.points.slice(1).map((b,i)=>{const a=path.points[i],dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((origin[0]-a[0])*dx+(origin[1]-a[1])*dy)/(dx*dx+dy*dy||1)));return metres(origin,[a[0]+dx*t,a[1]+dy*t])}));
 const ranked=paths.map(path=>({path,d:distanceToPath(path)})).filter(o=>o.d<450&&usablePath(o.path)).sort((a,b)=>a.d-b.d||a.path.id.localeCompare(b.path.id)),actors=[];
 const fleet=['car','motor','sport','pickup','truck','bus','taxi','motor','sport','pickup','car','truck'];
 for(const foot of [false,true]){const used=new Set(),selected=[];const budget=limit/2;
  // Fill nearest distinct streets first; long paths can then carry a second
  // vehicle in the opposite lane or extra pedestrians spaced along a promenade.
  for(let slot=0;slot<3&&selected.length<budget;slot++)for(const {path}of ranked){
   if(path.foot!==foot||selected.length>=budget||slot>0&&path.length<(foot?55:100))continue;
   const key=(path.promenade?path.id:path.source)+':'+slot;if(used.has(key))continue;used.add(key);
   const seed=hash(path.id),n=selected.length,id=path.id+':actor:'+slot;let mode=foot?'walk':fleet[n%fleet.length];
   if(['truck','bus'].includes(mode)&&(path.width<7||path.length<70))mode='pickup';
   selected.push({id,path,mode,variant:(seed+n)%6,direction:slot%2?-(seed%2?1:-1):seed%2?1:-1,speed:foot?.9+(seed%5)*.12:mode==='truck'?4.6:mode==='bus'?5.2:mode==='motor'?6.2:mode==='sport'?7.2:6,offset:((seed%997)/997+slot*.43)%1});
  }actors.push(...selected);
 }

 return actors;
}
export function townActorState(actor,time){
 const travel=(actor.path.length-10)/actor.speed,period=travel+4,phase=((time+actor.offset*period)%period+period)%period,progress=Math.max(0,Math.min(1,(phase-2)/travel)),distance=actor.direction>0?5+progress*(actor.path.length-10):actor.path.length-5-progress*(actor.path.length-10),pose=townPathPose(actor.path,distance,actor.direction);
 if(!pose||landAt([pose.position[1],pose.position[0]])<0)return null;
 return {...pose,moving:phase>2&&phase<travel+2,opacity:Math.min(1,phase/1.2,(period-phase)/1.2)};
}
