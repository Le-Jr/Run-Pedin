export type RunState = 'ready' | 'intro' | 'running' | 'paused' | 'catching' | 'won' | 'lost';
export type Pickup = 'coin' | 'shield' | 'boost' | 'star';
export const STAR_POINTS = 50;
export class RunModel {
  state: RunState = 'ready';
  time = 0; distance = 0; gap = 18; hearts = 3; coins = 0; stars = 0;
  shield = 0; boost = 0; immune = 0; reason = '';
  get speed() { return 240 + Math.min(this.time / 60, 1) * 80; }
  get score() { return Math.floor(this.distance) + this.coins * 10 + this.stars * STAR_POINTS + (this.state === 'won' ? 500 : 0); }
  // A cena de abertura não conta tempo nem distância; a corrida começa ao sair dela.
  intro() { if (this.state === 'ready') this.state = 'intro'; }
  start() { this.state = 'running'; }
  pause() { if (this.state === 'running') this.state = 'paused'; }
  resume() { if (this.state === 'paused') this.state = 'running'; }
  tick(dt: number) {
    if (this.state !== 'running') return;
    this.distance += this.speed * dt / 20;
    this.gap = Math.max(0, this.gap - (.2 + (this.boost > 0 ? 1 : 0)) * dt);
    this.time += dt;
    this.shield = Math.max(0, this.shield - dt);
    this.boost = Math.max(0, this.boost - dt);
    this.immune = Math.max(0, this.immune - dt);
    if (this.distance >= 600 && this.gap <= 2) this.state = 'catching';
    else if (this.time >= 90) { this.state = 'lost'; this.reason = 'O Pedin chegou à mamãe! Vamos tentar de novo?'; }
  }
  hit() {
    if (this.state !== 'running' || this.immune > 0) return false;
    this.immune = 1.5;
    if (this.shield > 0) { this.shield = 0; return true; }
    this.hearts--; this.boost = 0; this.gap = Math.min(30, this.gap + 3);
    if (this.hearts <= 0) { this.state = 'lost'; this.reason = 'Uma pausa para respirar… o próximo abraço está logo ali!'; }
    return true;
  }
  collect(kind: Pickup) {
    if (this.state !== 'running') return;
    if (kind === 'coin') this.coins++;
    if (kind === 'shield') this.shield = 8;
    if (kind === 'boost') this.boost = 3;
    if (kind === 'star') this.stars++;
  }
}
export function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => { value = (Math.imul(1664525, value) + 1013904223) >>> 0; return value / 4294967296; };
}
