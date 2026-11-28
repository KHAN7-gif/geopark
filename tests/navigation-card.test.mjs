import test from 'node:test';
import assert from 'node:assert/strict';
import {navigationCard} from '../dist/navigation-card.mjs';
test('navigation summary uses remaining journey time, Labuan arrival time and measured distance',()=>{
 const journey={pausedAt:null},state={remainingMs:90000,arrived:false},before=JSON.stringify({journey,state});const card=navigationCard({journey,state,remainingMetres:1250,destination:{id:'C5',name:'Dataran Labuan'},now:Date.parse('2026-11-28T03:00:00Z')});
 assert.equal(card.title,'Dataran Labuan');assert.equal(card.distance,'1.3 km');assert.equal(card.summary,'2 min · 1.3 km');assert.equal(card.eta,'11:01');assert.equal(card.context,'Menuju C5');assert.equal(JSON.stringify({journey,state}),before);
 const paused=navigationCard({journey:{pausedAt:100},state,remainingMetres:30});assert.equal(paused.eta,'Dijeda');assert.equal(paused.summary,'2 min · 30 m');
 const arrived=navigationCard({journey,state:{remainingMs:0,arrived:true},remainingMetres:0});assert.equal(arrived.eta,'Sudah tiba');assert.equal(arrived.summary,'0 min · 0 m');
});
test('free exploration shows mission progress and XP without an invented destination or ETA',()=>{
 const card=navigationCard({completed:4,total:25,xp:400,current:{id:'G1'}});assert.equal(card.distance,'25 destinasi');assert.equal(card.title,'Jelajah Labuan');assert.equal(card.summary,'4/25 misi · 400 XP');assert.equal(card.eta,'Terokai Labuan');assert.equal(card.active,false);
});
