import {decorateEnvironment} from './world-palette.mjs?v=townlife-20261128';
// Ground shadows in metres, so orbiting/zooming cannot detach them from objects.
// Their footprints are visual only; navigation and source geography stay intact.
const SUN={day:{azimuth:225,altitude:42},dusk:{azimuth:245,altitude:28},night:{azimuth:145,altitude:42}};
function hull(points){
 const sorted=points.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
 const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
 const half=values=>{const out=[];for(const p of values){while(out.length>1&&cross(out.at(-2),out.at(-1),p)<=0)out.pop();out.push(p)}return out};
 const result=half(sorted).slice(0,-1).concat(half(sorted.reverse()).slice(0,-1));
 return result.length>=3?[...result,result[0]]:null;
}
export function depthShadows(data,look='day'){
 const sun=SUN[look]||SUN.day,angle=sun.azimuth*Math.PI/180,features=[];
 for(const feature of data?.features?decorateEnvironment(data).features:[]){
  const {kind,height}=feature.properties||{};
  if(!['building','canopy'].includes(kind)||feature.geometry?.type!=='Polygon'||!Number.isFinite(height)||height<=0)continue;
  const ring=feature.geometry.coordinates[0];if(!ring?.length)continue;
  const metres=Math.min(90,height/Math.tan(sun.altitude*Math.PI/180)),dx=-Math.sin(angle)*metres,dy=-Math.cos(angle)*metres;
  const projected=ring.map(([lng,lat])=>[lng+dx/(111320*Math.cos(lat*Math.PI/180)),lat+dy/111320]);
  const outline=hull([...ring,...projected]);if(!outline)continue;
  features.push({type:'Feature',properties:{kind,osm:feature.properties.osm},geometry:{type:'Polygon',coordinates:[outline]}});
 }
 return {type:'FeatureCollection',features};
}
const lastLook=new WeakMap();
export function paintDepthShadows(map,data,look='day',weather){
 const source=map.getSource('labuan-depth-shadows');if(!source||!data)return;
 if(lastLook.get(source)!==look){source.setData(depthShadows(data,look));lastLook.set(source,look)}
 const cloud=Math.max(0,Math.min(1,(weather?.cloudCover||0)/100));
 const opacity=look==='night'?.1:(look==='dusk'?.27:.24)*(1-cloud*.55)*(weather?.raining?.75:1);
 if(map.getLayer('game-building-shadows'))map.setPaintProperty?.('game-building-shadows','fill-opacity',opacity);
}
