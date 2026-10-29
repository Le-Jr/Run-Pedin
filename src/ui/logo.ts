import { colors } from './pixel-art';

// Logo provisório em pixel art, desenhado por código até existir o asset final: letras blocadas
// próprias (cada célula vira 2 × 2 pixels), inclinação em degraus, preenchimento em faixas,
// sombra em degraus, contorno escuro e rastros de velocidade, conforme a referência.
const glyphs:Record<string,string[]>={
  P:['######.','##...##','##...##','##...##','######.','##.....','##.....','##.....','##.....'],
  E:['#######','##.....','##.....','##.....','######.','##.....','##.....','##.....','#######'],
  D:['######.','##...##','##...##','##...##','##...##','##...##','##...##','##...##','######.'],
  I:['######','..##..','..##..','..##..','..##..','..##..','..##..','..##..','######'],
  N:['##...##','###..##','###..##','####.##','##.####','##..###','##..###','##...##','##...##'],
  R:['######.','##...##','##...##','##...##','######.','##.##..','##..##.','##...##','##...##'],
  U:['##...##','##...##','##...##','##...##','##...##','##...##','##...##','##...##','.#####.'],
  '!':['##','##','##','##','##','##','..','##','##'],
};
// Inclinação alinhada à grade das letras: 1 pixel a cada duas linhas de célula.
const CELL=2,SKEW=CELL*2;
type Grid=(string|null)[][];

function word(text:string){
  const rows=Array.from({length:9*CELL},()=>[] as boolean[]);
  [...text].forEach((letter,i)=>{
    const glyph=glyphs[letter];
    glyph.forEach((line,y)=>{for(let dy=0;dy<CELL;dy++){
      const row=rows[y*CELL+dy];
      if(i>0)row.push(false,false);
      for(const cell of line)for(let dx=0;dx<CELL;dx++)row.push(cell==='#');
    }});
  });
  return rows;
}
function stamp(grid:Grid,shape:boolean[][],ox:number,oy:number,color:(y:number,h:number)=>string){
  const h=shape.length;
  shape.forEach((row,y)=>{
    const shift=Math.floor((h-1-y)/SKEW);
    row.forEach((on,x)=>{if(on&&grid[oy+y]?.[ox+x+shift]!==undefined)grid[oy+y][ox+x+shift]=color(y,h);});
  });
}

export function paintLogo(canvas:HTMLCanvasElement){
  const pedin=word('PEDIN'),run=word('RUN!');
  const pedinAt=[22,2] as const,runAt=[34,pedin.length+5] as const;
  const width=Math.max(pedinAt[0]+pedin[0].length,runAt[0]+run[0].length)+12,height=runAt[1]+run.length+4;
  const empty=()=>Array.from({length:height},()=>Array<string|null>(width).fill(null));
  const trails=empty(),body=empty();
  const trail=(y:number,x0:number,x1:number,color:string)=>{for(let x=Math.max(0,x0);x<x1;x++)if(x%7<5)trails[y][x]=color;};
  for(const [dy,len] of [[3,14],[8,20],[13,10]])trail(pedinAt[1]+dy,pedinAt[0]-len,pedinAt[0]+2,colors.yellow);
  for(const [dy,len] of [[4,18],[9,26],[14,14]])trail(runAt[1]+dy,runAt[0]-len,runAt[0]+2,colors.cyan);
  stamp(body,pedin,pedinAt[0]+1,pedinAt[1]+2,()=>colors.orange);
  stamp(body,pedin,...pedinAt,(y,h)=>y<2?colors.white:y>=h*.65?colors.orange:colors.yellow);
  stamp(body,run,runAt[0]+1,runAt[1]+2,()=>colors.blue);
  stamp(body,run,...runAt,(y,h)=>y>=h*.72?colors.cyan:colors.white);
  canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext('2d')!;ctx.clearRect(0,0,width,height);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const outline=[-1,0,1].some(dy=>[-1,0,1].some(dx=>body[y+dy]?.[x+dx]));
    const color=body[y][x]??(outline?colors.ink:trails[y][x]);
    if(color){ctx.fillStyle=color;ctx.fillRect(x,y,1,1);}
  }
}
