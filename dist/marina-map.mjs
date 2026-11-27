import {MARINA_BERTHS,MARINA_PONTOONS} from './marina-layout.mjs?v=carlights-20261127';
import {toXY,fromXY} from './marine-geometry.mjs?v=carlights-20261127';
export const MARINA_LAYERS=['marina-pontoons','marina-parked-boats'];
export const MARINA_LIMITS={eco:6,balanced:10,high:12};
export function marinaFeatures(quality='balanced'){
 const features=[],geo=([x,y])=>{const p=fromXY([x,y]);return [p[1],p[0]]};
 function polygon(ring,{id,part,color,base,height,entity='boat'}){features.push({type:'Feature',properties:{id,part,color,base,height,entity},geometry:{type:'Polygon',coordinates:[[...ring,ring[0]]]}})}
 for(const deck of MARINA_PONTOONS)for(let n=1;n<deck.path.length;n++){const a=toXY([deck.path[n-1][1],deck.path[n-1][0]]),b=toXY([deck.path[n][1],deck.path[n][0]]),dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy),nx=-dy/len*1.2,ny=dx/len*1.2;polygon([[a[0]+nx,a[1]+ny],[a[0]-nx,a[1]-ny],[b[0]-nx,b[1]-ny],[b[0]+nx,b[1]+ny]].map(geo),{id:deck.osm+':'+n,entity:'pontoon',part:'deck',color:'#ba9567',base:.3,height:.9})}
 for(const boat of MARINA_BERTHS.slice(0,MARINA_LIMITS[quality]||10)){
  const p=toXY([boat.position[1],boat.position[0]]),h=boat.heading*Math.PI/180,c=Math.cos(h),s=Math.sin(h),at=(x,z)=>geo([p[0]+x*c-z*s,p[1]-x*s-z*c]),L=boat.length,W=boat.width,accent=['#234d6b','#258f88','#a16246','#6078a1'][boat.variant],add=(ring,part,color,base,height)=>polygon(ring,{id:boat.id,part,color,base,height}),rect=(x,z,w,d,part,color,base,height)=>add([[x-w/2,z-d/2],[x+w/2,z-d/2],[x+w/2,z+d/2],[x-w/2,z+d/2]].map(([x,z])=>at(x,z)),part,color,base,height);
  const hull=[[-.02,-L*.5],[-W*.4,-L*.32],[-W*.5,L*.12],[-W*.42,L*.48],[W*.42,L*.48],[W*.5,L*.12],[W*.4,-L*.32],[.02,-L*.5]];
  add(hull.map(([x,z])=>at(x,z)),'hull','#f7f3e5',.15,1.35);add(hull.map(([x,z])=>at(x*.88,z*.92)),'teak-deck','#d8b77e',1.35,1.43);rect(0,L*.05,W*.66,L*.4,'cabin','#fffbed',1.4,2.3);rect(0,L*.05,W*.68,L*.405,'glass','#307890',1.75,2.12);rect(0,L*.03,W*.72,L*.43,'roof',accent,2.3,2.48);
  for(const side of [-1,1])for(const z of [-L*.12,L*.22])rect(side*W*.31,z,.15,.15,'window-post','#f7f3e5',1.7,2.3);
  if(boat.kind==='sail'){
   const ring=Array.from({length:8},(_,n)=>at(Math.cos(n*Math.PI/4)*.2,-L*.08+Math.sin(n*Math.PI/4)*.2));add(ring,'mast','#f1f2e9',2.4,L*1.15);rect(0,L*.1,.48,L*.36,'furled-sail','#fffdf1',2.65,3);rect(.45,-L*.08,.9,.1,'pennant',accent,L*1.15-.6,L*1.15);
  }else{rect(0,-L*.02,W*.5,L*.2,'flybridge','#fffbed',2.48,3.1);rect(0,-L*.02,W*.52,L*.205,'upper-glass','#376d86',2.7,2.97);rect(0,-L*.02,W*.62,L*.24,'vip-canopy',accent,3.1,3.3);rect(0,-L*.04,W*.32,L*.1,'solar-panel','#233f50',3.3,3.35);for(const side of [-1,1])rect(side*W*.23,L*.32,W*.16,L*.13,'cushion','#ead9b2',1.45,1.78)}
  if(quality!=='eco')for(const side of [-1,1]){rect(side*W*.42,L*.025,.07,L*.45,'rail','#dce5dc',1.83,1.91);for(const z of [-L*.2,L*.25])rect(side*W*.42,z,.1,.1,'rail-post','#dce5dc',1.4,1.9);for(const z of [-L*.15,L*.2])rect(side*W*.5,z,.24,.28,'fender','#ecede1',.8,1.35)}
 }
 return {type:'FeatureCollection',features};
}
export function addMarinaLayers(map,quality='balanced'){
 map.addSource('marina-scenery',{type:'geojson',data:marinaFeatures(quality),attribution:'Marina pontoon outlines © OpenStreetMap contributors; moored boats are game scenery'});
 for(const [id,entity]of [['marina-pontoons','pontoon'],['marina-parked-boats','boat']])map.addLayer({id,type:'fill-extrusion',source:'marina-scenery',minzoom:13.5,filter:['==',['get','entity'],entity],layout:{visibility:'visible'},paint:{'fill-extrusion-color':['get','color'],'fill-extrusion-height':['get','height'],'fill-extrusion-base':['get','base'],'fill-extrusion-opacity':1,'fill-extrusion-vertical-gradient':true}});
}
export function setMarinaQuality(map,quality){map.getSource('marina-scenery')?.setData(marinaFeatures(quality))}
