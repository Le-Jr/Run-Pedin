import { createRequire } from 'node:module';
import path from 'node:path';
import { describe,it,expect } from 'vitest';
import { obstacleBody } from '../src/game/data/props';
// Leva o motor físico real ao Node, sem simular canvas ou fingir um navegador.
const require=createRequire(import.meta.url);
const source=path.join(process.cwd(),'node_modules/phaser/src/physics/arcade');
const World=require(path.join(source,'World.js'));
const Body=require(path.join(source,'Body.js'));
const StaticBody=require(path.join(source,'StaticBody.js'));
function setup(){
 const world=new World({sys:{scale:{width:960,height:540}}},{gravity:{y:1500},fixedStep:false});
 const dad=new Body(world);dad.setSize(32,64,false);dad.position.set(164,374);world.add(dad);
 const floor=new StaticBody(world);floor.setSize(960,50);floor.position.set(0,438);world.add(floor);world.addCollider(dad,floor);
 const tick=()=>{world.update(0,1000/60);world.postUpdate()};tick();
 return {world,dad,tick};
}
describe('Arcade Physics real',()=>{
 it('pousa e mantém a base no chão após vários passos',()=>{const {world,dad,tick}=setup();for(let i=0;i<600;i++)tick();expect(dad.bottom).toBeCloseTo(438);expect(dad.blocked.down).toBe(true);world.destroy();});
 it('pula com altura suficiente para os brinquedos e volta ao chão',()=>{const {world,dad,tick}=setup();dad.velocity.y=-560;let top=dad.y;for(let i=0;i<60;i++){tick();top=Math.min(top,dad.y)}expect(374-top).toBeGreaterThan(95);expect(374-top).toBeLessThan(105);expect(dad.bottom).toBeCloseTo(438);world.destroy();});
 it('o mesmo banquinho atinge a pose em pé e permite o deslize',()=>{const {world,dad}=setup();const stool=new Body(world);stool.setAllowGravity(false);const shape=obstacleBody('stool');stool.setSize(shape.width,shape.height,false);stool.position.set(180-shape.width/2,438-shape.bottom-shape.height);world.add(stool);expect(world.overlap(dad,stool)).toBe(true);dad.setSize(48,28,false);dad.position.set(156,410);expect(world.overlap(dad,stool)).toBe(false);world.destroy();});
 it('há uma janela real de pulo para cada velocidade da fase',()=>{
  for(const kind of ['blocks','bear'] as const) for(const speed of [240,280,320]){
   const {world,dad,tick}=setup();const toy=new Body(world);toy.setAllowGravity(false);const shape=obstacleBody(kind);toy.setSize(shape.width,shape.height,false);toy.position.set(180+speed*.35,438-shape.height);toy.velocity.x=-speed;world.add(toy);dad.velocity.y=-560;
   let collision=false;for(let i=0;i<60;i++){tick();collision ||= world.overlap(dad,toy)}expect(collision,`pulo a ${speed} px/s`).toBe(false);world.destroy();
  }
 });
});
