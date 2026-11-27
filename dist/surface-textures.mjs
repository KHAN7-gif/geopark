// Deterministic pixel textures shared by native map and detailed models.
export function surfacePixels(kind='asphalt',size=64){
 const data=new Uint8Array(size*size*4);let seed=731;
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  seed=(Math.imul(seed,1664525)+1013904223)>>>0;const noise=((seed>>>24)/255-.5),i=(y*size+x)*4;
  let rgb;
  if(kind==='asphalt'){const n=noise*28;rgb=[67+n,73+n,77+n]}
  else if(kind==='roof'){const seam=y%16<2||(x+(Math.floor(y/16)%2)*8)%16<1;const n=seam?-.28:noise*.12;rgb=[238+n*100,235+n*100,226+n*100]}
  else{const seam=x%32===0||y%32===0,n=seam?-.2:noise*.06;rgb=[243+n*100,240+n*100,233+n*100]}
  for(let c=0;c<3;c++)data[i+c]=Math.max(0,Math.min(255,Math.round(rgb[c])));data[i+3]=255;
 }
 return {width:size,height:size,data};
}
