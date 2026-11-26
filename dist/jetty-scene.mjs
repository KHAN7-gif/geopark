import {MARINE_DATA} from './marine-data.mjs?v=map-viewer-20261126';
// Virtual decks / shore connections on user-supplied venue pins, not surveyed infrastructure.
export function jettyFeatures(){const features=[];for(const port of MARINE_DATA.jetties){const end=[port.lng,port.lat],start=[port.shore[1],port.shore[0]],dx=(end[0]-start[0])*110845,dy=(end[1]-start[1])*111320,len=Math.hypot(dx,dy)||1,nx=-dy/len*2.5/110845,ny=dx/len*2.5/111320;
 const polygon=(coordinates,color,height)=>({type:'Feature',properties:{color,height,base:0,port:port.id},geometry:{type:'Polygon',coordinates:[coordinates]}});
 if(Math.hypot(dx,dy)>.1)features.push(polygon([[start[0]+nx,start[1]+ny],[end[0]+nx,end[1]+ny],[end[0]-nx,end[1]-ny],[start[0]-nx,start[1]-ny],[start[0]+nx,start[1]+ny]],'#99734d',2));
 if(Math.hypot(dx,dy)<=.1){const x=4/110845,y=3/111320,roof=polygon([[end[0]-x,end[1]-y],[end[0]+x,end[1]-y],[end[0]+x,end[1]+y],[end[0]-x,end[1]+y],[end[0]-x,end[1]-y]],port.floating?'#488da0':'#507958',4.5);roof.properties.base=4.2;features.push(roof)}
 const x=8/110845,y=6/111320;features.push(polygon([[end[0]-x,end[1]-y],[end[0]+x,end[1]-y],[end[0]+x,end[1]+y],[end[0]-x,end[1]+y],[end[0]-x,end[1]-y]],port.id==='J3'?'#d2bb78':'#bb9864',2.2));}
 return {type:'FeatureCollection',features}}
