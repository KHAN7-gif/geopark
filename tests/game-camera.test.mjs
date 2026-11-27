import test from 'node:test';
import assert from 'node:assert/strict';
import {captureMapPhoto,photoLabel,photoFilename} from '../dist/game-camera.mjs';
import {validGamePhoto,createGameAlbum} from '../dist/game-album.mjs';
function fixture({width=3000,height=2000,blob=true,security=false,render=true,loaded=true}={}){
 const events=new Map(),texts=[],calls=[],context={fillRect(){},fillText(...args){texts.push(args[0])},drawImage(source){calls.push(source);if(security){const error=Error('Tainted');error.name='SecurityError';throw error}}},canvas={getContext:()=>context,toBlob(fn,type){queueMicrotask(()=>fn(blob?new Blob(['jpeg'],{type}):null))}},source={width,height},map={on(type,fn){events.set(type,fn)},off(type){events.delete(type)},getCanvas:()=>source,isStyleLoaded:()=>loaded,triggerRepaint(){if(render)events.get('render')?.()}};
 return {map,events,canvas,source,texts,calls,document:{createElement:()=>canvas}};
}
test('photo copies the live WebGL canvas during render, limits resolution and retains map credits',async()=>{
 const f=fixture(),photo=await captureMapPhoto(f.map,{document:f.document,title:'Dataran Labuan',attribution:'© OpenStreetMap contributors',now:Date.parse('2026-11-27T02:00:00Z')});assert.equal(f.calls[0],f.source);assert.equal(photo.width,1600);assert.equal(photo.height,1067);assert.equal(photo.blob.type,'image/jpeg');assert.ok(f.texts.includes('Dataran Labuan'));assert.ok(f.texts.some(s=>s.includes('OpenStreetMap')));assert.ok(f.texts.some(s=>s.includes('JELAJAH LABUAN')));assert.equal(f.events.size,0);
});
test('camera reports missing frames, denied image capture, loading maps and timeout without leaving listeners',async()=>{
 for(const options of [{width:0},{blob:false},{security:true},{loaded:false},{render:false}]){const f=fixture(options);await assert.rejects(captureMapPhoto(f.map,{document:f.document,timeoutMs:5}));assert.equal(f.events.size,0)}
 const f=fixture({render:false}),pending=captureMapPhoto(f.map,{document:f.document});f.events.get('remove')();await assert.rejects(pending,/ditutup/);assert.equal(f.events.size,0);
});
test('photo metadata only labels a nearby mapped location and generates safe filenames',()=>{
 const places=[{properties:{name:'Dataran'},geometry:{coordinates:[115.2449,5.27625]}}];assert.equal(photoLabel({lng:115.2449,lat:5.27625},places),'Dataran');assert.equal(photoLabel({lng:115.3,lat:5.4},places),'Panorama Labuan');assert.equal(photoLabel(null,places),'Panorama Labuan');assert.equal(photoFilename('../Foo <bar> / test'),'jelajah-labuan-foo-bar-test.jpg');
});
test('album accepts only bounded JPEG photos and provides a readable fallback when storage is unavailable',async()=>{
 const photo={id:'id1',title:'Labuan',capturedAt:Date.now(),blob:new Blob(['jpeg'],{type:'image/jpeg'}),width:800,height:600};assert.ok(validGamePhoto(photo));for(const changed of [{width:1700},{height:0},{title:''},{blob:new Blob(['no'],{type:'text/html'})},{capturedAt:NaN}])assert.equal(validGamePhoto({...photo,...changed}),false);
 const album=createGameAlbum(null);await assert.rejects(album.list(),/Storan album/);await assert.rejects(album.save({...photo,title:''}),/tidak sah/);
});
