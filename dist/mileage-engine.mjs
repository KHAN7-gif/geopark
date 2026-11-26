const MODES=['walk','bus','motor','car','boat','boat_vip'];
const cache=new WeakMap();
const rad=n=>n*Math.PI/180;
function metres(a,b){const d=Math.sin(rad(b[0]-a[0])/2)**2+Math.cos(rad(a[0]))*Math.cos(rad(b[0]))*Math.sin(rad(b[1]-a[1])/2)**2;return 6371000*2*Math.atan2(Math.sqrt(d),Math.sqrt(Math.max(0,1-d)))}
export function routeMileage(route,fraction){
  let segments=cache.get(route);
  if(!segments){
    segments=[];const legs=route.legs||[route];
    for(const leg of legs){const distances=leg.path.slice(1).map((p,i)=>metres(leg.path[i],p)),sum=distances.reduce((a,b)=>a+b,0),timing=leg.segmentSeconds.reduce((a,b)=>a+b,0),duration=leg.durationSeconds-(leg.mode==='bus'?120:0);
      distances.forEach((d,i)=>segments.push({mode:leg.mode||'car',metres:sum?d/sum*leg.distanceMetres:0,seconds:leg.segmentSeconds[i]/timing*duration}));
    }cache.set(route,segments);
  }
  const result=Object.fromEntries(MODES.map(m=>[m,0]));let time=Math.max(0,Math.min(1,fraction))*segments.reduce((a,s)=>a+s.seconds,0);
  for(const s of segments){const part=s.seconds>0?Math.min(1,Math.max(0,time/s.seconds)):time>0?1:0;result[s.mode]+=s.metres*part;time=Math.max(0,time-s.seconds)}return result;
}
export function validateMileage(entry){
  if(entry.distanceByMode===undefined&&entry.routeMetres===undefined)return {};
  if(!Number.isFinite(entry.routeMetres)||entry.routeMetres<0||entry.routeMetres>200000||!entry.distanceByMode||typeof entry.distanceByMode!=='object'||Array.isArray(entry.distanceByMode)||Object.keys(entry.distanceByMode).some(k=>!MODES.includes(k)))throw Error('Invalid mileage');
  const distanceByMode=Object.fromEntries(MODES.map(mode=>[mode,entry.distanceByMode[mode]??0]));
  if(Object.values(distanceByMode).some(n=>typeof n!=='number'||!Number.isFinite(n)||n<0)||Object.values(distanceByMode).reduce((a,b)=>a+b,0)>entry.routeMetres+.1)throw Error('Invalid mileage total');
  return {routeMetres:entry.routeMetres,distanceByMode};
}
export function distanceTotals(ledger){
 const byMode=Object.fromEntries(MODES.map(m=>[m,0]));let trackedJourneys=0;
 for(const entry of Object.values(ledger?.entries||{})){if(!entry.distanceByMode)continue;trackedJourneys++;for(const mode of MODES)byMode[mode]+=entry.distanceByMode[mode]||0}
 return {byMode,totalMetres:Object.values(byMode).reduce((a,b)=>a+b,0),vehicleMetres:byMode.bus+byMode.motor+byMode.car,boatMetres:byMode.boat+byMode.boat_vip,trackedJourneys};
}

export function movementTimes(route,elapsed){let maxMs=0,creditedMs=0,before=0;for(const leg of route.legs||[route]){const gameMs=Math.ceil(leg.durationSeconds/3*1000),wait=leg.mode==='bus'?40000:0;maxMs+=Math.max(0,gameMs-wait);creditedMs+=Math.floor(Math.max(0,Math.min(gameMs,elapsed-before)-wait));before+=gameMs}return {maxMs,creditedMs,gameMs:before}}
