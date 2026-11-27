// Architectural details are illustrative. Every facade follows its OSM wall.
export function addCityFacade({style,length,ground,top,pane,point,quad,stats}){
 if(!['shop','mixed','office','urban','hotel','civic','police'].includes(style.kind))return;
 stats.cityFacades=(stats.cityFacades||0)+1;
 const strip=(t,w,y,h,colour,offset)=>pane(t,w,y,h,colour,offset);
 // Plinth, roof cornice and vertical corner pilasters give walls physical depth.
 strip(length/2,length,ground+.12,.28,'#8c9086',.15);
 strip(length/2,length,top-.22,.2,'#f5ead3',.23);
 for(const t of [.16,length-.16])strip(t,.3,ground+.4,Math.max(.5,top-ground-.65),'#f2e6cc',.22);
 const bays=Math.max(1,Math.min(5,Math.floor(length/4.5))),width=length/bays;
 for(let n=0;n<bays;n++){
  const t=width*(n+.5);
  if(['shop','mixed','urban'].includes(style.kind)){
   // Recessed glass doors, slender mullions and a projecting striped canopy.
   strip(t,.12,ground+.25,2.25,'#dedcc8',.24);
   for(const dt of [-.18,.18])strip(t+dt,.055,ground+1,.45,'#e5bc72',.28);
   const w=width*.46;
   for(let stripe=0;stripe<8;stripe++){const left=t-w+2*w*stripe/8,right=t-w+2*w*(stripe+1)/8,c=stripe%2?'#f5e7c4':style.awning||'#318d82';quad(c,point(left,ground+2.84,.25),point(right,ground+2.84,.25),point(right,ground+2.57,1.25),point(left,ground+2.57,1.25));strip((left+right)/2,right-left,ground+2.4,.17,c,1.25)}
   for(const edge of [-1,1])strip(t+edge*w,.13,ground+.15,2.45,'#ece4ce',1.2);
   stats.cityCanopies=(stats.cityCanopies||0)+1;
  }
  if(top-ground>6){
   strip(t,Math.min(1.7,width*.6),ground+5.17,.14,'#eee6d6',.24);
   // Outdoor AC with grille and wall brackets; kept below upper-floor windows.
   strip(t,1,ground+3.65,.6,'#d9e1db',.35);
   for(let row=0;row<3;row++)strip(t,.72,ground+3.77+row*.12,.045,'#758784',.37);
   stats.airConditioners=(stats.airConditioners||0)+1;
  }
 }
}
export function addCityFrontage({length,ground,point,quad,solid,geometries,stats,clear,spaced}){
 const left=.6,right=length-.6,depth=1.8;if(right-left<4)return;
 if(![point(left,0,depth),point(right,0,depth),point(length/2,0,depth)].every(clear))return;
 quad('#c9c6b6',point(left,ground+.055,.1),point(right,ground+.055,.1),point(right,ground+.055,depth),point(left,ground+.055,depth));
 // Raised kerb and paving joints are actual geometry, visible from street level.
 quad('#e7e5d7',point(left,ground+.06,depth),point(right,ground+.06,depth),point(right,ground+.2,depth),point(left,ground+.2,depth));
 for(let t=left+1;t<right;t+=1)quad('#aeb5ad',point(t,ground+.06,.2),point(t+.025,ground+.06,.2),point(t+.025,ground+.06,depth-.05),point(t,ground+.06,depth-.05));
 stats.pavements=(stats.pavements||0)+1;
 const center=point(length*.65,ground,1.45);if(!spaced(center))return;
 solid(geometries.trunk,'#334f54',[center[0],ground+2.7,center[2]],[.75,5.4,.75]);
 solid(geometries.box,'#eceddb',[center[0],ground+5.4,center[2]],[.85,.16,.45]);
 solid(geometries.box,'#f4d899',[center[0],ground+5.29,center[2]],[.68,.07,.33]);
 const planter=point(length*.3,ground,.95);
 solid(geometries.box,'#b97e58',[planter[0],ground+.32,planter[2]],[.8,.65,.8]);
 solid(geometries.crown,'#489159',[planter[0],ground+.95,planter[2]],[.65,.55,.65]);
 stats.streetLamps=(stats.streetLamps||0)+1;stats.planters=(stats.planters||0)+1;
}
