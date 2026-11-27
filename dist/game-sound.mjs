// Original short synth cues. No music files or copyrighted game audio.
export const SOUND_CUES={
 photo:[{hz:1200,at:0,duration:.04},{hz:750,at:.055,duration:.045}],
 depart:[{hz:392,at:0,duration:.13},{hz:523.25,at:.13,duration:.16},{hz:659.25,at:.29,duration:.22}],
 arrive:[{hz:523.25,at:0,duration:.16},{hz:659.25,at:.18,duration:.16},{hz:783.99,at:.36,duration:.18},{hz:1046.5,at:.56,duration:.36}],
 preview:[{hz:659.25,at:0,duration:.14},{hz:783.99,at:.16,duration:.2}]
};
export function createGameSound({enabled=true,AudioContextClass=globalThis.AudioContext||globalThis.webkitAudioContext}={}){
 let context=null,on=!!enabled,lastCue=null;const active=new Set();
 async function unlock(){
  if(!on||!AudioContextClass)return false;
  try{if(!context||context.state==='closed')context=new AudioContextClass();if(context.state==='suspended')await context.resume();return context.state==='running'}catch{return false}
 }
 function schedule(kind,key){
  if(!on||context?.state!=='running'||!SOUND_CUES[kind]||key&&lastCue===key)return false;
  if(key)lastCue=key;
  try{const now=context.currentTime+.025;
   for(const note of SOUND_CUES[kind]){const oscillator=context.createOscillator(),gain=context.createGain(),begin=now+note.at,end=begin+note.duration;oscillator.type='triangle';oscillator.frequency.setValueAtTime(note.hz,begin);gain.gain.setValueAtTime(.0001,begin);gain.gain.exponentialRampToValueAtTime(.065,begin+.018);gain.gain.exponentialRampToValueAtTime(.0001,end);oscillator.connect(gain);gain.connect(context.destination);active.add(oscillator);oscillator.onended=()=>{active.delete(oscillator);oscillator.disconnect();gain.disconnect()};oscillator.start(begin);oscillator.stop(end+.02)}return true;
  }catch{return false}
 }
 return {unlock,setEnabled(value){on=!!value;if(!on){for(const oscillator of active)try{oscillator.stop()}catch{}active.clear();if(context?.state==='running')context.suspend?.().catch?.(()=>{})}},play(kind,{gesture=false,key=null}={}){if(!on)return Promise.resolve(false);return gesture?unlock().then(ok=>ok&&schedule(kind,key)):Promise.resolve(schedule(kind,key))},close(){on=false;context?.close?.().catch?.(()=>{});context=null}};
}
