import { readFileSync } from 'node:fs';
import { describe,it,expect } from 'vitest';
const manifest=JSON.parse(readFileSync('art/manifest.json','utf8'));
describe('atlas de produção',()=>{
 it('mantém recortes e destinos dentro das imagens e quadros virtuais',()=>{
  let count=0;
  for(const asset of manifest.assets){
   if(!asset.runtimeAtlas)continue;
   const atlas=JSON.parse(readFileSync(asset.runtimeAtlas,'utf8'));
   for(const frame of Object.values(atlas.frames) as any[]){
    const r=frame.frame,s=frame.sourceSize,d=frame.spriteSourceSize;
    expect(r.x).toBeGreaterThanOrEqual(0);expect(r.y).toBeGreaterThanOrEqual(0);
    expect(r.x+r.w).toBeLessThanOrEqual(asset.width);expect(r.y+r.h).toBeLessThanOrEqual(asset.height);
    expect(d.x).toBeGreaterThanOrEqual(0);expect(d.y).toBeGreaterThanOrEqual(0);
    expect(d.x+d.w).toBeLessThanOrEqual(s.w);expect(d.y+d.h).toBeLessThanOrEqual(s.h);
    if(asset.key!=='props')expect(d.y+d.h).toBe(s.h);
    count++;
   }
  }
  expect(count).toBe(204);
 });
 it('preserva os pés do papai que ultrapassavam a grade original',()=>{
  const atlas=JSON.parse(readFileSync('public/assets/characters/dad-atlas-v2.json','utf8'));
  const first=atlas.frames['row-0/00'];
  expect(first.frame.y+first.frame.h).toBeGreaterThan(240);
  expect(first.trimmed).toBe(true);expect(first.sourceSize).toEqual({w:320,h:320});
 });
});
