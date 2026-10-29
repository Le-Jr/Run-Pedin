import { afterEach,describe,it,expect,vi } from 'vitest';
import { loadSave,writeSave } from '../src/platform/save';
afterEach(()=>vi.unstubAllGlobals());
describe('save local',()=>{
 it('tolera storage indisponível',()=>{vi.stubGlobal('localStorage',{getItem(){throw Error('bloqueado')},setItem(){throw Error('bloqueado')}});const save=loadSave();expect(save.best).toBe(0);expect(()=>writeSave(save)).not.toThrow();});
 it('ignora dados inválidos e limita preferências',()=>{vi.stubGlobal('localStorage',{getItem:()=>JSON.stringify({version:1,best:-20,music:50,effects:'alto',muted:'sim',reducedMotion:true})});const save=loadSave();expect(save.best).toBe(0);expect(save.music).toBe(1);expect(save.effects).toBe(.5);expect(save.muted).toBe(false);expect(save.reducedMotion).toBe(true);});
 it('persiste recorde e configurações',()=>{let data:string|null=null;vi.stubGlobal('localStorage',{getItem:()=>data,setItem:(_key:string,value:string)=>{data=value}});const save=loadSave();save.best=1200;save.muted=true;writeSave(save);expect(loadSave()).toEqual(save);});
 it('tolera JSON corrompido e versões desconhecidas',()=>{vi.stubGlobal('localStorage',{getItem:()=>'{'});expect(loadSave().best).toBe(0);vi.stubGlobal('localStorage',{getItem:()=>'{"version":99,"best":100}'});expect(loadSave().best).toBe(0);});
});
