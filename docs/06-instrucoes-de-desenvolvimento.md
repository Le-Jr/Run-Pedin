# Instruções para implementar o jogo

> Norma visual: leia o [Style guide oficial](09-style-guide.md). Ele prevalece sobre decisões visuais anteriores deste documento e se aplica a toda a interface.

## Objetivo

Construir o Pedin Run! descrito nestes documentos, começando por uma corrida completa com placeholders e evoluindo até a identidade visual da referência. Entregar um jogo funcional em navegador, com vitória e derrota, teclado e toque.

## Ordem de leitura

Ler visão e escopo, regras, arquitetura, direção de arte e plano de implementação. Usar a imagem em `docs/referencias/pedin-run-conceito.png` como referência visual. O texto define comportamento; a imagem define aparência. Se houver ambiguidade, registrar a decisão e manter esses documentos sincronizados.

## Regras de implementação

- Usar Phaser, TypeScript estrito e Vite; confirmar compatibilidade das versões e gerar lockfile.
- Centralizar constantes de física, duração e pontuação em dados de balanceamento.
- Separar regras puras de renderização e física. Não usar estado de componentes HTML para controlar cada frame.
- Todas as ações de teclado e toque passam pela mesma camada de input.
- Tornar começo, pausa, retomada, término e reinício operações explícitas.
- Implementar colisões e término antes de investir em efeitos visuais.
- Não usar a prancha de referência como fundo do jogo ou como spritesheet de produção.
- Não gerar ou carregar todos os cenários antes de concluir a sala.
- Manter interface e documentação em português brasileiro.
- Atualizar os critérios de aceite com evidências reais; não declarar testes não executados.

## Primeira tarefa concreta

Inicializar a stack e construir uma sala com formas simples: papai fixo horizontalmente, chão, Pedin visível, objetos se aproximando, pulo e deslize. Em seguida implementar o modelo de captura e derrota para permitir uma partida inteira. Só depois trocar as formas por personagens e cenários finais.

## Definição de pronto

Uma pessoa abre o endereço, entende os controles, começa a corrida, coleta itens, desvia, ganha ou perde e joga novamente. O jogo mantém a proposta carinhosa da imagem, funciona com toque e teclado e passa pelos critérios da primeira versão. Entregar código, lockfile, comandos reais de execução, build reproduzível e registro da validação.
