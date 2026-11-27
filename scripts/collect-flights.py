"""Read ExploreLabuan's public arrivals / departures flight-board component.
No login/API key. Ephemeral public-session cookies and CSRF stay in memory.
Usage: python3 scripts/collect-flights.py OUTPUT
Fixtures: --arrivals-file FILE --departures-file FILE --now ISO_TIMESTAMP
"""
import argparse,datetime as dt,html,http.cookiejar,json,re,urllib.request
from html.parser import HTMLParser
from pathlib import Path
SOURCE='https://explorelabuan.my/?lang=en'
ZONE=dt.timezone(dt.timedelta(hours=8))
class Rows(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=True);self.rows=[];self.row=None;self.cell=None
 def handle_starttag(self,tag,attrs):
  if tag=='tr':self.row=[]
  if tag=='td' and self.row is not None:self.cell=[]
 def handle_data(self,text):
  if self.cell is not None and text.strip():self.cell.append(text.strip())
 def handle_endtag(self,tag):
  if tag=='td' and self.cell is not None:
   if self.row is not None:self.row.append(' '.join(self.cell))
   self.cell=None
  if tag=='tr' and self.row is not None:self.rows.append(self.row);self.row=None

def iso(value):return value.astimezone(dt.timezone.utc).isoformat(timespec='seconds').replace('+00:00','Z')
def clock(value,date):
 m=re.fullmatch(r'(\d{2}):(\d{2})',value.strip())
 if not m or int(m[1])>23 or int(m[2])>59:raise ValueError('Invalid flight clock')
 return dt.datetime.combine(date,dt.time(int(m[1]),int(m[2])),ZONE)
def status(value):
 s=value.lower()
 for token,code in [('cancel','cancelled'),('divert','diverted'),('departed','departed'),('landed','landed'),('delay','delayed'),('time','on-time'),('await','scheduled'),('schedul','scheduled'),('boarding','boarding'),('en route','en-route')]:
  if token in s:return code
 return 'unknown'
def parse_board(fragment,direction,date):
 if not all(word in fragment for word in ['Scheduled','Estimated','Flight']):raise ValueError('Flight board unavailable')
 parser=Rows();parser.feed(fragment);flights=[]
 for cells in parser.rows:
  if len(cells)!=7:continue
  m=re.match(r'^([A-Z0-9]{2,3})\s*(\d{1,4}[A-Z]?)\s+(.+)$',cells[0]);city=re.match(r'^(.*?)\s*\(([A-Z]{3})\)',cells[2])
  if not m or not city:continue
  number=m[1]+m[2];scheduled=clock(cells[3],date);estimated=None
  if re.fullmatch(r'\d{2}:\d{2}',cells[4]):
   estimated=clock(cells[4],date)
   if (estimated-scheduled).total_seconds()<-43200:estimated+=dt.timedelta(days=1)
   if (estimated-scheduled).total_seconds()>43200:estimated-=dt.timedelta(days=1)
  pair=city[2]+' ➔ LBU' if direction=='arrival' else 'LBU ➔ '+city[2]
  if pair not in cells[2]:raise ValueError('Wrong flight-board direction')
  flights.append({'id':f'{date}:{direction}:{number}','direction':direction,'number':number,'aircraft':m[3].strip(),'airline':re.sub(r'^[A-Z0-9]{2,3}\s+','',cells[1]),'city':city[1].strip(),'otherAirport':city[2],'scheduledAt':iso(scheduled),'estimatedAt':iso(estimated)if estimated else None,'status':status(cells[6]),'sourceStatus':cells[6],'gate':cells[5]})
 if not flights:raise ValueError('No readable flight rows; previous snapshot retained')
 return flights

def fetch_boards():
 jar=http.cookiejar.CookieJar();opener=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar));opener.addheaders=[('User-Agent','Mozilla/5.0 (compatible; JelajahLabuan/1.0)')]
 page=opener.open(SOURCE,timeout=25).read().decode()
 csrf=html.unescape(re.search(r'<meta[^>]+name=["\']csrf-token["\'][^>]+content=["\']([^"\']+)',page)[1])
 snapshots=[html.unescape(m[1])for m in re.finditer(r'wire:snapshot="([^"]+)"',page)];snapshot=next(s for s in snapshots if json.loads(s).get('memo',{}).get('name')=='public.flight-board')
 endpoint=html.unescape(re.search(r'data-update-uri="([^"]+)"',page)[1])
 if not endpoint.startswith('https://explorelabuan.my/'):raise ValueError('Unexpected flight component origin')
 payload={'_token':csrf,'components':[{'snapshot':snapshot,'updates':{},'calls':[{'path':'','method':'setType','params':['departures']}]}]}
 request=urllib.request.Request(endpoint,data=json.dumps(payload).encode(),headers={'Content-Type':'application/json','X-Livewire':'','Referer':SOURCE})
 response=json.load(opener.open(request,timeout=25));departures=response['components'][0]['effects']['html']
 return page,departures

def main():
 p=argparse.ArgumentParser();p.add_argument('output');p.add_argument('--arrivals-file');p.add_argument('--departures-file');p.add_argument('--now');a=p.parse_args()
 now=dt.datetime.fromisoformat(a.now.replace('Z','+00:00'))if a.now else dt.datetime.now(dt.timezone.utc);date=now.astimezone(ZONE).date()
 if a.arrivals_file and a.departures_file:arrivals=Path(a.arrivals_file).read_text();departures=Path(a.departures_file).read_text()
 else:arrivals,departures=fetch_boards()
 flights=parse_board(arrivals,'arrival',date)+parse_board(departures,'departure',date)
 result={'version':1,'airport':'LBU','source':'ExploreLabuan.my','sourceUrl':SOURCE,'fetchedAt':iso(now),'serviceDate':str(date),'dateBasis':'local-day-of-retrieval','timezone':'Asia/Kuching','flights':flights}
 Path(a.output).write_text(json.dumps(result,separators=(',',':'))+'\n');print('Collected ExploreLabuan flights:',len(flights))
if __name__=='__main__':main()
