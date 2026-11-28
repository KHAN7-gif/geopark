import {joystickVector} from './free-roam.mjs?v=townlife-20261128b';
// Input is reset on interruption: returning to the app never resumes held movement.
export function createRoamControls({pad,stick,run,document,window,getBearing,move,onUpdate,isBlocked}){
 let active=false,frame=null,last=null,pointer=null,vector={x:0,y:0},bearing=0,keys=new Set(),running=false;
 const raf=window.requestAnimationFrame?.bind(window),caf=window.cancelAnimationFrame?.bind(window),listeners=[];
 function listen(target,type,fn){target.addEventListener(type,fn);listeners.push(()=>target.removeEventListener(type,fn))}
 function reset(){vector={x:0,y:0};keys.clear();pointer=null;stick.style.transform='translate(-50%,-50%)';running=false;run.setAttribute('aria-pressed','false')}
 function permitted(){return active&&!document.hidden&&!isBlocked()}
 function input(){let x=vector.x,y=vector.y;if(keys.size){x=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'));y=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));const n=Math.max(1,Math.hypot(x,y));x/=n;y/=n}return {x,y,bearing,run:running||keys.has('shift')}}
 function tick(time){frame=null;if(!active)return;if(!permitted())reset();if(last===null||time-last>=1000/30){const state=move(input(),last===null?0:(time-last)/1000);last=time;if(state)onUpdate(state);}if(active&&raf)frame=raf(tick)}
 function updatePointer(e){const rect=pad.getBoundingClientRect(),radius=rect.width*.34,x=e.clientX-rect.left-rect.width/2,y=e.clientY-rect.top-rect.height/2;vector=joystickVector(x,y,radius);const length=Math.hypot(x,y),scale=length?Math.min(radius,length)/length:0;stick.style.transform=`translate(calc(-50% + ${x*scale}px),calc(-50% + ${y*scale}px))`}
 listen(pad,'pointerdown',e=>{if(!permitted()||pointer!==null||e.button>0)return;e.preventDefault();pointer=e.pointerId;bearing=getBearing();pad.setPointerCapture?.(pointer);updatePointer(e)});
 listen(pad,'pointermove',e=>{if(e.pointerId===pointer){e.preventDefault();updatePointer(e)}});
 for(const name of ['pointerup','pointercancel','lostpointercapture'])listen(pad,name,e=>{if(e.pointerId===pointer)reset()});
 const movement=new Set(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','shift']);
 listen(document,'keydown',e=>{const key=e.key.toLowerCase();if(!movement.has(key)||!permitted()||e.ctrlKey||e.metaKey||e.altKey||/INPUT|TEXTAREA|SELECT/.test(e.target?.tagName)&&e.target!==pad||e.target?.isContentEditable)return;e.preventDefault();if(!keys.size&&!pointer)bearing=getBearing();keys.add(key)});
 listen(document,'keyup',e=>keys.delete(e.key.toLowerCase()));listen(window,'blur',reset);listen(document,'visibilitychange',reset);
 listen(run,'click',()=>{if(!permitted())return;running=!running;run.setAttribute('aria-pressed',String(running))});
 return {start(){if(active)return;active=true;reset();last=null;if(raf)frame=raf(tick)},stop(){active=false;if(frame!==null)caf?.(frame);frame=null;last=null;reset()},reset,destroy(){this.stop();for(const dispose of listeners)dispose()}};
}
