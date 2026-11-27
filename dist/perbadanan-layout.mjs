// Explicit building identity from OSM, with floor count and appearance supplied
// by the user. Metres per floor are an illustration, not a surveyed height.
export const PERBADANAN_TOWER={osm:'way/1412136971',name:'Menara Perbadanan Labuan',centre:[115.24094555,5.27922835],floors:11,storeyHeight:3.2,blankEdge:1,facade:'#e5e9e9',glass:'#2c405b',silver:'#cbd3d7'};
export const isPerbadanan=p=>p?.osm===PERBADANAN_TOWER.osm;
export const PERBADANAN_PLACE={type:'Feature',properties:{kind:'office',name:PERBADANAN_TOWER.name,osm:PERBADANAN_TOWER.osm,viewZoom:18.9,referenceFloors:11},geometry:{type:'Point',coordinates:PERBADANAN_TOWER.centre}};
