import { chromium } from 'playwright-core';
import { mkdir, access } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

await mkdir('.playtest',{recursive:true});
const port=4175;
const server=process.env.PEDIN_URL?null:spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port',String(port),'--strictPort','--mode','test'],{stdio:['ignore','pipe','pipe']});
const url=process.env.PEDIN_URL??`http://127.0.0.1:${port}/`;
let browser;
function check(condition,message){if(!condition)throw Error(message);}
try{
 if(server)await Promise.race([
  new Promise((resolve,reject)=>{server.stdout.on('data',chunk=>{if(chunk.toString().includes('Local:'))resolve()});server.stderr.on('data',chunk=>process.stderr.write(chunk));server.once('exit',code=>reject(Error(`Vite encerrou com código ${code}`)));server.once('error',reject)}),
  new Promise((_,reject)=>{const timer=setTimeout(()=>reject(Error('O servidor de teste não iniciou em 15 segundos')),15000);timer.unref()})
 ]);
 let executablePath=process.env.CHROMIUM_PATH;
 if(!executablePath){for(const candidate of ['/usr/bin/chromium','/usr/bin/chromium-browser','/opt/google/chrome/chrome']){try{await access(candidate);executablePath=candidate;break}catch{}}}
 browser=await chromium.launch({executablePath,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});
 const errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 page.on('console',message=>{if(message.type()==='error')errors.push(message.text())});
 await page.goto(url,{waitUntil:'networkidle'});
 await page.locator('#menu:not(.hidden)').waitFor();
 await page.screenshot({path:'.playtest/menu-desktop.png',fullPage:true});
 await page.locator('#start').click();
 check(await page.evaluate(()=>!!window.pedinTest),'Use um servidor com --mode test para os testes completos.');
 await page.locator('#intro-bubble:not(.hidden)').waitFor();
 check(await page.evaluate(()=>window.pedinTest.scene.model.state)==='intro','JOGAR não abriu a cena da mamãe');
 await page.screenshot({path:'.playtest/intro-desktop.png',fullPage:true});
 await page.waitForFunction(()=>window.pedinTest.scene.model.state==='running',null,{timeout:6000});
 await page.waitForTimeout(300);
 const groundY=await page.evaluate(()=>window.pedinTest.scene.dad.y);
 await page.keyboard.press('Space');await page.waitForTimeout(180);
 check(await page.evaluate(()=>window.pedinTest.scene.dad.y)<groundY-30,'Pulo não tirou o papai do chão');
 await page.screenshot({path:'.playtest/run-desktop.png',fullPage:true});
 await page.keyboard.press('Escape');await page.locator('#pause:not(.hidden)').waitFor();
 const snapshot=await page.evaluate(()=>JSON.stringify(window.pedinTest.scene.model));
 await page.waitForTimeout(400);
 check(await page.evaluate(()=>JSON.stringify(window.pedinTest.scene.model))===snapshot,'A simulação avançou na pausa');
 await page.locator('#resume').click();await page.waitForTimeout(200);
 await page.keyboard.press('Escape');await page.locator('#restart').click();
 check(Number(await page.locator('#distance').innerText())<10,'Reinício não zerou distância');
 await page.waitForTimeout(300);
 await page.evaluate(()=>{const s=window.pedinTest.scene;s.pickup('shield',180,410)});
 await page.waitForTimeout(100);
 check(await page.evaluate(()=>window.pedinTest.scene.model.shield)>0,'Escudo não foi coletado');
 await page.evaluate(()=>{const s=window.pedinTest.scene;s.obstacle('bear',180)});
 await page.waitForTimeout(100);
 check(await page.evaluate(()=>window.pedinTest.scene.model.hearts)===3,'Escudo não protegeu o coração');
 await page.evaluate(()=>{const s=window.pedinTest.scene;s.model.hearts=1;s.model.immune=0;s.model.shield=0;s.obstacle('blocks',180)});
 await page.locator('#result:not(.hidden)').waitFor();
 check(await page.evaluate(()=>window.pedinTest.scene.model.state)==='lost','Dano fatal não encerrou a corrida');
 await page.locator('#again').click();
 await page.evaluate(()=>{const s=window.pedinTest.scene;s.model.distance=601;s.model.gap=1});
 await page.locator('#result:not(.hidden)').waitFor();
 check(await page.evaluate(()=>window.pedinTest.scene.model.state)==='won','Captura não concluiu vitória');
 await page.screenshot({path:'.playtest/victory.png',fullPage:true});
 const best=await page.locator('#result-best').innerText();
 await page.reload({waitUntil:'networkidle'});await page.locator('#menu:not(.hidden)').waitFor();
 check(Number(await page.locator('#best').innerText())===Number(best),'Recorde não persistiu após reload');
 for(let i=0;i<10;i++){await page.evaluate(()=>window.pedinTest.scene.start(41));await page.waitForTimeout(40)}
 check(await page.evaluate(()=>window.pedinTest.scene.things.length)===0,'Reinício deixou objetos da tentativa anterior');
 await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
 await page.locator('#pause:not(.hidden)').waitFor();
 const mobileContext=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 const mobile=await mobileContext.newPage();mobile.on('pageerror',error=>errors.push(error.message));
 await mobile.goto(url,{waitUntil:'networkidle'});await mobile.locator('#menu:not(.hidden)').waitFor();
 await mobile.screenshot({path:'.playtest/menu-mobile.png',fullPage:true});
 await mobile.locator('#start').tap();await mobile.locator('#intro-bubble:not(.hidden)').waitFor();await mobile.locator('#intro-bubble').tap();await mobile.waitForFunction(()=>window.pedinTest.scene.model.state==='running');await mobile.waitForTimeout(300);await mobile.locator('#jump').tap();await mobile.waitForTimeout(150);
 check(await mobile.evaluate(()=>window.pedinTest.scene.dad.y)<420,'Pulo por toque não funcionou');
 await mobile.screenshot({path:'.playtest/run-mobile.png',fullPage:true});
 await mobile.waitForFunction(()=>window.pedinTest.scene.dad.body.blocked.down);await mobile.locator('#slide').tap();await mobile.waitForTimeout(50);
 check(await mobile.evaluate(()=>window.pedinTest.scene.dad.body.height)<30,'Deslize por toque não reduziu a hitbox');
 await mobile.setViewportSize({width:844,height:390});await mobile.waitForTimeout(150);
 const controls=await mobile.locator('#jump').boundingBox();
 check(controls&&controls.x>=0&&controls.y>=0&&controls.x+controls.width<=844&&controls.y+controls.height<=390,'Controles saíram da tela ao rotacionar');
 check(!await mobile.evaluate(()=>document.documentElement.scrollWidth>innerWidth),'Overflow horizontal no celular');
 check(errors.length===0,errors.join('\n'));
 console.log('PASS: início, pulo, pausa, retomada, reinício, escudo, dano, derrota, vitória, recorde, 10 reinícios, perda de foco, toque e rotação.');
}finally{
 await browser?.close();
 if(server?.pid&&server.exitCode===null){server.kill('SIGTERM');await once(server,'exit').catch(()=>{})}
}
