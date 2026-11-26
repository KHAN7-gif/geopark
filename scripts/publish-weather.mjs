import {readFile} from 'node:fs/promises';
import {validateWeather} from '../dist/weather-engine.mjs';
const repository=process.env.GITHUB_REPOSITORY,token=process.env.GH_TOKEN;
if(!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository||'')||!token)throw Error('GitHub weather publishing configuration unavailable');
const text=await readFile(process.argv[2]||'/tmp/geopark-weather.json','utf8');validateWeather(JSON.parse(text));
async function api(path,options={}){const response=await fetch('https://api.github.com/repos/'+repository+path,{...options,headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'}});if(!response.ok)throw Error(`Weather publishing HTTP ${response.status}`);return response.json()}
const previous=await api('/contents/weather.json?ref=weather-data');
await api('/contents/weather.json',{method:'PUT',body:JSON.stringify({branch:'weather-data',message:'Update Labuan weather observation',sha:previous.sha,content:Buffer.from(text).toString('base64')})});
console.log('Published weather-data/weather.json');
