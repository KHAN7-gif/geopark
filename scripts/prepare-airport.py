"""Prepare attributed Labuan runway / civil-apron geometry and a taxiway path.
Usage: python3 scripts/prepare-airport.py AIRPORT_OSM_GEOJSON
Animation direction is illustrative, not an active runway / ATC feed.
"""
from pathlib import Path
import json,sys,math,heapq
raw=json.loads(Path(sys.argv[1]).read_text());features=raw['features'];runway=next(f for f in features if f['properties']['aeroway']=='runway');line=runway['geometry']['coordinates'];sx=111320*math.cos(math.radians(5.3));sy=111320
point=lambda p:(p[0]*sx,p[1]*sy)
def distance(a,b):return math.hypot((a[0]-b[0])*sx,(a[1]-b[1])*sy)
def centre(f):
 r=f['geometry']['coordinates'][0];return [sum(p[i]for p in r[:-1])/(len(r)-1)for i in[0,1]]
terminal=next(f for f in features if f['properties']['aeroway']=='terminal');tc=centre(terminal);apron=min((f for f in features if f['properties']['aeroway']=='apron'),key=lambda f:distance(centre(f),tc));ac=centre(apron)
graph={};coords={}
def key(p):return tuple(round(v,7)for v in p)
for f in features:
 if f['properties']['aeroway']!='taxiway' or f['geometry']['type']!='LineString':continue
 for a,b in zip(f['geometry']['coordinates'],f['geometry']['coordinates'][1:]):
  ka,kb=key(a),key(b);coords[ka]=a;coords[kb]=b;graph.setdefault(ka,[]).append((kb,distance(a,b)));graph.setdefault(kb,[]).append((ka,distance(a,b)))
start=min(graph,key=lambda p:distance(p,ac));goals={key(p)for p in line if key(p)in graph};assert goals,'No runway / taxiway junction';cost={start:0};prev={};queue=[(0,start)];finish=None
while queue:
 c,node=heapq.heappop(queue)
 if c!=cost[node]:continue
 if node in goals:finish=node;break
 for other,edge in graph[node]:
  value=c+edge
  if value<cost.get(other,float('inf')):cost[other]=value;prev[other]=node;heapq.heappush(queue,(value,other))
assert finish,'No civil taxiway route';path=[finish]
while path[-1]!=start:path.append(prev[path[-1]])
path=[coords[p]for p in path];assert distance(path[-1],ac)<150
# Include only the civil apron; never populate military ramps with civil flights.
keep=[f for f in features if f['properties']['aeroway']in['runway','taxiway','terminal','jet_bridge']or f is apron]
root=Path(__file__).resolve().parent.parent/'dist/environment';(root/'airport.geojson').write_text(json.dumps({'type':'FeatureCollection','features':keep},separators=(',',':')))
layout={'airport':'LBU','icao':'WBKL','runwayRef':'14/32','runwayOsm':runway['properties']['osm'],'runway':line,'runwayWidth':45,'terminal':tc,'civilApron':ac,'taxiPath':path,'source':'OpenStreetMap contributors / API 0.6','license':'ODbL-1.0','geometryDate':'2026-11-27','note':'Runway/taxiway geometry from OSM. Civil movement path and fixed runway-14 animation are game illustrations, not ATC / radar positions.'}
(root/'airport-layout.mjs').write_text('export const AIRPORT_LAYOUT='+json.dumps(layout,separators=(',',':'))+';\n');print('Prepared civil airport path:',len(path),'points;',round(cost[finish]),'m')
