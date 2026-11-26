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
export async function createJourney3D({element,onSelect,onInteract,onNotice,onFailure,reducedMotion=false}){
  const gl=await loadLibrary();
  const map=new gl.Map({container:element,center:[115.23,5.30],zoom:11.5,pitch:52,bearing:0,maxPitch:70,maxZoom:18,minZoom:8,
    maxBounds:[[114.85,4.95],[115.65,5.7]],canvasContextAttributes:{antialias:true},
    style:{version:8,sources:{
      basemap:{type:'raster',tiles:[BASEMAP_TILES],tileSize:256,maxzoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'},
      elevation:{type:'raster-dem',tiles:[TERRAIN_TILES],tileSize:256,maxzoom:15,encoding:'terrarium',attribution:'Terrain: <a href="https://github.com/tilezen/joerd/blob/master/docs/attribution.md" target="_blank" rel="noopener">Mapzen / AWS Open Data</a>'}
    },layers:[{id:'base',type:'raster',source:'basemap'},{id:'relief',type:'hillshade',source:'elevation',paint:{'hillshade-shadow-color':'#536747','hillshade-highlight-color':'#fff8df','hillshade-exaggeration':.3}}],terrain:{source:'elevation',exaggeration:1}}
  });
  let loaded=false,destroyed=false,pending=null,lastRoute=null,lastDone='',terrainErrors=0,tileErrors=0;
  const markers=new Map();let player=null;
  const timeout=setTimeout(()=>{if(!loaded&&!destroyed)onFailure('Paparan 3D tidak dapat dimuatkan. Peta 2D dipulihkan.')},25000);
  map.addControl(new gl.NavigationControl({visualizePitch:true}),'top-right');
  map.on('dragstart',onInteract);map.on('rotatestart',e=>{if(e.originalEvent)onInteract()});
  map.on('error',e=>{
    if(destroyed)return;
    if(e.sourceId==='elevation'&&++terrainErrors===3){map.setTerrain(null);onNotice('Data ketinggian belum tersedia. Paparan condong diteruskan tanpa bentuk muka bumi 3D.')}
    else if(e.sourceId==='basemap'&&++tileErrors===3)onNotice('Jubin peta belum tersedia. Semak sambungan internet atau kembali ke 2D.');
  });
  map.getCanvas().addEventListener('webglcontextlost',()=>{if(!destroyed)onFailure('Sokongan grafik 3D terhenti. Peta 2D dipulihkan.')});
  map.on('load',()=>{
    if(destroyed)return;loaded=true;clearTimeout(timeout);
    for(const id of ['route','travelled'])map.addSource(id,{type:'geojson',data:{type:'FeatureCollection',features:[]}});
    map.addLayer({id:'route-halo',type:'line',source:'route',paint:{'line-color':'#fff9e8','line-width':9}});
    map.addLayer({id:'route-line',type:'line',source:'route',paint:{'line-color':'#315d3d','line-width':5,'line-dasharray':[2,1]}});
    map.addLayer({id:'travelled-line',type:'line',source:'travelled',paint:{'line-color':'#a46b32','line-width':5}});
    if(pending){sync(pending);fit(pending.journey?.route.path||pending.sites.map(s=>[s.lat,s.lng]))}
  });
  function sync(state){
    pending=state;if(!loaded||destroyed)return;
    const {sites,records,journey,position,profile,vehicle}=state;
    const key=sites.map(s=>`${s.id}:${!!records[s.id]?.done}:${journey?.toId===s.id}`).join('|');
    if(key!==lastDone){
      lastDone=key;for(const marker of markers.values())marker.remove();markers.clear();
      for(const site of sites){
        const button=document.createElement('button');button.type='button';button.className='geo3d-pin'+(journey?.toId===site.id?' target':'');
        button.style.setProperty('--pin-color',{G:'#b8427a',B:'#226da8',C:'#237b54'}[site.id[0]]);
        button.textContent=site.id+(records[site.id]?.done?' ✓':'');button.setAttribute('aria-label',`${site.id} · ${site.name}`);button.title=site.name;button.onclick=()=>onSelect(site);
        markers.set(site.id,new gl.Marker({element:button,anchor:'bottom'}).setLngLat([site.lng,site.lat]).addTo(map));
      }
    }
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
  function fit(path){if(!loaded||!path?.length)return;const bounds=new gl.LngLatBounds();path.forEach(p=>bounds.extend(lngLat(p)));map.fitBounds(bounds,{padding:{top:110,right:60,bottom:window.innerWidth<760?290:200,left:60},maxZoom:14.5,pitch:52,bearing:map.getBearing(),duration:reducedMotion?0:700})}
  return {sync,fit,follow(position,close=false){if(loaded)map.easeTo({center:lngLat(position),...(close?{zoom:15}:{}),duration:reducedMotion?0:600})},resize(){map.resize()},destroy(){destroyed=true;clearTimeout(timeout);map.remove()}};
}
