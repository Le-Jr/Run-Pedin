import Phaser from 'phaser';
import runCycles from './run-cycles.json';
import { propLayout, obstacleBody, type ObstacleKind } from './data/props';
import { RunModel, seededRandom, type Pickup } from './domain/run';
import { AudioBus } from '../platform/audio';
import type { Save } from '../platform/save';
import { frames, icons, paintFrame, paintPixels, colors } from '../ui/pixel-art';
import { family, familyPlaces, helpers, type Member, type Sibling } from './data/family';

const W=960,H=540,GROUND=438,BACK_ROW=GROUND-26,FIXED=1/60,INTRO_TIME=2.8,BABY_START=300;
const members=Object.keys(family) as Member[];
type Thing = {sprite:Phaser.Physics.Arcade.Image; kind:string; used:boolean; label?:Phaser.GameObjects.Image};
export class RunScene extends Phaser.Scene {
  model=new RunModel();
  private dad!:Phaser.Physics.Arcade.Sprite; private baby!:Phaser.GameObjects.Sprite;
  private things:Thing[]=[]; private backgrounds:Phaser.GameObjects.Image[]=[];
  private shieldRing!:Phaser.GameObjects.Ellipse; private floor!:Phaser.Physics.Arcade.StaticGroup;
  private accumulator=0; private spawnTime=1; private wave=0; private random=seededRandom(41);
  private slideTime=0; private slideCooldown=0; private jumpBuffer=0; private coyote=0;
  private catchingTime=0; private feedbackTime=0; private finished=false;
  private beforePause: 'running' | 'catching' = 'running';
  private love!:Phaser.GameObjects.Container;
  private dust!:Phaser.GameObjects.Graphics;
  private family={} as Record<Member,Phaser.GameObjects.Sprite>;
  // Integrantes andando com o chão: saindo após a abertura ou entregando um item.
  private moving=new Set<Member>(); private helping=new Set<Sibling>();
  private introTime=0;
  onProgress?:(value:number)=>void;
  ready=false;
  constructor(public save:Save,public audioBus:AudioBus,private notify:()=>void,private message:(text:string)=>void,private onLoad:(error?:string)=>void){super('Run');}
  preload(){
    const base=import.meta.env.BASE_URL;
    for(const key of ['dad','pedin',...members]){
      const file=`${key}-sheet-${key==='pedin'?'v2':'v1'}`;
      this.load.atlas(key,`${base}assets/characters/${file}.png`,`${base}assets/characters/${key}-atlas-v2.json`);
    }
    for(const key of ['dad','pedin']) this.load.atlas(`${key}-run`,`${base}assets/characters/${key}-run-v3.png`,`${base}assets/characters/${key}-run-v3.json`);
    this.load.atlas('props',`${base}assets/props/props-sheet-v1.png`,`${base}assets/props/props-atlas-v2.json`);
    this.load.image('room',`${base}assets/backgrounds/room-v1.png`);
    this.load.on('progress',(value:number)=>this.onProgress?.(value));
    this.load.once('loaderror',()=>this.onLoad('Não conseguimos carregar todos os desenhos. Confira a conexão e tente novamente.'));
  }
  create(){
    if(!['room','dad','props','pedin','dad-run','pedin-run',...members].every(key=>this.textures.exists(key))){this.onLoad('Alguns desenhos não carregaram. Tente novamente.');return;}
    this.physics.disableUpdate();
    this.physics.world.gravity.y=1500;
    this.physics.world.fixedStep=false;
    this.backgrounds=[this.add.image(0,0,'room').setOrigin(0).setDisplaySize(W,H),this.add.image(W,0,'room').setOrigin(0).setDisplaySize(W,H)];
    this.add.rectangle(W/2,GROUND+54,W,108,0xeab66a,.12);
    this.add.rectangle(W/2,GROUND+2,W,3,0x805738,.25);
    const ground=this.add.rectangle(W/2,GROUND+25,W,50,0,0);
    this.floor=this.physics.add.staticGroup();this.floor.add(ground);
    this.dad=this.physics.add.sprite(180,GROUND,'dad','row-1/00').setOrigin(.5,1).setScale(.52).setDepth(6);
    this.configureDad(false);
    this.physics.add.collider(this.dad,this.floor);
    this.baby=this.add.sprite(BABY_START,GROUND,'pedin','row-1/00').setOrigin(.5,1).setScale(.34).setDepth(5);
    for(const key of members){
      const {scale,clips}=family[key];
      for(const [name,[row,start,count,fps]] of Object.entries(clips)){
        this.animation(`${key}-${name}`,key,row,start,count,fps,name==='action'?0:-1);
      }
      this.family[key]=this.add.sprite(0,GROUND,key,'row-1/00').setOrigin(.5,1).setScale(scale);
      this.family[key].on('animationcomplete',(animation:Phaser.Animations.Animation)=>{if(animation.key.endsWith('-action'))this.family[key].play(`${key}-cheer`);});
    }
    this.shieldRing=this.add.ellipse(180,GROUND-42,76,100).setStrokeStyle(3,0xff80c5,.85).setDepth(7).setVisible(false);
    this.dust=this.add.graphics().setDepth(4);
    this.pixelTexture('ui-heart',icons.heart);
    this.love=this.add.container(212,GROUND-135,[-40,0,40].map(x=>this.add.image(x,0,'ui-heart').setScale(3))).setDepth(8).setVisible(false);
    this.runAnimation('dad-run','dad');this.animation('dad-idle','dad',1,0,4,5);
    this.runAnimation('baby-run','pedin');this.animation('baby-idle','pedin',1,0,4,5);
    this.animation('dad-cheer','dad',3,4,4,7);this.animation('baby-cheer','pedin',2,0,8,8);
    this.dad.on('animationstart',(animation:Phaser.Animations.Animation)=>this.dad.setScale(animation.key==='dad-run'?runCycles.dad.scale:.52));
    this.baby.on('animationstart',(animation:Phaser.Animations.Animation)=>this.baby.setScale(animation.key==='baby-run'?runCycles.pedin.scale:.34));
    this.placeFamily('idle');this.dad.play('dad-idle');this.baby.play('baby-idle');
    this.input.on('pointerdown',()=>{if(this.model.state==='intro')this.start();});
    this.input.keyboard?.on('keydown',(event:KeyboardEvent)=>{
      if(event.repeat||['INPUT','SELECT','BUTTON'].includes((event.target as HTMLElement)?.tagName))return;
      if(['Space','ArrowUp','KeyW'].includes(event.code)){event.preventDefault();this.jump();}
      if(['ArrowDown','KeyS'].includes(event.code)){event.preventDefault();this.slide();}
    });
    this.ready=true;this.onLoad();this.notify();
    if(import.meta.env.MODE==='test') (window as unknown as {pedinTest:unknown}).pedinTest={scene:this};
  }
  private runAnimation(name:string,key:'dad'|'pedin'){
    this.anims.create({key:name,frames:Array.from({length:16},(_,i)=>({key:`${key}-run`,frame:`run/${String(i).padStart(2,'0')}`})),frameRate:runCycles[key].fps,repeat:-1});
  }
  private dadPose(frame:string){this.dad.setTexture('dad',frame).setScale(.52);}
  private animation(name:string,texture:string,row:number,start:number,count:number,fps:number,repeat=-1){
    if(this.anims.exists(name))return;
    this.anims.create({key:name,frames:Array.from({length:count},(_,i)=>({key:texture,frame:`row-${row}/${String(i+start).padStart(2,'0')}`})),frameRate:fps,repeat});
  }
  // Família reunida na sala: abertura (prontos para correr) ou comemoração do abraço.
  private placeFamily(mood:'idle'|'cheer',enter=false){
    this.moving.clear();this.helping.clear();
    for(const key of members){
      const sprite=this.family[key],{x,back}=familyPlaces[key];
      this.tweens.killTweensOf(sprite);
      sprite.setVisible(true).setY(back?BACK_ROW:GROUND).setDepth(back?3:5.5).setFlipX(false);
      if(enter&&key!=='mom'&&!this.save.reducedMotion){
        sprite.setX(-60-members.indexOf(key)*50).play(`${key}-run`);
        this.tweens.add({targets:sprite,x,duration:1100,onComplete:()=>sprite.play(`${key}-cheer`)});
      }else sprite.setX(x).play(`${key}-${mood}`);
    }
  }
  intro(){
    if(!this.ready||this.model.state!=='ready')return;
    this.model.intro();this.introTime=0;this.audioBus.unlock();
    this.family.mom.play('mom-alert');this.dad.anims.stop();this.dadPose('row-1/04');
    this.baby.play('baby-run');this.audioBus.tone(880,.12);this.audioBus.tone(1175,.18);
    this.notify();
  }
  private configureDad(sliding:boolean){
    const body=this.dad.body as Phaser.Physics.Arcade.Body,scale=this.dad.scaleX;
    const width=(sliding?48:32)/scale,height=(sliding?28:64)/scale;
    body.setSize(width,height,false);body.setOffset((this.dad.frame.realWidth-width)/2,this.dad.frame.realHeight-height);
  }
  start(seed=Date.now()){
    if(!this.ready)return;
    this.clearThings();this.model=new RunModel();this.model.start();
    this.random=seededRandom(seed);this.accumulator=0;this.spawnTime=.5;this.wave=0;
    this.slideTime=0;this.slideCooldown=0;this.jumpBuffer=0;this.coyote=0;
    this.catchingTime=0;this.finished=false;this.feedbackTime=0;
    this.physics.world.resume();this.dad.setPosition(180,GROUND);this.dad.setVelocity(0,0);this.configureDad(false);
    (this.dad.body as Phaser.Physics.Arcade.Body).reset(180,GROUND);
    this.dad.clearTint();this.dad.play('dad-run');this.baby.play('baby-run');
    // Quem estava na sala fica para trás e sai de cena com o chão; ajudantes em ação somem.
    this.helping.clear();this.moving.clear();
    for(const key of members){const sprite=this.family[key];this.tweens.killTweensOf(sprite);if(sprite.visible&&sprite.x>-80)this.moving.add(key);else sprite.setVisible(false);}
    if(this.family.mom.visible)this.family.mom.play('mom-cheer');
    this.audioBus.unlock();this.notify();
  }
  jump(){if(this.model.state==='intro')this.start();else if(this.model.state==='running')this.jumpBuffer=.12;}
  slide(){
    const body=this.dad?.body as Phaser.Physics.Arcade.Body|undefined;
    if(this.model.state!=='running'||!body?.blocked.down||this.slideTime>0||this.slideCooldown>0)return;
    this.slideTime=.6;this.configureDad(true);this.dad.anims.stop();this.dadPose('row-2/02');
  }
  pause(){if(this.model.state!=='running'&&this.model.state!=='catching')return;this.beforePause=this.model.state;this.model.state='paused';this.dad.anims.pause();this.baby.anims.pause();this.audioBus.suspend();this.notify();}
  resume(){if(this.model.state!=='paused')return;this.accumulator=0;this.model.state=this.beforePause;this.dad.anims.resume();this.baby.anims.resume();this.audioBus.unlock();this.notify();}
  menu(){this.clearThings();this.model=new RunModel();this.dad.setVelocity(0,0);this.dad.setPosition(180,GROUND);this.configureDad(false);this.dad.play('dad-idle');this.baby.setX(BABY_START).play('baby-idle');this.placeFamily('idle');this.audioBus.suspend();this.notify();}
  private clearThings(){for(const t of this.things){t.sprite.destroy();t.label?.destroy();}this.things=[];}
  private obstacle(kind:ObstacleKind,x:number){
    const frame=this.textures.getFrame('props',kind);
    const layout=propLayout(kind,frame.realWidth,frame.realHeight);
    const sprite=this.physics.add.image(x,GROUND,'props',kind).setOrigin(.5,1).setScale(layout.scale).setDepth(5);
    const b=sprite.body as Phaser.Physics.Arcade.Body;
    b.setAllowGravity(false).setImmovable(true);
    const {width,height,bottom}=obstacleBody(kind);
    b.setSize(width/sprite.scaleX,height/sprite.scaleY,false);
    b.setOffset((sprite.frame.realWidth-width/sprite.scaleX)/2,sprite.frame.realHeight-(bottom+height)/sprite.scaleY);
    const label=this.add.image(x,GROUND-layout.height-18,this.hintTexture(kind==='stool'?'slide':'jump')).setOrigin(.5).setDepth(8);
    this.things.push({sprite,kind,used:false,label});
  }
  private pixelTexture(key:string,map:typeof icons.heart){
    if(this.textures.exists(key))return;
    const texture=this.textures.createCanvas(key,map.rows[0].length,map.rows.length)!;
    paintPixels(texture.getContext(),map,0,0);texture.refresh();
  }
  // Placa de dica com a mesma moldura do HUD; criada na primeira vez, já com a fonte carregada.
  private hintTexture(action:'jump'|'slide'){
    const key=`hint-${action}`;
    if(this.textures.exists(key))return key;
    const text=action==='slide'?'DESLIZE':'PULE',arrow=action==='slide'?icons.arrowDown:icons.arrowUp;
    const probe=document.createElement('canvas').getContext('2d')!;
    const font='20px "Jersey 10", monospace';probe.font=font;
    const w=Math.ceil(8+2+14+4+probe.measureText(text).width+4+8),h=32;
    const texture=this.textures.createCanvas(key,w+4,h+4)!,ctx=texture.getContext();
    const shadow={rows:frames.cyan.rows,palette:Object.fromEntries(Object.keys(frames.cyan.palette).map(c=>[c,colors.ink]))};
    paintFrame(ctx,shadow,4,4,w,h);paintFrame(ctx,frames.cyan,0,0,w,h);
    paintPixels(ctx,arrow,10,(h-14)/2,2);
    ctx.font=font;ctx.textBaseline='middle';ctx.fillStyle=colors.white;ctx.fillText(text,28,h/2);
    texture.refresh();
    return key;
  }
  private pickup(kind:Pickup,x:number,y:number){
    const frame=this.textures.getFrame('props',kind);
    const layout=propLayout(kind,frame.realWidth,frame.realHeight);
    const sprite=this.physics.add.image(x,y,'props',kind).setScale(layout.scale).setDepth(5);
    const b=sprite.body as Phaser.Physics.Arcade.Body;
    b.setAllowGravity(false);
    // Coleta pelo centro do desenho, sem incluir todo o brilho externo.
    const ratio=kind==='coin'?.75:.6;
    b.setSize(frame.realWidth*ratio,frame.realHeight*ratio,false);
    b.setOffset(frame.realWidth*(1-ratio)/2,frame.realHeight*(1-ratio)/2);
    this.things.push({sprite,kind,used:false});
  }
  private spawn(){
    const kinds:ObstacleKind[]=['blocks','bear','stool'];
    const kind=this.wave<3?kinds[this.wave]:kinds[Math.floor(this.random()*3)];
    this.obstacle(kind,W+80);
    for(let i=0;i<3;i++)this.pickup('coin',W+60+i*50,GROUND-(kind==='stool'?22:105));
    const sibling:Sibling|undefined=this.wave%4===2?'son':this.wave%5===3?'eldest':this.wave%6===5?'middle':undefined;
    if(sibling)this.sendHelper(sibling);
    this.wave++;this.spawnTime=2.25+this.random()*.45;
  }
  // O irmão aparece no fundo da sala, faz a ação da prancha e deixa o item na frente dele.
  private sendHelper(key:Sibling){
    const sprite=this.family[key],{item,height}=helpers[key];
    this.tweens.killTweensOf(sprite);this.moving.delete(key);
    sprite.setPosition(W+330,BACK_ROW).setDepth(3).setVisible(true).setData('acted',false).play(`${key}-idle`);
    this.helping.add(key);this.pickup(item,W+270,GROUND-height);
  }
  private moveFamily(){
    for(const key of [...this.moving,...this.helping]){
      const sprite=this.family[key];sprite.x-=this.model.speed*FIXED;
      if(this.helping.has(key as Sibling)&&!sprite.getData('acted')&&sprite.x<W-40){sprite.setData('acted',true);sprite.play(`${key}-action`);}
      if(sprite.x<-90){sprite.setVisible(false);this.moving.delete(key);this.helping.delete(key as Sibling);}
    }
  }
  private step(){
    const body=this.dad.body as Phaser.Physics.Arcade.Body;
    this.coyote=body.blocked.down ? .08 : Math.max(0,this.coyote-FIXED);
    this.slideCooldown=Math.max(0,this.slideCooldown-FIXED);
    if(this.slideTime>0){
      this.slideTime=Math.max(0,this.slideTime-FIXED);
      if(this.slideTime===0){
        const blocked=this.things.some(t=>t.kind==='stool'&&!t.used&&Math.abs(t.sprite.x-this.dad.x)<obstacleBody('stool').width/2+24+4);
        if(blocked)this.slideTime=FIXED;else{this.configureDad(false);this.slideCooldown=.25;this.dad.play('dad-run');}
      }
    }
    if(this.jumpBuffer>0){
      if(this.coyote>0&&this.slideTime===0){this.dad.setVelocityY(-560);this.jumpBuffer=0;this.coyote=0;this.audioBus.tone(660);}
      else this.jumpBuffer=Math.max(0,this.jumpBuffer-FIXED);
    }
    this.spawnTime-=FIXED;if(this.spawnTime<=0)this.spawn();
    for(const t of this.things)(t.sprite.body as Phaser.Physics.Arcade.Body).setVelocityX(-this.model.speed);
    this.moveFamily();
    this.configureDad(this.slideTime>0);
    this.physics.world.update(0,FIXED*1000);this.physics.world.postUpdate();
    // Dano antes da captura: o terceiro tropeço sempre encerra a tentativa.
    for(const t of this.things){
      if(t.used||!t.sprite.active)continue;
      if(this.physics.overlap(this.dad,t.sprite)){
        if(['coin','shield','boost','star'].includes(t.kind)){
          t.used=true;this.model.collect(t.kind as Pickup);t.sprite.setVisible(false);this.audioBus.tone(t.kind==='coin'?988:1318);
          const helper=Object.values(helpers).find(h=>h.item===t.kind);
          if(helper)this.message(helper.message);
        }else{
          t.used=true;
          if(this.model.hit()){this.audioBus.tone(180,.15);if(!this.save.reducedMotion)this.cameras.main.shake(100,.002);this.feedbackTime=.35;this.message('Tudo bem! Continue, o abraço está logo ali.');}
        }
      }
    }
    for(let i=this.things.length-1;i>=0;i--){const t=this.things[i];t.label?.setX(t.sprite.x);if(t.sprite.x < -150){t.sprite.destroy();t.label?.destroy();this.things.splice(i,1);}}
    this.model.tick(FIXED);this.audioBus.update(FIXED);
    this.feedbackTime=Math.max(0,this.feedbackTime-FIXED);
    if(this.feedbackTime>0){this.dad.anims.stop();this.dadPose('row-2/06');}
    else if(this.slideTime===0){
      if(!body.blocked.down){this.dad.anims.stop();this.dadPose(body.velocity.y<0?'row-1/05':'row-1/06');}
      else if(this.dad.anims.currentAnim?.key!=='dad-run'||!this.dad.anims.isPlaying)this.dad.play('dad-run');
    }
    for(const bg of this.backgrounds){bg.x-=this.save.reducedMotion?0:this.model.speed*FIXED*.15;if(bg.x<=-W)bg.x+=W*2;}
    if(this.model.state==='catching'){this.clearThings();this.dad.setVelocity(0,0);this.dad.anims.stop();this.dadPose('row-3/02');this.baby.play('baby-cheer');this.placeFamily('cheer',true);}
    if(this.model.state==='lost')this.finish();
  }
  private finish(){
    if(this.finished)return;this.finished=true;this.dad.setVelocity(0,0);this.dad.play(this.model.state==='won'?'dad-cheer':'dad-idle');this.baby.play('baby-cheer');
    if(this.model.state==='won'){this.audioBus.tone(523,.35);this.audioBus.tone(659,.35);this.audioBus.tone(784,.35);}else this.audioBus.suspend();
    this.notify();
  }
  update(_time:number,delta:number){
    if(!this.ready)return;
    if(this.model.state==='intro'){
      // Mamãe grita, o Pedin dispara e o papai se prepara; a corrida começa sozinha.
      const dt=Math.min(delta/1000,.05);this.introTime+=dt;
      this.baby.x=Math.min(534,this.baby.x+dt*200);
      if(this.introTime>=INTRO_TIME)this.start();
    }else if(this.model.state==='running'){
      this.accumulator+=Math.min(delta/1000,5*FIXED);let steps=0;
      while(this.accumulator>=FIXED&&steps++<5&&this.model.state==='running'){this.step();this.accumulator-=FIXED;}
      this.baby.x=Phaser.Math.Linear(240,730,Math.min(1,this.model.gap/30));
    }else if(this.model.state==='catching'){
      const dt=Math.min(delta/1000,.05);this.catchingTime+=dt;this.baby.x=Phaser.Math.Linear(this.baby.x,225,Math.min(1,dt*3));
      if(this.catchingTime>=1.8){this.model.state='won';this.finish();}
    }
    this.love.setVisible(this.model.state==='catching'||this.model.state==='won').setY(GROUND-135-(this.save.reducedMotion?0:Math.sin(this.catchingTime*3)*5));
    this.shieldRing.setPosition(this.dad.x,this.dad.y-38).setVisible(this.model.shield>0||this.model.immune>0).setStrokeStyle(3,this.model.shield>0?0xff80c5:0xffffff,.8);
    this.dust.clear();
    if(this.model.state==='running'&&!this.save.reducedMotion){
      for(let i=0;i<4;i++){const offset=(this.model.time*90+i*20)%75;this.dust.fillStyle(0xffedb8,(1-offset/75)*.35);this.dust.fillCircle(155-offset,GROUND-5-i%2*4,3+offset/20);}
    }
    this.notify();
  }
}
