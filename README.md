# Piggy Contra o Mundo — site

Site estático em português e inglês, publicado no GitHub Pages. O jogo e a demo Web têm repositório e deploy próprios.

## Desenvolvimento

```sh
npm ci
npm run build
npm run assemble
npm test
npm run preview
```

Preview: http://127.0.0.1:4173/tower-tatics-pages/ (o mesmo prefixo usado no GitHub Pages).

- `scripts/lib/site-content.mjs`: textos PT/EN, mapas e legendas.
- `scripts/build-site.mjs`: página inicial e privacidade nos dois idiomas.
- `scripts/lib/layout.mjs`, `styles/site.css`, `js/site.js`: estrutura, identidade e interações compartilhadas.
- `blog/posts/`: artigos em Markdown; `blog/templates/`: apresentação dos artigos e do índice.
- `scripts/build-blog.mjs`: gera PT/EN da interface do blog. Os artigos mantêm o idioma original e a URL portuguesa como canonical.
- `scripts/assemble-site.mjs`: lista explícita dos arquivos públicos enviados ao Pages. Novas pastas públicas precisam entrar nessa lista.

A home e a política geradas ficam versionadas. O HTML do blog e `_site/` são ignorados e reconstruídos no deploy. Para conferir rascunhos localmente: `npm run build:blog:drafts`; execute o build normal antes de montar a versão pública.

O JavaScript melhora a navegação, as abas, o seletor de mapas e a galeria. Sem ele, os conteúdos continuam visíveis, os links internos funcionam e o trailer pode ser aberto pelo arquivo. Os vídeos curtos só carregam quando entram em cena; preferências de movimento reduzido e economia de dados mantêm os posters.

## Mídia

As fontes, scripts de preparação e capturas de revisão desta reformulação estão em `../store-assets/2026-10-21-site/`. Consulte [o roteiro de gravação](docs/media-capture.md).

As molduras e texturas são os recortes originais da HUD final em `tower-tatics-3D/assets/ui/hud_comic/extracted/`, convertidos em WebP sem perdas. O botão principal combina a moldura e a impressão dourada do jogo. A fonte Barlow Condensed e sua licença OFL estão em `fonts/`.

A mídia foi regenerada após o aviso de conclusão da HUD em 21/10/2026. Capturas e clipes de construção/combate têm versões PT/EN; os clipes aproximados do arsenal não contêm texto. O trailer preserva duração, música e créditos, com as cenas de gameplay atualizadas.

## Publicação

Push em `main` aciona `.github/workflows/blog.yml`: instala dependências, gera as páginas, monta o pacote público, valida links/recursos e publica no Pages. A implementação local não publica nem altera o Netlify.
