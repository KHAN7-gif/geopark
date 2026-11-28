import {isPerbadanan,PERBADANAN_TOWER} from './perbadanan-layout.mjs?v=townlife-20261128b';
// Function comes from OSM tags, never an arbitrary colour / random category.
export function buildingType(properties={}){
 if(isPerbadanan(properties))return 'perbadanan';
 if(properties.roleOverride)return properties.roleOverride;
 const t=properties.tags||{},b=t.building||'',a=t.amenity||'';
 if(a==='police')return 'police';
 if(t.office||b==='office'||a==='bank')return t.office==='government'?'civic':'office';
 if(t.shop||['retail','commercial'].includes(b)||['marketplace','restaurant','cafe','fast_food','pharmacy'].includes(a))return 'shop';
 if(b==='hotel'||t.tourism==='hotel')return 'hotel';
 if(['school','kindergarten','university','college'].includes(b)||['school','kindergarten','university','college'].includes(a))return 'school';
 if(['mosque','surau','temple','church'].includes(b)||a==='place_of_worship')return 'worship';
 if(['industrial','warehouse','storage_tank'].includes(b))return 'industrial';
 if(['government','civic','public','hospital','fire_station'].includes(b)||['post_office','hospital','clinic','fire_station','social_centre','library','ferry_terminal'].includes(a)||t.tourism==='museum')return 'civic';
 if(['house','terrace','semidetached_house','bungalow','residential','apartments'].includes(b))return 'residential';
 return properties.inTown?'urban':'residential';
}
const STYLES={
 perbadanan:{facade:PERBADANAN_TOWER.facade,roof:'#aebbc0',pitched:false,window:PERBADANAN_TOWER.glass,frame:PERBADANAN_TOWER.silver,floors:PERBADANAN_TOWER.floors},
 residential:{facade:null,roof:null,pitched:true,window:'#326b7d',frame:'#f3e4c8',floors:2},
 urban:{facade:'#d7d3bf',roof:'#7e8b8b',pitched:false,window:'#386b7b',frame:'#ebeadc',floors:3},
 shop:{facade:'#eed0a2',roof:'#7d8f8a',pitched:false,window:'#335e6d',frame:'#f6e8cf',awning:'#c36e49',floors:3},
 mixed:{facade:'#d3c7ae',roof:'#778c89',pitched:false,window:'#326a84',frame:'#ece5d2',awning:'#b6754b',floors:4},
 office:{facade:'#b9cbd0',roof:'#657c85',pitched:false,window:'#326a84',frame:'#d8e3e3',floors:4},
 police:{facade:'#e7e9e1',roof:'#395578',pitched:false,window:'#416785',frame:'#ecf1ed',band:'#284b8a',floors:3},
 civic:{facade:'#e1d5bc',roof:'#8b7361',pitched:false,window:'#426d79',frame:'#f5e8d1',band:'#54776a',floors:3},
 school:{facade:'#f1dfae',roof:'#ac684c',pitched:true,window:'#537e86',frame:'#f7ecd1',floors:3},
 worship:{facade:'#d6e5cd',roof:'#47836b',pitched:false,window:'#568275',frame:'#f5ebcf',floors:2},
 hotel:{facade:'#d5c1b5',roof:'#6c7d87',pitched:false,window:'#366d80',frame:'#eee5db',floors:4},
 industrial:{facade:'#bfc5bf',roof:'#849198',pitched:true,window:'#5c727c',frame:'#dfe3dc',floors:1}
};
export function buildingStyle(p){const kind=buildingType(p),style={kind,...STYLES[kind]},seed=[...String(p.osm||'')].reduce((n,c)=>(Math.imul(n,31)+c.charCodeAt(0))>>>0,0);if(kind==='urban')style.facade=['#d7d3bf','#bfd0c4','#c5d1dc','#d8c1ad'][seed%4];if(kind==='shop')style.facade=['#eed0a2','#c3d8c7','#c3d7dd','#e6c7b2'][seed%4];return style}

export function buildingHeight(p){if(isPerbadanan(p))return PERBADANAN_TOWER.floors*PERBADANAN_TOWER.storeyHeight;if(p.heightSource!=='estimate')return p.height;return Math.max(p.height||6,({mixed:12,shop:8,office:12,police:9,civic:8,hotel:18,school:7,industrial:7,urban:9})[buildingType(p)]||6)}
