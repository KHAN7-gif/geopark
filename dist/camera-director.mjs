import {journeyAt} from './travel-engine.mjs?v=perbadanan-20261127';
import {navigationHUD} from './navigation-hud.mjs?v=perbadanan-20261127';
import {CAMERA_MODES,cameraPose} from './advanced-map.mjs?v=perbadanan-20261127';

export function createCameraDirector(map,{getState,isReady,reducedMotion=false,frameRate=30}){
 let enabled=false,disposed=false,frame=null,last=0,angle=0,mode='close',fallbackPosition=null,fallbackHeading=0,fps=frameRate;
 const raf=typeof window!=='undefined'&&typeof window.requestAnimationFrame==='function'?window.requestAnimationFrame.bind(window):null;
 const cancel=typeof window!=='undefined'&&typeof window.cancelAnimationFrame==='function'?window.cancelAnimationFrame.bind(window):null;
 function pose(){
  const state=getState(),live=state?.journey?.startedAt&&state.journey.route?.segmentSeconds?journeyAt(state.journey):null,position=live?.position||state?.position||fallbackPosition;
  if(!position)return null;
  const heading=live?navigationHUD(state.journey,live).heading?.degrees??fallbackHeading:fallbackHeading;
  return cameraPose({mode,position,heading,currentBearing:map.getBearing(),orbitDegrees:angle,reducedMotion,width:typeof window!=='undefined'?window.innerWidth:1024});
 }
 function update(immediate=false,delta=0){if(!enabled||disposed||!isReady())return;const next=pose();if(next){if(immediate&&map.jumpTo){const gain=delta?1-Math.exp(-delta/220):.18,current=map.getCenter?.();next.bearing=map.getBearing()+(next.bearing-map.getBearing())*gain;if(current)next.center=[current.lng+(next.center[0]-current.lng)*gain,current.lat+(next.center[1]-current.lat)*gain];if(map.getZoom)next.zoom=map.getZoom()+(next.zoom-map.getZoom())*gain;if(map.getPitch)next.pitch=map.getPitch()+(next.pitch-map.getPitch())*gain;map.jumpTo(next)}else map.easeTo({...next,duration:reducedMotion?0:300})}}
 function tick(time){
  frame=null;if(!enabled||disposed)return;
  if(isReady()&&!(typeof document!=='undefined'&&document.hidden)&&time-last>=1000/fps){const delta=last?Math.min(time-last,250):0;last=time;if(mode==='orbit')angle=(angle+delta*.006)%360;update(true,delta)}
  if(enabled&&!disposed)frame=raf(tick);
 }
 function start(){if(!raf||reducedMotion||frame!==null||disposed||!enabled)return;last=0;frame=raf(tick)}
 function stop(){enabled=false;if(frame!==null)cancel?.(frame);frame=null;last=0}
 return {follow(position,heading){fallbackPosition=position;fallbackHeading=heading;enabled=true;if(!frame)update();start()},setMode(id){mode=CAMERA_MODES[id]?id:'close';angle=0;update();start()},setFrameRate(rate){fps=rate},setFollowing(value){if(!value)stop();else{enabled=true;update();start()}},destroy(){disposed=true;stop()}};
}
