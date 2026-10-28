# Pedin Run! — Uma corrida em família

Documentação de um jogo web 2D baseado na referência visual enviada. Nome do repositório: `pega_o_pedin`.

O jogador controla o papai em uma corrida automática para alcançar o caçula Pedin, desviando de objetos da casa e recebendo ajuda da família. O tom é afetuoso, engraçado e acolhedor.

## Documentos

1. [Visão e escopo](docs/01-visao-e-escopo.md): experiência, personagens e limites da primeira versão.
2. [Regras e controles](docs/02-game-design.md): corrida, captura, obstáculos, itens e balanceamento.
3. [Arte, interface e áudio](docs/03-arte-interface-audio.md): identidade visual e produção dos assets.
4. [Stack e arquitetura](docs/04-stack-arquitetura.md): escolha técnica, organização e execução.
5. [Plano de implementação](docs/05-plano-de-implementacao.md): entregas e critérios de aceite.
6. [Instruções de desenvolvimento](docs/06-instrucoes-de-desenvolvimento.md): orientações para implementar o jogo.
7. [Inventário de assets](docs/07-inventario-de-assets.md): lista de produção, prioridade e critérios de entrega.

## Decisão técnica

**Phaser + TypeScript + Vite**, com Arcade Physics, interface do jogo em Phaser e HTML/CSS para configurações acessíveis. Vitest para regras e Playwright para fluxos no navegador. Publicação estática, sem backend na primeira versão.

A escolha atende ao foco em sprites, animações, colisões simples e controles por teclado/toque. A justificativa e as fontes oficiais estão no documento de arquitetura.

## Referência e estado atual

![Referência visual de Pedin Run](docs/referencias/pedin-run-conceito.png)

A imagem é uma direção de arte, não um spritesheet pronto. As mecânicas e os números descritos são propostas iniciais, sujeitas a ajuste com testes de jogo. A produção dos personagens e objetos começou; veja o [guia de arte e prévia animada](art/README.md). O gameplay ainda não foi implementado.
