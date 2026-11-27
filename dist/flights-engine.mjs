import {AIRPORT_LAYOUT} from './environment/airport-layout.mjs?v=airport-20261127';
export const FLIGHT_SOURCE='https://explorelabuan.my/?lang=en';
export const FLIGHT_SNAPSHOT='https://raw.githubusercontent.com/KHAN7-gif/geopark/refs/heads/flight-data/flights.json';
export const FLIGHT_MAX_AGE=60*60000;
export const localFlightDate=now=>new Date(now+8*3600000).toISOString().slice(0,10);
const stamp=value=>typeof value==='string'&&Number.isFinite(Date.parse(value));
export function validateFlights(raw,now=Date.now()){
 if(!raw||raw.version!==1||raw.airport!=='LBU'||raw.sourceUrl!==FLIGHT_SOURCE||raw.timezone!=='Asia/Kuching'||!stamp(raw.fetchedAt)||Date.parse(raw.fetchedAt)>now+300000||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(raw.serviceDate)||!Array.isArray(raw.flights)||raw.flights.length>200)throw Error('Invalid flight snapshot');
 const ids=new Set();for(const f of raw.flights){if(!f||typeof f.id!=='string'||f.id.length>80||ids.has(f.id)||!['arrival','departure'].includes(f.direction)||!/^\w{2,3}\d{1,4}[A-Z]?$/.test(f.number)||!stamp(f.scheduledAt)||f.estimatedAt!==null&&!stamp(f.estimatedAt)||!['scheduled','on-time','en-route','boarding','delayed','landed','departed','cancelled','diverted','unknown'].includes(f.status)||!['aircraft','airline','city','otherAirport','sourceStatus','gate'].every(k=>typeof f[k]==='string'&&f[k].length<=140)||!/^\w{3}$/.test(f.otherAirport)||Math.abs(Date.parse(f.scheduledAt)-Date.parse(raw.serviceDate+'T00:00:00+08:00'))>48*3600000||f.estimatedAt&&Math.abs(Date.parse(f.estimatedAt)-Date.parse(f.scheduledAt))>24*3600000)throw Error('Invalid flight row');ids.add(f.id)}return raw;
}
export function flightsUsable(data,now=Date.now()){try{validateFlights(data,now);return now-Date.parse(data.fetchedAt)<=FLIGHT_MAX_AGE&&data.serviceDate===localFlightDate(now)}catch{return false}}
export function eventTime(f){if(['cancelled','diverted'].includes(f.status)||f.status==='delayed'&&!f.estimatedAt)return null;return Date.parse(f.estimatedAt||f.scheduledAt)}
const metres=(a,b)=>Math.hypot((b[0]-a[0])*110850,(b[1]-a[1])*111320);
export function pathAt(path,fraction){const lengths=path.slice(1).map((p,i)=>metres(path[i],p)),total=lengths.reduce((a,b)=>a+b,0),target=Math.max(0,Math.min(1,fraction))*total;let before=0;for(let i=0;i<lengths.length;i++){if(before+lengths[i]>=target||i===lengths.length-1){const t=lengths[i]?Math.max(0,Math.min(1,(target-before)/lengths[i])):0,a=path[i],b=path[i+1];return {position:a.map((v,n)=>v+(b[n]-v)*t),heading:(Math.atan2((b[0]-a[0])*110850,(b[1]-a[1])*111320)*180/Math.PI+360)%360}}before+=lengths[i]}return {position:path[0],heading:0}}
const runway=AIRPORT_LAYOUT.runway,first=runway[0],last=runway.at(-1),length=metres(first,last),runwayAt=distance=>first.map((v,i)=>v+(last[i]-v)*distance/length),runwayHeading=pathAt(runway,.5).heading;
const exit=AIRPORT_LAYOUT.taxiPath[0],exitDistance=metres(first,exit),taxiPath=AIRPORT_LAYOUT.taxiPath;
const departureTaxi=[...taxiPath].reverse().concat([...runway].reverse().filter(p=>metres(first,p)<exitDistance).concat([first]));
export function aircraftState(f,now=Date.now(),{preview=false}={}){
 const target=eventTime(f);if(target===null)return null;const t=(now-target)/1000;if(t< -300||t>240)return null;
 if(!preview&&(f.status==='landed'||f.status==='departed')&&t<0)return null;
 let position,heading=runwayHeading,altitude=0,pitch=0,phase;
 if(f.direction==='arrival'){
  if(t<0){const along=350+t*60;position=runwayAt(along);altitude=Math.max(0,-t*3.1);pitch=-.052;phase='approach'}
  else if(t<75){const q=t/75;position=runwayAt(350+(exitDistance-350)*(1-(1-q)**2));phase='landing-roll'}
  else if(t<195){const state=pathAt(taxiPath,(t-75)/120);position=state.position;heading=state.heading;phase='taxi-in'}
  else if(t<240){position=taxiPath.at(-1);heading=pathAt(taxiPath,1).heading;phase='parked'}else return null;
 }else{
  if(t< -70){const state=pathAt(departureTaxi,(t+300)/230);position=state.position;heading=state.heading;phase='taxi-out'}
  else if(t<0){position=runwayAt(1700*((t+70)/70)**2);phase='takeoff-roll';pitch=t> -10?.08:0}
  else if(t<240){position=runwayAt(1700+t*72);altitude=t*4.2;pitch=.07;phase='climb'}else return null;
 }
 return {id:f.id,number:f.number,aircraft:f.aircraft,airline:f.airline,direction:f.direction,position,heading,altitude,pitch,phase,preview};
}
export function activeAircraft(data,now=Date.now()){if(!flightsUsable(data,now))return [];return data.flights.map(f=>aircraftState(f,now)).filter(Boolean).slice(0,8)}
export function demoAircraft(direction,startedAt,now=Date.now()){
 const elapsed=(now-startedAt)/1000;if(elapsed<0||elapsed>35)return null;
 // Preview accelerates only the aircraft vignette, never the global/player clock.
 const relative=direction==='arrival'?-90+elapsed*10:-120+elapsed*10;
 const f={id:'preview-'+direction,number:'PRATONTON',direction,aircraft:'Boeing 737-800',airline:'Jelajah Labuan',status:'scheduled',estimatedAt:null,scheduledAt:new Date(now-relative*1000).toISOString()};return aircraftState(f,now,{preview:true});
}
export {AIRPORT_LAYOUT};
