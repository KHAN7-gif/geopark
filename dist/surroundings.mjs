import {decorateEnvironment} from './world-palette.mjs?v=merdeka-four-20261127';
import {scenicDetails} from './scenery.mjs?v=merdeka-four-20261127';
export const SURROUNDING_LAYERS=['game-building-shadows','labuan-green','labuan-buildings','labuan-trunks','labuan-canopies','labuan-roofs','labuan-crown-tops','labuan-palm-fronds','labuan-sea','labuan-shore','labuan-waves','labuan-mission-beacons'];
export function addSurroundingLayers(map,data){
  map.addSource('labuan-surroundings',{type:'geojson',data:decorateEnvironment(data),attribution:'Environment © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a> (ODbL)'});
  map.addLayer({id:'labuan-green',type:'fill',source:'labuan-surroundings',minzoom:12,filter:['==',['get','kind'],'green'],paint:{'fill-color':'#688a53','fill-opacity':.35}},map.getLayer('town-square-grass')?'town-square-grass':map.getLayer('game-road-edge')?'game-road-edge':'route-halo');
  map.addLayer({id:'game-building-shadows',type:'fill',source:'labuan-surroundings',minzoom:15,layout:{visibility:'none'},filter:['==',['get','kind'],'building'],paint:{'fill-color':'#263c32','fill-opacity':.18,'fill-translate':[5,6]}},'route-halo');
  for(const [kind,id,colour,minzoom] of [['building','labuan-buildings',null,14],['trunk','labuan-trunks','#7b603c',16],['canopy','labuan-canopies',['get','canopyColor'],15]]){
    map.addLayer({id,type:'fill-extrusion',source:'labuan-surroundings',minzoom,filter:['==',['get','kind'],kind],paint:{'fill-extrusion-color':colour||['get','facadeColor'],'fill-extrusion-height':['get','height'],'fill-extrusion-base':['get','base'],'fill-extrusion-opacity':kind==='building'?.94:1}});
  }
  map.addSource('labuan-details',{type:'geojson',data:scenicDetails(data)});
  for(const [id,kind,colour,zoom]of [['labuan-roofs','roof',['get','roofColor'],15],['labuan-crown-tops','crown-top',['get','colour'],15],['labuan-palm-fronds','palm-frond',['get','colour'],15]])map.addLayer({id,type:'fill-extrusion',source:'labuan-details',minzoom:zoom,filter:['==',['get','kind'],kind],paint:{'fill-extrusion-color':colour,'fill-extrusion-height':['get','height'],'fill-extrusion-base':['get','base'],'fill-extrusion-opacity':1}});
}
export function setSurroundingsVisible(map,visible){for(const id of SURROUNDING_LAYERS)if(map.getLayer(id))map.setLayoutProperty(id,'visibility',visible?'visible':'none')}
