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
const landings={};for(const site of sites.filter(s=>s.access?.island)){const point=[site.lat,site.lng],rawRing=landAt(point),near=nearestShore(point),ring=rawRing>=0?rawRing:near.distance<=8?near.ring:-1,shore=ring>=0?nearestShore(point,ring).point:point;landings[site.id]={siteId:site.id,island:site.access.island,point:shore,walkToSite:ring>=0?getLand(ring)(shore,point):[],note:ring>=0?'Akses pantai simulasi, bukan denai disahkan.':'Perhentian laut simulasi di lokasi tapak.'}}
const endpoints=[...ports.map(p=>({id:p.id,point:[p.lat,p.lng],island:'labuan'})),...Object.values(landings).map(p=>({id:p.siteId,point:p.point,island:p.island}))],sea=pathfinder(),routes={},walks={};
for(let i=0;i<endpoints.length;i++)for(let j=i+1;j<endpoints.length;j++){const a=endpoints[i],b=endpoints[j],key=[a.id,b.id].sort().join(':');if(a.island===b.island&&a.island==='labuan')continue;const path=sea(a.point,b.point);if(!validSeaPath(path))throw Error('Marine crossing land: '+key);routes[key]={from:a.id,to:b.id,path};console.log('Prepared sea corridor',key,path.length)}
for(let i=0;i<sites.length;i++)for(let j=i+1;j<sites.length;j++){const a=sites[i],b=sites[j];if(!a.access?.island||a.access.island!==b.access?.island)continue;const raw=landAt([a.lat,a.lng]),near=nearestShore([a.lat,a.lng]),ring=raw>=0?raw:near.distance<=8?near.ring:-1;if(ring>=0&&!a.access?.marineObservation&&!b.access?.marineObservation)walks[[a.id,b.id].sort().join(':')]={from:a.id,to:b.id,path:getLand(ring)([a.lat,a.lng],[b.lat,b.lng])}}
const output={ports,landings,routes,walks,metadata:{source:'User Google Maps pins and OpenStreetMap coastline snapshot',simulation:true,coastlineDate:'2026-11-26',note:'Game-only geometric sea corridors. No bathymetry, restricted-area, tide, safety or operator-track verification. Walking island access is illustrative.'}};
await writeFile(new URL('../dist/marine-data.mjs',import.meta.url),'// Generated game corridors; not marine navigation data.\nexport const MARINE_DATA='+JSON.stringify(output)+';\n');
console.log('Completed',Object.keys(routes).length,'sea corridors and',Object.keys(walks).length,'island walking links');
