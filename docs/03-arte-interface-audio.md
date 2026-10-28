# Arte, interface e áudio

## Direção visual

Seguir a referência: pixel art vibrante, contornos escuros, detalhes azuis/cianos, corações rosa, moedas amarelas e família expressiva. Preservar os traços dos personagens: papai de camiseta verde e calça azul; mamãe de óculos e cabelo longo; Pedin de cabelo cacheado, camiseta clara e fralda; irmãos com roupas e cores distintas.

Usar resolução lógica de 960 × 540, proporção 16:9 e coordenadas inteiras para renderização. Preferir escala inteira quando couber; em telas menores aceitar escala fracionária com filtro nearest-neighbor e verificar legibilidade. Nunca esticar a proporção. Aplicar letterbox quando necessário.

A imagem reúne conceito, poses e interface: não recortar a prancha inteira para simular personagens animados. Produzir sprites e fundos separados, com transparência, pivô consistente nos pés e espaço suficiente para cada pose.

## Inventário de animações

| Personagem | Animações | Frames sugeridos |
| --- | --- | --- |
| Papai | idle, run, jump, slide, hit, catch | 4, 6–8, 3, 3, 3, 6 |
| Pedin | idle, run, look-back, caught | 4, 6, 4, 4 |
| Mamãe | alert, support, hint, cheer | 3–4 cada |
| Filhão | idle, point, throw-boost, cheer | 3–4 cada |
| Primogênita | idle, shield, cheer | 3–4 cada |
| Filha do meio | idle, give-star, cheer | 3–4 cada |

São quantidades propostas para produção; as poses da referência não representam frames completos. Corrida em 10–12 fps; demais animações conforme duração da ação. O estado de gameplay controla a duração, sem depender do término de um loop visual.

Exportar PNG com alpha e atlas JSON compatível com o loader escolhido. Padronizar chaves como `dad/run/00` e animações como `dad-run`. Guardar fontes editáveis em `art/source/` e exportações em `public/assets/`. Manter inventário com dimensões, pivôs, frames e autoria/licença antes da publicação.

## Cenários

Sala inicial: parede e janela ao fundo, sofá no plano intermediário e piso na pista. Quarto, jardim e rua seguem a mesma perspectiva e linha de chão. Parallax sugerido: fundo 0,15×, decoração 0,45× e pista 1×. Objetos decorativos devem se distinguir dos obstáculos por contraste e posição.

## Interface

Menu: logo, Jogar, Como jogar e Configurações. Abertura curta com a mamãe: “Querido! O Pedin está fugindo!”. Permitir pular a abertura.

HUD: três corações à esquerda; distância, moedas e indicador de aproximação no topo; buffs com ícone e duração. Não reproduzir os painéis de personagens da prancha dentro da área de gameplay.

Celular: botões de pulo e deslize com área mínima de 56 × 56 CSS px, afastados da pista e respeitando áreas seguras. Calcular coordenadas pelo canvas escalado. Em retrato, manter jogo com proporção correta e controles acessíveis; sugerir girar sem bloquear a pessoa.

Pausa: Retomar, Reiniciar e Menu. Resultado: abraço ou convite para tentar de novo, pontuação, recorde e Jogar novamente. Configurações em HTML semântico: música, efeitos e reduzir movimento; suportar teclado e foco visível. A interface deve ser navegável por teclado; essa meta não implica que o gameplay em canvas seja inteiramente acessível a leitores de tela.

## Áudio e conforto

Trilha leve em loop e efeitos curtos para pulo, coleta, escudo, tropeço e abraço. Iniciar áudio apenas após gesto do usuário. Persistir volumes separados e estado de silêncio. Interromper ou suspender áudio ao pausar/ocultar aba, sem loops duplicados no reinício.

Usar fontes legíveis com acentos em português. Não depender só de cor para indicar dano ou buff. Opção de reduzir movimento remove tremor, reduz partículas e desliga parallax. Não usar flashes intensos. Falha no carregamento de áudio não deve impedir a partida.
