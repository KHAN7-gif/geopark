export const ANNUR_SEQUENCE=['cyan','blue','red','green'];
// One low-frequency timer, independent of traffic animation and camera motion.
export function createAnnurCycle({apply,schedule=setInterval,cancel=clearInterval,hidden=()=>typeof document!=='undefined'&&document.hidden}={}){
 let timer=null,mode='auto',active=false,index=0,disposed=false;
 const colour=()=>mode==='auto'?ANNUR_SEQUENCE[index]:mode;
 function stop(){if(timer!==null)cancel(timer);timer=null}
 return {current:colour,configure(nextMode,enabled){if(disposed)return;const next=['auto',...ANNUR_SEQUENCE].includes(nextMode)?nextMode:'auto';if(next==='auto'&&mode!=='auto')index=0;mode=next;active=!!enabled;apply(colour());if(!active||mode!=='auto'){stop();return}if(timer===null)timer=schedule(()=>{if(disposed||hidden())return;index=(index+1)%ANNUR_SEQUENCE.length;apply(colour())},5000)},destroy(){disposed=true;active=false;stop()}};
}
