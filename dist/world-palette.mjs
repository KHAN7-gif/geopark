import {merdekaTreeAllowed} from './merdeka-layout.mjs?v=admintravel-20261127';
import {marlinTreeAllowed} from './marlin-layout.mjs?v=admintravel-20261127';
import {dataranTreeAllowed} from './dataran-layout.mjs?v=admintravel-20261127';
import {buildingStyle,buildingHeight} from './building-types.mjs?v=admintravel-20261127';
const FACADES=['#e9ae92','#9bcba9','#86c7cb','#a2c7e4','#efd294','#c0afd8','#d89d81','#eee2c6'];
const ROOFS=['#b65e4d','#587b91','#b88155','#599475','#8d789d','#dbb971'];
const GREENS=['#43885b','#69a052','#4b927e','#7da654','#39856e','#8bae62'];
function hash(value){let h=2166136261;for(const c of String(value)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
export function shade(hex,factor){return '#'+hex.slice(1).match(/../g).map(v=>Math.round(parseInt(v,16)*factor).toString(16).padStart(2,'0')).join('')}
export function treeCentre(feature){const ring=feature.geometry.coordinates[0],xs=ring.map(p=>p[0]),ys=ring.map(p=>p[1]);return [(Math.min(...xs)+Math.max(...xs))/2,(Math.min(...ys)+Math.max(...ys))/2]}
export function treeVariant(feature){const centre=treeCentre(feature),seed=hash(`${feature.properties.osm}:${centre[0].toFixed(4)}:${centre[1].toFixed(4)}`);const type=['broadleaf','dense','palm'][seed%3];return {type,colour:GREENS[seed%GREENS.length],height:type==='palm'?8.5+(seed%3)*.6:6+(seed%4)*.6,seed}}
export function buildingPalette(osm){const id=hash(osm);return {facade:FACADES[id%FACADES.length],roof:ROOFS[Math.floor(id/8)%ROOFS.length]}}
export function decorateEnvironment(data){return {...data,features:data.features.filter(f=>!['canopy','trunk'].includes(f.properties.kind)||dataranTreeAllowed(treeCentre(f))&&marlinTreeAllowed(treeCentre(f))&&merdekaTreeAllowed(treeCentre(f))).map(feature=>{
 const p=feature.properties;
 if(p.kind==='building'){const style=buildingStyle(p);return {...feature,properties:{...p,height:buildingHeight(p),buildingType:style.kind,facadeColor:style.facade||buildingPalette(p.osm).facade}};}
 if(p.kind==='canopy'||p.kind==='trunk'){
  const tree=treeVariant(feature);return {...feature,properties:{...p,treeType:tree.type,height:p.kind==='trunk'?(tree.type==='palm'?tree.height-.3:3):tree.height,base:p.kind==='canopy'?(tree.type==='palm'?tree.height-.6:2.5):0,canopyColor:tree.colour,canopyNightColor:shade(tree.colour,.8)}};
 }return feature;
})}}
