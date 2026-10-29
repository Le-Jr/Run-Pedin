import { propLayout, propSizes, obstacleBody, type PropKind, type ObstacleKind } from './game/data/props';
import runCycles from './game/run-cycles.json';
type Rect = {x:number;y:number;w:number;h:number};
type Frame = {frame:Rect;spriteSourceSize:Rect;sourceSize:{w:number;h:number}};
type Atlas = {frames:Record<string,Frame>};
const canvas=document.querySelector('canvas')!;
const ctx=canvas.getContext('2d')!;
const base=import.meta.env.BASE_URL;
async function asset(imagePath:string,atlasPath:string) {
  const image=new Image();image.src=base+imagePath;
  const [atlas]=await Promise.all([fetch(base+atlasPath).then(r=>{if(!r.ok)throw Error(atlasPath);return r.json() as Promise<Atlas>}),image.decode()]);
  return {image,atlas};
}
try {
  const [props,dad,pedin]=await Promise.all([
    asset('assets/props/props-sheet-v1.png','assets/props/props-atlas-v2.json'),
    asset('assets/characters/dad-run-v3.png','assets/characters/dad-run-v3.json'),
    asset('assets/characters/pedin-run-v3.png','assets/characters/pedin-run-v3.json')
  ]);
  function draw(){
    ctx.clearRect(0,0,1100,510);ctx.imageSmoothingEnabled=false;
    ctx.font='14px monospace';ctx.textAlign='center';
    for(const [row,keys] of [ ['blocks','bear','stool','plant','puddle','basket'], ['coin','shield','boost','star','bottle','gift'] ].entries()){
      const floor=180+row*245;
      ctx.fillStyle='#1673d1';ctx.fillRect(20,floor,1060,2);
      for(const [i,character] of [dad,pedin].entries()){
        const f=character.atlas.frames['run/00'],r=f.frame,s=f.spriteSourceSize;
        const scale=i===0?runCycles.dad.scale:runCycles.pedin.scale;
        const x=90+i*115;
        ctx.drawImage(character.image,r.x,r.y,r.w,r.h,x+(s.x-f.sourceSize.w/2)*scale,floor+(s.y-f.sourceSize.h)*scale,r.w*scale,r.h*scale);
        ctx.fillStyle='#ffe34a';ctx.fillText(i===0?'PAPAI':'PEDIN',x,floor+28);
      }
      keys.forEach((name,index)=>{
        const key=name as PropKind,r=props.atlas.frames[key].frame;
        const layout=propLayout(key,r.w,r.h),x=345+index*137;
        ctx.drawImage(props.image,r.x,r.y,r.w,r.h,x-layout.width/2,floor-layout.height,layout.width,layout.height);
        if((document.querySelector('#bodies') as HTMLInputElement).checked&&['blocks','bear','stool'].includes(key)){
          const b=obstacleBody(key as ObstacleKind);ctx.strokeStyle='#ff64a8';ctx.lineWidth=1;ctx.strokeRect(x-b.width/2,floor-b.bottom-b.height,b.width,b.height);
        }
        ctx.fillStyle='#f8faff';ctx.fillText(propSizes[key].label,x,floor+28);
        ctx.fillStyle='#00cfff';ctx.fillText(`${Math.round(layout.width)} × ${Math.round(layout.height)}`,x,floor+49);
      });
    }
  }
  document.querySelector('#bodies')!.addEventListener('change',draw);draw();
  document.querySelector('#status')!.textContent='Dimensões em pixels lógicos. A linha azul é o chão; no jogo os coletáveis ficam suspensos.';
}catch(error){document.querySelector('#status')!.textContent=`Falha ao carregar a prévia: ${String(error)}`;}
