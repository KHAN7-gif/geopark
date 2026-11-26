// Visual presets, not live weather or time of day.
export const SCENE_LOOKS={
 day:{name:'Siang',sky:'#78bce8',horizon:'#e0eee1',fog:'#d4e4d3',light:'#fff4d6',intensity:.48,sun:[1.5,170,48],water:'#43aeb9',shore:'#a4e5d4',green:'#789b55',brightness:1,saturation:.08},
 dusk:{name:'Senja',sky:'#8aa8c8',horizon:'#f4c69b',fog:'#d4cbb1',light:'#ffcf8c',intensity:.62,sun:[1.5,245,72],water:'#458f9e',shore:'#dce4bc',green:'#6d8a4e',brightness:.94,saturation:.13},
 night:{name:'Malam',sky:'#101f39',horizon:'#4b6280',fog:'#354f62',light:'#b1cce8',intensity:.32,sun:[1.5,145,48],water:'#214f67',shore:'#6b9fb4',green:'#354e44',brightness:.55,saturation:-.22}
};
export function sceneLook(id){return SCENE_LOOKS[id]||SCENE_LOOKS.dusk}
export function applySceneLook(map,id){
 const look=sceneLook(id);
 map.setSky?.({'sky-color':look.sky,'horizon-color':look.horizon,'fog-color':look.fog,'sky-horizon-blend':.65,'horizon-fog-blend':.6,'fog-ground-blend':.3});
 map.setLight?.({anchor:'map',color:look.light,intensity:look.intensity,position:look.sun});
 const paint=(layer,key,value)=>{if(map.getLayer(layer))map.setPaintProperty?.(layer,key,value)};
 paint('base','raster-brightness-max',look.brightness);paint('base','raster-saturation',look.saturation);
 paint('labuan-sea','fill-color',look.water);paint('labuan-shore','line-color',look.shore);
 paint('labuan-green','fill-color',look.green);
 paint('labuan-canopies','fill-extrusion-color',id==='night'?'#365649':'#578a49');
 paint('labuan-crown-tops','fill-extrusion-color',id==='night'?'#48705a':'#8da95a');
 paint('labuan-roofs','fill-extrusion-color',id==='night'?'#6e796f':['get','roofColor']);
 return look;
}
export function insetRing(ring,scale){
 const points=ring.slice(0,-1),x=points.reduce((s,p)=>s+p[0],0)/points.length,y=points.reduce((s,p)=>s+p[1],0)/points.length;
 return ring.map(p=>[x+(p[0]-x)*scale,y+(p[1]-y)*scale]);
}
export function scenicDetails(data){
 const features=[];
 for(const feature of data.features){
  const p=feature.properties,ring=feature.geometry.coordinates[0];
  if(p.kind==='building'){
   const id=Number(String(p.osm).split('/')[1])||0;
   features.push({type:'Feature',properties:{kind:'roof',height:p.height+.55,base:p.height,roofColor:['#9c745b','#6c8279','#b7986f','#a88a77'][id%4]},geometry:{type:'Polygon',coordinates:[insetRing(ring,.94)]}});
  }else if(p.kind==='canopy'){
   const id=Number(String(p.osm).split('/')[1])||0;
   features.push({type:'Feature',properties:{kind:'crown-top',height:p.height+1.2+(id%3)*.3,base:p.height-.45},geometry:{type:'Polygon',coordinates:[insetRing(ring,.68)]}});
  }
 }
 return {type:'FeatureCollection',features};
}
export function missionBeacons(sites,records,destination){
 const colours={G:'#dc6d9d',B:'#4e9fdb',C:'#71b77c'};
 return {type:'FeatureCollection',features:sites.map(site=>{
  const radius=site.id===destination?2.2:1.1,lat=site.lat,lng=site.lng;
  const ring=Array.from({length:9},(_,i)=>[lng+Math.cos(i*Math.PI/4)*radius/(111320*Math.cos(lat*Math.PI/180)),lat+Math.sin(i*Math.PI/4)*radius/111320]);ring[8]=[...ring[0]];
  return {type:'Feature',properties:{id:site.id,height:site.id===destination?16:records[site.id]?.done?3:7,color:site.id===destination?'#f2d38d':colours[site.id[0]]},geometry:{type:'Polygon',coordinates:[ring]}};
 })};
}
export function addCoastalScenery(map,data){
 map.addSource('labuan-coast',{type:'geojson',data,attribution:'Coast © OpenStreetMap contributors (ODbL)'});
 map.addLayer({id:'labuan-sea',type:'fill',source:'labuan-coast',filter:['==',['get','kind'],'sea'],paint:{'fill-color':'#458f9e','fill-opacity':['interpolate',['linear'],['zoom'],12,0,15,.94]}},'route-halo');
 map.addLayer({id:'labuan-shore',type:'line',source:'labuan-coast',filter:['==',['get','kind'],'shore'],paint:{'line-color':'#dce4bc','line-width':['interpolate',['linear'],['zoom'],11,1,17,3],'line-opacity':.72}},'route-halo');
 if(typeof document!=='undefined'&&map.addImage){
  const canvas=document.createElement('canvas');canvas.width=64;canvas.height=64;const ctx=canvas.getContext?.('2d');
  if(ctx){ctx.strokeStyle='rgba(235,255,248,.5)';ctx.lineWidth=1.4;
   for(let row=-1;row<5;row++){ctx.beginPath();for(let x=0;x<=64;x++){const y=row*16+8+Math.sin(x/64*Math.PI*2)*2.6;x?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke()}
   map.addImage('labuan-wave-pattern',ctx.getImageData(0,0,64,64));
   map.addLayer({id:'labuan-waves',type:'fill',source:'labuan-coast',filter:['==',['get','kind'],'sea'],minzoom:14,paint:{'fill-pattern':'labuan-wave-pattern','fill-opacity':.3,'fill-translate-anchor':'viewport'}},'route-halo');
  }
 }
}
