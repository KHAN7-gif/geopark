import {GAME_MAP_LAYERS} from './game-world.mjs?v=camera-20261127';
export const SATELLITE_TILES='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
export const CAMERA_MODES={village:{name:'Kampung',pitch:52,zoom:18.4},close:{name:'Dekat',pitch:67,zoom:19.1},drone:{name:'Dron',pitch:48,zoom:17.1},orbit:{name:'Orbit',pitch:61,zoom:18.4}};
export function qualityProfile(choice='auto',device={}){
 const requested=['auto','eco','high'].includes(choice)?choice:'auto';
 const low=(device.memory>0&&device.memory<=2)||(device.cores>0&&device.cores<=4);
 const level=requested==='eco'||requested==='auto'&&low?'eco':requested==='high'?'high':'balanced';
 return {requested,level,pixelRatio:Math.min(device.ratio||1,level==='eco'?1:level==='high'?2:1.5),fps:level==='eco'?15:level==='high'?45:30,details:level!=='eco'};
}
export function cameraPose({mode='close',position,heading=0,currentBearing=0,orbitDegrees=0,reducedMotion=false,width=1024}){
 const preset=CAMERA_MODES[mode]||CAMERA_MODES.close;
 const desired=heading+(mode==='village'?25:0)+(mode==='orbit'?(reducedMotion?35:orbitDegrees):0);
 const bearing=currentBearing+((desired-currentBearing+540)%360-180);
 return {center:[position[1],position[0]],bearing,pitch:preset.pitch,zoom:preset.zoom,padding:{top:0,right:0,bottom:width<760?130:90,left:0}};
}
export function applyAdvancedQuality(map,profile,surroundings=true){
 map.setPixelRatio?.(profile.pixelRatio);
 for(const id of ['labuan-roofs','labuan-crown-tops','labuan-palm-fronds','labuan-waves'])if(map.getLayer(id))map.setLayoutProperty(id,'visibility',surroundings&&profile.details?'visible':'none');
 for(const id of ['labuan-buildings','labuan-canopies'])if(map.getLayer(id))map.setLayerZoomRange?.(id,profile.level==='high'?13.5:id==='labuan-buildings'?14:15,24);
}
export function switchBasemap(map,choice){
 const selected=['game','satellite','street'].includes(choice)?choice:'street',game=selected==='game'&&!!map.getLayer('game-roads'),satellite=selected==='satellite';
 if(map.getLayer('base'))map.setLayoutProperty('base','visibility',!satellite&&!game?'visible':'none');
 if(map.getLayer('base-satellite'))map.setLayoutProperty('base-satellite','visibility',satellite?'visible':'none');
 if(map.getLayer('relief'))map.setLayoutProperty('relief','visibility',game?'none':'visible');
 for(const id of GAME_MAP_LAYERS)if(map.getLayer(id))map.setLayoutProperty(id,'visibility',game?'visible':'none');
 return selected;
}
