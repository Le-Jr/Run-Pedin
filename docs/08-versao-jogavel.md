# Primeira versão jogável

## Executar

Requer Node.js 22.18 ou superior e npm.

```sh
npm ci
npm run dev
```

O Vite imprime o endereço local. Para inspecionar a distribuição:

```sh
npm run build
npm run preview
```

O build fica em `dist/`, com caminhos relativos para permitir publicação estática em subdiretórios. Não é necessário backend, conta ou chave de API.

## O que está implementado

- Sala com cenário em movimento, papai e Pedin animados usando as pranchas geradas.
- Menu, instruções, carregamento com erro/retry, HUD, pausa e resultado.
- Corrida automática, pulo com buffer/coyote time e deslize com troca de hitbox.
- Blocos e urso para pular; banquinho com colisão apenas no tampo para deslizar.
- Três corações, invulnerabilidade, moedas, escudo e boost.
- Aproximação, captura após 600 m, comemoração, derrota por corações ou limite de 90 s.
- Recorde e preferências locais tolerantes a falhas de armazenamento.
- Controles por teclado e botões de toque, modo tela cheia e layout responsivo.
- Música e efeitos sintetizados, volumes separados, silêncio e redução de movimento.
- Pausa ao perder foco ou ocultar a aba, incluindo a sequência final de aproximação.

A família completa participa: abertura com a mamãe gritando que o Pedin está fugindo, irmãos entregando boost (filhão), escudo (primogênita) e estrela (filha do meio), e comemoração de todos na vitória. A fase inicial usa apenas a sala. Detalhes visuais em `docs/09-style-guide.md`, seção 13.

## Trilha sonora

As cinco músicas foram fornecidas pelo projeto, geradas a partir dos prompts de trilha. Elas foram recortadas e normalizadas com ffmpeg (loudnorm, −18 LUFS integrados, pico −1,5 dBTP; MP3 128 kbps) em `public/assets/audio/`:

| Arquivo | Origem e recorte | Uso |
| --- | --- | --- |
| `menu-v1.mp3` | Sunday_Morning_Tag, 0–85 s, sem o fade final | Menu, em loop |
| `intro-v1.mp3` | Saturday_Morning_Cartridges, 0–3,2 s, com fade de saída | Grito da mamãe na abertura |
| `run-v1.mp3` | Socks_on_Hardwood, 24–150,4 s, sem a introdução calma e o trecho final mais baixo | Corrida e captura, em loop |
| `win-v1.mp3` | Hearts_Floating_Up, 0–63,4 s | Vitória, em loop |
| `lose-v1.mp3` | One_More_Go, 0–55,9 s | Derrota, em loop |

`src/platform/audio.ts` carrega cada faixa sob demanda (sem atrasar o carregamento da sala), troca de música com fade cruzado de 0,6 s e repete as faixas com sobreposição de 1,2 s, para o loop não estalar. A pausa suspende o áudio. Volume de música, silêncio e efeitos seguem as configurações; o volume padrão da música passou a 0,6. Como o navegador exige um gesto, a trilha do menu começa no primeiro toque ou tecla. A melodia sintetizada anterior foi removida; os efeitos sonoros continuam sintetizados.

O mapeamento faixa → momento foi inferido pelos títulos, pelo andamento e pela energia de cada faixa. A escuta humana ainda está pendente, inclusive dos pontos de loop. Para trocar, edite `tracks` em `src/platform/audio.ts`.

## Código

`src/game/domain/run.ts` concentra progressão, dano, buffs e resultado, sem depender do Phaser. `src/game/RunScene.ts` integra o mundo, os obstáculos e os sprites. `src/main.ts` controla a interface HTML e as entradas complementares. Persistência e áudio ficam em `src/platform/`.

A versão inicial usa uma cena Phaser com estados explícitos e overlays HTML, em vez de uma cena separada para cada menu. A interface fica navegável por teclado e a máquina de estados permanece no domínio. Os objetos que saem da tela são destruídos, e o reinício remove todos os objetos da tentativa anterior; pooling poderá ser introduzido após medição em dispositivos reais.

A simulação acumula passos de 1/60 s, no máximo cinco por frame. O `World.update` manual do Arcade prepara os corpos e executa a física; `postUpdate` sincroniza os sprites a cada passo. O acumulador é reiniciado na retomada. Colisões são processadas antes da progressão que libera a captura.

Dependências fixadas: Phaser 4.2.1, Vite 8.3.5 e TypeScript 7.0.2, com lockfile. Nesta sessão, as dependências vieram de uma instalação existente na máquina, pois o registro npm estava inacessível; uma instalação limpa pela rede ainda precisa ser conferida em outro ambiente.

## Verificação realizada

```sh
npm test
npm run build
```

21 testes passaram: regras de captura, dano fatal, invulnerabilidade, escudo, renovação de buffs, boost, pausa, fim por tempo, pontuação, semente e persistência. Os testes de integração da física usam o código real do Arcade no Node e confirmam chão, altura do pulo, passagem sob o banquinho e uma janela válida de pulo nas velocidades 240, 280 e 320 px/s.

Dois testes adicionais protegem os recortes do atlas e o alinhamento dos pés, incluindo a regressão que cortava a primeira pose de corrida do papai. Os atlas de runtime usam as silhuetas reais e quadros virtuais de 320 × 320, sem alterar os PNGs originais.

O build de produção e a verificação TypeScript passaram. O bundle JavaScript inicial tem aproximadamente 1,39 MB sem compressão e 366 KB com gzip. As cinco imagens usadas na partida somam 9,20 MB; a transferência real depende da hospedagem e ainda não foi medida. O build também preserva os outros assets disponíveis em `public/`.

## Teste no navegador

```sh
npm run test:e2e
```

O script inicia seu próprio Vite em modo de teste na porta 4175 e usa Playwright com Chromium. Detecta instalações comuns no Linux; para outro caminho, defina `CHROMIUM_PATH`. Também aceita `PEDIN_URL` apontando para um servidor já iniciado com `--mode test`. A API de inspeção usada pelo teste não é incluída no modo de produção.

O roteiro cobre início, pulo, pausa, retomada, reinício, escudo, dano, derrota, vitória, recorde, dez reinícios, perda de foco, toque e rotação; salva capturas em `.playtest/`.

**Atualização (2026-10-28):** o roteiro completo passou no Chromium local após a etapa de HUD do style guide. O deslize por toque agora espera o papai pousar em vez de um tempo fixo, porque o Chromium headless pode simular mais devagar que o relógio real. Ainda não houve playtest humano. Ainda é necessário conferir Chromium/Firefox, Android e iOS, alinhamento das poses, leitura dos obstáculos e desempenho em aparelhos reais. O fundo e os ciclos são a primeira integração dos assets e podem receber ajustes após essa revisão.
