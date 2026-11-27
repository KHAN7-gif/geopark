import {PERBADANAN_PLACE} from './perbadanan-layout.mjs?v=marina-20261127';
import {MERDEKA_PLACE} from './merdeka-layout.mjs?v=marina-20261127';
import {MARLIN_PLACE} from './marlin-layout.mjs?v=marina-20261127';
import {dataranForecourt} from './dataran-layout.mjs?v=marina-20261127';
import {TOWN_DATA} from './environment/town-data.mjs?v=marina-20261127';
export const TOWN_LAYERS=['town-square-grass','town-square-path','town-square-plinth'];
export const TOWN_PLACES=[...TOWN_DATA.features.filter(f=>f.geometry.type==='Point'),MARLIN_PLACE,MERDEKA_PLACE,PERBADANAN_PLACE];
export function plazaCentre(ring){const p=ring.slice(0,-1);return p.reduce((sum,q)=>[sum[0]+q[0]/p.length,sum[1]+q[1]/p.length],[0,0])}
export function townGround(){const features=[];for(const f of TOWN_DATA.features.filter(f=>f.geometry.type==='Polygon')){const ring=f.geometry.coordinates[0],c=plazaCentre(ring),path=ring.map(p=>[c[0]+(p[0]-c[0])*.9,c[1]+(p[1]-c[1])*.9]),circle=dataranForecourt();features.push({...f,properties:{...f.properties,part:'grass'}},{type:'Feature',properties:{part:'path'},geometry:{type:'LineString',coordinates:path}},{type:'Feature',properties:{part:'plinth'},geometry:{type:'Polygon',coordinates:[circle]}})}return {type:'FeatureCollection',features}}
export function addTownSquare(map){map.addSource('town-square',{type:'geojson',data:townGround(),attribution:'Dataran footprint © OpenStreetMap contributors; furniture and paths illustrative'});for(const layer of [{id:'town-square-grass',type:'fill',filter:['==',['get','part'],'grass'],paint:{'fill-color':'#8fb169'}},{id:'town-square-path',type:'line',filter:['==',['get','part'],'path'],paint:{'line-color':'#d4c49e','line-width':['interpolate',['exponential',2],['zoom'],14,1,20,35]}},{id:'town-square-plinth',type:'fill',filter:['==',['get','part'],'plinth'],paint:{'fill-color':'#b4bf93'}}])map.addLayer({...layer,source:'town-square',minzoom:14,layout:{visibility:'none'}},'game-road-edge')}
