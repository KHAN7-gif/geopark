import {TOWN_PLACES} from './town-scene.mjs?v=merdeka-20261127';
import {addGameWorld,paintGameWorld} from './game-world.mjs?v=merdeka-20261127';
import {viewerPreferences,applyViewerLayers} from './map-viewer.mjs?v=merdeka-20261127';
import {MARINE_DATA} from './marine-data.mjs?v=merdeka-20261127';
import {jettyFeatures} from './jetty-scene.mjs?v=merdeka-20261127';
import {applyWeatherScene} from './weather-scene.mjs?v=merdeka-20261127';
import {SATELLITE_TILES,qualityProfile,applyAdvancedQuality,switchBasemap} from './advanced-map.mjs?v=merdeka-20261127';
import {createCameraDirector} from './camera-director.mjs?v=merdeka-20261127';
import {SCENE_LOOKS,applySceneLook,missionBeacons,addCoastalScenery} from './scenery.mjs?v=merdeka-20261127';
import {navigationHUD} from './navigation-hud.mjs?v=merdeka-20261127';
import {addSurroundingLayers,setSurroundingsVisible} from './surroundings.mjs?v=merdeka-20261127';
// All geographic data uses WGS84 coordinates. No invented coastlines or roads.
export const TERRAIN_TILES='https://elevation-tiles-prod.s3.amazonaws.com/terrarium/{z}/{x}/{y}.png';
export const BASEMAP_TILES='https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const lngLat=point=>[point[1],point[0]];
export function routeFeature(path=[]){return {type:'Feature',properties:{},geometry:{type:'LineString',coordinates:path.map(lngLat)}}}
let library;
function loadLibrary(){
  if(window.maplibregl)return Promise.resolve(window.maplibregl);
  if(library)return library;
  library=new Promise((resolve,reject)=>{
    const script=document.createElement('script');script.src=new URL('vendor/maplibre-gl.js',import.meta.url).href;
    const timeout=setTimeout(()=>{script.remove();reject(Error('3D library timeout'))},20000);
    script.onload=()=>{clearTimeout(timeout);window.maplibregl?resolve(window.maplibregl):reject(Error('3D unavailable'))};
    script.onerror=()=>{clearTimeout(timeout);script.remove();reject(Error('3D library unavailable'))};document.head.append(script);
  }).catch(error=>{library=null;throw error});return library;
}
export async function createJourney3D({element,onSelect,onInteract,onPlace=()=>{},onNotice,onFailure,onEnvironment=()=>{},onViewport=()=>{},layers=null,look='dusk',cameraMode='close',basemap='satellite',quality='auto',onBasemapChange=()=>{},reducedMotion=false}){
  const gl=await loadLibrary();const device={ratio:window.devicePixelRatio||1,memory:typeof navigator!=='undefined'?navigator.deviceMemory:0,cores:typeof navigator!=='undefined'?navigator.hardwareConcurrency:0};let graphics=qualityProfile(quality,device),basemapId=['game','street','satellite'].includes(basemap)?basemap:'game';
  const map=new gl.Map({container:element,center:[115.23,5.30],zoom:11.5,pitch:52,bearing:0,maxPitch:75,maxZoom:20,minZoom:8,
    maxBounds:[[114.85,4.95],[115.65,5.7]],canvasContextAttributes:{antialias:true},
    style:{version:8,sky:{'sky-color':'#80b4d6','horizon-color':'#e8e9c7','fog-color':'#d5dfcc','sky-horizon-blend':.55,'horizon-fog-blend':.6,'fog-ground-blend':.25},light:{anchor:'map',color:'#fff2d3',intensity:.45,position:[1.5,150,45]},sources:{
      basemap:{type:'raster',tiles:[BASEMAP_TILES],tileSize:256,maxzoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'},
      satellite:{type:'raster',tiles:[SATELLITE_TILES],tileSize:256,maxzoom:19,attribution:'Imagery © Esri, Vantor, Earthstar Geographics, and the GIS User Community'},
      elevation:{type:'raster-dem',tiles:[TERRAIN_TILES],tileSize:256,maxzoom:15,encoding:'terrarium',attribution:'Terrain: <a href="https://github.com/tilezen/joerd/blob/master/docs/attribution.md" target="_blank" rel="noopener">Mapzen / AWS Open Data</a>'}
    },layers:[{id:'base',type:'raster',source:'basemap',layout:{visibility:basemapId!=='satellite'?'visible':'none'}},{id:'base-satellite',type:'raster',source:'satellite',layout:{visibility:basemapId==='satellite'?'visible':'none'}},{id:'relief',type:'hillshade',source:'elevation',paint:{'hillshade-shadow-color':'#536747','hillshade-highlight-color':'#fff8df','hillshade-exaggeration':.3}}],terrain:{source:'elevation',exaggeration:1}}
  });
  let environmentData=null,roadData=null,village=null,villageLoading=false,villageFailed=false;
  let weatherState=null,visibleLayers=viewerPreferences({layers}).layers;
  function reportViewport(){if(destroyed)return;const center=map.getCenter?.()||{lat:5.30,lng:115.23};onViewport({lat:center.lat,lng:center.lng,zoom:map.getZoom?.()||11.5,bearing:map.getBearing(),pitch:map.getPitch?.()||52})}
  map.on('moveend',()=>{reportViewport();refreshTownLabels()});
  let lookId=SCENE_LOOKS[look]?look:'dusk',waveTimer=null,wavePhase=0;
  let loaded=false,destroyed=false,pending=null,previewRequested=false,placeRequested=null,placeZoom=17.9,lastRoute=null,lastDone='',terrainErrors=0,tileErrors=0,satelliteErrors=0;
  let townLabelKey='';const markers=new Map();let player=null,explorer=null,following=false,surroundings=true,environmentReady=false,heading=0;const environmentAbort=new AbortController();
  const director=createCameraDirector(map,{getState:()=>pending,isReady:()=>loaded,reducedMotion,frameRate:graphics.fps});director.setMode(cameraMode);
  const timeout=setTimeout(()=>{if(!loaded&&!destroyed)onFailure('Paparan 3D tidak dapat dimuatkan. Peta 2D dipulihkan.')},25000);
  map.addControl(new gl.NavigationControl({visualizePitch:true}),'top-right');
  // Stop the follow loop before a native control starts its own zoom animation.
  // zoomstart alone may not fire again while the follow camera is already zooming.
  function releaseCamera(){following=false;director.setFollowing(false);onInteract()}
  const container=map.getContainer?.();
  function beforeNavigation(event){if(event.target?.closest?.('.maplibregl-ctrl-zoom-in,.maplibregl-ctrl-zoom-out,.maplibregl-ctrl-compass')){releaseCamera();map.stop?.()}}
  container?.addEventListener('pointerdown',beforeNavigation,true);container?.addEventListener('click',beforeNavigation,true);
  map.on('dragstart',releaseCamera);map.on('zoomstart',e=>{if(e.originalEvent)releaseCamera()});map.on('pitchstart',e=>{if(e.originalEvent)releaseCamera()});map.on('rotatestart',e=>{if(e.originalEvent)releaseCamera()});
  map.on('error',e=>{
    if(destroyed)return;
    if(e.sourceId==='elevation'&&++terrainErrors===3){map.setTerrain(null);onNotice('Data ketinggian belum tersedia. Paparan condong diteruskan tanpa bentuk muka bumi 3D.')}
    else if(e.sourceId==='satellite'&&++satelliteErrors===3){basemapId=switchBasemap(map,'street');onBasemapChange('street');onNotice('Imejan satelit belum tersedia. Peta jalan dipulihkan.')}
    else if(e.sourceId==='basemap'&&++tileErrors===3)onNotice('Jubin peta belum tersedia. Semak sambungan internet atau kembali ke 2D.');
  });
  map.getCanvas().addEventListener('webglcontextlost',()=>{if(!destroyed)onFailure('Sokongan grafik 3D terhenti. Peta 2D dipulihkan.')});
  map.on('load',()=>{
    if(destroyed)return;loaded=true;clearTimeout(timeout);map.addSource('virtual-jetties',{type:'geojson',data:jettyFeatures()});map.addLayer({id:'virtual-jetty-decks',type:'fill-extrusion',source:'virtual-jetties',paint:{'fill-extrusion-color':['get','color'],'fill-extrusion-height':['get','height'],'fill-extrusion-base':['get','base'],'fill-extrusion-opacity':1}});
    paintWorldLook();applyAdvancedQuality(map,graphics,surroundings);switchBasemap(map,basemapId);
    map.addSource('mission-beacons',{type:'geojson',data:{type:'FeatureCollection',features:[]}});map.addLayer({id:'labuan-mission-beacons',type:'fill-extrusion',source:'mission-beacons',minzoom:15,paint:{'fill-extrusion-height':['get','height'],'fill-extrusion-base':0,'fill-extrusion-color':['get','color'],'fill-extrusion-opacity':.4}});
    for(const id of ['route','travelled'])map.addSource(id,{type:'geojson',data:{type:'FeatureCollection',features:[]}});
    map.addLayer({id:'route-halo',type:'line',source:'route',paint:{'line-color':'#fff9e8','line-width':9}});
    map.addLayer({id:'route-line',type:'line',source:'route',paint:{'line-color':'#315d3d','line-width':5,'line-dasharray':[2,1]}});
    map.addLayer({id:'travelled-line',type:'line',source:'travelled',paint:{'line-color':'#a46b32','line-width':5}});
    if(pending){sync(pending);if(!following&&!previewRequested&&!placeRequested)fit(pending.journey?.route.path||pending.sites.map(s=>[s.lat,s.lng]))}
    loadSurroundings();loadCoast();loadRoads();loadExplorer();reportViewport();if(placeRequested)focusPlace(placeRequested,placeZoom);else if(previewRequested)previewVillage();refreshTownLabels();
  });
  function sync(state){
    pending=state;if(!loaded||destroyed)return;
    const {sites,records,journey,position,profile,vehicle}=state;
    const metrics=journey?navigationHUD(journey,{position,index:state.index||0,waiting:!!state.waiting,arrived:!!state.arrived}):null;
    if(metrics?.heading)heading=metrics.heading.degrees;
    explorer?.sync({position,heading,mode:state.mode||journey?.route.mode||'walk',avatar:profile?.avatar||'rimba',journey,moving:!!journey&&journey.pausedAt===null&&!state.waiting&&!state.arrived});
    if(following&&position)chase(position);
    const key=sites.map(s=>`${s.id}:${!!records[s.id]?.done}:${journey?.toId===s.id}`).join('|');
    if(key!==lastDone){
      lastDone=key;map.getSource('mission-beacons').setData(missionBeacons(sites,records,journey?.toId));for(const marker of markers.values())marker.remove();markers.clear();townLabelKey='';
      for(const site of [...sites,...MARINE_DATA.jetties]){
        const button=document.createElement('button');button.type='button';button.className='geo3d-pin'+(journey?.toId===site.id?' target':'');
        button.style.setProperty('--pin-color',{G:'#b8427a',B:'#226da8',C:'#237b54'}[site.id[0]]||'#795733');
        button.textContent=(site.id.startsWith('J')?'⚓ ':'')+site.id+(records[site.id]?.done?' ✓':'');button.setAttribute('aria-label',`${site.id} · ${site.name}`);button.title=site.name;button.onclick=()=>onSelect(site);
        markers.set(site.id,new gl.Marker({element:button,anchor:'bottom',offset:site.kind==='island'?[35,0]:[0,0]}).setLngLat([site.lng,site.lat]).addTo(map));
      }refreshTownLabels();
    }
    applyViewerLayers(map,markers,visibleLayers);
    const route=journey?.route.path||null;
    if(route!==lastRoute){lastRoute=route;map.getSource('route').setData(route?routeFeature(route):{type:'FeatureCollection',features:[]})}
    const travelled=journey&&position?[...journey.route.path.slice(0,state.index+1),position]:null;
    map.getSource('travelled').setData(travelled?.length>1?routeFeature(travelled):{type:'FeatureCollection',features:[]});
    if(position){
      if(!player){const el=document.createElement('div');el.className='geo3d-player';player=new gl.Marker({element:el,anchor:'bottom'}).setLngLat(lngLat(position)).addTo(map)}
      const el=player.getElement();const identity=`${profile?.avatar}:${profile?.name}:${vehicle}`;
      if(el.dataset.identity!==identity){el.dataset.identity=identity;el.replaceChildren();if(profile){const img=document.createElement('img');img.src=new URL(`avatars/${profile.avatar}.svg`,import.meta.url).href;img.alt='';el.append(img)}const label=document.createElement('span');label.textContent=`${vehicle||'⌖'} ${profile?.name||'Penjelajah'}`;el.append(label)}
      player.setLngLat(lngLat(position));
    }else if(player){player.remove();player=null}
  }
  function focusPlace(point,zoom=17.9){placeZoom=Number.isFinite(zoom)?Math.max(8,Math.min(20,zoom)):17.9;following=false;director.setFollowing(false);placeRequested=point;if(!loaded)return;placeRequested=null;map.easeTo({center:point,zoom:placeZoom,pitch:52,bearing:25,padding:{top:0,right:0,bottom:100,left:0},duration:reducedMotion?0:1000})}
  function previewVillage(){placeRequested=null;following=false;director.setFollowing(false);previewRequested=true;if(!loaded)return;previewRequested=false;map.easeTo({center:[115.246,5.284],zoom:18.4,pitch:52,bearing:25,padding:{top:0,right:0,bottom:100,left:0},duration:reducedMotion?0:1000})}
  function fit(path){following=false;director.setFollowing(false);if(!loaded||!path?.length)return;const bounds=new gl.LngLatBounds();path.forEach(p=>bounds.extend(lngLat(p)));map.fitBounds(bounds,{padding:{top:110,right:60,bottom:window.innerWidth<760?290:200,left:60},maxZoom:14.5,pitch:52,bearing:map.getBearing(),duration:reducedMotion?0:700})}
  function refreshTownLabels(){
    if(!loaded||destroyed)return;
    const centre=map.getCenter?.()||{lng:pending?.position?.[1]||115.245,lat:pending?.position?.[0]||5.276};
    const near=!visibleLayers.places||(map.getZoom?.()||18)<15?[]:TOWN_PLACES.map(p=>({p,d:Math.hypot((p.geometry.coordinates[0]-centre.lng)*110850,(p.geometry.coordinates[1]-centre.lat)*111320)})).filter(o=>o.d<650).sort((a,b)=>({plaza:0,landmark:1,police:1,office:2,civic:3,shop:4}[a.p.properties.kind]-{plaza:0,landmark:1,police:1,office:2,civic:3,shop:4}[b.p.properties.kind])||a.d-b.d).slice(0,10);
    const key=near.map(o=>o.p.properties.osm).join('|');if(key===townLabelKey)return;townLabelKey=key;
    for(const [id,marker]of markers)if(id.startsWith('T:')){marker.remove();markers.delete(id)}
    for(const {p}of near){const button=document.createElement('button');button.type='button';button.className='town3d-label '+p.properties.kind;button.textContent=p.properties.name;button.title=p.properties.name;button.setAttribute('aria-label',p.properties.name);button.onclick=()=>onPlace(p);markers.set('T:'+p.properties.osm,new gl.Marker({element:button,anchor:'bottom',offset:[0,p.properties.kind==='landmark'?-55:-18]}).setLngLat(p.geometry.coordinates).addTo(map))}
  }
  async function loadSurroundings(){
    onEnvironment('Memuatkan bangunan dan kawasan hijau…');
    try{
      const response=await fetch(new URL('environment/labuan.geojson?v=town-20261127',import.meta.url),{signal:environmentAbort.signal});
      if(!response.ok)throw Error('Environment unavailable');const data=await response.json();if(destroyed)return;
      if(data.type!=='FeatureCollection'||!Array.isArray(data.features))throw Error('Invalid environment');
      environmentData=data;addSurroundingLayers(map,data);environmentReady=true;setSurroundingsVisible(map,surroundings);applyAdvancedQuality(map,graphics,surroundings);paintWorldLook();ensureVillage();
      onEnvironment('Dunia game berpandukan jalan, pantai dan tapak bangunan OSM. Bumbung cerun, tingkap, warna dan pokok tepi jalan ialah ilustrasi. Liputan bangunan OSM belum lengkap; kawasan tanpa data tidak ditambah rumah rekaan.');
    }catch(error){if(!destroyed&&error.name!=='AbortError')onEnvironment('Bangunan dan tumbuhan belum dimuatkan. Peta dan perjalanan kekal tersedia.')}
  }
  async function loadRoads(){
    try{const response=await fetch(new URL('environment/game-roads.geojson',import.meta.url),{signal:environmentAbort.signal});if(!response.ok)throw Error('Road scene unavailable');const data=await response.json();if(destroyed)return;if(data.type!=='FeatureCollection')throw Error('Invalid roads');roadData=data;addGameWorld(map,data);switchBasemap(map,basemapId);paintWorldLook();ensureVillage()}
    catch(error){if(!destroyed&&error.name!=='AbortError'){if(basemapId==='game'){basemapId='street';switchBasemap(map,'street');onBasemapChange('street')}onNotice('Dunia game belum dimuatkan. Peta jalan digunakan sementara.')}}
  }
  function applyVillageState(){
    const active=basemapId==='game'&&surroundings&&!!village&&!villageFailed;
    if(map.getLayer('game-building-shadows'))map.setLayoutProperty('game-building-shadows','visibility',basemapId==='game'&&surroundings?'visible':'none');
    village?.setEnabled(active);village?.setMood(lookId);
    for(const id of ['labuan-roofs','labuan-trunks','labuan-canopies','labuan-crown-tops','labuan-palm-fronds'])if(map.getLayer(id))map.setLayoutProperty(id,'visibility',active?'none':surroundings&&(graphics.details||!['labuan-roofs','labuan-crown-tops','labuan-palm-fronds'].includes(id))?'visible':'none');
  }
  async function ensureVillage(){
    if(village){applyVillageState();return}if(villageLoading||!environmentData||!roadData||basemapId!=='game'||destroyed)return;villageLoading=true;
    try{const {createVillageLayer}=await import('./village-layer.mjs?v=merdeka-20261127');if(destroyed)return;village=createVillageLayer(gl,{data:environmentData,roads:roadData,quality:graphics.level,onFailure:()=>{villageFailed=true;applyVillageState();onNotice('Perincian kampung tidak tersedia. Bangunan asas dan peta dikekalkan.')}});map.addLayer(village.layer);applyVillageState()}
    catch{villageFailed=true;onNotice('Bangunan asas digunakan pada peranti ini.')}
  }
  async function loadExplorer(){
    try{const {createExplorerLayer}=await import('./explorer-model.mjs?v=merdeka-20261127');if(destroyed)return;
      explorer=createExplorerLayer(gl,{reducedMotion,onFailure:()=>{element.classList.remove('has-explorer-model');onNotice('Model penjelajah tidak tersedia. Penanda avatar digunakan.') }});
      map.addLayer(explorer.layer);explorer.setMood?.(lookId);explorer.setFrameRate?.(graphics.fps);element.classList.add('has-explorer-model');if(pending)sync(pending);reportViewport();
    }catch{if(!destroyed){explorer=null;element.classList.remove('has-explorer-model');onNotice('Penanda avatar digunakan pada peranti ini.')}}
  }
  async function loadCoast(){
    try{const response=await fetch(new URL('environment/shoreline.geojson',import.meta.url),{signal:environmentAbort.signal});if(!response.ok)throw Error('Coast unavailable');const data=await response.json();if(destroyed)return;if(data.type!=='FeatureCollection')throw Error('Invalid coast');addCoastalScenery(map,data);setSurroundingsVisible(map,surroundings);applyAdvancedQuality(map,graphics,surroundings);paintWorldLook();applyVillageState();refreshWaves()}catch(error){if(!destroyed&&error.name!=='AbortError')onNotice('Kesan laut belum dimuatkan. Garis pantai peta asal dikekalkan.')}
  }
  function paintWorldLook(){applySceneLook(map,lookId);paintGameWorld(map,lookId);applyWeatherScene(map,lookId,weatherState);village?.setMood(lookId)}
  function refreshWaves(){clearInterval(waveTimer);waveTimer=null;if(!surroundings||graphics.level==='eco'||reducedMotion||destroyed||!map.getLayer('labuan-waves'))return;waveTimer=setInterval(()=>{if(typeof document!=='undefined'&&document.hidden)return;wavePhase=(wavePhase+1)%64;map.setPaintProperty('labuan-waves','fill-translate',[0,-wavePhase])},weatherState?.windKmh>20?115:160)}
  function chase(position,close=false){director.follow(position,heading)}
  return {sync,fit,previewVillage,focusPlace,setLayers(value){visibleLayers=viewerPreferences({layers:value}).layers;if(loaded){applyViewerLayers(map,markers,visibleLayers);refreshTownLabels()}},follow(position,close=false){following=true;if(loaded)chase(position,close)},setFollowing(value){following=!!value;director.setFollowing(value)},setCameraMode(id){director.setMode(id)},setBasemap(id){basemapId=['game','street','satellite'].includes(id)?id:'game';satelliteErrors=0;if(loaded){switchBasemap(map,basemapId);ensureVillage();applyVillageState()}},setQuality(id){graphics=qualityProfile(id,device);director.setFrameRate(graphics.fps);explorer?.setFrameRate?.(graphics.fps);if(loaded){applyAdvancedQuality(map,graphics,surroundings);village?.setQuality(graphics.level);applyVillageState()}refreshWaves()},setWeather(data){weatherState=data;if(loaded){paintWorldLook();refreshWaves()}},setLook(id){lookId=SCENE_LOOKS[id]?id:'dusk';if(loaded){paintWorldLook();explorer?.setMood?.(lookId)}},setSurroundings(value){surroundings=!!value;if(loaded){setSurroundingsVisible(map,surroundings);applyAdvancedQuality(map,graphics,surroundings);applyVillageState()}refreshWaves()},resize(){map.resize()},destroy(){destroyed=true;container?.removeEventListener('pointerdown',beforeNavigation,true);container?.removeEventListener('click',beforeNavigation,true);director.destroy();clearInterval(waveTimer);environmentAbort.abort();element.classList.remove('has-explorer-model');clearTimeout(timeout);map.remove()}};
}
