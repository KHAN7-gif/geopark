import test from 'node:test';
import assert from 'node:assert/strict';
import {createAnnurCycle} from '../dist/annur-cycle.mjs';
test('mosque auto colour advances every five seconds without restarting when the scene refreshes',()=>{
 const timers=new Map(),colours=[];let seq=0;
 const cycle=createAnnurCycle({apply:c=>colours.push(c),schedule:(fn,ms)=>{assert.equal(ms,5000);timers.set(++seq,fn);return seq},cancel:id=>timers.delete(id),hidden:()=>false});
 cycle.configure('auto',true);assert.equal(cycle.current(),'cyan');assert.equal(timers.size,1);const tick=timers.values().next().value;
 tick();assert.equal(cycle.current(),'blue');cycle.configure('auto',true);assert.equal(seq,1);assert.equal(cycle.current(),'blue');tick();assert.equal(cycle.current(),'red');tick();assert.equal(cycle.current(),'green');tick();assert.equal(cycle.current(),'cyan');
 cycle.configure('green',true);assert.equal(timers.size,0);assert.equal(colours.at(-1),'green');cycle.configure('auto',true);assert.equal(timers.size,1);cycle.destroy();assert.equal(timers.size,0);
});
test('daytime, absent mosque, disabled scenery and hidden tabs do not animate lights',()=>{
 const timers=new Map();let hidden=true;
 const cycle=createAnnurCycle({apply(){},schedule:fn=>{timers.set(1,fn);return 1},cancel:id=>timers.delete(id),hidden:()=>hidden});cycle.configure('auto',false);assert.equal(timers.size,0);cycle.configure('auto',true);const tick=timers.get(1);tick();assert.equal(cycle.current(),'cyan');hidden=false;tick();assert.equal(cycle.current(),'blue');cycle.configure('auto',false);assert.equal(timers.size,0);cycle.destroy();tick();assert.equal(cycle.current(),'blue');
});
