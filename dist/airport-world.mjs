import {AIRPORT_LAYOUT} from './environment/airport-layout.mjs?v=airport-20261127';
export const AIRPORT_LAYERS=['airport-apron','airport-taxiways','airport-taxi-centre','airport-runway','airport-runway-centre','airport-thresholds'];
export function addAirportWorld(map,data){
 const features=data.features.map(f=>({...f,properties:{...f.properties,renderWidth:f.properties.aeroway==='runway'?45:18}}));
 map.addSource('airport-ground',{type:'geojson',data:{type:'FeatureCollection',features},attribution:'Airport geometry © OpenStreetMap contributors (ODbL)'});
 const width=['interpolate',['exponential',2],['zoom'],10,['*',['get','renderWidth'],.00658],20,['*',['get','renderWidth'],6.58]];
 for(const layer of [{id:'airport-apron',type:'fill',filter:['==',['get','aeroway'],'apron'],paint:{'fill-color':'#c5c5b6'}},{id:'airport-taxiways',type:'line',filter:['==',['get','aeroway'],'taxiway'],paint:{'line-color':'#717b77','line-width':width}},{id:'airport-taxi-centre',type:'line',filter:['==',['get','aeroway'],'taxiway'],paint:{'line-color':'#ddc771','line-width':1}},{id:'airport-runway',type:'line',filter:['==',['get','aeroway'],'runway'],paint:{'line-color':'#465158','line-width':width}},{id:'airport-runway-centre',type:'line',filter:['==',['get','aeroway'],'runway'],paint:{'line-color':'#e4e6d7','line-width':1.5,'line-dasharray':[6,8]}}])map.addLayer({...layer,source:'airport-ground',minzoom:12,layout:layer.type==='line'?{visibility:'none','line-cap':'butt'}:{visibility:'none'}},'route-halo');
 // White threshold bars use the actual runway axis, with illustrative spacing.
 const a=AIRPORT_LAYOUT.runway[0],b=AIRPORT_LAYOUT.runway.at(-1),sx=110850,sy=111320,dx=(b[0]-a[0])*sx,dy=(b[1]-a[1])*sy,length=Math.hypot(dx,dy),u=[dx/length,dy/length],v=[-u[1],u[0]],at=(d,w)=>[a[0]+(u[0]*d+v[0]*w)/sx,a[1]+(u[1]*d+v[1]*w)/sy],stripes=[];
 for(const start of [45,length-75])for(const side of [-1,1])for(let n=0;n<4;n++){const w=side*(4+n*4),ring=[at(start,w-1.2),at(start+30,w-1.2),at(start+30,w+1.2),at(start,w+1.2),at(start,w-1.2)];stripes.push({type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[ring]}})}
 map.addSource('airport-markings',{type:'geojson',data:{type:'FeatureCollection',features:stripes}});map.addLayer({id:'airport-thresholds',type:'fill',source:'airport-markings',minzoom:14,layout:{visibility:'none'},paint:{'fill-color':'#eae9d8'}},'route-halo');
}
