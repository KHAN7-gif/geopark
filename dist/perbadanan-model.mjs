import {PERBADANAN_TOWER as tower} from './perbadanan-layout.mjs?v=navui-20261128';
export function addPerbadananFacades({ring,center,ground,triangle,quad,stats}){
 const height=tower.floors*tower.storeyHeight,top=ground+height;
 const area=ring.reduce((sum,a,i)=>{const b=ring[(i+1)%ring.length];return sum+a[0]*b[1]-b[0]*a[1]},0),sign=area>=0?1:-1;
 for(let i=0;i<ring.length;i++){
  const a=ring[i],b=ring[(i+1)%ring.length],length=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/length,uz=(b[1]-a[1])/length,nx=uz*sign,nz=-ux*sign;
  function pane(t,width,y,h,colour,offset=.08){const x=a[0]+ux*t+nx*offset,z=a[1]+uz*t+nz*offset;quad(colour,[x-ux*width/2,y,z-uz*width/2],[x+ux*width/2,y,z+uz*width/2],[x+ux*width/2,y+h,z+uz*width/2],[x-ux*width/2,y+h,z-uz*width/2])}
  if(i===tower.blankEdge){
   for(let floor=1;floor<tower.floors;floor++)pane(length/2,length,ground+floor*tower.storeyHeight,.035,'#cbd3d7');stats.perbadananBlankFacades=(stats.perbadananBlankFacades||0)+1;
  }else{
   for(let floor=0;floor<tower.floors;floor++){
    const y=ground+floor*tower.storeyHeight+.62,span=length-.5;
    pane(length/2,span,y,2.05,tower.glass);
    const panes=Math.max(2,Math.round(span/1.7));for(let n=1;n<panes;n++)pane(.25+span*n/panes,.035,y,2.05,'#547082',.095);
    pane(length/2,length,ground+(floor+1)*tower.storeyHeight-.42,.38,tower.silver,.10);
    stats.perbadananGlassBands=(stats.perbadananGlassBands||0)+1;stats.perbadananBandsByFloor??=Array(tower.floors).fill(0);stats.perbadananBandsByFloor[floor]++;
   }
  }
  // Silver corner cladding and the flat roof rim frame the ribbon windows.
  for(const end of [.12,length-.12])pane(end,.24,ground,height,'#d6dddd',.12);pane(length/2,length,top-.2,.25,'#e8ecea',.13);
  if(i===2){pane(length/2,4.5,ground+.12,2.72,'#263d50',.15);for(const t of [length/2-2.5,length/2+2.5])pane(t,.38,ground,3.2,'#eceee8',.2);const x=a[0]+ux*length/2,z=a[1]+uz*length/2,w=3;quad('#cbd3d2',[x-ux*w,ground+3,z-uz*w],[x+ux*w,ground+3,z+uz*w],[x+ux*w+nx*1.05,ground+3,z+uz*w+nz*1.05],[x-ux*w+nx*1.05,ground+3,z-uz*w+nz*1.05])}
 }
 // Flat roof plus a modest service core / aerial, following the reference silhouette.
 for(let i=1;i<ring.length-1;i++)triangle('#aebbc0',[ring[0][0],top+.08,ring[0][1]],[ring[i][0],top+.08,ring[i][1]],[ring[i+1][0],top+.08,ring[i+1][1]]);
 const a=ring[0],b=ring[1],l=Math.hypot(b[0]-a[0],b[1]-a[1]),u=[(b[0]-a[0])/l,(b[1]-a[1])/l],v=[-u[1],u[0]];
 function box(x,z,w,d,y,h,colour){const point=(s,t,Y)=>[x+u[0]*s+v[0]*t,Y,z+u[1]*s+v[1]*t],A=point(-w/2,-d/2,y),B=point(w/2,-d/2,y),C=point(w/2,d/2,y),D=point(-w/2,d/2,y),up=p=>[p[0],p[1]+h,p[2]];quad(colour,up(A),up(B),up(C),up(D));quad(colour,A,B,up(B),up(A));quad(colour,B,C,up(C),up(B));quad(colour,C,D,up(D),up(C));quad(colour,D,A,up(A),up(D))}
 box(center[0],center[1],7,5,top+.1,1.4,'#e9ece6');for(const side of [-1,1])box(center[0]+u[0]*side*2,center[1]+u[1]*side*2,.12,.12,top+1.5,2.1,'#8d9b9d');
 stats.perbadananTowers=(stats.perbadananTowers||0)+1;stats.perbadananFloors=tower.floors;
}
