import {SCENE_LOOKS} from './scenery.mjs?v=zoom-fix-20261127';
function blend(a,b,amount){const parts=hex=>hex.slice(1).match(/../g).map(v=>parseInt(v,16));const x=parts(a),y=parts(b);return '#'+x.map((v,i)=>Math.round(v+(y[i]-v)*amount).toString(16).padStart(2,'0')).join('')}
export function applyWeatherScene(map,lookId,weather){
 if(!weather||weather.condition==='unknown')return;
 const base=SCENE_LOOKS[lookId]||SCENE_LOOKS.dusk,cloud=Math.max(0,Math.min(1,(weather.cloudCover||0)/100)),storm=weather.condition==='storm',amount=Math.min(.8,cloud*.55+(weather.raining?.13:0)+(storm?.1:0));
 const sky=blend(base.sky,lookId==='night'?'#40516b':'#8298a8',amount),fog=blend(base.fog,'#a1b4bf',amount*.65);
 map.setSky?.({'sky-color':sky,'horizon-color':blend(base.horizon,'#a2b2b8',amount),'fog-color':fog,'sky-horizon-blend':.65,'horizon-fog-blend':.6,'fog-ground-blend':weather.condition==='fog'?.6:.3});
 map.setLight?.({anchor:'map',color:base.light,intensity:base.intensity*(1-cloud*.23),position:base.sun});
 for(const id of ['base','base-satellite'])if(map.getLayer(id))map.setPaintProperty?.(id,'raster-brightness-max',base.brightness*(weather.raining?.92:1));
}
