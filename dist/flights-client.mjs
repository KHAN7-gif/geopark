import {FLIGHT_SNAPSHOT,validateFlights,flightsUsable} from './flights-engine.mjs?v=airport-20261127';
export function createFlightsClient({fetchFn=fetch,storage,onUpdate=()=>{},now=Date.now,setIntervalFn,clearIntervalFn}){
 let current=null,pending=null,disposed=false,timer=null,abort=null;
 try{current=validateFlights(JSON.parse(storage?.getItem('jelajah-labuan-flights-v1')||'null'),now())}catch{}
 if(current)onUpdate(current);
 async function refresh(){if(disposed)return null;if(pending)return pending;
  pending=(async()=>{for(const url of [FLIGHT_SNAPSHOT+'?t='+Math.floor(now()/300000),new URL('flights-snapshot.json',import.meta.url).href]){
   const controller=new AbortController();abort=controller;const timeout=setTimeout(()=>controller.abort(),12000);
   try{const res=await fetchFn(url,{signal:controller.signal});if(!res.ok)throw Error('Flights unavailable');const next=validateFlights(await res.json(),now());if(!flightsUsable(next,now()))continue;if(disposed)return null;current=next;try{storage?.setItem('jelajah-labuan-flights-v1',JSON.stringify(next))}catch{}onUpdate(next);return next}catch{}finally{clearTimeout(timeout)}
  }if(!disposed)onUpdate(current);return current})().finally(()=>{pending=null});return pending;
 }
 if(setIntervalFn)timer=setIntervalFn(refresh,5*60000);
 return {refresh,destroy(){disposed=true;abort?.abort();if(timer!==null)clearIntervalFn?.(timer)}};
}
