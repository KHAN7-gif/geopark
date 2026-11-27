import {TOWN_DATA} from './environment/town-data.mjs?v=marina-20261127';
// Layout follows the user's satellite reference (27 Nov 2026), aligned to the
// existing OSM outline. Furniture dimensions / positions are approximate.
export const DATARAN_RING=TOWN_DATA.features.find(f=>f.geometry.type==='Polygon'&&f.properties.name==='Dataran Labuan').geometry.coordinates[0];
const SX=111320*Math.cos(5.276*Math.PI/180),SY=111320;
const edge=DATARAN_RING.slice(1).map((p,i)=>[DATARAN_RING[i],p]).sort((a,b)=>Math.hypot((b[1][0]-b[0][0])*SX,(b[1][1]-b[0][1])*SY)-Math.hypot((a[1][0]-a[0][0])*SX,(a[1][1]-a[0][1])*SY))[0],ordered=edge[0][0]<edge[1][0]?edge:[edge[1],edge[0]],origin=ordered[0],end=ordered[1],dx=(end[0]-origin[0])*SX,dy=(end[1]-origin[1])*SY,len=Math.hypot(dx,dy),axis=[dx/len,dy/len],normal=[-axis[1],axis[0]];
export function dataranPoint(u,v){return [origin[0]+(axis[0]*u+normal[0]*v)/SX,origin[1]+(axis[1]*u+normal[1]*v)/SY]}
export function dataranUV(p){const x=(p[0]-origin[0])*SX,y=(p[1]-origin[1])*SY;return [x*axis[0]+y*axis[1],x*normal[0]+y*normal[1]]}
export const DATARAN_LAYOUT={monument:{u:10,v:-46,radius:28,platformOffset:5,platformHeight:.65},get flag(){return {u:this.monument.u+this.monument.platformOffset,v:this.monument.v}},grandstand:{u:112,v:-88,width:27,depth:11},reference:'User satellite screenshot; aligned to OSM outline; dimensions illustrative'};
export function insideDataran(p){let hit=false;for(let i=0,j=DATARAN_RING.length-1;i<DATARAN_RING.length;j=i++){const a=DATARAN_RING[i],b=DATARAN_RING[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])hit=!hit}return hit}
export function dataranEdgeDistance(p){const [u,v]=dataranUV(p);let best=Infinity;for(let i=1;i<DATARAN_RING.length;i++){const a=dataranUV(DATARAN_RING[i-1]),b=dataranUV(DATARAN_RING[i]),dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((u-a[0])*dx+(v-a[1])*dy)/(dx*dx+dy*dy||1)));best=Math.min(best,Math.hypot(u-a[0]-t*dx,v-a[1]-t*dy))}return best}
export function dataranTreeAllowed(p){if(!insideDataran(p))return true;const [u,v]=dataranUV(p),m=DATARAN_LAYOUT.monument,g=DATARAN_LAYOUT.grandstand;if(Math.hypot(u-m.u,v-m.v)<m.radius+7||Math.abs(u-g.u)<g.width/2+4&&Math.abs(v-g.v)<g.depth/2+4)return false;return dataranEdgeDistance(p)<=7}
export function dataranForecourt(){const m=DATARAN_LAYOUT.monument,points=[dataranPoint(m.u+6,m.v)];for(let n=0;n<=24;n++){const a=Math.PI/2+n*Math.PI/24;points.push(dataranPoint(m.u+Math.cos(a)*m.radius,m.v+Math.sin(a)*m.radius))}points.push(points[0]);return points}
