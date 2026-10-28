# Inventário de assets

Este documento transforma a referência visual em uma lista de produção. Nenhum item abaixo deve ser considerado pronto apenas por aparecer na prancha. Os arquivos finais ainda precisam ser produzidos e integrados.

## Primeira versão

| Grupo | Chave sugerida | Entrega | Prioridade |
| --- | --- | --- | --- |
| Papai | `dad` | idle, run, jump, slide, hit e catch | Protótipo com formas; arte na etapa 4 |
| Pedin | `pedin` | idle, run, look-back e caught | Protótipo com formas; arte na etapa 4 |
| Mamãe | `mom` | Retrato de alerta, apoio e comemoração | Etapa 4 |
| Sala | `room` | Fundo, decoração e piso separados para parallax | Etapa 4 |
| Obstáculos | `blocks`, `bear`, `stool` | Blocos, urso e banquinho com vão para deslize | Formas na etapa 2; arte na etapa 4 |
| Coletáveis | `coin`, `shield`, `boost` | Moeda, coração de proteção e tênis de velocidade | Formas na etapa 3; arte na etapa 4 |
| Interface | `ui` | Logo, coração cheio/vazio, pausa, som, pulo e deslize | Etapas 3–4 |
| Efeitos | `fx` | Poeira, coleta, escudo e corações do abraço | Etapa 4 |
| Música | `music-room` | Loop leve com ponto de repetição sem corte audível | Etapa 4 |
| Efeitos sonoros | `sfx` | Pulo, coleta, escudo, tropeço e abraço | Etapa 4 |
| Tipografia | `font-ui` | Fonte legível com acentos, cedilha e números | Etapa 3 |

O banquinho precisa comunicar uma passagem baixa: desenhar pernas e tampo com abertura suficiente, usando colisão no tampo e sem bloquear o corredor do deslize. Validar primeiro com formas e hitboxes visíveis.

## Expansões

| Grupo | Entrega |
| --- | --- |
| Irmãos | Filhão lançando boost, primogênita criando escudo e filha do meio entregando estrela |
| Coletáveis | Estrela, mamadeira e presente |
| Obstáculos | Planta, poça e cesto baixo |
| Cenários | Quarto, jardim e rua, cada um com camadas e padrões próprios |

## Contrato de entrega

Guardar fontes editáveis em `art/source/` e exportações em `public/assets/`. Organizar exportações em `characters/`, `backgrounds/`, `obstacles/`, `pickups/`, `ui/` e `audio/`. Esses diretórios serão criados durante a implementação.

Para cada asset, registrar caminho, dimensões, escala no jogo, pivô, frames, duração, autor, origem e licença em um manifesto de produção. Não presumir uma licença para a referência enviada; registrar sua procedência antes da publicação.

Sprites usam PNG com transparência e atlas JSON compatível com a versão do Phaser escolhida. O tamanho das células deve acomodar todas as poses da animação sem cortar braços ou efeitos. Manter os pés no mesmo pivô; evitar espaços variáveis que façam o personagem oscilar. As hitboxes são definidas separadamente do retângulo da imagem.

Exportar áudio em formatos que funcionem nos navegadores alvo e validar os arquivos reais no carregamento. O jogo deve continuar sem áudio quando o navegador não conseguir reproduzi-lo.

## Aceite visual

- Conferir silhuetas, cores das roupas e expressões com a referência.
- Avaliar cada obstáculo em movimento na velocidade máxima, com a hitbox visível no modo de desenvolvimento.
- Verificar bordas e transparência sobre fundos claros e escuros.
- Conferir que mudanças de pose não deslocam os pés nem o personagem horizontalmente.
- Testar HUD e botões na menor tela prevista, incluindo textos em português.
- Conferir origem e licença de imagens, fontes e sons antes de publicar.

A lista de frames sugeridos e as regras de resolução estão em [Arte, interface e áudio](03-arte-interface-audio.md). As etapas citadas seguem o [Plano de implementação](05-plano-de-implementacao.md).
