import type { Pickup } from '../domain/run';

// Mamãe e irmãos. Linhas e quadros seguem as pranchas *-sheet-v1 (row-0 é a primeira linha):
// [linha, primeiro quadro, quantidade, fps]. Escalas mantêm a ordem de altura da família.
export type Member = 'mom' | 'son' | 'eldest' | 'middle';
type Clip = readonly [row: number, start: number, count: number, fps: number];
export const family: Record<Member, {scale: number; clips: Record<string, Clip>}> = {
  mom: {scale: .48, clips: {idle: [0, 0, 4, 5], alert: [1, 0, 8, 10], cheer: [3, 0, 8, 8]}},
  son: {scale: .4, clips: {run: [0, 0, 8, 14], idle: [1, 0, 4, 5], action: [2, 0, 5, 9], cheer: [3, 0, 8, 8]}},
  eldest: {scale: .4, clips: {run: [0, 0, 8, 14], idle: [1, 0, 8, 5], action: [2, 2, 4, 7], cheer: [3, 0, 8, 8]}},
  middle: {scale: .38, clips: {run: [0, 0, 8, 14], idle: [1, 0, 8, 5], action: [2, 2, 4, 7], cheer: [3, 0, 8, 8]}},
};

// Abertura e comemoração: mamãe na frente, irmãos no fundo da sala (fileira de trás).
export const familyPlaces: Record<Member, {x: number; back: boolean}> = {
  mom: {x: 84, back: false},
  son: {x: 290, back: true},
  eldest: {x: 360, back: true},
  middle: {x: 428, back: true},
};

// Cada irmão entrega um item durante a corrida, conforme a prancha de referência.
export type Sibling = Exclude<Member, 'mom'>;
export const helpers: Record<Sibling, {item: Pickup; height: number; message: string}> = {
  son: {item: 'boost', height: 42, message: 'O filhão lançou um boost! Você está chegando mais perto.'},
  eldest: {item: 'shield', height: 42, message: 'A primogênita criou um escudo de amor! O próximo tropeço está protegido.'},
  middle: {item: 'star', height: 100, message: 'Estrela da filha do meio! Mais 50 pontos.'},
};
