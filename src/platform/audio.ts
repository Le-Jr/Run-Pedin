import type { Save } from './save';

// Trilhas em public/assets/audio, já recortadas e normalizadas (ver docs/08-versao-jogavel.md).
export type Track = 'menu' | 'intro' | 'run' | 'win' | 'lose';
const tracks: Record<Track, {file: string; loop: boolean}> = {
  menu: {file: 'menu-v1.mp3', loop: true},
  intro: {file: 'intro-v1.mp3', loop: false},
  run: {file: 'run-v1.mp3', loop: true},
  win: {file: 'win-v1.mp3', loop: true},
  lose: {file: 'lose-v1.mp3', loop: true},
};
const FADE = .6, LOOP_FADE = 1.2, MUSIC_LEVEL = .8;
type Voice = {track: Track; gain: GainNode; sources: AudioBufferSourceNode[]; nextAt: number};

export class AudioBus {
  private context?: AudioContext; private musicBus?: GainNode;
  private buffers = new Map<Track, Promise<AudioBuffer | undefined>>();
  private voice?: Voice; private wanted?: Track; private timer?: number;
  constructor(private save: Save) {}
  unlock() {
    try {
      if (!this.context) {
        this.context = new AudioContext();
        this.musicBus = this.context.createGain();this.musicBus.connect(this.context.destination);this.applyVolume();
        this.timer = window.setInterval(() => this.keepLooping(), 250);
      }
      void this.context.resume().catch(() => {});
      if (this.wanted && this.voice?.track !== this.wanted) this.music(this.wanted);
    } catch {/* Áudio opcional. */}
  }
  suspend() {void this.context?.suspend().catch(() => {});}
  applyVolume() {
    if (!this.context || !this.musicBus) return;
    this.musicBus.gain.setTargetAtTime(this.save.muted ? 0 : this.save.music * MUSIC_LEVEL, this.context.currentTime, .05);
  }
  tone(frequency: number, duration = .09) {
    const ctx = this.context;if (!ctx || ctx.state !== 'running' || this.save.muted) return;
    const level = this.save.effects * .08;if (!level) return;
    const oscillator = ctx.createOscillator(), gain = ctx.createGain();
    oscillator.type = 'triangle';oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(level, ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + duration);
    oscillator.connect(gain).connect(ctx.destination);oscillator.start();oscillator.stop(ctx.currentTime + duration);
  }
  // Troca de trilha com fade cruzado; sem gesto do jogador, guarda o pedido até o unlock().
  music(track: Track | null) {
    this.wanted = track ?? undefined;
    const ctx = this.context;if (!ctx || !this.musicBus || this.voice?.track === track) return;
    const old = this.voice;this.voice = undefined;
    if (old) {
      old.gain.gain.setTargetAtTime(0, ctx.currentTime, FADE / 4);
      for (const source of old.sources) source.stop(ctx.currentTime + FADE * 2);
    }
    if (!track) return;
    void this.load(track).then(buffer => {
      if (!buffer || this.wanted !== track || this.voice || !this.context) return;
      const gain = ctx.createGain();gain.connect(this.musicBus!);
      gain.gain.setValueAtTime(0, ctx.currentTime);gain.gain.linearRampToValueAtTime(1, ctx.currentTime + (old ? FADE : .05));
      this.voice = {track, gain, sources: [], nextAt: ctx.currentTime};
      this.schedule(this.voice, buffer, false);
    });
  }
  private load(track: Track) {
    let buffer = this.buffers.get(track);
    if (!buffer) {
      buffer = fetch(`${import.meta.env.BASE_URL}assets/audio/${tracks[track].file}`)
        .then(response => response.ok ? response.arrayBuffer() : Promise.reject(Error(response.statusText)))
        .then(data => this.context!.decodeAudioData(data))
        .catch(() => {this.buffers.delete(track);return undefined;});
      this.buffers.set(track, buffer);
    }
    return buffer;
  }
  // Cada repetição começa LOOP_FADE antes do fim da anterior, com rampas opostas: o loop não estala.
  private schedule(voice: Voice, buffer: AudioBuffer, crossfade: boolean) {
    const ctx = this.context!, at = Math.max(voice.nextAt, ctx.currentTime), source = ctx.createBufferSource(), envelope = ctx.createGain();
    source.buffer = buffer;source.connect(envelope).connect(voice.gain);
    const loop = tracks[voice.track].loop, end = at + buffer.duration;
    envelope.gain.setValueAtTime(crossfade ? 0 : 1, at);
    if (crossfade) envelope.gain.linearRampToValueAtTime(1, at + LOOP_FADE);
    if (loop) {envelope.gain.setValueAtTime(1, end - LOOP_FADE);envelope.gain.linearRampToValueAtTime(0, end);}
    source.start(at);source.onended = () => {voice.sources = voice.sources.filter(s => s !== source);};
    voice.sources.push(source);voice.nextAt = loop ? end - LOOP_FADE : Infinity;
  }
  private keepLooping() {
    const voice = this.voice, ctx = this.context;
    if (!voice || !ctx || voice.nextAt === Infinity || ctx.currentTime < voice.nextAt - 1) return;
    void this.load(voice.track).then(buffer => {if (buffer && this.voice === voice) this.schedule(voice, buffer, true);});
  }
}
