import {MARINE_DATA} from './marine-data.mjs?v=navui-20261128';
import {toXY,fromXY,landAt} from './marine-geometry.mjs?v=navui-20261128';
export const MARINA_VIEW=[115.2480,5.27297];
// Existing OSM marina footway/pontoon centre lines; scenery, not surveyed berths.
export const MARINA_PONTOONS=[{osm:'way/905756222',path:[[115.2489874,5.2731723],[115.2488264,5.2727438],[115.2480922,5.2730015],[115.2473978,5.2732453]]},{osm:'way/905756221',path:[[115.2480922,5.2730015],[115.2479285,5.2725676]]}];
const xy=p=>toXY([p[1],p[0]]),lnglat=p=>{const q=fromXY(p);return [q[1],q[0]]},distance=(p,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p[0]-a[0]-dx*t,p[1]-a[1]-dy*t)};
const port=MARINE_DATA.ports.find(p=>p.id==='J3');
export const MARINA_EXIT=[port.lat,port.lng];
const exitLegs=Object.values(MARINE_DATA.routes).flatMap(route=>{const p=route.path;if(route.from==='J3')return [[toXY(p[0]),toXY(p[1])]];if(route.to==='J3')return [[toXY(p.at(-1)),toXY(p.at(-2))]];return []});
export function marinaRouteClearance(position){const p=xy(position);return Math.min(...exitLegs.map(([a,b])=>distance(p,a,b)))}
export function berthHullPoints(berth){const p=xy(berth.position),h=berth.heading*Math.PI/180,c=Math.cos(h),s=Math.sin(h),result=[];for(const z of [-.5,0,.5])for(const x of [-.5,0,.5])result.push(lnglat([p[0]+x*berth.width*c-z*berth.length*s,p[1]-x*berth.width*s-z*berth.length*c]));return result}
function prepareBerths(){const path=MARINA_PONTOONS[0].path.slice(1).map(xy),lengths=path.slice(1).map((p,i)=>Math.hypot(p[0]-path[i][0],p[1]-path[i][1])),total=lengths.reduce((a,b)=>a+b,0),result=[];
 for(let n=0;n<16;n++){let target=total*(.12+n*.052),i=0;while(i<lengths.length-1&&target>lengths[i]){target-=lengths[i];i++}const a=path[i],b=path[i+1],len=lengths[i],ux=(b[0]-a[0])/len,uy=(b[1]-a[1])/len,side=n%2?1:-1,length=11+(n%3)*3,width=length*.28,nx=-uy*side,ny=ux*side,dock=[a[0]+ux*target,a[1]+uy*target],centre=[dock[0]+nx*(length/2+3),dock[1]+ny*(length/2+3)],berth={id:'marina-berth-'+n,kind:n%3===1?'vip':'sail',length,width,heading:(Math.atan2(nx,ny)*180/Math.PI+360)%360,position:lnglat(centre),mooring:lnglat(dock),variant:n%4,source:'way/905756222'};
  if(marinaRouteClearance(berth.position)<length/2+14||berthHullPoints(berth).some(p=>landAt([p[1],p[0]])>=0))continue;
  const clear=berthHullPoints(berth).every(p=>MARINA_PONTOONS.every(deck=>deck.path.slice(1).every((b,j)=>distance(xy(p),xy(deck.path[j]),xy(b))>1.5)));
  if(clear&&result.every(other=>Math.hypot(...xy(other.position).map((v,k)=>v-centre[k]))>(other.length+length)/2+1))result.push(berth);
 }
 return result;
}
export const MARINA_BERTHS=prepareBerths();
export function marinaDistance(anchor){return Math.hypot((anchor[0]-MARINA_VIEW[0])*110850,(anchor[1]-MARINA_VIEW[1])*111320)}
