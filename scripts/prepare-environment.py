"""Convert a public OSM Overpass snapshot to compact geographic surroundings.
Usage: python3 scripts/prepare-environment.py /path/to/overpass.json
No network request is made by this script.
"""
import sys,json,math,datetime,random
from pathlib import Path
raw=json.loads(Path(sys.argv[1]).read_text());features=[];green=[];trees=[];stats={'buildings':0,'taggedHeights':0,'estimatedHeights':0,'greenAreas':0,'mappedTrees':0,'illustrativeTrees':0}
def number(v):
 try:return float(str(v).split(';')[0].split()[0])
 except (ValueError,TypeError):return None
def polygon(coords,props):return {'type':'Feature','properties':props,'geometry':{'type':'Polygon','coordinates':[coords]}}
def inside(p,ring):
 x,y=p;hit=False
 for a,b in zip(ring,ring[1:]):
  if (a[1]>y)!=(b[1]>y) and x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]:hit=not hit
 return hit
def circle(lng,lat,r):return [[round(lng+math.cos(i*math.pi/4)*r/(111320*math.cos(math.radians(lat))),7),round(lat+math.sin(i*math.pi/4)*r/111320,7)] for i in range(9)]
for e in raw['elements']:
 tags=e.get('tags',{});osm=f"{e['type']}/{e['id']}"
 if e['type']=='node' and tags.get('natural')=='tree':
  trees.append((e['lon'],e['lat'],osm,False));stats['mappedTrees']+=1;continue
 coords=[[round(p['lon'],7),round(p['lat'],7)] for p in e.get('geometry',[]) if 'lon'in p and 'lat'in p]
 if len(coords)<4 or coords[0]!=coords[-1]:continue
 if 'building'in tags:
  height=number(tags.get('height'));levels=number(tags.get('building:levels'));source='height' if height else 'levels' if levels else 'estimate'
  height=height or (levels*3.1 if levels else 6)
  height=max(2,min(120,height));base=max(0,min(height-1,number(tags.get('min_height')) or 0))
  stats['buildings']+=1;stats['taggedHeights' if source!='estimate' else 'estimatedHeights']+=1
  color='#b9aa88' if tags['building']in ['industrial','warehouse'] else '#e3d2aa' if tags['building']in ['school','civic','public'] else '#c3bda8'
  features.append(polygon(coords,{'kind':'building','osm':osm,'height':round(height,1),'base':base,'heightSource':source,'color':color}))
 else:
  green.append((coords,osm));stats['greenAreas']+=1
  features.append(polygon(coords,{'kind':'green','osm':osm}))
# Decorative trees are restricted to documented green polygons. They are not
# represented as surveyed tree positions, and never placed on buildings.
buildings=[f['geometry']['coordinates'][0] for f in features if f['properties']['kind']=='building']
for ring,osm in green:
 rng=random.Random(osm);xs=[p[0]for p in ring];ys=[p[1]for p in ring];count=0
 for _ in range(200):
  if count>=35 or stats['illustrativeTrees']>=420:break
  point=[rng.uniform(min(xs),max(xs)),rng.uniform(min(ys),max(ys))]
  if inside(point,ring) and not any(inside(point,b)for b in buildings):
   trees.append((*point,osm,True));count+=1;stats['illustrativeTrees']+=1
for lng,lat,osm,illustration in trees:
 features.append(polygon(circle(lng,lat,.3),{'kind':'trunk','osm':osm,'height':3,'base':0,'illustration':illustration}))
 features.append(polygon(circle(lng,lat,2.5),{'kind':'canopy','osm':osm,'height':7,'base':2.5,'illustration':illustration}))
output={'type':'FeatureCollection','features':features}
root=Path(__file__).resolve().parent.parent/'dist/environment';root.mkdir(exist_ok=True)
(root/'labuan.geojson').write_text(json.dumps(output,separators=(',',':')))
meta={'source':'OpenStreetMap contributors via Overpass API','license':'ODbL-1.0','attribution':'https://www.openstreetmap.org/copyright','osmTimestamp':raw.get('osm3s',{}).get('timestamp_osm_base'),'bbox':[115.08,5.10,115.37,5.44],'stats':stats,'heightNote':'OSM height where present, otherwise levels × 3.1 m; untagged buildings shown at an illustrative 6 m. Not a surveyed city model.','vegetationNote':'Mapped tree nodes plus illustrative trees within OSM green areas; canopy shapes and heights are illustrative.'}
(root/'metadata.json').write_text(json.dumps(meta,indent=2)+'\n')
print(json.dumps(stats));print('GeoJSON bytes:',(root/'labuan.geojson').stat().st_size)
