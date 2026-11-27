import {readFile} from 'node:fs/promises';
import {validateFlights,flightsUsable} from '../dist/flights-engine.mjs';
const repository=process.env.GITHUB_REPOSITORY,token=process.env.GH_TOKEN;
if(!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository||'')||!token)throw Error('GitHub flights publishing configuration unavailable');
const text=await readFile(process.argv[2]||'/tmp/geopark-flights.json','utf8');const snapshot=validateFlights(JSON.parse(text));if(!flightsUsable(snapshot))throw Error('Flight snapshot is stale');
async function api(path,options={}){const response=await fetch('https://api.github.com/repos/'+repository+path,{...options,headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'}});if(!response.ok)throw Error(`Flights publishing HTTP ${response.status}`);return response.json()}
const previous=await api('/contents/flights.json?ref=flight-data');
await api('/contents/flights.json',{method:'PUT',body:JSON.stringify({branch:'flight-data',message:'Update Labuan flights observation',sha:previous.sha,content:Buffer.from(text).toString('base64')})});
console.log('Published flight-data/flights.json');
