export const METAR_URL='https://aviationweather.gov/api/data/metar?ids=WBKL&format=json';
export const MODEL_URL='https://api.open-meteo.com/v1/forecast?latitude=5.2831&longitude=115.2308&current=temperature_2m,precipitation,weather_code,cloud_cover,wind_speed_10m&timezone=Asia%2FKuching&timeformat=unixtime';
export const WEATHER_SNAPSHOT_URL='https://raw.githubusercontent.com/KHAN7-gif/geopark/weather-data/weather.json';
export const MAX_WEATHER_AGE=90*60*1000;
const finite=(n,min,max)=>typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max;
export function validateWeather(raw,now=Date.now()){
 if(raw?.version!==1||!['metar','open-meteo'].includes(raw.provider)||!finite(raw.observedAt,now-MAX_WEATHER_AGE,now+15*60000)||!['clear','cloudy','rain','storm','fog'].includes(raw.condition)||typeof raw.raining!=='boolean'||!finite(raw.cloudCover,0,100))throw Error('Weather unavailable or stale');
 return {version:1,provider:raw.provider,observedAt:raw.observedAt,fetchedAt:now,condition:raw.condition,raining:raw.raining,cloudCover:raw.cloudCover,temperatureC:finite(raw.temperatureC,-10,55)?raw.temperatureC:null,windKmh:finite(raw.windKmh,0,250)?raw.windKmh:null};
}
export function normalizeMetar(data,now=Date.now()){
 const row=Array.isArray(data)?data.find(r=>r.icaoId==='WBKL'):null;if(!row)throw Error('No WBKL observation');
 const tokens=String(row.wxString||row.rawOb||'').toUpperCase().split(/\b(?:TEMPO|BECMG|RMK)\b/)[0].split(/\s+/),storm=tokens.some(t=>/^[+-]?(?:VC)?TS(?:RA|GR|GS|SH)*$/.test(t)),raining=tokens.some(t=>/^[+-]?(?:(?:VC|TS|SH|FZ))?(?:RA|DZ)(?:RA|DZ|SN|GR|GS)*$/.test(t));
 const covers={SKC:0,CLR:0,NSC:0,NCD:0,FEW:20,SCT:45,BKN:75,OVC:100,VV:100};
 const cloudCover=Math.max(0,...[row.cover,...(row.clouds||[]).map(c=>c.cover)].map(c=>covers[c]??0));
 return validateWeather({version:1,provider:'metar',observedAt:row.obsTime*1000,temperatureC:row.temp,windKmh:typeof row.wspd==='number'?row.wspd*1.852:null,cloudCover,raining,condition:storm?'storm':raining?'rain':tokens.some(t=>/^(?:FG|BR)$/.test(t))?'fog':cloudCover>=20?'cloudy':'clear'},now);
}
export function normalizeModel(data,now=Date.now()){
 const row=data?.current;if(!row||!finite(row.weather_code,0,99)||!finite(row.precipitation,0,500))throw Error('Invalid weather model');
 const code=row.weather_code,storm=[95,96,99].includes(code),raining=row.precipitation>.05||[51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code);
 return validateWeather({version:1,provider:'open-meteo',observedAt:row.time*1000,temperatureC:row.temperature_2m,windKmh:row.wind_speed_10m,cloudCover:row.cloud_cover,raining,condition:storm?'storm':raining?'rain':[45,48].includes(code)?'fog':row.cloud_cover>=20?'cloudy':'clear'},now);
}
export function labuanTimePhase(now=Date.now()){
 // Solar altitude from the NOAA fractional-year approximation, at Labuan.
 const date=new Date(now),yearStart=Date.UTC(date.getUTCFullYear(),0,1),day=Math.floor((now-yearStart)/86400000)+1,hour=date.getUTCHours()+date.getUTCMinutes()/60;
 const g=2*Math.PI/365*(day-1+(hour-12)/24),eq=229.18*(.000075+.001868*Math.cos(g)-.032077*Math.sin(g)-.014615*Math.cos(2*g)-.040849*Math.sin(2*g));
 const decl=.006918-.399912*Math.cos(g)+.070257*Math.sin(g)-.006758*Math.cos(2*g)+.000907*Math.sin(2*g)-.002697*Math.cos(3*g)+.00148*Math.sin(3*g);
 const rad=n=>n*Math.PI/180,solarMinutes=(hour*60+eq+4*115.23+1440)%1440,angle=rad(solarMinutes/4-180),lat=rad(5.2831),altitude=Math.asin(Math.sin(lat)*Math.sin(decl)+Math.cos(lat)*Math.cos(decl)*Math.cos(angle))*180/Math.PI;
 const localHour=new Date(now+8*3600000).getUTCHours();
 return altitude<-.833?{look:'night',label:'Malam'}:localHour>=14?{look:'dusk',label:'Petang'}:{look:'day',label:'Siang'};
}
export function weatherPresentation(raw,now=Date.now()){
 const phase=labuanTimePhase(now);let weather;try{weather=validateWeather(raw,now)}catch{return {...phase,condition:'unknown',raining:false,cloudCover:0,description:'Data cuaca belum tersedia',source:'Belum disahkan',weather:null}}
 const description=weather.condition==='storm'?'Ribut petir':weather.raining?'Hujan':weather.condition==='fog'?'Berkabus':weather.cloudCover>=80?'Mendung':weather.cloudCover>=40?'Berawan':weather.cloudCover>=20?'Sedikit awan':'Langit cerah';
 return {...phase,...weather,weather,description,source:weather.provider==='metar'?'Pemerhatian stesen WBKL':'Anggaran model Open-Meteo'};
}
