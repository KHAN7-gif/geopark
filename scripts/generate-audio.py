"""Original procedural WAV previews; no third-party recordings or packages."""
from pathlib import Path
import math,random,struct,wave
RATE=16000
OUT=Path(__file__).resolve().parents[1]/'dist/audio'
OUT.mkdir(exist_ok=True)
for kind,seconds in [('sea',8),('birds',6),('night',6),('town',7),('steps',4),('engine',5)]:
 rng=random.Random(817);samples=[];low=0;phase=0
 for n in range(RATE*seconds):
  t=n/RATE;noise=rng.uniform(-1,1);low=low*.94+noise*.06
  if kind=='sea':v=(low*2.4+noise*.08)*(.48+.38*math.sin(t*2*math.pi/4)**2)
  elif kind=='birds':
   v=low*.1
   for start,hz in [(0.6,1700),(1.15,2100),(2.5,1850),(3.9,2200),(4.3,1600)]:
    d=t-start
    if 0<d<.23:v+=math.sin(2*math.pi*(hz*d+1800*d*d))*math.sin(math.pi*d/.23)**2*.22
  elif kind=='night':
   d=t%.7;v=low*.08+(math.sin(t*2*math.pi*2900)*math.sin(math.pi*d/.13)**2*.14 if d<.13 else 0)
  elif kind=='town':
   envelope=math.sin(math.pi*t/seconds)**2;v=low*.7+envelope*(math.sin(2*math.pi*(55*t+2*t*t))*.13+math.sin(2*math.pi*120*t)*.04)
  elif kind=='steps':
   d=t%.53;v=(low*3+math.sin(2*math.pi*110*d)*.14)*math.exp(-d*34) if d<.2 else 0
  else:
   phase+=2*math.pi*(72+4*math.sin(t*2))/RATE;v=math.sin(phase)*.25+math.sin(phase*2)*.08+low*.25
  v*=min(1,t/.06,(seconds-t)/.06);samples.append(v)
 peak=max(abs(v)for v in samples)or 1
 with wave.open(str(OUT/(kind+'.wav')),'wb')as f:
  f.setnchannels(1);f.setsampwidth(2);f.setframerate(RATE);f.writeframes(b''.join(struct.pack('<h',round(v/peak*.55*32767))for v in samples))
 print(kind,seconds,'seconds')
