export interface Save { version: 1; best: number; tutorial: boolean; muted: boolean; reducedMotion: boolean; music: number; effects: number }
const defaults: Save = {version:1,best:0,tutorial:false,muted:false,reducedMotion:typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches,music:.25,effects:.5};
const key='pedin-run:save:v1';
export function loadSave(): Save {
  try {
    const s=JSON.parse(localStorage.getItem(key) ?? 'null');
    if(!s || s.version!==1) return {...defaults};
    return {version:1,best:Number.isSafeInteger(s.best)&&s.best>=0?s.best:0,tutorial:s.tutorial===true,muted:s.muted===true,reducedMotion:s.reducedMotion===true,music:volume(s.music,.25),effects:volume(s.effects,.5)};
  } catch {return {...defaults};}
}
function volume(v: unknown, fallback: number) {return typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(1,v)):fallback;}
export function writeSave(save: Save) {try{localStorage.setItem(key,JSON.stringify(save));}catch{/* Storage é opcional. */}}
