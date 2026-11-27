import {MODEL_URL,WEATHER_SNAPSHOT_URL,normalizeModel,validateWeather} from './weather-engine.mjs?v=superadmin-20261127';
export function createWeatherClient({fetchFn=fetch,storage,onUpdate,onStatus=()=>{},now=Date.now,setIntervalFn,clearIntervalFn}){
 let disposed=false,current=null,pending=null,abort=null,timer=null;
 try{current=validateWeather(JSON.parse(storage?.getItem('jelajah-labuan-weather')||'null'),now())}catch{}
 if(current)onUpdate(current);
 async function request(url){const controller=new AbortController();abort=controller;const timeout=setTimeout(()=>controller.abort(),10000);try{const response=await fetchFn(url,{signal:controller.signal});if(!response.ok)throw Error('Weather request failed');return await response.json()}finally{clearTimeout(timeout)}}
 async function refresh(){
  if(disposed)return null;if(pending)return pending;
  pending=(async()=>{onStatus('loading');let result;
   try{result=validateWeather(await request(WEATHER_SNAPSHOT_URL+'?t='+Math.floor(now()/900000)),now())}catch{if(disposed)return null;try{result=normalizeModel(await request(MODEL_URL),now())}catch{}}
   if(disposed)return null;if(result){current=result;try{storage?.setItem('jelajah-labuan-weather',JSON.stringify(result))}catch{}onUpdate(result);onStatus('ready')}else{onUpdate(current);onStatus('unavailable')}return result||current;
  })().finally(()=>{pending=null});return pending;
 }
 if(setIntervalFn)timer=setIntervalFn(refresh,15*60000);
 return {refresh,destroy(){disposed=true;abort?.abort();if(timer!==null)clearIntervalFn?.(timer)}};
}
