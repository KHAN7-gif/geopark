import * as THREE from './vendor/three.module.js';
// Small deterministic textures, generated locally: no downloads or image licences.
import {surfacePixels} from './surface-textures.mjs?v=town3d-20261127';
export {surfacePixels};
export function cityTexture(kind){const pixels=surfacePixels(kind),texture=new THREE.DataTexture(pixels.data,pixels.width,pixels.height);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.generateMipmaps=true;texture.colorSpace=THREE.SRGBColorSpace;texture.needsUpdate=true;return texture}
export function surfaceUV(points,scale=2){
 const uv=[];for(let i=0;i<points.length;i+=9){const a=points.slice(i,i+3),b=points.slice(i+3,i+6),c=points.slice(i+6,i+9),ab=b.map((n,j)=>n-a[j]),ac=c.map((n,j)=>n-a[j]),normal=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]].map(Math.abs),vertical=normal[1]>=Math.max(normal[0],normal[2]);for(const p of [a,b,c])uv.push((vertical?p[0]:normal[0]>normal[2]?p[2]:p[0])/scale,(vertical?p[2]:p[1])/scale)}return uv;
}
