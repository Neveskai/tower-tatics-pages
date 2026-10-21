import { BASE, PLAY, DEMO, copy } from './site-content.mjs';
export const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const arrow = '<span aria-hidden="true">↗</span>';
export function ctas(c, className = '') {
  return `<div class="actions ${className}"><a class="button button-gold" href="${PLAY}" target="_blank" rel="noopener">${c.play}${arrow}</a><a class="button button-outline" href="${DEMO}" target="_blank" rel="noopener">${c.demo}<span aria-hidden="true">▷</span></a></div>`;
}
export function page({ locale, root, ptPath, enPath, title, description, content, kind = 'home', articleLanguage }) {
  const c = copy[locale];
  const local = locale === 'en' ? 'en/' : '';
  const home = root + local + 'index.html';
  const paths = [ptPath, enPath];
  const currentPath = paths[locale === 'en' ? 1 : 0];
  const nav = ['game','arsenal','worlds','gameplay'].map((id, i) => `<a href="${kind === 'home' ? '' : home}#${id}">${c.nav[i]}</a>`).join('');
  return `<!DOCTYPE html>
<html lang="${c.lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#080f18">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="icon" href="${root}app_icon_192.png" type="image/png">
<link rel="canonical" href="${BASE + (articleLanguage ? ptPath : currentPath)}">
${!articleLanguage ? `<link rel="alternate" hreflang="pt-BR" href="${BASE + ptPath}"><link rel="alternate" hreflang="en" href="${BASE + enPath}"><link rel="alternate" hreflang="x-default" href="${BASE + ptPath}">` : ''}
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="${articleLanguage ? 'article' : 'website'}">
<meta property="og:locale" content="${locale === 'pt' ? 'pt_BR' : 'en_US'}">
<meta property="og:url" content="${BASE + currentPath}">
<meta property="og:image" content="${BASE}img/feature_graphic.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="preload" href="${root}fonts/BarlowCondensed-Bold.ttf" as="font" type="font/ttf" crossorigin>
<link rel="stylesheet" href="${root}styles/site.css">
<script defer src="${root}js/site.js"></script>
</head>
<body class="page-${kind}" data-locale="${locale}">
<a class="skip-link" href="#content">${c.skip}</a>
<header class="site-header">
  <div class="header-inner">
    <a class="brand" href="${home}"><img src="${root}app_icon_192.png" width="38" height="38" alt=""><span>${c.name}</span></a>
    <button class="menu-toggle" type="button" aria-label="${c.menu}" aria-expanded="false" aria-controls="navigation"><span aria-hidden="true">☰</span></button>
    <nav class="navigation" id="navigation" aria-label="${locale === 'pt' ? 'Principal' : 'Main'}">${nav}<a href="${root + local}blog/index.html"${kind.startsWith('blog') ? ' aria-current="page"' : ''}>${c.nav[4]}</a></nav>
    <div class="header-actions"><div class="languages" aria-label="${locale === 'pt' ? 'Idioma' : 'Language'}"><a href="${root + ptPath}" lang="pt-BR" hreflang="pt-BR"${locale === 'pt' ? ' aria-current="page"' : ''}>PT</a><span aria-hidden="true">/</span><a href="${root + enPath}" lang="en" hreflang="en"${locale === 'en' ? ' aria-current="page"' : ''}>EN</a></div><a class="header-play" href="${PLAY}" target="_blank" rel="noopener">${c.playShort}${arrow}</a></div>
  </div>
</header>
<main id="content">${content}</main>
<footer class="site-footer wrap"><a class="brand" href="${home}"><img src="${root}app_icon_192.png" width="32" height="32" alt=""><span>${c.name}</span></a><p>© ${new Date().getFullYear()} Neveskai</p><div><a href="${root + local}blog/index.html">Blog</a><a href="${root + local}privacy.html">${c.privacy}</a><a href="mailto:wnevesky@gmail.com">${c.contact}</a></div></footer>
</body>
</html>`;
}
export function video(root, name, { portrait = false, hero = false, label = '', locale = 'pt' } = {}) {
  const mediaName = locale === 'en' && ['combat','construction'].includes(name) ? `en/${name}` : name;
  return `<div class="motion-frame ${portrait ? 'portrait' : ''}"${hero ? ' data-hero-motion' : ''}><video muted loop playsinline preload="none" poster="${root}media/${mediaName}-poster.webp" data-src="${root}media/${mediaName}.mp4" aria-label="${esc(label)}"${hero ? ' data-priority="true"' : ''}></video></div>`;
}
