import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeMetar,normalizeModel,weatherPresentation,labuanTimePhase,validateWeather,MAX_WEATHER_AGE} from '../dist/weather-engine.mjs';
import {createWeatherClient} from '../dist/weather-client.mjs';
import {decorateEnvironment,treeVariant} from '../dist/world-palette.mjs';
import {readFile} from 'node:fs/promises';
const timestamp=Date.parse('2026-11-26T16:00:00Z'),now=timestamp+20*60000;
const station={icaoId:'WBKL',obsTime:timestamp/1000,temp:26,wspd:3,cover:'FEW',clouds:[{cover:'FEW'}],rawOb:'METAR WBKL 261600Z 00000KT 9999 FEW017CB 26/25 Q1013'};
const model={current:{time:timestamp/1000,temperature_2m:26.8,weather_code:3,cloud_cover:99,precipitation:0,wind_speed_10m:3.4}};

test('WBKL observations distinguish clouds, rain and thunder without treating CB or a trend as lightning',()=>{
 const weather=normalizeMetar([station],now);assert.equal(weather.provider,'metar');assert.equal(weather.cloudCover,20);assert.equal(weather.raining,false);assert.equal(weather.condition,'cloudy');assert.equal(weatherPresentation(weather,now).description,'Sedikit awan');
 const storm=normalizeMetar([{...station,wxString:'+TSRA',cover:'BKN'}],now);assert.equal(storm.condition,'storm');assert.equal(storm.raining,true);
 const trend=normalizeMetar([{...station,rawOb:station.rawOb+' TEMPO 3000 TSRA'}],now);assert.notEqual(trend.condition,'storm');
 assert.throws(()=>normalizeMetar([station],timestamp+MAX_WEATHER_AGE+1));
 assert.equal(weatherPresentation(storm,timestamp+MAX_WEATHER_AGE+1).condition,'unknown');
});

test('model fallback is explicitly identified and Labuan light follows its local solar day',()=>{
 const weather=normalizeModel(model,now);assert.equal(weather.provider,'open-meteo');assert.equal(weatherPresentation(weather,now).description,'Mendung');assert.match(weatherPresentation(weather,now).source,/model/);
 assert.equal(labuanTimePhase(Date.parse('2026-11-26T02:00:00Z')).look,'day');
 assert.equal(labuanTimePhase(Date.parse('2026-11-26T08:00:00Z')).label,'Petang');
 assert.equal(labuanTimePhase(Date.parse('2026-11-26T16:00:00Z')).look,'night');
 assert.throws(()=>validateWeather({...weather,observedAt:now+3600000},now));
 assert.equal(normalizeModel({current:{...model.current,weather_code:95}},now).raining,false);
});

test('browser weather uses station snapshots first and falls back honestly when they are stale',async()=>{
 const entries=new Map(),storage={getItem:key=>entries.get(key)||null,setItem:(key,value)=>entries.set(key,value)},calls=[],updates=[];
 const snapshot=normalizeMetar([station],now);
 const client=createWeatherClient({now:()=>now,storage,onUpdate:w=>updates.push(w),fetchFn:async url=>{calls.push(url);return {ok:true,json:async()=>snapshot}}});
 assert.equal((await client.refresh()).provider,'metar');assert.equal(calls.length,1);assert.equal(updates.length,1);client.destroy();
 const fallback=createWeatherClient({now:()=>now,storage,onUpdate(){},fetchFn:async url=>({ok:true,json:async()=>url.includes('raw.githubusercontent')?{...snapshot,observedAt:now-2*MAX_WEATHER_AGE}:model})});
 assert.equal((await fallback.refresh()).provider,'open-meteo');fallback.destroy();
 const offline=createWeatherClient({now:()=>now+2*MAX_WEATHER_AGE,storage,onUpdate(){},fetchFn:async()=>{throw Error('offline')}});
 assert.equal(await offline.refresh(),null);offline.destroy();
});

test('building colours and three tree styles vary without moving source features',async()=>{
 const original=JSON.parse(await readFile(new URL('../dist/environment/labuan.geojson',import.meta.url))),snapshot=JSON.stringify(original),decorated=decorateEnvironment(original);
 const buildings=decorated.features.filter(f=>f.properties.kind==='building');assert.ok(new Set(buildings.map(f=>f.properties.facadeColor)).size>=6);
 const trees=original.features.filter(f=>f.properties.kind==='canopy');assert.deepEqual(new Set(trees.map(f=>treeVariant(f).type)),new Set(['broadleaf','dense','palm']));
 assert.equal(JSON.stringify(original),snapshot);assert.deepEqual(decorated.features[0].geometry,original.features[0].geometry);
});
