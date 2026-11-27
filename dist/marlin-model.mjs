import {MARLIN_MONUMENT} from './marlin-layout.mjs?v=merdeka-four-20261127';
// Faceted sculpture, not a photogrammetric or measured replica.
export function addMarlinMonument({local,heightAt,triangle,quad,stats}){
 const [cx,cz]=local(MARLIN_MONUMENT.centre),ground=heightAt(MARLIN_MONUMENT.centre)||0;
 const point=(x,y,z)=>[cx+x,ground+y,cz+z];
 const tri=(colour,a,b,c)=>triangle(colour,point(...a),point(...b),point(...c));
 const face=(colour,a,b,c,d)=>quad(colour,point(...a),point(...b),point(...c),point(...d));
 function cylinder(radius,y,height,colour,segments=40){for(let n=0;n<segments;n++){const a=n*Math.PI*2/segments,b=(n+1)*Math.PI*2/segments,p=[Math.cos(a)*radius,y,Math.sin(a)*radius],q=[Math.cos(b)*radius,y,Math.sin(b)*radius],up=p=>[p[0],p[1]+height,p[2]];face(colour,p,q,up(q),up(p));tri(colour,[0,y+height,0],up(p),up(q))}}
 cylinder(6.5,0,.13,'#adac91');
 for(const [radius,y,height,colour]of [[4.8,.13,1.2,'#327f87'],[3.7,1.33,.7,'#3a9294'],[2.65,2.03,.45,'#4d9d9b']]){
  cylinder(radius,y,height,colour);
  for(let row=.2;row<height;row+=.2)cylinder(radius+.012,y+row,.018,'#85b9b0');
  for(let n=0;n<64;n++){const a=n*Math.PI/32,da=.0022,r=radius+.018;face('#8fbfb4',[Math.cos(a-da)*r,y,Math.sin(a-da)*r],[Math.cos(a+da)*r,y,Math.sin(a+da)*r],[Math.cos(a+da)*r,y+height,Math.sin(a+da)*r],[Math.cos(a-da)*r,y+height,Math.sin(a-da)*r])}
 }
 // A rising spiral of blue wave / coral forms supports the three marlin.
 for(let section=0;section<16;section++){const y=2.48+section*.34,nextY=y+.34,r=1.45-section*.065,nextR=r-.065,phase=section*.4;
  for(let n=0;n<12;n++){const a=n*Math.PI/6,b=(n+1)*Math.PI/6,at=(t,h,r,p)=>[Math.cos(t+p)*r+.25*Math.sin(h),h,Math.sin(t+p)*r],colour=n%3===0?'#b2cbd0':n%3===1?'#245986':'#5285a0';face(colour,at(a,y,r,phase),at(b,y,r,phase),at(b,nextY,nextR,phase+.4),at(a,nextY,nextR,phase+.4))}
 }
 for(let n=0;n<8;n++){const a=n*Math.PI/4,r=1.8,y=2.7+n*.21;tri(n%2?'#b9d4d2':'#3a7198',[Math.cos(a)*.8,y,Math.sin(a)*.8],[Math.cos(a)*r,y+.9,Math.sin(a)*r],[Math.cos(a+.4)*2,y+.2,Math.sin(a+.4)*2])}
 function fish(position,direction,length){
  const norm=v=>{const l=Math.hypot(...v);return v.map(n=>n/l)},cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],axis=norm(direction),side=norm(cross(axis,[0,1,0])),up=norm(cross(side,axis));
  const at=(along,height,width)=>position.map((v,i)=>v+axis[i]*along+up[i]*height+side[i]*width);
  const sections=[[-.5,.08],[-.34,.24],[-.1,.38],[.18,.32],[.38,.18],[.5,.06]];
  for(let s=1;s<sections.length;s++){const [x0,r0]=sections[s-1],[x1,r1]=sections[s];for(let n=0;n<12;n++){const a=n*Math.PI/6,b=(n+1)*Math.PI/6,ring=(x,r,t)=>at(x*length,Math.sin(t)*r,Math.cos(t)*r*.65);face(Math.sin((a+b)/2)>.3?'#28628a':Math.sin((a+b)/2)<-.2?'#e2d5a6':'#a4b9bc',ring(x0,r0,a),ring(x1,r1,a),ring(x1,r1,b),ring(x0,r0,b))}}
  // Long pointed bill, tall dorsal fin, paired pectorals and forked tail.
  for(let n=0;n<6;n++){const a=n*Math.PI/3,b=(n+1)*Math.PI/3;tri('#a9c1c1',at(length*.5,Math.sin(a)*.065,Math.cos(a)*.065),at(length*.98,0,0),at(length*.5,Math.sin(b)*.065,Math.cos(b)*.065))}
  tri('#244f83',at(-length*.25,.15,0),at(-length*.07,length*.4,0),at(length*.25,.24,0));
  for(const sign of [-1,1]){tri('#346c91',at(length*.08,-.12,sign*.13),at(-length*.27,-.5,sign*.8),at(-length*.1,-.12,sign*.2));tri('#31658a',at(-length*.47,.04,0),at(-length*.72,sign*.62,0),at(-length*.53,sign*.2,0));}
  stats.marlinFish=(stats.marlinFish||0)+1;
 }
 fish([.05,8.3,.1],[-1,.27,.12],2.6);
 fish([.35,5,.55],[1,.25,-.15],3.1);
 fish([-.4,6.4,-.35],[-.42,.75,-.4],2.25);
 // Low perimeter planting leaves a gap on the Dataran-facing side.
 for(let n=0;n<18;n++){const a=n*Math.PI/9;if(a>1.5&&a<2.7)continue;const x=Math.cos(a)*6.55,z=Math.sin(a)*6.55;for(let j=0;j<6;j++){const t=j*Math.PI/3,u=(j+1)*Math.PI/3;tri(n%2?'#6b9f46':'#448150',[x,.9,z],[x+Math.cos(t)*.45,.22,z+Math.sin(t)*.45],[x+Math.cos(u)*.45,.22,z+Math.sin(u)*.45])}}
 stats.marlinMonuments=(stats.marlinMonuments||0)+1;
}
