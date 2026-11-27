// Centre derived from the closed OSM roundabout way. Sculpture appearance is
// an original, approximate game model based on the user's reference photos.
export const MARLIN_MONUMENT={centre:[115.24593584524419,5.27631508292888],roadOsm:'way/28717159',roadRadius:12.21,roadWidth:8,islandRadius:8.1,plinthRadius:4.8,pavingRadius:6.5};
export const MARLIN_PLACE={type:'Feature',properties:{kind:'landmark',name:'Monumen Ikan Marlin',osm:'reference/marlin-28717159',source:'User reference photos; position from OSM roundabout centre'},geometry:{type:'Point',coordinates:MARLIN_MONUMENT.centre}};
export function marlinDistance(point){return Math.hypot((point[0]-MARLIN_MONUMENT.centre[0])*110850,(point[1]-MARLIN_MONUMENT.centre[1])*111320)}
export const marlinTreeAllowed=point=>marlinDistance(point)>7.5;
