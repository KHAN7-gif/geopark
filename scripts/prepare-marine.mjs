import {readFile,writeFile} from 'node:fs/promises';
import {landAt,nearestShore,validSeaPath,metres} from '../dist/marine-geometry.mjs';
import {pathfinder} from './marine-pathfinder.mjs';
const ports=JSON.parse(await readFile(new URL('./marine-ports.json',import.meta.url),'utf8')),sites=JSON.parse(await readFile(new URL('../dist/locations.json',import.meta.url)));
const landPaths=new Map(),getLand=ring=>{if(!landPaths.has(ring))landPaths.set(ring,pathfinder({domain:'land',ring,step:40}));return landPaths.get(ring)};
for(const port of ports){const anchor=[port.lat,port.lng],shore=nearestShore(anchor);port.shore=shore.point;port.shoreDistance=shore.distance;
 try{const response=JSON.parse(await readFile(new URL('../tests/fixtures/port-'+port.id+'.json',import.meta.url),'utf8'));const coords=response.routes[0].geometry.coordinates.at(-1);port.roadEnd=[coords[1],coords[0]]}catch{port.roadEnd=port.shore}
 if(metres(port.roadEnd,anchor)<30)port.approach=[port.roadEnd,anchor];
 else {let start=port.roadEnd,via=[];if(landAt(start)<0){const entry=nearestShore(start).point;via=[start];start=entry}const ring=nearestShore(port.shore).ring;port.approach=[...via,...getLand(ring)(start,port.shore),anchor]}
}
const islandDefinitions=[
 ['J4','kuraman','Pulau Kuraman','G6'],['J5','rusukan-besar','Pulau Rusukan Besar','G7'],
 ['J6','rusukan-kecil','Pulau Rusukan Kecil','C7'],['J7','papan','Pulau Papan','C6'],
 ['J8','burong','Pulau Burong','C10'],['J9','ular','Pulau Ular','B3']
];
const islandPorts=islandDefinitions.map(([id,island,name,siteId])=>{
 const site=sites.find(s=>s.id===siteId),point=[site.lat,site.lng],raw=landAt(point),near=nearestShore(point),ring=raw>=0?raw:near.distance<=8?near.ring:-1;
 const shore=ring>=0?nearestShore(point,ring).point:point;
 return {id,island,name:'Jeti '+name,lat:shore[0],lng:shore[1],shore,ring,kind:'island',floating:ring<0,modes:['perahu','boat','boat_vip'],siteIds:sites.filter(s=>s.access?.island===island).map(s=>s.id),source:'Virtual game jetty based on mapped coast; not a surveyed real-world pier'};
});
const landings={};for(const site of sites.filter(s=>s.access?.island)){
 const port=islandPorts.find(p=>p.island===site.access.island),point=[site.lat,site.lng],observation=site.access.marineObservation===true;
 const shore=observation?point:[port.lat,port.lng];
 landings[site.id]={siteId:site.id,island:site.access.island,jettyId:port.id,point:shore,walkToSite:!observation&&port.ring>=0?getLand(port.ring)(shore,point):[],note:observation?'Pemerhatian laut selepas berlepas dari jeti pulau.':port.floating?'Jeti terapung maya; garis pantai belum dipetakan.':'Akses dari jeti pulau simulasi, bukan denai disahkan.'};
}
const endpoints=[...ports.map(p=>({id:p.id,point:[p.lat,p.lng],island:'labuan'})),...Object.values(landings).map(p=>({id:p.siteId,point:p.point,island:p.island}))],sea=pathfinder(),routes={},walks={};
for(let i=0;i<endpoints.length;i++)for(let j=i+1;j<endpoints.length;j++){const a=endpoints[i],b=endpoints[j],key=[a.id,b.id].sort().join(':');if(a.island===b.island&&a.island==='labuan'||metres(a.point,b.point)<.01)continue;const station=endpoint=>{const landing=landings[endpoint.id],port=landing&&islandPorts.find(p=>p.id===landing.jettyId);return sites.find(s=>s.id===endpoint.id)?.access?.marineObservation?[port.lat,port.lng]:endpoint.point};
 const sa=station(a),sb=station(b),pieces=[];if(metres(a.point,sa)>.01)pieces.push(sea(a.point,sa));if(metres(sa,sb)>.01)pieces.push(sea(sa,sb));if(metres(sb,b.point)>.01)pieces.push(sea(sb,b.point));const path=pieces.flatMap((p,i)=>i?p.slice(1):p);if(!validSeaPath(path))throw Error('Marine crossing land: '+key);routes[key]={from:a.id,to:b.id,path};console.log('Prepared sea corridor',key,path.length)}
for(let i=0;i<sites.length;i++)for(let j=i+1;j<sites.length;j++){const a=sites[i],b=sites[j];if(!a.access?.island||a.access.island!==b.access?.island)continue;const raw=landAt([a.lat,a.lng]),near=nearestShore([a.lat,a.lng]),ring=raw>=0?raw:near.distance<=8?near.ring:-1;if(ring>=0&&!a.access?.marineObservation&&!b.access?.marineObservation)walks[[a.id,b.id].sort().join(':')]={from:a.id,to:b.id,path:getLand(ring)([a.lat,a.lng],[b.lat,b.lng])}}
const output={ports,islandPorts,jetties:[...ports,...islandPorts],landings,routes,walks,metadata:{source:'User Google Maps pins and OpenStreetMap coastline snapshot',simulation:true,coastlineDate:'2026-11-26',note:'Game-only geometric sea corridors. No bathymetry, restricted-area, tide, safety or operator-track verification. Walking island access is illustrative.'}};
await writeFile(new URL('../dist/marine-data.mjs',import.meta.url),'// Generated game corridors; not marine navigation data.\nexport const MARINE_DATA='+JSON.stringify(output)+';\n');
console.log('Completed',Object.keys(routes).length,'sea corridors and',Object.keys(walks).length,'island walking links');
