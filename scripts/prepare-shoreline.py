"""Prepare a local coastal scenery mask from OSM coastline ways.
Usage: python3 scripts/prepare-shoreline.py /path/to/osm-coastline.json
The input has OSM elements with nodes and geometry (Overpass JSON format).
"""
import json,sys
from pathlib import Path
raw=json.loads(Path(sys.argv[1]).read_text());pending=[]
for way in raw['elements']:
 pending.append(([str(n)for n in way['nodes']],[[p['lon'],p['lat']]for p in way['geometry']],[way['id']]))
rings=[];ignored=0
while pending:
 ids,points,ways=pending.pop()
 while ids[0]!=ids[-1]:
  match=False
  for i,(other,coords,refs)in enumerate(pending):
   if ids[-1]==other[0]:ids+=other[1:];points+=coords[1:]
   elif ids[-1]==other[-1]:ids+=other[-2::-1];points+=coords[-2::-1]
   elif ids[0]==other[-1]:ids=other[:-1]+ids;points=coords[:-1]+points
   elif ids[0]==other[0]:ids=other[:0:-1]+ids;points=coords[:0:-1]+points
   else:continue
   ways+=refs;pending.pop(i);match=True;break
  if not match:break
 if ids[0]==ids[-1]and len(points)>3 and all(115.08<=p[0]<=115.32 and 5.10<=p[1]<=5.44 for p in points):rings.append((points,ways))
 else:ignored+=1
def inside(point,ring):
 x,y=point;hit=False
 for a,b in zip(ring,ring[1:]):
  if (a[1]>y)!=(b[1]>y)and x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]:hit=not hit
 return hit
assert any(inside([115.23,5.30],r)for r,_ in rings),'Main Labuan coastline is incomplete; do not publish water overlay'
def area(ring):return sum(a[0]*b[1]-b[0]*a[1]for a,b in zip(ring,ring[1:]))/2
outer=[[115.08,5.10],[115.32,5.10],[115.32,5.44],[115.08,5.44],[115.08,5.10]]
holes=[list(reversed(r))if area(r)>0 else r for r,_ in rings]
features=[{'type':'Feature','properties':{'kind':'sea'},'geometry':{'type':'Polygon','coordinates':[outer,*holes]}}]
features +=[{'type':'Feature','properties':{'kind':'shore','osmWays':ways},'geometry':{'type':'LineString','coordinates':ring}}for ring,ways in rings]
root=Path(__file__).resolve().parent.parent/'dist/environment'
(root/'shoreline.geojson').write_text(json.dumps({'type':'FeatureCollection','features':features},separators=(',',':')))
(root/'shoreline-metadata.json').write_text(json.dumps({'source':'OpenStreetMap API coastline ways','copyright':'OpenStreetMap contributors','license':'ODbL-1.0','attribution':'https://www.openstreetmap.org/copyright','snapshotDate':'2026-11-26','closedIslandOutlines':len(rings),'unusedOpenChains':ignored,'note':'Coastal water colours, foam and waves are decorative. Shorelines follow the bundled OSM geometry. No tide or weather data is implied.'},indent=2)+'\n')
print('Closed island outlines:',len(rings),'unused open chains:',ignored,'bytes:',(root/'shoreline.geojson').stat().st_size)
