import {scenicDetails} from './scenery.mjs?v=scenery-20261126';
export const SURROUNDING_LAYERS=['labuan-green','labuan-buildings','labuan-trunks','labuan-canopies','labuan-roofs','labuan-crown-tops','labuan-sea','labuan-shore','labuan-waves','labuan-mission-beacons'];
export function addSurroundingLayers(map,data){
  map.addSource('labuan-surroundings',{type:'geojson',data,attribution:'Environment © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a> (ODbL)'});
  map.addLayer({id:'labuan-green',type:'fill',source:'labuan-surroundings',minzoom:12,filter:['==',['get','kind'],'green'],paint:{'fill-color':'#688a53','fill-opacity':.35}},'route-halo');
  for(const [kind,id,colour,minzoom] of [['building','labuan-buildings',null,14],['trunk','labuan-trunks','#7b603c',16],['canopy','labuan-canopies','#608644',15]]){
    map.addLayer({id,type:'fill-extrusion',source:'labuan-surroundings',minzoom,filter:['==',['get','kind'],kind],paint:{'fill-extrusion-color':colour||['get','color'],'fill-extrusion-height':['get','height'],'fill-extrusion-base':['get','base'],'fill-extrusion-opacity':kind==='building'?.94:1}});
  }
  map.addSource('labuan-details',{type:'geojson',data:scenicDetails(data)});
  for(const [id,kind,colour,zoom]of [['labuan-roofs','roof',['get','roofColor'],15],['labuan-crown-tops','crown-top','#8da95a',15]])map.addLayer({id,type:'fill-extrusion',source:'labuan-details',minzoom:zoom,filter:['==',['get','kind'],kind],paint:{'fill-extrusion-color':colour,'fill-extrusion-height':['get','height'],'fill-extrusion-base':['get','base'],'fill-extrusion-opacity':1}});
}
export function setSurroundingsVisible(map,visible){for(const id of SURROUNDING_LAYERS)if(map.getLayer(id))map.setLayoutProperty(id,'visibility',visible?'visible':'none')}
