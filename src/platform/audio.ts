import type { Save } from './save';
export class AudioBus {
  private context?: AudioContext; private melodyTime=0; private note=0;
  constructor(private save: Save) {}
  unlock() {try {this.context ??= new AudioContext(); void this.context.resume().catch(()=>{});}catch{/* Áudio opcional. */}}
  suspend() {void this.context?.suspend().catch(()=>{});}
  tone(frequency: number, duration=.09, music=false) {
    const ctx=this.context;if(!ctx||ctx.state!=='running'||this.save.muted)return;
    const level=(music?this.save.music:this.save.effects)*.08;if(!level)return;
    const oscillator=ctx.createOscillator(),gain=ctx.createGain();
    oscillator.type=music?'sine':'triangle';oscillator.frequency.value=frequency;
    gain.gain.setValueAtTime(level,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+duration);
    oscillator.connect(gain).connect(ctx.destination);oscillator.start();oscillator.stop(ctx.currentTime+duration);
  }
  update(dt:number) {this.melodyTime-=dt;if(this.melodyTime<=0){this.melodyTime=.38;const notes=[523,659,784,659,587,698,880,698,523,659,784,1047,880,784,659,587];this.tone(notes[this.note++%notes.length],.18,true);}}
}
