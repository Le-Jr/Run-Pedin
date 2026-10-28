# Regras e controles

Todas as medidas abaixo usam coordenadas lógicas do jogo. Os valores são pontos de partida para ajuste, não características extraídas da imagem.

## Modelo da corrida

A câmera apresenta uma pista lateral única. O papai permanece próximo de x = 180; o cenário e os obstáculos se movem para a esquerda. Não há movimentação horizontal manual nem troca de faixa.

Manter `distanceM`, `gapM` e velocidade em um modelo de partida. Converter deslocamento visual em metros usando 20 px/m. Velocidade inicial: 240 px/s (12 m/s), aumentando linearmente até 320 px/s durante os primeiros 60 segundos. A distância só avança durante a corrida ativa.

A separação inicial para Pedin é 18 m. Durante a corrida, reduzir essa separação em 0,20 m/s; boost acrescenta 1,0 m/s de aproximação. Um tropeço aumenta a separação em 3 m. Limitar o valor entre 0 e 30 m. Esses números representam a progressão abstrata; a posição de Pedin na tela deve ser mapeada para uma faixa visível, sem mover o papai.

A captura só fica disponível após 600 m. Quando distância ≥ 600 m e separação ≤ 2 m, encerrar obstáculos e iniciar o abraço automaticamente. Aos 90 segundos de corrida ativa, se ainda não houver captura, mostrar que Pedin chegou à mamãe e oferecer outra tentativa. Não interpretar esse final como acidente.

## Controles

| Ação | Teclado | Toque |
| --- | --- | --- |
| Pular | Espaço, W ou seta para cima | Botão de pulo |
| Deslizar | S ou seta para baixo | Botão de deslize |
| Pausar / retomar | Escape ou P | Botão de pausa |
| Confirmar menu | Enter | Botão correspondente |

Pulo apenas no chão, sem pulo duplo. Usar tolerância de 80 ms após deixar o chão e buffer de entrada de 120 ms. Deslize dura 600 ms, com intervalo mínimo de 250 ms após terminar. Não permitir deslize no ar ou pulo durante deslize. Input mantido não deve gerar ações repetidas automaticamente.

## Movimento e colisões

- Gravidade inicial: 1.500 px/s²; impulso do pulo: −560 px/s. Isso produz aproximadamente 104 px de altura e 0,75 s de voo.
- Hitbox em pé sugerida: 32 × 64 px; deslizando: 48 × 28 px, sempre apoiada na mesma linha do chão.
- Ajustar hitboxes ao desenho final, excluindo cabelo e efeitos. Restaurar a hitbox só quando houver espaço; manter deslize até sair de uma passagem baixa.
- Cada colisão válida remove um coração, interrompe boost, aumenta a separação e aplica invulnerabilidade por 1,5 s. O mesmo obstáculo não pode causar dano duas vezes.
- Começar com três corações; zero encerra a corrida. Invulnerabilidade usa contorno/ícone, sem flashes rápidos.

## Obstáculos

| Objeto da referência | Regra proposta | Disponibilidade |
| --- | --- | --- |
| Blocos e urso | Pular; contato causa tropeço | Primeira versão |
| Banquinho | Passar por baixo com deslize; desenhar vão legível | Primeira versão |
| Planta | Pular, com altura compatível com o arco | Expansão |
| Poça | Pular; contato causa um tropeço | Expansão |
| Cesto de roupas | Pular; versão baixa do cesto | Expansão |

Usar padrões desenhados e validados, escolhidos por gerador com semente. Os primeiros 10 s ensinam um obstáculo por vez. Começar com intervalo de 1,6–2,4 s e nunca reduzir abaixo de 1,2 s. Garantir ao menos 1 s de visibilidade antes do contato e validar transições de pulo/deslize pela duração das ações. Não gerar combinações que exijam ações incompatíveis; reduzir variedade em vez de criar passagens impossíveis. Ao aumentar a velocidade, recalcular espaçamento em pixels a partir desses tempos.

## Coletáveis e ajuda da família

| Item | Efeito | Regra |
| --- | --- | --- |
| Moeda | +10 pontos | Consumida uma vez |
| Escudo de amor | Absorve um tropeço | Até 8 s; nova coleta renova, sem acumular cargas |
| Boost | Aproxima o papai de Pedin | 3 s; renova duração, não acumula intensidade |
| Estrela | +100 pontos | Expansão |
| Mamadeira | Recupera um coração | Máximo de três; expansão |
| Presente | +250 pontos | Expansão |

Escudo absorve o contato sem perda de coração, distância ou boost e concede a invulnerabilidade normal. Boost altera a aproximação, não a velocidade dos obstáculos ou a altura do pulo. A mamãe dá dicas contextuais com intervalo mínimo de 10 s. Os irmãos, quando implementados, anunciam o item antes da entrega sem bloquear a pista.

## Pontuação e estados

Pontuação = parte inteira da distância em metros + moedas × 10 + bônus de itens + 500 pela captura. Salvar maior pontuação; em empate, manter o recorde anterior. Exibir pontuação final e melhor resultado local.

Estados: `ready`, `running`, `paused`, `catching`, `won`, `lost`. Em caso de dano fatal e captura no mesmo passo, processar dano primeiro e finalizar derrota. Assim que sair de `running`, ignorar novas colisões e entradas de movimento. O resultado deve ser emitido uma única vez.

Pausa congela física, distância, geração, buffs, invulnerabilidade e relógio da fase. Ao perder foco ou ocultar a aba, pausar e exigir retomada explícita. Reiniciar limpa todos os timers, objetos e efeitos da tentativa anterior.
