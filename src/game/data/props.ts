import sizes from './prop-sizes.json';
export type PropKind = keyof typeof sizes;
export type ObstacleKind = 'blocks' | 'bear' | 'stool';
export { sizes as propSizes };

// Um único fator preserva a silhueta. Os limites são pixels lógicos da cena.
export function propLayout(kind: PropKind, sourceWidth: number, sourceHeight: number) {
  const spec = sizes[kind];
  const scale = Math.min(spec.maxWidth / sourceWidth, spec.maxHeight / sourceHeight);
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  return { scale, width, height };
}
export function obstacleBody(kind: ObstacleKind) { return sizes[kind].body; }
