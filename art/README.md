# Produção de arte — Pedin Run!

O primeiro lote usa a imagem original como referência de identidade e estilo, com novas poses geradas pela ferramenta integrada `image_gen`. Os [prompts completos](source/generated/prompts-lote-01.md) ficam versionáveis junto ao projeto. As imagens são exportações raster; não existem arquivos com camadas editáveis neste lote.

## Visualizar animações

Abra [preview.html](preview.html) diretamente no navegador. Como a prévia usa arquivos relativos e não faz requisições a uma API, ela também funciona sem servidor. Se preferir servir o projeto, na raiz execute:

```sh
python -m http.server 8080 --bind 127.0.0.1
```

Abra `http://localhost:8080/art/preview.html`. A prévia permite escolher linha, velocidade, fundo e pausa. Não exige instalação de dependências.

## Organização

- `public/assets/characters/*-sheet-v1.png`: pranchas originais dos seis personagens.
- `public/assets/characters/pedin-sheet-v2.png`: revisão de enquadramento do Pedin, selecionada na prévia.
- `public/assets/props/props-sheet-v1.png`: prancha de objetos, obstáculos e itens.
- `public/assets/backgrounds/room-v1.png`: fundo plano da sala, ainda sem camadas separadas.
- `art/source/generated/prompts-lote-01.md`: instruções exatas usadas na geração.
- `art/manifest.json`: dimensões reais e estado da revisão.

As pranchas dos personagens solicitam 8 colunas e 4 linhas; a de objetos solicita 4 colunas e 3 linhas. Os tamanhos reais são registrados no manifesto, sem presumir a resolução solicitada ao gerador.

Os arquivos `*-sheet-*.json` são os atlas preliminares por grade, compatíveis com o formato JSON hash do Phaser. Os novos `*-atlas-v2.json` usados pelo jogo corrigem os recortes com as coordenadas reais das silhuetas, preservam o eixo horizontal de cada coluna e alinham os pés em quadros virtuais de 320 × 320. Os objetos têm retângulos próprios. Nenhum PNG foi alterado. As coordenadas de origem estão em `art/source/generated/frame-regions.json`; `python tools/inspect-sprite-regions.py` refaz a análise de alpha com ImageMagick, sem gerar ou editar imagens. Recrie o catálogo e os atlas com `node tools/catalog-assets.mjs`. Os retângulos dos atlas preliminares usam a grade solicitada. A prévia de pranchas ainda exibe essa grade; para ver os recortes revisados e as animações integradas, execute o jogo com `npm run dev`. Como 1774 × 887 não divide exatamente por 8 × 4, as células são arredondadas individualmente, com 221 ou 222 pixels. Evitar o carregamento como spritesheet de células fixas; usar o atlas e revisar os recortes.

## Integração no jogo

Os atlas de runtime já incluem a normalização por metadados. Ainda é necessário conferir os ciclos em movimento no navegador. A geração pode variar posicionamento e escala entre poses. Não usar a dimensão total da imagem como prova de alinhamento ou de fluidez.

As linhas de papai e Pedin misturam ações diferentes: o jogo deve selecionar somente o intervalo de quadros da ação atual. A prévia oferece seleção de ação por personagem e seleção de linha inteira para inspeção. Ela não define a máquina de estados final, e ações como pulo são repetidas somente para revisão.

Manter as pranchas originais. Correções devem gerar arquivos `v2` ou exportações separadas, evitando perda do primeiro lote. O aceite final exige movimento sem saltos, silhuetas legíveis, alpha limpo e hitboxes independentes das imagens.

## Validação do lote em 28/10/2026

Confirmados: seis pranchas selecionadas com 32 regiões cada, 12 regiões de objetos, dimensões reais, transparência das pranchas, sintaxe JavaScript da prévia e limites dos 204 retângulos de atlas. A versão inicial do Pedin tinha poses cortadas no rodapé; a v2 foi gerada e selecionada após inspeção visual.

A execução do Chromium e do servidor local foi impedida pelo sandbox deste ambiente (operações de socket bloqueadas). Portanto, a prévia não recebeu validação em navegador nesta sessão. A consulta ao registro npm também falhou por resolução de DNS; a stack do gameplay ainda não foi instalada. A prévia funciona com arquivos locais e não depende dessas bibliotecas.

Este lote prioriza produção e revisão visual. As imagens originais ainda não foram otimizadas para a meta de download da primeira partida. A sala é um fundo plano; separação de camadas, repetição horizontal, pivôs e acabamento dos ciclos continuam pendentes para integração no jogo.

## Comparar proporções dos objetos

Com `npm run dev`, abra `/art/proporcoes.html` para comparar os 12 objetos com o papai e o Pedin. A prévia usa os mesmos atlas e limites de escala do jogo; não abre diretamente por `file://` porque carrega o módulo TypeScript pelo Vite. Os valores ficam em `src/game/data/prop-sizes.json`.
