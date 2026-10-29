import tokens from '../../docs/style-tokens.json';

// Kit de UI provisório desenhado em código: cada mapa é uma grade de pixels
// usada tanto no HTML (SVG) quanto no canvas do Phaser, para manter a mesma arte.
export const colors=tokens.colors;
type Palette=Record<string,string>;
export type PixelMap={rows:string[];palette:Palette};

const ui:Palette={k:colors.ink,n:colors.panel,l:colors.panelLight,c:colors.cyan,b:colors.blue,w:colors.white,y:colors.yellow,o:colors.orange,p:colors.pink,m:colors.magenta,r:colors.red};

const heartRows=[
  '.kkk...kkk.',
  'kpppk.kpppk',
  'kpwwpkppppk',
  'kpwppppppdk',
  'kppppppppdk',
  '.kppppppdk.',
  '..kppppdk..',
  '...kppdk...',
  '....kdk....',
  '.....k.....',
];
export const icons={
  heart:{rows:heartRows,palette:{...ui,d:colors.red}},
  heartEmpty:{rows:heartRows,palette:{...ui,p:colors.panelLight,w:colors.panelLight,d:colors.blue}},
  clock:{rows:[
    '..kkkkk..',
    '.kwwwwwk.',
    'kwwwkwwwk',
    'kwwwkwwwk',
    'kwwwkkkwk',
    'kwwwwwwwk',
    'kclwwwlck',
    '.kccccck.',
    '..kkkkk..',
  ],palette:ui},
  pause:{rows:[
    'ww.ww',
    'ww.ww',
    'ww.ww',
    'ww.ww',
    'ww.ww',
    'ww.ww',
  ],palette:ui},
  arrowUp:{rows:[
    '...y...',
    '..yyy..',
    '.yyyyy.',
    'yyyyyyy',
    '..yyy..',
    '..yyy..',
    '..yyy..',
  ],palette:ui},
  arrowDown:{rows:[
    '..yyy..',
    '..yyy..',
    '..yyy..',
    'yyyyyyy',
    '.yyyyy.',
    '..yyy..',
    '...y...',
  ],palette:ui},
  chevron:{rows:[
    'yy..',
    '.yy.',
    '..yy',
    '.yy.',
    'yy..',
  ],palette:ui},
  soundOn:{rows:[
    '...w.....',
    '..ww..w..',
    'wwww...w.',
    'wwww.w.w.',
    'wwww.w.w.',
    'wwww...w.',
    '..ww..w..',
    '...w.....',
  ],palette:ui},
  soundOff:{rows:[
    '...w.....',
    '..ww.....',
    'wwww.r.r.',
    'wwww..r..',
    'wwww.r.r.',
    'wwww.....',
    '..ww.....',
    '...w.....',
  ],palette:ui},
  fullscreen:{rows:[
    'www..www',
    'w......w',
    'w......w',
    '........',
    '........',
    'w......w',
    'w......w',
    'www..www',
  ],palette:ui},
  close:{rows:[
    'w....w',
    'ww..ww',
    '.wwww.',
    '..ww..',
    '.wwww.',
    'ww..ww',
    'w....w',
  ],palette:ui},
  check:{rows:[
    '.....k',
    '....kk',
    'k..kk.',
    'kkkk..',
    '.kk...',
  ],palette:ui},
  // Cauda para baixo: a primeira linha substitui a borda inferior do balão.
  tailDown:{rows:[
    'kwwk',
    'kwk.',
    'kk..',
    'k...',
  ],palette:ui},
  // Cauda do balão: a última coluna substitui a borda esquerda do balão.
  tail:{rows:[
    '....k',
    '..kkw',
    'kkwww',
    '..kkw',
    '....k',
  ],palette:ui},
} satisfies Record<string,PixelMap>;

// Moldura de 9 fatias: contorno escuro, linha colorida, relevo claro em cima/à esquerda,
// sombra na base e cantos em degraus. FRAME_SLICE células formam cada canto.
const frameRows=[
  '..kkkkk..',
  '.kccccck.',
  'kclllllck',
  'kclnnnnck',
  'kclnnnnck',
  'kclnnnnck',
  'kcbbbbbck',
  '.kccccck.',
  '..kkkkk..',
];
export const FRAME_SLICE=4;
export const frames={
  cyan:{rows:frameRows,palette:ui},
  pink:{rows:frameRows,palette:{...ui,c:colors.pink,b:colors.magenta}},
  orange:{rows:frameRows,palette:{...ui,c:colors.orange,b:colors.red}},
  yellow:{rows:frameRows,palette:{...ui,c:colors.yellow,b:colors.orange}},
  primary:{rows:frameRows,palette:{...ui,c:colors.yellow,l:colors.white,n:colors.yellow,b:colors.orange}},
  balloon:{rows:frameRows,palette:{...ui,c:colors.white,l:colors.white,n:colors.white,b:colors.white}},
} satisfies Record<string,PixelMap>;

export function pixelSvg({rows,palette}:PixelMap){
  const rects=rows.flatMap((row,y)=>[...row].map((cell,x)=>palette[cell]?`<rect x="${x}" y="${y}" width="1" height="1" fill="${palette[cell]}"/>`:''));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${rows[0].length} ${rows.length}" width="${rows[0].length}" height="${rows.length}" shape-rendering="crispEdges">${rects.join('')}</svg>`;
}
export const pixelUrl=(map:PixelMap)=>`url("data:image/svg+xml,${encodeURIComponent(pixelSvg(map))}")`;

export function paintPixels(ctx:CanvasRenderingContext2D,{rows,palette}:PixelMap,x:number,y:number,cell=1){
  rows.forEach((row,ry)=>[...row].forEach((c,rx)=>{if(palette[c]){ctx.fillStyle=palette[c];ctx.fillRect(x+rx*cell,y+ry*cell,cell,cell);}}));
}

// Mesmo resultado do border-image do CSS, para placas desenhadas dentro do canvas.
export function paintFrame(ctx:CanvasRenderingContext2D,{rows,palette}:PixelMap,x:number,y:number,w:number,h:number,cell=2){
  const size=rows.length;
  const span=(i:number,total:number)=>i<FRAME_SLICE?[i*cell,cell]:i>=size-FRAME_SLICE?[total-(size-i)*cell,cell]:[FRAME_SLICE*cell,total-FRAME_SLICE*cell*2];
  rows.forEach((row,ry)=>[...row].forEach((c,rx)=>{
    if(!palette[c])return;
    const [px,pw]=span(rx,w),[py,ph]=span(ry,h);
    ctx.fillStyle=palette[c];ctx.fillRect(x+px,y+py,pw,ph);
  }));
}
