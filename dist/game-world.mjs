import {surfacePixels} from './surface-textures.mjs?v=town3d-20261127';
import {TOWN_LAYERS,addTownSquare} from './town-scene.mjs?v=town3d-20261127';
import {LAND_RINGS} from './marine-coast.mjs?v=town3d-20261127';
export const GAME_MAP_LAYERS=['game-ocean','game-land','game-road-edge','game-roads','game-asphalt','game-road-markings',...TOWN_LAYERS];
export function addGameWorld(map,roads){
 map.addSource('game-land',{type:'geojson',data:{type:'FeatureCollection',features:LAND_RINGS.map(ring=>({type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[ring]}}))},attribution:'Land & roads © OpenStreetMap contributors (ODbL)'});
 map.addLayer({id:'game-ocean',type:'background',layout:{visibility:'none'},paint:{'background-color':'#2bc8c3'}},'base');
 map.addLayer({id:'game-land',type:'fill',source:'game-land',layout:{visibility:'none'},paint:{'fill-color':'#92bd60','fill-opacity':1}},map.getLayer('labuan-green')?'labuan-green':'route-halo');
 map.addSource('game-roads',{type:'geojson',data:roads});
 const width=extra=>['interpolate',['exponential',2],['zoom'],10,['*',['+',['get','width'],extra],.00658],20,['*',['+',['get','width'],extra],6.58]];
 map.addLayer({id:'game-road-edge',type:'line',source:'game-roads',layout:{visibility:'none','line-join':'round','line-cap':'round'},paint:{'line-color':'#d0c3a0','line-width':width(1.4)}},'route-halo');
 map.addLayer({id:'game-roads',type:'line',source:'game-roads',layout:{visibility:'none','line-join':'round','line-cap':'round'},paint:{'line-color':['case',['get','foot'],'#bba67a','#485255'],'line-width':width(0)}},'route-halo');
 // Grain is only applied to vehicular streets; footpaths retain their palette.
 {map.addImage?.('labuan-asphalt',surfacePixels('asphalt'),{pixelRatio:2});map.addLayer({id:'game-asphalt',type:'line',source:'game-roads',minzoom:17,filter:['==',['get','foot'],false],layout:{visibility:'none','line-join':'round','line-cap':'round'},paint:{'line-pattern':'labuan-asphalt','line-width':width(0)}},'route-halo')}
 map.addLayer({id:'game-road-markings',type:'line',source:'game-roads',minzoom:16,filter:['all',['==',['get','foot'],false],['>=',['get','width'],5.5]],layout:{visibility:'none','line-join':'round'},paint:{'line-color':'#f5ebba','line-width':['interpolate',['linear'],['zoom'],16,.7,20,2],'line-dasharray':[4,6],'line-opacity':.85}},'route-halo');
 addTownSquare(map);
}
export function paintGameWorld(map,id){for(const [layer,key,value]of [['game-land','fill-color',id==='night'?'#345b49':id==='dusk'?'#93aa60':'#92bd60'],['game-ocean','background-color',id==='night'?'#1c7690':'#2bc8c3']])if(map.getLayer(layer))map.setPaintProperty?.(layer,key,value)}
