import {depthShadows} from './depth-scene.mjs?v=annur-20261128';
import {decorateEnvironment} from './world-palette.mjs?v=annur-20261128';
import {scenicDetails} from './scenery.mjs?v=annur-20261128';
export const SURROUNDING_LAYERS=['game-building-shadows','labuan-green','labuan-buildings','labuan-trunks','labuan-canopies','labuan-roofs','labuan-crown-tops','labuan-palm-fronds','labuan-sea','labuan-shore','labuan-waves','labuan-mission-beacons'];
export function addSurroundingLayers(map,data){
  map.addSource('labuan-surroundings',{type:'geojson',data:decorateEnvironment(data),attribution:'Environment © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a> (ODbL)'});
  map.addLayer({id:'labuan-green',type:'fill',source:'labuan-surroundings',minzoom:12,filter:['==',['get','kind'],'green'],paint:{'fill-color':'#688a53','fill-opacity':.35}},map.getLayer('town-square-grass')?'town-square-grass':map.getLayer('game-road-edge')?'game-road-edge':'route-halo');
  map.addSource('labuan-depth-shadows',{type:'geojson',data:depthShadows(data,'day')});
  map.addLayer({id:'game-building-shadows',type:'fill',source:'labuan-depth-shadows',minzoom:15,layout:{visibility:'none'},paint:{'fill-color':'#203b39','fill-opacity':.24,'fill-antialias':true}},'route-halo');
  for(const [kind,id,colour,minzoom] of [['building','labuan-buildings',null,14],['trunk','labuan-trunks','#7b603c',16],['canopy','labuan-canopies',['get','canopyColor'],15]]){
    map.addLayer({id,type:'fill-extrusion',source:'labuan-surroundings',minzoom,filter:['==',['get','kind'],kind],paint:{'fill-extrusion-color':colour||['get','facadeColor'],'fill-extrusion-height':['get','height'],'fill-extrusion-base':['get','base'],'fill-extrusion-opacity':1,'fill-extrusion-vertical-gradient':true}});
  }
  map.addSource('labuan-details',{type:'geojson',data:scenicDetails(data)});
  for(const [id,kind,colour,zoom]of [['labuan-roofs','roof',['get','roofColor'],15],['labuan-crown-tops','crown-top',['get','colour'],15],['labuan-palm-fronds','palm-frond',['get','colour'],15]])map.addLayer({id,type:'fill-extrusion',source:'labuan-details',minzoom:zoom,filter:['==',['get','kind'],kind],paint:{'fill-extrusion-color':colour,'fill-extrusion-height':['get','height'],'fill-extrusion-base':['get','base'],'fill-extrusion-opacity':1}});
}
export function setSurroundingsVisible(map,visible){for(const id of SURROUNDING_LAYERS)if(map.getLayer(id))map.setLayoutProperty(id,'visibility',visible?'visible':'none')}
