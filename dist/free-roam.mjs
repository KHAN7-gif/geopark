import {landAt,toXY,fromXY,inPolygon,metres} from './marine-geometry.mjs?v=soundfix-20261127';
export const ROAM_START=[5.27625,115.2449];
export function joystickVector(x,y,radius=48){const length=Math.hypot(x,y),amount=Math.min(1,length/radius);if(amount<.14)return {x:0,y:0};const gain=(amount-.14)/.86;return {x:x/length*gain,y:y/length*gain}}
export function createWalkingWorld(data){
 const grid=new Map(),size=80;
 for(const f of data?.features||[]){if(f.properties?.kind!=='building'||!['Polygon','MultiPolygon'].includes(f.geometry?.type))continue;
  for(const rings of f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates){const points=rings[0].map(([lng,lat])=>toXY([lat,lng])),polygon={points,minX:Math.min(...points.map(p=>p[0])),maxX:Math.max(...points.map(p=>p[0])),minY:Math.min(...points.map(p=>p[1])),maxY:Math.max(...points.map(p=>p[1])),holes:rings.slice(1).map(r=>{const points=r.map(([lng,lat])=>toXY([lat,lng]));return {points,minX:-Infinity,maxX:Infinity,minY:-Infinity,maxY:Infinity}})};
   for(let x=Math.floor(polygon.minX/size);x<=Math.floor(polygon.maxX/size);x++)for(let y=Math.floor(polygon.minY/size);y<=Math.floor(polygon.maxY/size);y++){const key=x+','+y;if(!grid.has(key))grid.set(key,[]);grid.get(key).push(polygon)}
  }
 }
 return {walkable(point){if(!Array.isArray(point)||point.length!==2||!point.every(Number.isFinite)||landAt(point)<0)return false;const p=toXY(point),near=grid.get(Math.floor(p[0]/size)+','+Math.floor(p[1]/size))||[];return !near.some(poly=>inPolygon(p,poly)&&!poly.holes.some(hole=>inPolygon(p,hole)))}};
}
export function walkingSpawn(point,world){if(world.walkable(point))return [...point];if(Array.isArray(point)&&point.length===2&&point.every(Number.isFinite)){const p=toXY(point);for(let r=3;r<=60;r+=3)for(let n=0;n<16;n++){const a=n*Math.PI/8,q=fromXY([p[0]+Math.cos(a)*r,p[1]+Math.sin(a)*r]);if(world.walkable(q))return q}}return [...ROAM_START]}
export function walkStep(state,input,seconds,world){
 const magnitude=Math.min(1,Math.hypot(input.x,input.y)),dt=Math.max(0,Math.min(.1,Number.isFinite(seconds)?seconds:0));if(!magnitude||!dt)return {...state,moving:false,speed:0,blocked:false};
 const angle=(input.bearing||0)*Math.PI/180,norm=Math.hypot(input.x,input.y),right=input.x/norm,forward=-input.y/norm,east=(right*Math.cos(angle)+forward*Math.sin(angle)),north=(-right*Math.sin(angle)+forward*Math.cos(angle)),speed=(input.run?10:5),distance=speed/3.6*dt*magnitude,p=toXY(state.position),target=[p[0]+east*distance,p[1]+north*distance];
 let point=fromXY(target);if(!world.walkable(point)){const slideX=fromXY([target[0],p[1]]),slideY=fromXY([p[0],target[1]]);point=world.walkable(slideX)?slideX:world.walkable(slideY)?slideY:state.position}
 const moved=metres(state.position,point),moving=moved>.00001;return {...state,position:point,heading:(Math.atan2(east,north)*180/Math.PI+360)%360,distance:(state.distance||0)+moved,moving,speed:moving?speed*magnitude:0,blocked:!moving};
}
