"""Cria atlas a partir das silhuetas; não modifica os PNGs."""
import json,re,subprocess
from pathlib import Path
root=Path(__file__).resolve().parent.parent
summary={}
for key,target in [('dad',225),('pedin',195)]:
 p=root/f'public/assets/characters/{key}-run-v3.png'
 w,h=map(int,subprocess.check_output(['identify','-format','%w %h',str(p)],text=True).split())
 output=subprocess.check_output(['magick',str(p),'-alpha','extract','-threshold','20%','-define','connected-components:verbose=true','-connected-components','8','null:'],text=True)
 boxes={}
 for line in output.splitlines():
  m=re.search(r'\d+: (\d+)x(\d+)\+(\d+)\+(\d+) ([\d.]+),([\d.]+) (\d+) srgb\(255,255,255\)',line)
  if not m or int(m[7])<1500:continue
  bw,bh,x,y=map(int,m.group(1,2,3,4));cx,cy=map(float,m.group(5,6))
  index=int(cy/(h/4))*4+int(cx/(w/4))
  if index in boxes:raise RuntimeError(f'{key}: figuras sobrepostas na célula {index}')
  boxes[index]={'x':x,'y':y,'w':bw,'h':bh}
 if sorted(boxes)!=list(range(16)):raise RuntimeError(f'{key}: encontradas {len(boxes)} poses, esperado 16')
 size=max(320,max(max(r['w'],r['h']) for r in boxes.values())+20)
 frames={f'run/{i:02}':{'frame':r,'rotated':False,'trimmed':True,'spriteSourceSize':{'x':(size-r['w'])//2,'y':size-r['h']-4,'w':r['w'],'h':r['h']},'sourceSize':{'w':size,'h':size}} for i,r in sorted(boxes.items())}
 atlas={'frames':frames,'meta':{'image':p.name,'size':{'w':w,'h':h},'scale':'1'}}
 (p.with_suffix('.json')).write_text(json.dumps(atlas,indent=2)+'\n')
 median=sorted(r['h'] for r in boxes.values())[8]
 summary[key]={'scale':round((.52 if key=='dad' else .34)*target/median,5),'frames':16,'fps':20}
 print(key,w,h,len(boxes),summary[key])
(root/'src/game/run-cycles.json').write_text(json.dumps(summary,indent=2)+'\n')
