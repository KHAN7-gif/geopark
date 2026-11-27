"""Convert an attributed OSM Overpass highway geometry snapshot into game roads.
Usage: python3 scripts/prepare-game-roads.py /path/to/overpass.json
Road centre lines are OSM; widths / colours / markings are illustrative.
"""
import json,sys
from pathlib import Path
raw=json.loads(Path(sys.argv[1]).read_text());features=[]
widths={'primary':9,'secondary':8,'tertiary':7,'residential':5.5,'unclassified':5.5,'service':4,'living_street':4,'footway':1.8,'path':1.5,'track':2.5,'cycleway':2,'pedestrian':3,'steps':1.5}
for e in raw['elements']:
 t=e.get('tags',{});coords=[[p['lon'],p['lat']] for p in e.get('geometry',[]) if 'lon'in p and 'lat'in p]
 if len(coords)<2:continue
 kind=t.get('highway','service');width=widths.get(kind,6)
 try:width=max(1,min(20,float(t.get('width',str(width)).split()[0])))
 except ValueError:pass
 features.append({'type':'Feature','properties':{'osm':'way/'+str(e['id']),'name':t.get('name',''),'highway':kind,'width':width,'foot':kind in ['footway','path','track','cycleway','pedestrian','steps'],'bridge':t.get('bridge','no')!='no','tunnel':t.get('tunnel','no')!='no'},'geometry':{'type':'LineString','coordinates':coords}})
Path('dist/environment/game-roads.geojson').write_text(json.dumps({'type':'FeatureCollection','features':features},separators=(',',':')))
Path('dist/environment/game-roads-metadata.json').write_text(json.dumps({'source':'OpenStreetMap contributors via Overpass API','license':'ODbL-1.0','attribution':'https://www.openstreetmap.org/copyright','osmTimestamp':raw.get('osm3s',{}).get('timestamp_osm_base'),'roads':len(features),'note':'OSM road centre lines. Surface colours, widths without tags and lane markings are game illustrations, not surveyed lane data.'},indent=2))
print('Prepared',len(features),'road lines')
