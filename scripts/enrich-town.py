"""Enrich existing OSM footprints with explicit function tags and contained POIs.
Usage: python3 scripts/enrich-town.py <environment-overpass.json> <town-overpass.json>
Does not move footprints; unclassified buildings keep an explicitly generic type.
"""
import json,sys,collections
from pathlib import Path
root=Path(__file__).resolve().parent.parent/'dist/environment'
raw=json.loads(Path(sys.argv[1]).read_text());town=json.loads(Path(sys.argv[2]).read_text());data=json.loads((root/'labuan.geojson').read_text())
keys=['building','building:levels','name','name:ms','amenity','office','shop','tourism','religion','brand','operator','roof:shape','roof:colour','building:colour']
lookup={f"{e['type']}/{e['id']}":e for e in raw['elements']}
pois=[]
def inside(point,ring):
 x,y=point;hit=False
 for a,b in zip(ring,ring[1:]):
  if(a[1]>y)!=(b[1]>y) and x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]:hit=not hit
 return hit
def centre(ring):return [sum(p[i] for p in ring[:-1])/(len(ring)-1)for i in [0,1]]
for e in town['elements']:
 tags=e.get('tags',{});geom=e.get('geometry',[]);ring=[[p['lon'],p['lat']]for p in geom if'lon'in p and'lat'in p];c=e.get('center',e)
 point=[c['lon'],c['lat']]if'lon'in c else centre(ring)if len(ring)>3 else None
 if not point:continue
 osm=f"{e['type']}/{e['id']}";pois.append({'osm':osm,'tags':{k:tags[k]for k in keys if k in tags},'point':point,'ring':ring if len(ring)>3 and ring[0]==ring[-1]else None})
counts=collections.Counter();joined=0
for f in data['features']:
 if f['properties']['kind']!='building':continue
 p=f['properties'];tags={k:v for k,v in lookup.get(p['osm'],{}).get('tags',{}).items()if k in keys};ring=f['geometry']['coordinates'][0];point=centre(ring);matches=[]
 for poi in pois:
  if poi['osm']==p['osm']:tags.update(poi['tags']);continue
  if inside(poi['point'],ring)or poi['ring']and inside(point,poi['ring']):matches.append(poi)
 # Highest specificity wins; never assign a point to a nearby unrelated building.
 matches.sort(key=lambda o:0 if o['tags'].get('amenity')=='police'else 1 if o['tags'].get('office')else 2)
 for poi in matches:
  for k in ['amenity','office','shop','tourism','name','name:ms']:
   if k in poi['tags'] and k not in tags:tags[k]=poi['tags'][k]
 if matches:joined+=1
 p['tags']=tags;p['inTown']=115.23<=point[0]<=115.259 and 5.268<=point[1]<=5.293;p['functionSource']='contained-osm-poi'if matches else'osm-building-tags'
 p.pop('poiRefs',None)
 if matches:p['poiRefs']=[o['osm']for o in matches]
 if p['osm']=='way/305216106':p['roleOverride']='mixed';p['functionReference']='https://www.fpl.com.my/office-space'
 counts[tags.get('building','yes')]+=1
features=[]
financial=lookup.get('way/305216106')
if financial:
 ring=[[p['lon'],p['lat']]for p in financial['geometry']]
 pois.append({'osm':'way/305216106','tags':{'name':'Financial Park','office':'company'},'point':centre(ring),'ring':None})
for poi in pois:
 t=poi['tags'];name=t.get('name:ms',t.get('name',''))
 if name and ('dataran'in name.lower() or 'labuan square'in name.lower())and poi['ring']:
  features.append({'type':'Feature','properties':{'kind':'plaza','name':'Dataran Labuan','osm':poi['osm']},'geometry':{'type':'Polygon','coordinates':[poi['ring']]}})
 # Only explicit public/commercial points get labels; no labels for unnamed generic houses.
 if name and (t.get('amenity')in['police','post_office','marketplace','bank','hospital','clinic']or t.get('office')or t.get('shop')or t.get('tourism')=='museum' or 'dataran'in name.lower()or'labuan square'in name.lower()):
  kind='police'if t.get('amenity')=='police'else'office'if t.get('office')or t.get('amenity')=='bank'else'shop'if t.get('shop')or t.get('amenity')=='marketplace'else'plaza'if'dataran'in name.lower()or'labuan square'in name.lower()else'civic'
  features.append({'type':'Feature','properties':{'kind':kind,'name':name,'osm':poi['osm'],'tags':t},'geometry':{'type':'Point','coordinates':poi['point']}})
(root/'labuan.geojson').write_text(json.dumps(data,separators=(',',':')))
(root/'town-data.mjs').write_text('export const TOWN_DATA='+json.dumps({'type':'FeatureCollection','features':features},separators=(',',':'))+';\n')
(root/'town.geojson').write_text(json.dumps({'type':'FeatureCollection','features':features},separators=(',',':')))
(root/'town-metadata.json').write_text(json.dumps({'source':'OpenStreetMap contributors: existing Overpass footprints and API 0.6 town map','license':'ODbL-1.0','osmTimestamp':town.get('osm3s',{}).get('timestamp_osm_base'),'bbox':[115.23,5.268,115.259,5.293],'joinedFootprints':joined,'features':len(features),'note':'Function from OSM building tags or contained POIs / compounds. No nearest-neighbour guessing. Facade, plaza furniture and estimated heights are game illustrations.'},indent=2))
print('Enriched',sum(counts.values()),'footprints;',joined,'contained POI joins;',len(features),'town features')
