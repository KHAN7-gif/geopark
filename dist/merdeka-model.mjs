import {MERDEKA_LAYOUT as layout} from './merdeka-layout.mjs?v=merdeka-20261127';
// Original reference-based geometry: open lattice bowls, spotted columns and
// a small central fountain. No measured-architecture claim is made.
export function addMerdekaRoundabout({local,heightAt,triangle,quad,stats}){
 const [cx,cz]=local(layout.centre),ground=heightAt(layout.centre)||0,p=(x,y,z)=>[cx+x,ground+y,cz+z];
 const tri=(c,a,b,d)=>triangle(c,p(...a),p(...b),p(...d)),face=(c,a,b,d,e)=>quad(c,p(...a),p(...b),p(...d),p(...e));
 function cylinder(x,z,r,y,height,colour,segments=48){for(let n=0;n<segments;n++){const a=n*Math.PI*2/segments,b=(n+1)*Math.PI*2/segments,A=[x+Math.cos(a)*r,y,z+Math.sin(a)*r],B=[x+Math.cos(b)*r,y,z+Math.sin(b)*r],up=q=>[q[0],q[1]+height,q[2]];face(colour,A,B,up(B),up(A));tri(colour,[x,y+height,z],up(A),up(B))}}
 function ring(r,width,y,height,colour,segments=64){for(let n=0;n<segments;n++){const a=n*Math.PI*2/segments,b=(n+1)*Math.PI*2/segments,at=(t,r,y)=>[Math.cos(t)*r,y,Math.sin(t)*r],A=at(a,r-width/2,y),B=at(b,r-width/2,y),C=at(b,r+width/2,y),D=at(a,r+width/2,y),up=q=>[q[0],q[1]+height,q[2]];face(colour,up(A),up(B),up(C),up(D));face(colour,D,C,up(C),up(D));face(colour,A,B,up(B),up(A))}}
 function beam(a,b,width,colour){const d=b.map((v,i)=>v-a[i]),len=Math.hypot(...d),u=Math.abs(d[1]/len)>.9?[1,0,0]:[-d[2],0,d[0]],ul=Math.hypot(...u),side=u.map(v=>v/ul*width/2),v=[d[1]*side[2]-d[2]*side[1],d[2]*side[0]-d[0]*side[2],d[0]*side[1]-d[1]*side[0]],vl=Math.hypot(...v),other=v.map(n=>n/vl*width/2);for(const axis of [side,other])face(colour,a.map((n,i)=>n+axis[i]),b.map((n,i)=>n+axis[i]),b.map((n,i)=>n-axis[i]),a.map((n,i)=>n-axis[i]))}
 // Circular grass mound, raised white kerb, and red / grey paving border.
 cylinder(0,0,layout.outerRadius,0,.12,'#b6ae95');cylinder(0,0,13.1,.12,.16,'#82af58');ring(12.95,.22,.29,.12,'#dddcc5');
 for(let n=0;n<96;n++){const a=n*Math.PI/48,b=(n+1)*Math.PI/48;for(let row=0;row<3;row++){const r0=13.18+row*.29,r1=r0+.29,colour=(n+row)%4<2?'#b97660':'#9e9d90';face(colour,[Math.cos(a)*r0,.14,Math.sin(a)*r0],[Math.cos(b)*r0,.14,Math.sin(b)*r0],[Math.cos(b)*r1,.14,Math.sin(b)*r1],[Math.cos(a)*r1,.14,Math.sin(a)*r1])}}
 for(let n=0;n<64;n++){const a=n*Math.PI/32,b=(n+1)*Math.PI/32,r=14.1,at=(t,r,y)=>[Math.cos(t)*r,y,Math.sin(t)*r],c=n%2?'#53605a':'#ecebd9';face(c,at(a,r-.1,.27),at(b,r-.1,.27),at(b,r+.1,.27),at(a,r+.1,.27));face(c,at(a,r+.1,.12),at(b,r+.1,.12),at(b,r+.1,.27),at(a,r+.1,.27))}
 // Three umbrella-like ornamental structures on triangular planting beds.
 for(const [index,t]of layout.umbrellas.entries()){
  cylinder(t.x,t.z,1.9,.28,.08,'#8d825f',24);cylinder(t.x,t.z,.52,.34,t.height-1.7,'#e8e6db',28);
  // Irregular black patches make the white columns recognisable in the game.
  for(let row=0;row<9;row++)for(let n=0;n<5;n++){const a=n*Math.PI*2/5+(row%2)*.47,spread=.23+(row+n)%3*.06,y=.5+row*(t.height-2)/9,h=.31+(n%2)*.13,r=.533;face('#273b3c',[t.x+Math.cos(a-spread)*r,y,t.z+Math.sin(a-spread)*r],[t.x+Math.cos(a+spread*.6)*r,y+.06,t.z+Math.sin(a+spread*.6)*r],[t.x+Math.cos(a+spread)*r,y+h,t.z+Math.sin(a+spread)*r],[t.x+Math.cos(a-spread*.6)*r,y+h+.09,t.z+Math.sin(a-spread*.6)*r])}
  const bowl=(a,f)=>[t.x+Math.cos(a)*t.radius*f,t.height-1.55+1.55*f*f,t.z+Math.sin(a)*t.radius*f];
  for(let rib=0;rib<22;rib++){const a=rib*Math.PI/11;for(let step=1;step<=9;step++)beam(bowl(a,(step-1)/9),bowl(a,step/9),.085,'#dfd5ab')}
  for(const f of [.25,.45,.65,.83,1])for(let n=0;n<48;n++)beam(bowl(n*Math.PI/24,f),bowl((n+1)*Math.PI/24,f),f===1?.13:.065,'#ece1b8');
  // Rough boulders around each column base.
  for(let n=0;n<6;n++){const a=n*Math.PI/3+index*.4,x=t.x+Math.cos(a)*1.25,z=t.z+Math.sin(a)*1.25,r=.38+(n%3)*.13,h=.55+(n%2)*.35;for(let j=0;j<6;j++){const u=j*Math.PI/3,v=(j+1)*Math.PI/3;tri(j%2?'#aaa99c':'#d0cebc',[x+Math.cos(u)*r,.35,z+Math.sin(u)*r],[x+Math.cos(v)*r,.35,z+Math.sin(v)*r],[x+.12,.35+h,z-.05])}}
  stats.merdekaUmbrellas=(stats.merdekaUmbrellas||0)+1;
 }
 // Central circular pool and illustrative fountain streams.
 cylinder(0,0,layout.poolRadius+.23,.29,.46,'#ced3c3');cylinder(0,0,layout.poolRadius,.75,.025,'#59aeb9');ring(layout.poolRadius+.08,.3,.75,.12,'#e7e2cc');
 cylinder(0,0,.48,.77,.25,'#b6c8bd');
 for(let jet=0;jet<12;jet++){const a=jet*Math.PI/6;const at=t=>[Math.cos(a)*2.9*t,1+2.5*4*t*(1-t)-.18*t,Math.sin(a)*2.9*t];for(let n=1;n<=12;n++)beam(at((n-1)/12),at(n/12),.055,'#b4dfe1')}
 beam([0,.8,0],[0,3.7,0],.09,'#b4dfe1');
 // Small raised LABUAN lettering, made from geometry without font downloads.
 const letters={L:['10000','10000','10000','10000','10000','10000','11111'],A:['01110','10001','10001','11111','10001','10001','10001'],B:['11110','10001','10001','11110','10001','10001','11110'],U:['10001','10001','10001','10001','10001','10001','01110'],N:['10001','11001','11001','10101','10011','10011','10001']},text='LABUAN',size=.14;
 for(let k=0;k<text.length;k++)for(let row=0;row<7;row++)for(let col=0;col<5;col++)if(letters[text[k]][row][col]==='1'){const x=-2.5+(k*6+col)*size,y=.9+(6-row)*size;face('#e1cf9e',[x,y,3.15],[x+size,y,3.15],[x+size,y+size,3.15],[x,y+size,3.15]);face('#ab9f7f',[x,y,3.07],[x+size,y,3.07],[x+size,y+size,3.07],[x,y+size,3.07])}
 stats.merdekaFountains=(stats.merdekaFountains||0)+1;stats.merdekaRoundabouts=(stats.merdekaRoundabouts||0)+1;
}
