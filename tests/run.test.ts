import { describe,it,expect } from 'vitest';
import { RunModel,seededRandom } from '../src/game/domain/run';
const active=()=>{const m=new RunModel();m.start();return m;};
const advance=(m:RunModel,seconds:number)=>{for(let n=0;n<Math.round(seconds*60);n++)m.tick(1/60);};
describe('corrida',()=>{
 it('permite captura sem coletáveis ou colisões antes dos 90 segundos',()=>{const m=active();advance(m,85);expect(m.state).toBe('catching');expect(m.distance).toBeGreaterThanOrEqual(600);expect(m.gap).toBeLessThanOrEqual(2);expect(m.time).toBeLessThan(90);});
 it('não captura antes da distância mínima',()=>{const m=active();m.gap=0;advance(m,10);expect(m.state).toBe('running');});
 it('prioriza dano fatal sobre uma captura simultânea',()=>{const m=active();m.hearts=1;m.distance=601;m.gap=0;m.hit();m.tick(1/60);expect(m.state).toBe('lost');expect(m.hearts).toBe(0);});
 it('limita dano com invulnerabilidade e termina após três danos válidos',()=>{const m=active();m.hit();m.hit();expect(m.hearts).toBe(2);advance(m,1.6);m.hit();advance(m,1.6);m.hit();expect(m.state).toBe('lost');expect(m.hearts).toBe(0);});
 it('escudo protege vida, aproximação e boost uma vez',()=>{const m=active();m.collect('shield');m.collect('boost');const gap=m.gap;m.hit();expect(m.hearts).toBe(3);expect(m.gap).toBe(gap);expect(m.boost).toBe(3);expect(m.shield).toBe(0);});
 it('renova buffs sem acumular a duração',()=>{const m=active();m.collect('boost');advance(m,1);m.collect('boost');expect(m.boost).toBe(3);m.collect('shield');m.collect('shield');expect(m.shield).toBe(8);});
 it('boost aumenta aproximação e não muda velocidade da pista',()=>{const normal=active(),boost=active();boost.collect('boost');advance(normal,2);advance(boost,2);expect(boost.speed).toBe(normal.speed);expect(boost.distance).toBeCloseTo(normal.distance);expect(normal.gap-boost.gap).toBeCloseTo(2);});
 it('congela todos os tempos e contadores durante pausa',()=>{const m=active();m.collect('shield');m.collect('boost');m.hit();m.pause();const before=JSON.stringify(m);advance(m,10);expect(JSON.stringify(m)).toBe(before);m.resume();m.tick(1/60);expect(m.time).toBeGreaterThan(0);});
 it('encerra por tempo e ignora danos/coletas após o término',()=>{const m=active();m.gap=30;advance(m,91);expect(m.state).toBe('lost');const before=JSON.stringify(m);m.collect('coin');m.hit();advance(m,10);expect(JSON.stringify(m)).toBe(before);});
 it('pontua distância, moedas e vitória uma vez',()=>{const m=active();m.distance=600.9;m.collect('coin');m.collect('coin');m.state='won';expect(m.score).toBe(1120);m.tick(10);expect(m.score).toBe(1120);});
 it('abertura não avança a corrida',()=>{const m=new RunModel();m.intro();expect(m.state).toBe('intro');advance(m,5);expect(m.time).toBe(0);expect(m.distance).toBe(0);m.start();m.tick(1/60);expect(m.time).toBeGreaterThan(0);});
 it('estrela da filha do meio soma pontos sem afetar buffs',()=>{const m=active();m.collect('star');m.collect('star');expect(m.stars).toBe(2);expect(m.score).toBe(100);expect(m.shield).toBe(0);expect(m.boost).toBe(0);});
 it('reproduz geração por semente',()=>{const a=seededRandom(123),b=seededRandom(123),c=seededRandom(321);const first=Array.from({length:20},a);expect(first).toEqual(Array.from({length:20},b));expect(first).not.toEqual(Array.from({length:20},c));expect(first.every(v=>v>=0&&v<1)).toBe(true);});
});
