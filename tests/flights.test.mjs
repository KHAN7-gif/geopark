import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {activeAircraft,aircraftState,eventTime,flightsUsable,validateFlights,localFlightDate,AIRPORT_LAYOUT,demoAircraft} from '../dist/flights-engine.mjs';
import {createFlightsClient} from '../dist/flights-client.mjs';
import {buildAircraftModel} from '../dist/aircraft-model.mjs';
const seed=JSON.parse(await readFile(new URL('../dist/flights-snapshot.json',import.meta.url))),clock=Date.parse(seed.serviceDate+'T11:20:00+08:00');
const fresh=()=>({...structuredClone(seed),fetchedAt:new Date(clock).toISOString()});
test('source data includes both directions and uses Labuan calendar date',()=>{
 const data=fresh();assert.equal(validateFlights(data,clock),data);assert.ok(data.flights.some(f=>f.direction==='arrival'));assert.ok(data.flights.some(f=>f.direction==='departure'));assert.equal(localFlightDate(Date.parse('2026-11-27T16:01:00Z')),'2026-11-28');assert.ok(flightsUsable(data,clock));assert.equal(flightsUsable(data,clock+3600001),false);assert.equal(flightsUsable({...data,serviceDate:'2026-01-01'},clock),false);
 assert.throws(()=>validateFlights({...data,flights:[data.flights[0],data.flights[0]]},clock));
});
test('aircraft follow estimated event time with no invented cancelled or stale flights',()=>{
 const data=fresh(),f=data.flights.find(f=>f.number==='AK5172'),at=eventTime(f);
 assert.equal(aircraftState(f,at-60000).phase,'approach');assert.ok(aircraftState(f,at-60000).altitude>0);assert.equal(aircraftState(f,at).phase,'landing-roll');assert.equal(aircraftState(f,at+76000).phase,'taxi-in');assert.deepEqual(aircraftState(f,at+200000).position,AIRPORT_LAYOUT.taxiPath.at(-1));assert.equal(aircraftState(f,at+241000),null);
 const delayed={...f,status:'delayed',estimatedAt:new Date(at+900000).toISOString()};assert.equal(eventTime(delayed),at+900000);assert.equal(aircraftState({...delayed,estimatedAt:null},at),null);for(const status of ['cancelled','diverted'])assert.equal(aircraftState({...f,status},at),null);
 assert.deepEqual(activeAircraft(data,clock),activeAircraft(data,clock));assert.equal(activeAircraft({...data,fetchedAt:new Date(clock-3600001).toISOString()},clock).length,0);
});
test('departures taxi, accelerate and climb on shared wall clock; preview is isolated',()=>{
 const f=fresh().flights.find(f=>f.direction==='departure'),at=eventTime(f);assert.equal(aircraftState(f,at-301000),null);const scheduled={...f,status:'scheduled'};assert.equal(aircraftState(scheduled,at-200000).phase,'taxi-out');assert.equal(aircraftState(scheduled,at-30000).phase,'takeoff-roll');assert.equal(aircraftState(scheduled,at+10000).phase,'climb');assert.equal(aircraftState(scheduled,at+10000).altitude,42);
 assert.equal(demoAircraft('arrival',clock,clock).preview,true);assert.equal(demoAircraft('departure',clock,clock+36000),null);assert.ok(AIRPORT_LAYOUT.taxiPath.length>10);assert.equal(AIRPORT_LAYOUT.runwayRef,'14/32');
});
test('flight refresh caches fresh snapshots, tolerates outages and clears polling',async()=>{
 let fail=false,cleared=false,updates=[],cache=new Map(),interval;const data=fresh();const client=createFlightsClient({now:()=>clock,fetchFn:async()=>{if(fail)throw Error('offline');return {ok:true,json:async()=>data}},storage:{getItem:k=>cache.get(k),setItem:(k,v)=>cache.set(k,v)},onUpdate:s=>updates.push(s),setIntervalFn:fn=>{interval=fn;return 7},clearIntervalFn:id=>{cleared=id===7}});assert.equal(await client.refresh(),data);assert.ok(cache.size);fail=true;assert.equal(await client.refresh(),data);assert.equal(updates.at(-1),data);assert.equal(typeof interval,'function');client.destroy();assert.ok(cleared);assert.equal(await client.refresh(),null);
});
test('jet and turboprop geometry is finite and disposable',()=>{
 for(const type of ['Boeing 737-800','ATR 72-600']){const model=buildAircraftModel(type,'AirAsia');let meshes=0,disposed=0;model.root.traverse(o=>{if(o.isMesh){meshes++;assert.ok([...o.geometry.attributes.position.array].every(Number.isFinite));o.geometry.addEventListener('dispose',()=>disposed++)}});assert.ok(meshes>20);model.animate(10,true,false);assert.ok(model.root.children.some(o=>!o.visible));model.dispose();assert.equal(disposed,meshes);assert.equal(model.root.children.length,0)}
});
test('collector reads source table fixtures, including estimate crossing midnight',()=>{
 const code=`import importlib.util,datetime as d,json\ns=importlib.util.spec_from_file_location('collector','scripts/collect-flights.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m)\nprint(json.dumps(m.parse_board('<table>Flight Scheduled Estimated<tr><td>AK5172 Airbus A320</td><td>AK AirAsia</td><td>Kuala Lumpur (KUL) KUL ➔ LBU</td><td>23:55</td><td>00:10</td><td>2</td><td>Delayed</td></tr></table>','arrival',d.date(2026,11,27))))`;
 const [f]=JSON.parse(execFileSync('python3',['-c',code],{cwd:new URL('../',import.meta.url),encoding:'utf8'}));assert.equal(f.number,'AK5172');assert.equal(f.status,'delayed');assert.equal(Date.parse(f.estimatedAt)-Date.parse(f.scheduledAt),15*60000);assert.equal(f.airline,'AirAsia');
});
