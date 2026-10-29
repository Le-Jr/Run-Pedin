import type Phaser from 'phaser';
import type { RunModel } from '../game/domain/run';
import { colors, frames, icons, pixelSvg, pixelUrl } from './pixel-art';
import './hud.css';

// Recortes de rosto/busto dentro do quadro parado de cada atlas (coordenadas do quadro).
const portraits={
  dad:{texture:'dad',frame:'row-1/00',x:12,y:4,size:100},
  pedin:{texture:'pedin',frame:'row-1/00',x:6,y:0,size:112},
  mom:{texture:'mom',frame:'row-1/00',x:64,y:2,size:100},
} as const;
type ArtTarget={id:string;width:number;height:number}&({portrait:keyof typeof portraits}|{prop:string});
const art:ArtTarget[]=[
  {id:'hud-dad',width:40,height:40,portrait:'dad'},
  {id:'chase-dad',width:20,height:20,portrait:'dad'},
  {id:'chase-pedin',width:20,height:20,portrait:'pedin'},
  {id:'toast-mom',width:40,height:40,portrait:'mom'},
  {id:'icon-coin',width:16,height:18,prop:'coin'},
  {id:'icon-shield',width:20,height:20,prop:'shield'},
  {id:'icon-boost',width:22,height:20,prop:'boost'},
  {id:'how-coin',width:16,height:18,prop:'coin'},
  {id:'how-shield',width:20,height:20,prop:'shield'},
  {id:'how-boost',width:22,height:20,prop:'boost'},
  {id:'how-star',width:20,height:20,prop:'star'},
  {id:'result-coin',width:16,height:18,prop:'coin'},
  {id:'result-star',width:18,height:18,prop:'star'},
];
export const canvas=(id:string)=>{const t=art.find(a=>a.id===id)!;return `<canvas id="${id}" class="px-art" width="${t.width}" height="${t.height}" aria-hidden="true"></canvas>`;};
export const icon=(name:keyof typeof icons,className:string,palette={})=>`<span class="px-icon ${className}" aria-hidden="true">${pixelSvg({...icons[name],palette:{...icons[name].palette,...palette}})}</span>`;

// screens: telas que também vivem na camada lógica (menu, abertura, pausa, resultado, carregamento).
export const hudMarkup=(screens:string)=>`
<div id="hud-layer" class="hud-layer">
<div id="hud" class="hud hidden">
<div class="hud-primary">
<div class="px-plate hud-life">${canvas('hud-dad')}<span id="hearts" class="hud-hearts" role="img" aria-label="3 corações"><i class="hud-heart"></i><i class="hud-heart"></i><i class="hud-heart"></i></span></div>
<div class="hud-right">
<div class="px-plate hud-stats"><span class="hud-stat"><span class="hud-label">DISTÂNCIA</span><b id="distance" class="hud-number">000000</b><span class="hud-unit">m</span></span><span class="hud-stat" aria-label="Moedas">${canvas('icon-coin')}<span class="hud-unit">×</span><b id="coins" class="hud-number">00</b></span></div>
<button id="pause-button" class="px-button hud-pause" aria-label="Pausar jogo">${icon('pause','hud-pause-icon')}</button>
</div>
</div>
<div class="hud-secondary">
<div id="chase" class="px-plate hud-chase" role="img" aria-label="Pedin a 18 metros">${canvas('chase-dad')}${icon('chevron','hud-arrow')}<b id="gap-label" class="hud-small-number">18 m</b>${icon('chevron','hud-arrow')}${canvas('chase-pedin')}</div>
<div class="px-plate hud-time" role="img" aria-label="Tempo restante">${icon('clock','hud-clock')}<b id="time-left" class="hud-small-number">90</b><span class="hud-unit">s</span></div>
</div>
</div>
<div id="buffs" class="hud-buffs hidden">
<div id="buff-shield" class="px-plate px-plate-pink hud-buff hidden">${canvas('icon-shield')}<span class="hud-label">ESCUDO</span><b id="shield-time" class="hud-small-number">0</b><span class="hud-unit">s</span></div>
<div id="buff-boost" class="px-plate px-plate-orange hud-buff hidden">${canvas('icon-boost')}<span class="hud-label">BOOST</span><b id="boost-time" class="hud-small-number">0</b><span class="hud-unit">s</span></div>
</div>
<div id="toast" class="toast hidden" role="status">${canvas('toast-mom')}<div class="balloon"><span id="toast-text"></span></div></div>
${screens}
</div>
<div id="touch-controls" class="touch-controls hidden"><button id="slide" class="px-button touch-button" aria-label="Deslizar">${icon('arrowDown','touch-arrow')}<span>DESLIZE</span></button><button id="jump" class="px-button px-button-primary touch-button" aria-label="Pular">${icon('arrowUp','touch-arrow',{y:colors.ink})}<span>PULE</span></button></div>`;

const el=(id:string)=>document.getElementById(id)!;

export function mountHud(stage:HTMLElement,root:HTMLElement,gameCanvas:()=>HTMLCanvasElement|undefined){
  const layer=el('hud-layer');
  const vars={'--frame-cyan':frames.cyan,'--frame-panel':frames.cyan,'--icon-tail-down':icons.tailDown,'--icon-check':icons.check,'--frame-yellow':frames.yellow,'--frame-primary':frames.primary,'--frame-pink':frames.pink,'--frame-orange':frames.orange,'--frame-balloon':frames.balloon,'--icon-heart':icons.heart,'--icon-heart-empty':icons.heartEmpty,'--icon-tail':icons.tail};
  for(const [name,map] of Object.entries(vars))root.style.setProperty(name,pixelUrl(map));
  // A camada usa pixels lógicos e acompanha o canvas sem passar da escala da cena. Cada pixel
  // lógico ocupa um número inteiro de pixels do dispositivo; abaixo de 0,625 o HUD deixa de
  // diminuir (aceitando um pixel fracionado para manter o texto legível) e se redistribui.
  const fit=()=>{
    const view=gameCanvas();if(!view)return;
    const box=view.getBoundingClientRect(),parent=stage.getBoundingClientRect();
    if(!box.width)return;
    const dpr=devicePixelRatio||1,snap=(value:number)=>Math.round(value*dpr)/dpr;
    const unit=Math.max(.625,Math.floor(box.width/960*dpr)/dpr);
    Object.assign(layer.style,{left:`${snap(box.left-parent.left)}px`,top:`${snap(box.top-parent.top)}px`,width:`${box.width/unit}px`,height:`${box.height/unit}px`});
    layer.style.setProperty('--u',String(unit));
    // --s converte pixels da cena (960 × 540) para pixels da camada.
    layer.style.setProperty('--s',String(box.width/960/unit));
  };
  new ResizeObserver(fit).observe(stage);
  addEventListener('resize',fit);
  return fit;
}

export function paintHudArt(textures:Phaser.Textures.TextureManager){
  for(const target of art){
    const ctx=(el(target.id) as HTMLCanvasElement).getContext('2d')!;
    ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    ctx.clearRect(0,0,target.width,target.height);
    if('portrait' in target){
      const p=portraits[target.portrait],frame=textures.getFrame(p.texture,p.frame);
      ctx.fillStyle=colors.panelLight;
      ctx.fillRect(0,0,target.width,target.height);
      ctx.drawImage(frame.source.image as CanvasImageSource,frame.cutX+p.x,frame.cutY+p.y,p.size,p.size,0,0,target.width,target.height);
    }else{
      const frame=textures.getFrame('props',target.prop),scale=Math.min(target.width/frame.cutWidth,target.height/frame.cutHeight);
      const w=Math.round(frame.cutWidth*scale),h=Math.round(frame.cutHeight*scale);
      ctx.drawImage(frame.source.image as CanvasImageSource,frame.cutX,frame.cutY,frame.cutWidth,frame.cutHeight,Math.round((target.width-w)/2),Math.round((target.height-h)/2),w,h);
    }
  }
}

const pad=(value:number,length:number)=>String(Math.max(0,Math.floor(value))).padStart(length,'0');
export function updateHud(m:RunModel){
  el('distance').textContent=pad(m.distance,6);
  el('coins').textContent=pad(m.coins,2);
  el('time-left').textContent=String(Math.max(0,Math.ceil(90-m.time)));
  const hearts=el('hearts');
  hearts.querySelectorAll('i').forEach((heart,i)=>heart.classList.toggle('empty',i>=m.hearts));
  hearts.setAttribute('aria-label',`${m.hearts} ${m.hearts===1?'coração':'corações'}`);
  const gap=Math.max(0,Math.ceil(m.gap));
  el('gap-label').textContent=`${gap} m`;el('chase').setAttribute('aria-label',`Pedin a ${gap} metros`);
  for(const [id,left] of [['shield',m.shield],['boost',m.boost]] as const){
    el(`buff-${id}`).classList.toggle('hidden',left<=0);
    el(`${id}-time`).textContent=String(Math.ceil(left));
  }
}
