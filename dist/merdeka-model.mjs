import {MERDEKA_LAYOUT as layout} from './merdeka-layout.mjs?v=carlights-20261127';
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
 // Four reference-based structures frame the fountain rather than a triangle.
 for(const [index,t]of layout.umbrellas.entries()){
  cylinder(t.x,t.z,1.9,.28,.08,'#8d825f',24);
  const shaft=t.height-1.6,shaftRadius=y=>.55+.1*(1-Math.min(1,y/shaft))**2;
  for(let row=0;row<8;row++){const y=.34+row*(shaft-.34)/8,next=.34+(row+1)*(shaft-.34)/8;for(let n=0;n<32;n++){const a=n*Math.PI/16,b=(n+1)*Math.PI/16;face('#eeeee5',[t.x+Math.cos(a)*shaftRadius(y),y,t.z+Math.sin(a)*shaftRadius(y)],[t.x+Math.cos(b)*shaftRadius(y),y,t.z+Math.sin(b)*shaftRadius(y)],[t.x+Math.cos(b)*shaftRadius(next),next,t.z+Math.sin(b)*shaftRadius(next)],[t.x+Math.cos(a)*shaftRadius(next),next,t.z+Math.sin(a)*shaftRadius(next)])}}
  // Uneven, rounded dark cells leave a white branching pattern on the shaft.
  for(let row=0;row<9;row++)for(let n=0;n<6;n++){
   const a=n*Math.PI/3+(row%2)*.38+Math.sin(row*7+n*3)*.09,y=.47+row*(shaft-.7)/9,h=.35+(row+n)%3*.08,w=.26+(row+n)%2*.08;
   const at=(angle,height)=>[t.x+Math.cos(angle)*(shaftRadius(height)+.012),height,t.z+Math.sin(angle)*(shaftRadius(height)+.012)],outline=[at(a-w*.7,y+.04),at(a+w*.6,y),at(a+w,y+h*.52),at(a+w*.35,y+h),at(a-w*.8,y+h*.85),at(a-w,y+h*.35)],c=at(a,y+h*.5);
   for(let k=0;k<outline.length;k++)tri('#263536',c,outline[k],outline[(k+1)%outline.length]);
  }
  const bowl=(x,z)=>{const r=Math.hypot(x,z)/t.radius;return [t.x+x,t.height-1.6+1.6*r**1.65,t.z+z]};
  // A warped cellular mesh replaces straight spokes / concentric wire rings.
  const cell=.42,edges=new Set(),jitter=(x,z)=>{const seed=Math.sin(Math.round(x*1000)*12.9898+Math.round(z*1000)*78.233);return [x+seed*.055,z+Math.cos(seed*67)*.055]};
  function clippedEdge(a,b){const dx=b[0]-a[0],dz=b[1]-a[1],A=dx*dx+dz*dz,B=2*(a[0]*dx+a[1]*dz),C=a[0]*a[0]+a[1]*a[1]-t.radius*t.radius,disc=B*B-4*A*C;if(disc<0)return;const root=Math.sqrt(disc),lo=Math.max(0,(-B-root)/(2*A)),hi=Math.min(1,(-B+root)/(2*A));if(hi-lo<.001)return;const p=[a[0]+dx*lo,a[1]+dz*lo],q=[a[0]+dx*hi,a[1]+dz*hi];beam(bowl(...p),bowl(...q),.105,'#e8e6d5');stats.merdekaCanopyCells=(stats.merdekaCanopyCells||0)+1}
  for(let q=-7;q<=7;q++)for(let r=-7;r<=7;r++){
   const x=Math.sqrt(3)*cell*(q+r/2),z=1.5*cell*r;if(Math.hypot(x,z)>t.radius+cell)continue;
   const points=Array.from({length:6},(_,n)=>{const a=Math.PI/6+n*Math.PI/3;return jitter(x+Math.cos(a)*cell,z+Math.sin(a)*cell)});
   for(let n=0;n<6;n++){const a=points[n],b=points[(n+1)%6],key=[a,b].map(p=>p.map(v=>v.toFixed(3)).join(',')).sort().join('|');if(edges.has(key))continue;edges.add(key);clippedEdge(a,b)}
  }
  for(let n=0;n<64;n++){const a=n*Math.PI/32,b=(n+1)*Math.PI/32;beam(bowl(Math.cos(a)*t.radius,Math.sin(a)*t.radius),bowl(Math.cos(b)*t.radius,Math.sin(b)*t.radius),.14,'#dddcca')}
  // Small pointed loops around the rim echo the crown-like edge in the photo.
  for(let n=0;n<36;n++){const a=n*Math.PI/18,top=[t.x+Math.cos(a)*(t.radius+.05),t.height+.32,t.z+Math.sin(a)*(t.radius+.05)];for(const sign of [-1,1])beam(bowl(Math.cos(a+sign*.055)*t.radius,Math.sin(a+sign*.055)*t.radius),top,.075,'#e8e6d5')}
  // Rough boulders around each column base.
  for(let n=0;n<6;n++){const a=n*Math.PI/3+index*.4,x=t.x+Math.cos(a)*1.25,z=t.z+Math.sin(a)*1.25,r=.38+(n%3)*.13,h=.55+(n%2)*.35;for(let j=0;j<6;j++){const u=j*Math.PI/3,v=(j+1)*Math.PI/3;tri(j%2?'#aaa99c':'#d0cebc',[x+Math.cos(u)*r,.35,z+Math.sin(u)*r],[x+Math.cos(v)*r,.35,z+Math.sin(v)*r],[x+.12,.35+h,z-.05])}}
  stats.merdekaUmbrellas=(stats.merdekaUmbrellas||0)+1;
 }
 // Central circular pool and illustrative fountain streams.
 cylinder(0,0,layout.poolRadius+.23,.29,.46,'#ced3c3');cylinder(0,0,layout.poolRadius,.75,.025,'#59aeb9');ring(layout.poolRadius+.08,.3,.75,.12,'#e7e2cc');
 cylinder(0,0,.48,.77,.25,'#b6c8bd');
 for(let jet=0;jet<12;jet++){const a=jet*Math.PI/6;const at=t=>[Math.cos(a)*2.9*t,1+2.5*4*t*(1-t)-.18*t,Math.sin(a)*2.9*t];for(let n=1;n<=12;n++)beam(at((n-1)/12),at(n/12),.055,'#b4dfe1')}
 beam([0,.8,0],[0,3.7,0],.09,'#b4dfe1');
 // Wire globe at the centre, a simplified sculptural landmark from the photo.
 const globeRadius=1.3,globeY=3.8;
 for(let meridian=0;meridian<10;meridian++){const a=meridian*Math.PI/10,at=theta=>[Math.cos(theta)*Math.cos(a)*globeRadius,globeY+Math.sin(theta)*globeRadius,Math.cos(theta)*Math.sin(a)*globeRadius];for(let n=1;n<=40;n++)beam(at((n-1)*Math.PI/20),at(n*Math.PI/20),.045,'#d2cda9')}
 for(const latitude of [-.8,-.4,0,.4,.8]){const r=globeRadius*Math.sqrt(1-latitude*latitude),y=globeY+latitude*globeRadius;for(let n=0;n<48;n++){const a=n*Math.PI/24,b=(n+1)*Math.PI/24;beam([Math.cos(a)*r,y,Math.sin(a)*r],[Math.cos(b)*r,y,Math.sin(b)*r],.045,'#d2cda9')}}
 stats.merdekaGlobes=(stats.merdekaGlobes||0)+1;
 // Small raised LABUAN lettering, made from geometry without font downloads.
 const letters={L:['10000','10000','10000','10000','10000','10000','11111'],A:['01110','10001','10001','11111','10001','10001','10001'],B:['11110','10001','10001','11110','10001','10001','11110'],U:['10001','10001','10001','10001','10001','10001','01110'],N:['10001','11001','11001','10101','10011','10011','10001']},text='LABUAN',size=.14;
 function word(baseline,step,z,colour){const start=-((text.length*6-1)*step)/2;for(let k=0;k<text.length;k++)for(let row=0;row<7;row++)for(let col=0;col<5;col++)if(letters[text[k]][row][col]==='1'){const x=start+(k*6+col)*step,y=baseline+(6-row)*step;face(colour,[x,y,z],[x+step,y,z],[x+step,y+step,z],[x,y+step,z]);face(colour,[x,y,z-.08],[x+step,y,z-.08],[x+step,y+step,z-.08],[x,y+step,z-.08])}}
 word(.9,size,3.15,'#e4e3d5');word(4.05,.09,1.37,'#b84940');
 stats.merdekaFountains=(stats.merdekaFountains||0)+1;stats.merdekaRoundabouts=(stats.merdekaRoundabouts||0)+1;
}
