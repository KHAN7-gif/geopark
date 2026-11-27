import {DATARAN_LAYOUT,dataranPoint} from './dataran-layout.mjs?v=perbadanan-20261127';
// Approximate reference-based public-square structures, separate from OSM
// building footprints. Nothing is added to the centre of the playing field.
export function addDataranStructures({local,heightAt,quad,triangle,stats}){
 const m=DATARAN_LAYOUT.monument,g=DATARAN_LAYOUT.grandstand;
 const mg=heightAt(dataranPoint(m.u,m.v))||0,gg=heightAt(dataranPoint(g.u,g.v))||0;
 const p=(u,v,y)=>{const q=local(dataranPoint(u,v));return [q[0],y,q[1]]};
 function box(u,v,w,d,base,h,colour){const a=p(u-w/2,v-d/2,base),b=p(u+w/2,v-d/2,base),c=p(u+w/2,v+d/2,base),e=p(u-w/2,v+d/2,base),top=q=>[q[0],q[1]+h,q[2]],A=top(a),B=top(b),C=top(c),E=top(e);quad(colour,A,B,C,E);quad(colour,a,b,B,A);quad(colour,b,c,C,B);quad(colour,c,e,E,C);quad(colour,e,a,A,E)}
 function arc(u,v,r,width,base,h,start,end,colour,steps=28){for(let n=0;n<steps;n++){const a=start+(end-start)*n/steps,b=start+(end-start)*(n+1)/steps;const at=(angle,radius,y)=>p(u+Math.cos(angle)*radius,v+Math.sin(angle)*radius,y),a0=at(a,r-width/2,base),b0=at(b,r-width/2,base),c0=at(b,r+width/2,base),d0=at(a,r+width/2,base),up=q=>[q[0],q[1]+h,q[2]];quad(colour,up(a0),up(b0),up(c0),up(d0));quad(colour,a0,b0,up(b0),up(a0));quad(colour,d0,c0,up(c0),up(d0))}}
 stats.grandstands=(stats.grandstands||0)+1;stats.monuments=(stats.monuments||0)+1;
 // Covered grandstand along the southern long edge, facing the open field.
 box(g.u,g.v,g.width+2,g.depth+2,gg,.22,'#b3b7ad');
 for(let row=0;row<5;row++){const v=g.v+4-row*1.7,h=.35+row*.33;box(g.u,v,g.width-1,1.72,gg+.22,h,'#d2d5c8');box(g.u,v-.4,g.width-2,.5,gg+.22+h,.14,row%2?'#477a91':'#5b8a9c')}
 for(const u of [-g.width/2+1,-g.width/6,g.width/6,g.width/2-1])for(const v of [-g.depth/2+.7,g.depth/2-.7])box(g.u+u,g.v+v,.28,.28,gg,4.8,'#e1e1d3');
 const r=g.width/2+1.4,front=g.v+g.depth/2+1.4,back=g.v-g.depth/2-1.2;
 quad('#315c78',p(g.u-r,back,gg+5.35),p(g.u+r,back,gg+5.35),p(g.u+r,front,gg+4.75),p(g.u-r,front,gg+4.75));
 box(g.u,front,g.width+2.8,.3,gg+4.35,.5,'#3a6b88');
 for(const sign of [-1,1])box(g.u+sign*(g.width/2+.2),g.v,.18,g.depth+.5,gg+1.8,.15,'#798b8a');
 // West-end fan-shaped forecourt, low white curved monument and colonnade.
 const stageU=m.u+m.platformOffset,stageV=m.v;
 for(let tier=0;tier<3;tier++)arc(stageU,stageV,7-tier*.8,1.7,mg+tier*.24,.24,-Math.PI,Math.PI,'#e2ddca',36);
 box(stageU,stageV,8,8,mg,m.platformHeight,'#e9e5d5');
 for(const [radius,height]of [[5.5,3.7],[8,2.9],[10.5,2]])arc(stageU-3,stageV,radius,.65,mg+.65,height,-Math.PI*.38,Math.PI*.38,'#f2eee0');
 const positions=[];for(let n=0;n<9;n++){const a=Math.PI*.55+n*Math.PI*.9/8,u=m.u+Math.cos(a)*25,v=m.v+Math.sin(a)*25;positions.push([u,v]);box(u,v,1.3,1.3,mg,4.3,'#9d664d');box(u,v,1.8,1.8,mg+4.3,.35,'#dbc8a3')}
 for(let n=1;n<positions.length;n++){const a=positions[n-1],b=positions[n],dx=b[0]-a[0],dv=b[1]-a[1],length=Math.hypot(dx,dv),nx=-dv/length*.23,nv=dx/length*.23;quad('#cbbf9e',p(a[0]+nx,a[1]+nv,mg+4.4),p(b[0]+nx,b[1]+nv,mg+4.4),p(b[0]-nx,b[1]-nv,mg+4.4),p(a[0]-nx,a[1]-nv,mg+4.4))}
 // Radial walkways sit within the western fan instead of crossing the field.
 for(let n=0;n<9;n++){const a=Math.PI*.55+n*Math.PI*.9/8,end=[m.u+Math.cos(a)*23,m.v+Math.sin(a)*23],start=[m.u+6,m.v],du=end[0]-start[0],dv=end[1]-start[1],length=Math.hypot(du,dv),nx=-dv/length*.45,nv=du/length*.45;quad('#ded3b7',p(start[0]+nx,start[1]+nv,mg+.04),p(end[0]+nx,end[1]+nv,mg+.04),p(end[0]-nx,end[1]-nv,mg+.04),p(start[0]-nx,start[1]-nv,mg+.04))}
}
