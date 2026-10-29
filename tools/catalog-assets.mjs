import { readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const characters = ['dad', 'pedin', 'mom', 'son', 'eldest', 'middle'];
const items = ['blocks', 'bear', 'plant', 'stool', 'puddle', 'basket', 'coin', 'shield', 'boost', 'star', 'bottle', 'gift'];
const specs = characters.map(key => ({ key, file: `public/assets/characters/${key}-sheet-${key === 'pedin' ? 'v2' : 'v1'}.png`, columns: 8, rows: 4 }));
specs.push({ key: 'props', file: 'public/assets/props/props-sheet-v1.png', columns: 4, rows: 3 });
const spriteRegions = JSON.parse(await readFile(path.join(root, 'art/source/generated/frame-regions.json'), 'utf8'));
const propRegions = { blocks:[20,80,350,320],bear:[400,60,330,340],plant:[720,45,355,355],stool:[1110,125,310,260],puddle:[0,455,398,260],basket:[398,418,355,290],coin:[787,433,245,275],shield:[1080,390,368,340],boost:[0,715,400,371],star:[393,715,340,340],bottle:[752,720,280,330],gift:[1090,720,350,340] };
const manifest = { version: 1, reference: 'docs/referencias/pedin-run-conceito.png', generator: 'image_gen integrada', status: 'primeiro lote; revisão de animação e pivôs pendente', assets: [] };

for (const spec of specs) {
  const bytes = await readFile(path.join(root, spec.file));
  if (bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw Error(`PNG inválido: ${spec.file}`);
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
  const frames = {};
  for (let row = 0; row < spec.rows; row++) {
    for (let column = 0; column < spec.columns; column++) {
      // Partições inteiras cobrem a imagem sem acumular erro de arredondamento.
      const x = Math.round(column * width / spec.columns), y = Math.round(row * height / spec.rows);
      const w = Math.round((column + 1) * width / spec.columns) - x;
      const h = Math.round((row + 1) * height / spec.rows) - y;
      const key = spec.key === 'props' ? items[row * spec.columns + column] : `row-${row}/${column.toString().padStart(2, '0')}`;
      frames[key] = { frame: { x, y, w, h }, rotated: false, trimmed: false, spriteSourceSize: { x: 0, y: 0, w, h }, sourceSize: { w, h } };
    }
  }
  const atlasFile = spec.file.replace('.png', '.json');
  await writeFile(path.join(root, atlasFile), JSON.stringify({ frames, meta: { app: 'Pedin Run grid catalog', image: path.basename(spec.file), size: { w: width, h: height }, scale: '1' } }, null, 2) + '\n');
  const runtimeFrames = {};
  if (spec.key === 'props') {
    for (const [key, rect] of Object.entries(propRegions)) {
      const [x, y, w, h] = rect;
      runtimeFrames[key] = {frame:{x,y,w,h},rotated:false,trimmed:false,spriteSourceSize:{x:0,y:0,w,h},sourceSize:{w,h}};
    }
  } else {
    for (const [key, rect] of Object.entries(spriteRegions[spec.key])) {
      const column = Number(key.split('/')[1]);
      const x = Math.round(160 + rect.x - (column + .5) * width / 8);
      runtimeFrames[key] = {frame:rect,rotated:false,trimmed:true,spriteSourceSize:{x,y:320-rect.h,w:rect.w,h:rect.h},sourceSize:{w:320,h:320}};
    }
  }
  const runtimeAtlas = path.posix.join(path.posix.dirname(spec.file), `${spec.key}-atlas-v2.json`);
  await writeFile(path.join(root, runtimeAtlas), JSON.stringify({frames:runtimeFrames,meta:{app:'Pedin Run reviewed atlas',image:path.basename(spec.file),size:{w:width,h:height},scale:'1'}},null,2)+'\n');
  manifest.assets.push({ ...spec, width, height, frameCount: Object.keys(frames).length, atlas: atlasFile, runtimeAtlas, frameGeometry: 'atlas inicial por grade; runtime por silhuetas com base dos pés alinhada', selected: true });
}
const room = 'public/assets/backgrounds/room-v1.png';
try {
  await access(path.join(root, room));
  const bytes = await readFile(path.join(root, room));
  manifest.assets.push({ key: 'room', file: room, width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20), status: 'fundo plano inicial; camadas de parallax ainda não separadas' });
} catch (error) { if (error.code !== 'ENOENT') throw error; }
await writeFile(path.join(root, 'art/manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`${manifest.assets.length} assets catalogados; ${manifest.assets.reduce((n, a) => n + (a.frameCount || 0), 0)} regiões de atlas.`);
