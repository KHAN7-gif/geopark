import {execFileSync} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import {METAR_URL,MODEL_URL,normalizeMetar,normalizeModel} from '../dist/weather-engine.mjs';
async function read(url){const source="import urllib.request,sys; req=urllib.request.Request(sys.argv[1],headers={'User-Agent':'GeoparkLabuanWeather/1.0'}); print(urllib.request.urlopen(req,timeout=20).read().decode())";return JSON.parse(execFileSync('python3',['-c',source,url],{encoding:'utf8',timeout:25000,maxBuffer:200000}))}
let weather;
try{weather=normalizeMetar(await read(METAR_URL))}catch{weather=normalizeModel(await read(MODEL_URL))}
await writeFile(process.argv[2]||'/tmp/geopark-weather.json',JSON.stringify(weather,null,2)+'\n');
console.log(`Collected ${weather.provider} weather at ${new Date(weather.observedAt).toISOString()}`);
