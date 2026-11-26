import {toXY,fromXY,landPolygons,inPolygon,segmentAllowed,nearestShore} from '../dist/marine-geometry.mjs';
class Heap{constructor(){this.items=[]}push(node){let i=this.items.length;this.items.push(node);while(i){const p=(i-1)>>1;if(this.items[p].f<=node.f)break;this.items[i]=this.items[p];i=p}this.items[i]=node}pop(){const first=this.items[0],last=this.items.pop();if(this.items.length){let i=0;while(i*2+1<this.items.length){let c=i*2+1;if(c+1<this.items.length&&this.items[c+1].f<this.items[c].f)c++;if(this.items[c].f>=last.f)break;this.items[i]=this.items[c];i=c}this.items[i]=last}return first}}
export function pathfinder({domain='sea',ring=null,step=90}={}){
 const region=domain==='sea'?{minX:9000,maxX:33000,minY:3000,maxY:33500}:landPolygons[ring];
 const minX=Math.floor(region.minX/step)*step-step,minY=Math.floor(region.minY/step)*step-step,width=Math.ceil((region.maxX-minX)/step)+2,height=Math.ceil((region.maxY-minY)/step)+2,total=width*height,known=new Int8Array(total),edges=new Map();
 const xy=id=>[minX+(id%width)*step,minY+Math.floor(id/width)*step],point=id=>fromXY(xy(id));
 function usable(id){if(!known[id]){const land=domain==='land'?inPolygon(xy(id),landPolygons[ring]):landPolygons.some(p=>inPolygon(xy(id),p));known[id]=(domain==='sea'?!land:land)?1:-1}return known[id]===1}
 function clear(a,b){const key=a<b?a+':'+b:b+':'+a;if(!edges.has(key))edges.set(key,segmentAllowed(point(a),point(b),domain,ring));return edges.get(key)}
 function connectors(p){const q=toXY(p),cx=Math.round((q[0]-minX)/step),cy=Math.round((q[1]-minY)/step),choices=[];for(let r=0;r<=10;r++){for(let y=Math.max(0,cy-r);y<=Math.min(height-1,cy+r);y++)for(let x=Math.max(0,cx-r);x<=Math.min(width-1,cx+r);x++){if(r&&Math.max(Math.abs(x-cx),Math.abs(y-cy))!==r)continue;const id=y*width+x;if(usable(id)&&segmentAllowed(p,point(id),domain,ring))choices.push({id,d:Math.hypot(...xy(id).map((n,i)=>n-q[i]))})}if(choices.length>=4)break}return choices.sort((a,b)=>a.d-b.d).slice(0,8)}
 return (start,end)=>{
  if(segmentAllowed(start,end,domain,ring))return [start,end];
  const starts=connectors(start),goals=new Map(connectors(end).map(v=>[v.id,v.d]));if(!starts.length||!goals.size)throw Error('No coastal connector');
  const target=toXY(end),g=new Float64Array(total);g.fill(Infinity);const previous=new Int32Array(total);previous.fill(-1);const heap=new Heap();
  const heuristic=id=>Math.hypot(...xy(id).map((n,i)=>n-target[i]));for(const s of starts){g[s.id]=s.d;heap.push({id:s.id,g:s.d,f:s.d+heuristic(s.id)})}
  let finish=-1;while(heap.items.length){const n=heap.pop();if(n.g!==g[n.id])continue;if(goals.has(n.id)){finish=n.id;break}const x=n.id%width,y=Math.floor(n.id/width);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=width||ny>=height)continue;const id=ny*width+nx,cost=n.g+Math.hypot(dx,dy)*step;if(cost>=g[id]||!usable(id)||!clear(n.id,id))continue;g[id]=cost;previous[id]=n.id;heap.push({id,g:cost,f:cost+heuristic(id)})}}
  if(finish<0)throw Error('No path through mapped '+domain);
  const raw=[end];for(let id=finish;id>=0;id=previous[id])raw.push(point(id));raw.push(start);raw.reverse();const result=[raw[0]];let i=0;while(i<raw.length-1){let j=raw.length-1;while(j>i+1&&!segmentAllowed(raw[i],raw[j],domain,ring))j--;result.push(raw[j]);i=j}return result;
 };
}
