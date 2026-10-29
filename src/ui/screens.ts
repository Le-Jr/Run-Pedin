import type { Save } from '../platform/save';
import { canvas, icon } from './hud';
import './screens.css';

// Telas dentro da camada lógica do HUD: acompanham a escala do canvas.
export const layerScreens=`
<div id="loading" class="screen loading">
<canvas id="loading-logo" class="logo" aria-hidden="true"></canvas>
<p id="loading-title" class="screen-label">CARREGANDO A SALA</p>
<div class="segments" aria-hidden="true">${'<i></i>'.repeat(12)}</div>
<p id="load-progress" class="hud-number" role="status">0%</p>
<p id="loading-error" class="screen-copy hidden"></p>
<button id="retry" class="px-button px-button-primary screen-button hidden">TENTAR NOVAMENTE</button>
</div>

<div id="menu" class="screen menu hidden">
<div class="menu-corner">
<div class="px-plate menu-best"><span class="hud-label">RECORDE</span><b id="best" class="hud-number">000000</b></div>
<button id="sound" class="px-button icon-button" aria-label="Silenciar áudio" aria-pressed="false">${icon('soundOn','sound-on')}${icon('soundOff','sound-off')}</button>
<button id="fullscreen" class="px-button icon-button" aria-label="Alternar tela cheia">${icon('fullscreen','')}</button>
</div>
<div class="menu-column">
<h1 class="menu-title"><canvas id="menu-logo" class="logo" aria-hidden="true"></canvas><span class="visually-hidden">Pedin Run!</span></h1>
<p class="menu-tagline"><i class="tag-heart"></i>UMA CORRIDA EM FAMÍLIA<i class="tag-heart"></i></p>
<button id="start" class="px-button px-button-primary screen-button menu-play">JOGAR</button>
<div class="menu-secondary">
<button id="how-open" class="px-button screen-button">COMO JOGAR</button>
<button id="settings-open" class="px-button screen-button">CONFIGURAÇÕES</button>
</div>
<p class="menu-keys"><kbd>ESPAÇO</kbd> PULA <kbd>S</kbd> DESLIZA <kbd>ESC</kbd> PAUSA</p>
</div>
</div>

<div id="intro-bubble" class="intro-bubble hidden" aria-live="assertive"><p>Queridooooo!!<br>O Pedin está fugindo!!</p></div>

<div id="pause" class="screen dim hidden">
<div class="px-panel pause-panel" role="dialog" aria-labelledby="pause-title">
<h2 id="pause-title" class="panel-title">PAUSA</h2>
<p class="screen-copy">A brincadeira espera por você.</p>
<button id="resume" class="px-button px-button-primary screen-button">CONTINUAR</button>
<button id="restart" class="px-button screen-button">RECOMEÇAR</button>
<button id="pause-settings" class="px-button screen-button">CONFIGURAÇÕES</button>
<button id="back-menu" class="px-button screen-button">MENU</button>
</div>
</div>

<div id="result" class="screen result hidden">
<div class="px-panel result-panel" role="dialog" aria-labelledby="result-title">
<p id="result-record" class="record-tag hidden">NOVO RECORDE!</p>
<h2 id="result-title" class="panel-title">PEGOU!</h2>
<div id="result-hearts" class="result-hearts" aria-hidden="true"><i class="hud-heart"></i><i class="hud-heart"></i><i class="hud-heart"></i></div>
<p id="result-copy" class="screen-copy"></p>
<dl class="result-stats">
<div><dt>PONTOS</dt><dd id="result-score" class="hud-number">0</dd></div>
<div><dt>${canvas('result-coin')}MOEDAS</dt><dd id="result-coins" class="hud-number">0</dd></div>
<div><dt>${canvas('result-star')}ESTRELAS</dt><dd id="result-stars" class="hud-number">0</dd></div>
<div><dt>RECORDE</dt><dd id="result-best" class="hud-number">0</dd></div>
</dl>
<button id="again" class="px-button px-button-primary screen-button">JOGAR DE NOVO</button>
<button id="result-menu" class="px-button screen-button">MENU</button>
</div>
</div>`;

// Diálogos nativos (camada superior do navegador), em pixels CSS.
export const dialogs=(save:Save)=>`
<dialog id="settings" class="px-dialog" aria-labelledby="settings-title"><form method="dialog">
<button class="px-button icon-button close-dialog" aria-label="Fechar configurações">${icon('close','')}</button>
<h2 id="settings-title" class="panel-title">CONFIGURAÇÕES</h2>
<label class="setting"><span>MÚSICA</span><input id="music-volume" class="px-range" type="range" min="0" max="1" step=".1" value="${save.music}"></label>
<label class="setting"><span>EFEITOS</span><input id="effects-volume" class="px-range" type="range" min="0" max="1" step=".1" value="${save.effects}"></label>
<label class="setting setting-check"><input id="reduce-motion" class="px-check" type="checkbox" ${save.reducedMotion?'checked':''}><span>REDUZIR MOVIMENTO</span></label>
<p class="dialog-note">O recorde fica salvo só neste navegador.</p>
<button class="px-button px-button-primary screen-button">PRONTO</button>
</form></dialog>
<dialog id="how" class="px-dialog" aria-labelledby="how-title"><form method="dialog">
<button class="px-button icon-button close-dialog" aria-label="Fechar instruções">${icon('close','')}</button>
<h2 id="how-title" class="panel-title">COMO JOGAR</h2>
<ul class="how-list">
<li><span class="how-keys"><kbd>ESPAÇO</kbd><kbd>W</kbd></span>Pule os blocos e o ursinho.</li>
<li><span class="how-keys"><kbd>S</kbd><kbd>SETA BAIXO</kbd></span>Deslize por baixo do banquinho.</li>
<li><span class="how-keys">${canvas('how-boost')}</span>O filhão lança o boost: você chega mais perto.</li>
<li><span class="how-keys">${canvas('how-shield')}</span>A primogênita cria o escudo de amor: protege um tropeço.</li>
<li><span class="how-keys">${canvas('how-star')}</span>A filha do meio dá estrelas: +50 pontos.</li>
<li><span class="how-keys">${canvas('how-coin')}</span>Moedas valem 10 pontos.</li>
</ul>
<p class="dialog-note">Alcance o Pedin depois de 600 m. São três corações e 90 segundos. No celular, use os botões PULE e DESLIZE. ESC ou P pausa.</p>
<button class="px-button px-button-primary screen-button">ENTENDI!</button>
</form></dialog>`;
