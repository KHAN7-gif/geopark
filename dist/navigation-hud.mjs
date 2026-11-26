const rad=n=>n*Math.PI/180;
const lengths=new WeakMap();
function metres(a,b){const d=Math.sin(rad(b[0]-a[0])/2)**2+Math.cos(rad(a[0]))*Math.cos(rad(b[0]))*Math.sin(rad(b[1]-a[1])/2)**2;return 6371000*2*Math.atan2(Math.sqrt(d),Math.sqrt(Math.max(0,1-d)))}
export function compassHeading(a,b){
  const y=Math.sin(rad(b[1]-a[1]))*Math.cos(rad(b[0]));
  const x=Math.cos(rad(a[0]))*Math.sin(rad(b[0]))-Math.sin(rad(a[0]))*Math.cos(rad(b[0]))*Math.cos(rad(b[1]-a[1]));
  const degrees=(Math.atan2(y,x)*180/Math.PI+360)%360;
  return {degrees,label:['U','TL','T','TG','S','BD','B','BL'][Math.round(degrees/45)%8]};
}
export function navigationHUD(journey,state){
  if(!journey||!state)return {remainingMetres:null,speedKmh:0,heading:null};
  const route=journey.route,path=route.path,index=Math.min(state.index,path.length-2);
  let cache=lengths.get(path);
  if(!cache){const tail=new Array(path.length).fill(0);for(let i=path.length-2;i>=0;i--)tail[i]=tail[i+1]+metres(path[i],path[i+1]);cache=tail;lengths.set(path,cache)}
  const remaining=state.arrived?0:Math.min(cache[0],metres(state.position,path[index+1])+cache[index+1]);
  let target=index+1;while(target<path.length-1&&metres(state.position,path[target])<1)target++;
  const heading=metres(state.position,path[target])>=1?compassHeading(state.position,path[target]):null;
  const stopped=journey.pausedAt!==null||state.waiting||state.arrived;
  const speed=route.mode==='walk'?5:route.mode==='bus'?25:route.mode==='motor'?35:route.distanceMetres/route.durationSeconds*3.6;
  return {remainingMetres:cache[0]>0?remaining/cache[0]*route.distanceMetres:0,speedKmh:stopped?0:speed,heading};
}
