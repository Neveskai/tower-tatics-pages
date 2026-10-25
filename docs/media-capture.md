# Mídia do site — roteiro e regeneração

**Status:** HUD finalizada pelo usuário em 21/10/2026; capturas, clipes e acabamento do site regenerados a partir dela.

## Pacote atual

O trailer publicado desde 24/10/2026 é uma cópia de `../../../store-assets/2026-10-24-lancamento/video-hype-16x9.mp4` (41,1 s). A capa `capas/video-hype-16x9.jpg` desse pacote foi convertida em `media/trailer-poster.webp` com FFmpeg/libwebp, qualidade 88. Música: “Five Armies” — Kevin MacLeod, CC BY 4.0, com créditos nas duas páginas. O roteiro abaixo permanece válido para as capturas e os loops; `update-trailer.py` descreve o trailer anterior de 70 s e não deve substituir o trailer oficial de lançamento.

Fontes e scripts em `../../../store-assets/2026-10-21-site/` a partir deste documento. A rodada anterior continua preservada em `2026-10-20-site/`.

- `pt/phone/` e `en/phone/`: 13 capturas PNG por idioma, geradas pelo runner do build completo, com save separado.
- `tutorial-jpg/<idioma>/place_tower/`: construção completa pelo Piggy, 99 frames a 30 fps.
- `tutorial-jpg/<idioma>/site_combat/`: 330 frames a 30 fps, defesa montada na campanha Classic, Floresta Orc 3★, oitava onda. A montagem usa as regras reais de posicionamento e a onda do catálogo, sem alterar o combate.
- `items/`: Balista, Relâmpago e Orc, gravados pelo runner atual a 60 fps, com os recortes de ação do arsenal.
- `capture.ps1`, `record-clips.ps1`: execuções escondidas do Godot Compatibility. Rodar nessa ordem.
- `prepare-media.py`: gera WebP e MP4 H.264 silencioso a 24 fps. A mídia vertical mantém o quadro inteiro em 720×1280; clipes de arsenal usam 800×600.
- `update-trailer.py`: substitui todo o gameplay antigo, de 6 a 61 s, preservando a abertura, o encerramento, os 70 s, música e créditos. A cópia original está guardada junto ao script.
- `media-manifest.json`: tamanho dos arquivos derivados.

O projeto `capture-project/` tem configuração própria, junctions para os recursos e uma cópia dos scripts de ferramentas. O save fica em `%APPDATA%/Godot/app_userdata/Piggy Website Capture 2026-10-21/`. Não iniciar o editor nem importar recursos nessa cópia enquanto o projeto principal estiver aberto. Nenhum arquivo de gameplay do projeto principal foi alterado.

Somente a cópia do runner ganhou o roteiro `site_combat` e exportação JPEG de qualidade 97 para os frames de vídeo, evitando o custo de compressão PNG quadro a quadro. Capturas estáticas permanecem PNG. O save de demonstração tem conteúdo desbloqueado e saldos de exemplo; o combate e a construção são gravados sem o override de ouro do modo god. Os clipes aproximados do arsenal usam o modo god isolado e não incluem o HUD. As páginas inglesas carregam os loops verticais e as capturas com texto em inglês.

Os PNGs em `assets/ui/hud_comic/extracted/` são a fonte dos WebP sem perdas das molduras. A chamada dourada combina `gold_frame` e `gold_fill`; painéis e abas usam `panel` e `card`. As artes de mapas e marca reaproveitam as fontes atuais do jogo e a rodada anterior, pois não dependem da HUD.

## Tomadas sugeridas para a HUD final

Gravar 15–25 segundos por tomada, com 3–5 segundos antes e depois. Usar o build completo e, se possível, gravar PT e EN. Sem edição, zoom do gravador ou música adicional. Manter o tabuleiro e os botões legíveis.

| Tomada | Ação | Critério de escolha |
| --- | --- | --- |
| Construção | Selecionar uma torre, posicionar, acompanhar Piggy e o andaime até a torre ficar pronta. | A construção inteira aparece sem popup cobrindo o campo. |
| Labirinto / combate | Mostrar uma defesa montada e a horda fazendo as curvas criadas pelas torres. | O caminho e o efeito dos ataques ficam claros em um trecho contínuo. |
| Habilidade | Selecionar Relâmpago ou outra habilidade atual e atingir um grupo. | Seleção, lançamento e impacto visíveis; preservar a consequência real do golpe. |
| Invocação | Acionar a invocação, mostrar o aliado surgindo e seu primeiro ataque. | Distinguir o aliado dos inimigos e manter o botão visível no começo. |
| Chefão (extra) | Mostrar a reação a um ataque do Boss e a resposta do jogador. | Uma decisão legível; não precisa encerrar a partida. |

**Crystal com cristal central foi descontinuado. Não gravar, anunciar nem reutilizar esse modo.** Os arquivos de arte de mapas ainda podem ter `crystal_` no nome técnico; isso não descreve um modo disponível.

## Regenerar novamente

1. Atualizar os recursos da cópia de captura sem alterar o projeto principal. Preservar as duas adaptações de gravação descritas acima.
2. Rodar `capture.ps1`, depois `record-clips.ps1`, e conferir os logs e os frames.
3. Executar `prepare-media.py` e `update-trailer.py` com Python/Pillow e FFmpeg instalados.
4. Revisar os quadros inicial, intermediário e final dos clipes, idiomas, legibilidade e créditos.
5. Gerar o site, montar o pacote público e executar os testes; revisar o preview em desktop e celular.

Os fontes ficam fora do deploy. O pacote público inclui apenas as imagens, vídeos e páginas derivados.
