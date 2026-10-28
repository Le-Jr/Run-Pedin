# Plano de implementação e aceite

Executar em ordem. Só avançar quando a entrega anterior estiver jogável ou verificável. Não começar pela produção de todos os cenários.

## 1. Fundação e protótipo de movimento

Criar projeto Phaser/TypeScript/Vite, scripts, canvas responsivo e cena da sala com formas simples. Implementar corrida visual, chão, pulo, deslize e pausa.

Aceite: teclado e toque executam as mesmas ações; o papai não atravessa o chão; o deslize preserva a base da hitbox; pausar não avança a simulação; build de produção abre sem erros.

## 2. Corrida completa com placeholders

Implementar modelo de distância e aproximação, gerador com semente, obstáculos, dano, invulnerabilidade, captura e derrota.

Aceite: a fase pode ser vencida sem itens nem colisões; três danos válidos causam derrota; um obstáculo não drena múltiplos corações; a captura respeita a distância mínima; limite de tempo produz resultado; dez reinícios não duplicam objetos ou listeners.

## 3. Itens, pontuação e interface

Adicionar moedas, escudo, boost, tutorial, HUD, menu, resultado e save local tolerante a falhas.

Aceite: itens são consumidos uma vez; escudo absorve um contato; boost altera aproximação pelo tempo definido; buffs congelam na pausa; recorde sobrevive ao reload; save inválido não trava o jogo.

## 4. Identidade visual e áudio

Substituir placeholders por assets separados, finalizar animações, sala em parallax, abertura com mamãe e abraço. Adicionar música e efeitos configuráveis.

Aceite: silhuetas são legíveis na velocidade máxima; colisões correspondem às poses; som começa após interação; reduzir movimento altera os efeitos; falta de áudio não bloqueia o jogo.

## 5. Validação e build para publicação

Testar build de produção em Chromium e Firefox desktop, Chrome Android e Safari iOS, usando dispositivos reais quando disponíveis. Registrar versões, aparelhos e limitações. Automatizar o que puder ser validado com Playwright, sem alegar que emulação substitui aparelho real.

Aceite: jogar por teclado e toque; rotacionar e redimensionar sem perder botões; ocultar aba e retomar sem salto temporal; ausência de scroll involuntário ao jogar; carregamento permite retry; sem erros de console no fluxo completo; metas de tamanho e desempenho medidas.

## Testes essenciais

| Camada | Casos |
| --- | --- |
| Unidade | Pontuação, limites de vida, escudo, expiração/renovação de buffs, aproximação e empate de recorde |
| Unidade | Captura após distância mínima, dano fatal simultâneo, relógio pausado e transições terminais únicas |
| Geração | Sementes reproduzíveis, tempo de reação e padrões compatíveis com ações |
| Integração | Iniciar, pular, deslizar, pausar, retomar, finalizar e reiniciar |
| Persistência | Save válido, inválido e armazenamento indisponível |
| Manual | Leitura visual, toque, orientação, conforto e sensação da corrida |

Para automação, permitir semente e configuração de teste somente no ambiente de teste. Preferir verificar estados e comportamento a comparar pixels de animações. Não depender de vitória aleatória em testes.

## Depois da primeira versão

Adicionar irmãos animados e itens restantes; depois quarto, jardim e rua. Cada fase precisa de padrões próprios e validação de alcance. Modo infinito exige regras de dificuldade e resultado próprias e não deve substituir a corrida com abraço final.
