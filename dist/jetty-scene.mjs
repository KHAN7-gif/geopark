import {MARINE_DATA} from './marine-data.mjs?v=boats-20261126';
// Virtual decks / shore connections on user-supplied venue pins, not surveyed infrastructure.
export function jettyFeatures(){const features=[];for(const port of MARINE_DATA.ports){const end=[port.lng,port.lat],start=[port.shore[1],port.shore[0]],dx=(end[0]-start[0])*110845,dy=(end[1]-start[1])*111320,len=Math.hypot(dx,dy)||1,nx=-dy/len*2.5/110845,ny=dx/len*2.5/111320;
 const polygon=(coordinates,color,height)=>({type:'Feature',properties:{color,height,port:port.id},geometry:{type:'Polygon',coordinates:[coordinates]}});
 features.push(polygon([[start[0]+nx,start[1]+ny],[end[0]+nx,end[1]+ny],[end[0]-nx,end[1]-ny],[start[0]-nx,start[1]-ny],[start[0]+nx,start[1]+ny]],'#99734d',2));
 const x=8/110845,y=6/111320;features.push(polygon([[end[0]-x,end[1]-y],[end[0]+x,end[1]-y],[end[0]+x,end[1]+y],[end[0]-x,end[1]+y],[end[0]-x,end[1]-y]],port.id==='J3'?'#d2bb78':'#bb9864',2.2));}
 return {type:'FeatureCollection',features}}
