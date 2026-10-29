import Phaser from 'phaser';
import { RunScene } from './game/RunScene';
import { loadSave, writeSave } from './platform/save';
import { AudioBus, type Track } from './platform/audio';
import { hudMarkup, mountHud, paintHudArt, updateHud } from './ui/hud';
import { dialogs, layerScreens } from './ui/screens';
import { paintLogo } from './ui/logo';
import './style.css';

const save=loadSave(),audio=new AudioBus(save);
const app=document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML=`
<main class="arcade" aria-label="Pedin Run!, uma corrida em família">
<div class="stage-wrap">
<div id="game" aria-label="Área do jogo. Espaço para pular, S para deslizar, Escape para pausar."></div>
${hudMarkup(layerScreens)}
</div>
</main>
${dialogs(save)}`;
const el=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;
let displayedState='',lastMessageTime=-10,toastUntil=0,loadingFailed=false;
const scene=new RunScene(save,audio,refresh,showMessage,(error)=>{
  if(error){
    loadingFailed=true;el('loading-title').textContent='OPS! FALTOU UM DESENHO';
    el('loading-error').textContent=error;el('loading-error').classList.remove('hidden');el('retry').classList.remove('hidden');return;
  }
  if(!loadingFailed){el('loading').classList.add('hidden');paintHudArt(scene.textures);fitHud();refresh();}
});
scene.onProgress=value=>{
  el('load-progress').textContent=`${Math.round(value*100)}%`;
  el('loading').querySelectorAll('.segments i').forEach((segment,i,all)=>segment.classList.toggle('on',i<Math.round(value*all.length)));
};
// Fonte pixel carregada cedo: HUD, logo e placas desenhadas no canvas a utilizam.
Promise.resolve(document.fonts?.load('20px "Jersey 10"')).catch(()=>{}).finally(()=>{
  for(const id of ['loading-logo','menu-logo']){
    const logo=el<HTMLCanvasElement>(id);paintLogo(logo);
    logo.style.setProperty('--logo-w',String(logo.width));logo.style.setProperty('--logo-h',String(logo.height));
  }
});
const game=new Phaser.Game({type:Phaser.AUTO,parent:'game',width:960,height:540,backgroundColor:'#080B12',pixelArt:true,roundPixels:true,scene:[scene],physics:{default:'arcade',arcade:{gravity:{x:0,y:1500},debug:false,customUpdate:true}},scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},render:{antialias:false},audio:{noAudio:true}});
const fitHud=mountHud(document.querySelector<HTMLElement>('.stage-wrap')!,document.documentElement,()=>game.canvas);

const pad=(value:number)=>String(value).padStart(6,'0');
function refresh(){
  const m=scene.model;
  updateHud(m);
  if(m.time>=toastUntil)el('toast').classList.add('hidden');
  if(m.state===displayedState)return;
  displayedState=m.state;document.body.dataset.state=m.state;
  // Pausa mantém a trilha atual (o contexto de áudio é suspenso pela cena).
  const track=({ready:'menu',intro:'intro',running:'run',catching:'run',won:'win',lost:'lose'} as Record<string,Track>)[m.state];
  if(track)audio.music(track);
  el('best').textContent=pad(save.best);
  const playing=m.state==='running'||m.state==='catching'||m.state==='paused';
  for(const [id,show] of [['menu',m.state==='ready'],['intro-bubble',m.state==='intro'],['pause',m.state==='paused'],['result',m.state==='won'||m.state==='lost'],['hud',playing],['buffs',m.state==='running'],['touch-controls',m.state==='running']] as const)el(id).classList.toggle('hidden',!show||!scene.ready);
  if(m.state==='paused')el('resume').focus({preventScroll:true});
  if(m.state==='ready'&&scene.ready)el('start').focus({preventScroll:true});
  if(m.state==='intro')el('toast').classList.add('hidden');
  if(m.state==='won'||m.state==='lost'){
    const record=m.score>save.best;
    save.best=Math.max(save.best,m.score);writeSave(save);
    el('result-title').textContent=m.state==='won'?'PEGOU!':'QUASE LÁ!';
    el('result-copy').textContent=m.state==='won'?'O papai alcançou o Pedin. Agora é abraço!':m.reason;
    el('result-hearts').classList.toggle('hidden',m.state!=='won');
    el('result-record').classList.toggle('hidden',!record);
    el('result-score').textContent=String(m.score);el('result-coins').textContent=String(m.coins);
    el('result-stars').textContent=String(m.stars);el('result-best').textContent=String(save.best);
    el('again').focus({preventScroll:true});el('toast').classList.add('hidden');
  }
}
function showMessage(text:string){
  const now=scene?.model.time??0;
  if(now>0&&now-lastMessageTime<10)return;
  lastMessageTime=now;toastUntil=now+4;el('toast-text').textContent=text;el('toast').classList.remove('hidden');
}
function focusGame(){const canvas=game.canvas;canvas.setAttribute('tabindex','0');canvas.setAttribute('aria-label','Pedin Run: Espaço pula; S desliza; Escape pausa.');canvas.focus({preventScroll:true});}
function prepare(){lastMessageTime=-10;toastUntil=0;save.tutorial=true;writeSave(save);focusGame();}
// JOGAR passa pela abertura com a mamãe; recomeçar e jogar de novo vão direto à corrida.
function play(){prepare();scene.intro();}
function start(){prepare();scene.start();}
el('start').onclick=play;
for(const id of ['restart','again'])el(id).onclick=start;
el('resume').onclick=()=>{scene.resume();focusGame();};
for(const id of ['back-menu','result-menu'])el(id).onclick=()=>{el('toast').classList.add('hidden');scene.menu();};
el('pause-button').onclick=()=>scene.pause();el('retry').onclick=()=>location.reload();
for(const [id,action] of [['jump',()=>scene.jump()],['slide',()=>scene.slide()]] as const){el(id).addEventListener('pointerdown',event=>{event.preventDefault();action();});el(id).addEventListener('keydown',event=>{if((event.code==='Space'||event.code==='Enter')&&!event.repeat){event.preventDefault();action();}});}
el('intro-bubble').addEventListener('pointerdown',()=>scene.jump());
window.addEventListener('keydown',event=>{
  if(el<HTMLDialogElement>('settings').open||el<HTMLDialogElement>('how').open)return;
  if(event.repeat)return;
  const state=scene.model.state;
  if(event.code==='Escape'||event.code==='KeyP'){event.preventDefault();if(state==='paused'){scene.resume();focusGame();}else scene.pause();}
  if(event.code!=='Enter'||!scene.ready||['BUTTON','INPUT','SELECT'].includes((event.target as HTMLElement)?.tagName))return;
  if(state==='ready'){event.preventDefault();play();}
  else if(state==='intro'||state==='won'||state==='lost'){event.preventDefault();start();}
});
window.addEventListener('blur',()=>scene.pause());document.addEventListener('visibilitychange',()=>{if(document.hidden)scene.pause();});
for(const [button,dialog] of [['settings-open','settings'],['pause-settings','settings'],['how-open','how']] as const)el(button).onclick=()=>{scene.pause();el<HTMLDialogElement>(dialog).showModal();};
el<HTMLInputElement>('music-volume').oninput=event=>{save.music=Number((event.target as HTMLInputElement).value);writeSave(save);audio.applyVolume();};
el<HTMLInputElement>('effects-volume').oninput=event=>{save.effects=Number((event.target as HTMLInputElement).value);writeSave(save);};
el<HTMLInputElement>('reduce-motion').onchange=event=>{save.reducedMotion=(event.target as HTMLInputElement).checked;writeSave(save);};
function updateSound(){el('sound').setAttribute('aria-label',save.muted?'Ativar áudio':'Silenciar áudio');el('sound').setAttribute('aria-pressed',String(save.muted));}
el('sound').onclick=()=>{save.muted=!save.muted;audio.unlock();audio.applyVolume();writeSave(save);updateSound();};updateSound();
// Navegadores só liberam áudio após um gesto: o primeiro toque ou tecla inicia a trilha do menu.
for(const type of ['pointerdown','keydown'])window.addEventListener(type,()=>audio.unlock(),{once:true,capture:true});
el('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.querySelector('.arcade')!.requestFullscreen();}catch{showMessage('Seu navegador não oferece tela cheia. Você pode continuar jogando aqui.');}};

document.addEventListener('fullscreenchange',()=>{game.scale.refresh();fitHud();});
game.scale.on('resize',fitHud);
