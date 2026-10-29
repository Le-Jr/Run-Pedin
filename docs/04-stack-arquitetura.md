# Stack e arquitetura

## Decisão

Usar **Phaser + TypeScript + Vite**, com **Arcade Physics**. É a recomendação para este escopo: runner 2D, sprites animados, física simples, áudio, teclado e toque, com publicação web estática.

Phaser fornece os sistemas de jogo; TypeScript explicita contratos de estados, configurações e entidades; Vite conduz desenvolvimento e build. Usar a versão estável compatível disponível no início da implementação, verificar documentação dessa versão e fixar dependências no lockfile. Não assumir uma major a partir de exemplos antigos.

## Comparação de alternativas

| Opção | Avaliação para este projeto |
| --- | --- |
| Phaser + TypeScript | Escolhida pela cobertura dos sistemas 2D necessários |
| PixiJS com sistemas próprios | Adequado para renderização, mas exige montar mais infraestrutura de jogo |
| Canvas puro | Bom para experimentos pequenos; aumenta trabalho com cenas, assets e animações |
| React/Next.js como núcleo | Não oferece benefício suficiente para o loop e a física deste runner |
| Engine com exportação web | Pode atender; adiciona um fluxo de ferramentas desnecessário para este escopo web |

Essa comparação é uma decisão de engenharia para o projeto, não um benchmark de desempenho. React poderá ser avaliado se surgir um portal amplo em volta do jogo; não faz parte da primeira versão.

## Componentes

| Camada | Escolha |
| --- | --- |
| Runtime | Phaser, TypeScript e Arcade Physics |
| Ferramentas | Vite, npm e Node.js LTS compatível com o Vite escolhido |
| UI complementar | HTML/CSS para configurações e mensagens acessíveis |
| Estado de partida | Modelo TypeScript em memória, sem biblioteca global |
| Persistência | localStorage com versão e validação |
| Testes | Vitest para regras puras; Playwright para integração |
| Hospedagem | Arquivos estáticos em CDN com HTTPS |

## Estrutura prevista

```text
src/
  main.ts
  game/
    config.ts
    scenes/       # Boot, Preload, Menu, Run, HUD, Result
    entities/     # Dad, Pedin, Obstacle, Pickup
    systems/      # Input, Spawner, Collision, Audio
    domain/       # RunModel, score, progression, buffs, patterns
    data/         # balanceamento e definição de fases
  platform/       # save, visibility e preferências
  ui/             # configurações HTML/CSS
public/assets/
art/source/
tests/unit/
tests/e2e/
docs/
```

Boot configura ambiente; Preload carrega e apresenta progresso/erro com retry; Menu inicia a partida; Run possui o mundo; HUD observa o modelo; Result apresenta os dados finais. Cenas não devem duplicar regras de pontuação ou vida. Usar eventos tipados e remover listeners no encerramento das cenas.

## Loop e física

Separar regras do Phaser para permitir teste sem canvas. O modelo mantém distância, separação, vida, pontuação e tempos de buff. Física mantém posição e colisão. Evitar atualizar a mesma variável por dois sistemas.

Usar passo de simulação de 1/60 s, sincronizando física e domínio, com limite de cinco passos por frame e descarte do excesso após engasgos. A API exata de passo manual deve ser verificada na versão escolhida. Não acumular tempo oculto para compensar quando a aba voltar. Toda duração de gameplay usa tempo da simulação, nunca `Date.now()` ou timers de parede.

O cenário move objetos; não há segunda movimentação horizontal automática do papai. Reutilizar obstáculos, moedas e partículas com pools limitados. Ao reciclar, limpar hitbox, flags de dano/coleta, timers e listeners.

## Persistência e falhas

Chave proposta: `pedin-run:save:v1`, contendo versão, recorde, tutorial visto e preferências. Validar tipos e limites; dados inválidos ou storage indisponível usam padrões em memória. Não persistir partida em andamento. Recordes locais podem ser alterados pelo navegador; não tratá-los como ranking confiável.

Carregar somente assets necessários à fase. Meta inicial: até 10 MB transferidos na primeira partida; medir build real antes de aceitar. Buscar 60 fps em desktop e pelo menos 30 fps no celular de referência, a definir e registrar durante a implementação. Reduzir partículas e densidade decorativa antes de comprometer leitura.

## Scripts disponíveis

- `npm run dev`: servidor local.
- `npm run build`: verificação de tipos e build de produção em `dist/`.
- `npm run preview`: inspeção local do build.
- `npm run test`: regras com Vitest.
- `npm run test:e2e`: fluxos com Playwright.

Os scripts estão definidos em `package.json`. A implementação atual e as diferenças em relação à estrutura prevista estão em [Versão jogável](08-versao-jogavel.md). Publicar `dist/` em hospedagem estática escolhida pelo responsável. Validar caminhos de assets tanto na raiz quanto no subdiretório configurado em `base`. Backend e credenciais não são necessários.

## Fontes oficiais consultadas

- [Documentação do Phaser](https://docs.phaser.io/): escopo 2D e suporte a TypeScript.
- [Arcade Physics](https://docs.phaser.io/phaser/concepts/physics/arcade): corpos e física usados na proposta.
- [Build de produção com Vite](https://vite.dev/guide/build): geração do build web.
- [Hospedagem estática com Vite](https://vite.dev/guide/static-deploy): publicação dos arquivos gerados.

Consulta em 28/10/2026. A escolha e a arquitetura são recomendações para este jogo; os links fundamentam as capacidades das ferramentas.
