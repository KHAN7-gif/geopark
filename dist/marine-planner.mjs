import {MARINE_DATA} from './marine-data.mjs?v=merdeka-four-20261127';
import {pathMetres,metres} from './marine-geometry.mjs?v=merdeka-four-20261127';
import {modeDuration} from './transport-shop.mjs?v=merdeka-four-20261127';
import {validateRoute,combineRouteLegs,normaliseRoadResponse,routeURL} from './travel-engine.mjs?v=merdeka-four-20261127';
export {MARINE_DATA};
const key=(a,b)=>[a,b].sort().join(':');
function corridor(a,b,collection){const r=collection[key(a,b)];if(!r)throw Error('Corridor unavailable');return r.from===a?r.path:[...r.path].reverse()}
function leg(path,mode='walk'){const distanceMetres=pathMetres(path),durationSeconds=modeDuration(mode,distanceMetres,1);return validateRoute({path,mode,distanceMetres,durationSeconds,sourceSeconds:durationSeconds,segmentSeconds:path.slice(1).map((p,i)=>Math.max(.001,metres(path[i],p))),startAccessMetres:0,endAccessMetres:0,provider:mode==='walk'?'GEOPARK-ACCESS':'GEOPARK-MARINE'})}
export async function prepareMarineRoute(from,to,mode,{signal,fetcher=fetch}={}){
 if(mode==='walk'){return leg(corridor(from.id,to.id,MARINE_DATA.walks))}
 const port=MARINE_DATA.ports.find(p=>p.mode===mode);if(!port)throw Error('Unknown vessel');
 const a=from.access?.island?MARINE_DATA.landings[from.id]:port,b=to.access?.island?MARINE_DATA.landings[to.id]:port;
 if(!a||!b||a===b)throw Error('No sea crossing');
 const legs=[];
 async function approach(site,reverse){
  const response=await fetcher(routeURL(reverse?port:site,reverse?site:port,'walk'),{signal});if(!response.ok)throw Error('Walking route unavailable');const road=normaliseRoadResponse(await response.json(),'walk');
  const endpoint=reverse?road.path[0]:road.path.at(-1);if(metres(endpoint,port.roadEnd)>25)throw Error('Jetty road access changed');
  const connector=reverse?[...port.approach].reverse():port.approach;
  const path=reverse?[...connector,...road.path.slice(1)]:[...road.path,...connector.slice(1)];
  // The final jetty connector is a virtual game access, not an independently surveyed trail.
  return leg(path);
 }
 if(from.access?.island){if(a.walkToSite.length>1)legs.push(leg([...a.walkToSite].reverse()))}else legs.push(await approach(from,false));
 legs.push(leg(corridor(a.siteId||a.id,b.siteId||b.id,MARINE_DATA.routes),mode));
 if(to.access?.island){if(b.walkToSite.length>1)legs.push(leg(b.walkToSite))}else legs.push(await approach(to,true));
 return legs.length===1?legs[0]:combineRouteLegs(legs);
}
