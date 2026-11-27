import {LAND_RINGS} from './marine-coast.mjs?v=merdeka-four-20261127';
const SX=111320*Math.cos(5.3*Math.PI/180),SY=111320;
export const toXY=([lat,lng])=>[(lng-115)*SX,(lat-5.1)*SY];
export const fromXY=([x,y])=>[y/SY+5.1,x/SX+115];
export const landPolygons=LAND_RINGS.map(r=>{const p=r.map(([lng,lat])=>toXY([lat,lng]));return {points:p,minX:Math.min(...p.map(v=>v[0])),maxX:Math.max(...p.map(v=>v[0])),minY:Math.min(...p.map(v=>v[1])),maxY:Math.max(...p.map(v=>v[1]))}});
export function inPolygon([x,y],polygon){if(x<polygon.minX||x>polygon.maxX||y<polygon.minY||y>polygon.maxY)return false;let hit=false;const p=polygon.points;for(let i=0,j=p.length-1;i<p.length;j=i++){const a=p[i],b=p[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit}return hit}
export function nearestShore(point,ringIndex=null){const p=toXY(point);let best=Infinity,result=null,index=-1;for(let k=0;k<landPolygons.length;k++){if(ringIndex!==null&&k!==ringIndex)continue;const ring=landPolygons[k].points;for(let i=0;i<ring.length-1;i++){const a=ring[i],b=ring[i+1],dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy||1))),q=[a[0]+dx*t,a[1]+dy*t],d=Math.hypot(q[0]-p[0],q[1]-p[1]);if(d<best){best=d;result=q;index=k}}}return {point:fromXY(result),distance:best,ring:index}}
export function landAt(point){const xy=toXY(point);return landPolygons.findIndex(p=>inPolygon(xy,p))}
export function segmentAllowed(a,b,domain='sea',ringIndex=null){
 const p=toXY(a),q=toXY(b),dx=q[0]-p[0],dy=q[1]-p[1],cuts=[0,1],polygons=ringIndex===null?landPolygons:[landPolygons[ringIndex]];
 for(const polygon of polygons){if(Math.max(p[0],q[0])<polygon.minX||Math.min(p[0],q[0])>polygon.maxX||Math.max(p[1],q[1])<polygon.minY||Math.min(p[1],q[1])>polygon.maxY)continue;const ring=polygon.points;
  for(let i=0;i<ring.length-1;i++){const c=ring[i],d=ring[i+1],ex=d[0]-c[0],ey=d[1]-c[1],den=dx*ey-dy*ex;if(Math.abs(den)<1e-8)continue;const t=((c[0]-p[0])*ey-(c[1]-p[1])*ex)/den,u=((c[0]-p[0])*dy-(c[1]-p[1])*dx)/den;if(t>1e-8&&t<1-1e-8&&u>=0&&u<=1)cuts.push(t)}
 }
 cuts.sort((a,b)=>a-b);for(let i=1;i<cuts.length;i++){const t=(cuts[i-1]+cuts[i])/2,point=[p[0]+dx*t,p[1]+dy*t],land=polygons.some(r=>inPolygon(point,r));if(domain==='sea'&&land||domain==='land'&&!land){const world=fromXY(point);if(nearestShore(world,ringIndex).distance>(domain==='land'?5:1))return false}}
 return true;
}
export function validSeaPath(path){return Array.isArray(path)&&path.length>=2&&path.every((p,i)=>i===0||segmentAllowed(path[i-1],p))}
export function metres(a,b){const rad=n=>n*Math.PI/180,d=Math.sin(rad(b[0]-a[0])/2)**2+Math.cos(rad(a[0]))*Math.cos(rad(b[0]))*Math.sin(rad(b[1]-a[1])/2)**2;return 6371000*2*Math.atan2(Math.sqrt(d),Math.sqrt(Math.max(0,1-d)))}
export const pathMetres=path=>path.slice(1).reduce((sum,p,i)=>sum+metres(path[i],p),0);
