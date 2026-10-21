import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';
import { BLOG_OUT_DIR, loadPosts } from './lib/posts.mjs';
import { render } from './lib/template.mjs';
import { copy } from './lib/site-content.mjs';
import { page, esc, arrow } from './lib/layout.mjs';
const repo = path.dirname(BLOG_OUT_DIR);
const posts = loadPosts({ includeDrafts: process.argv.includes('--drafts') });
const templates = path.join(BLOG_OUT_DIR,'templates');
const postTemplate = readFileSync(path.join(templates,'post.html.tmpl'),'utf8');
const indexTemplate = readFileSync(path.join(templates,'index.html.tmpl'),'utf8');
for (const locale of ['pt','en']) {
  const c = copy[locale], prefix = locale === 'en' ? 'en/' : '';
  const output = path.join(repo,prefix,'blog');
  const formatter = new Intl.DateTimeFormat(c.lang,{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
  mkdirSync(output,{recursive:true});
  const tags = post => post.tags.map(tag=>`<span class="tag">${esc(tag)}</span>`).join('');
  for (const post of posts) {
    const postDir = path.join(output,post.slug);
    mkdirSync(postDir,{recursive:true});
    const content = render(postTemplate,{
      KICKER:c.blogEyebrow, TITLE:esc(post.title), DATE:formatter.format(post.date), ISO_DATE:post.date.toISOString(), TAGS:tags(post),
      LANGUAGE_NOTE:c.blogOriginal, SUMMARY:esc(post.summary), CONTENT:marked.parse(post.body), BACK:c.back
    });
    writeFileSync(path.join(postDir,'index.html'),page({locale,root:locale==='en'?'../../../':'../../',ptPath:`blog/${post.slug}/index.html`,enPath:`en/blog/${post.slug}/index.html`,title:`${post.title} — ${c.name}`,description:post.summary,content,kind:'blog-post',articleLanguage:'pt-BR'}));
  }
  const cards = posts.map((post,i)=>`<a class="post-card" href="${post.slug}/index.html"><div class="post-number" aria-hidden="true">${String(i+1).padStart(2,'0')}</div><div><div class="post-meta"><time datetime="${post.date.toISOString()}">${formatter.format(post.date)}</time><span class="language-note">${c.blogOriginal}</span></div><h2 lang="pt-BR">${esc(post.title)}</h2><p lang="pt-BR">${esc(post.summary)}</p><div class="tags">${tags(post)}</div></div><span class="post-arrow" aria-label="${c.read}">↗</span></a>`).join('') || `<p>${c.empty}</p>`;
  const content = render(indexTemplate,{KICKER:c.blogEyebrow,TITLE:c.blogTitle,DESCRIPTION:c.blogDescription,POSTS:cards});
  writeFileSync(path.join(output,'index.html'),page({locale,root:locale==='en'?'../../':'../',ptPath:'blog/index.html',enPath:'en/blog/index.html',title:`Dev Blog — ${c.name}`,description:c.blogDescription,kind:'blog-index',content}));
}
console.log(`Built ${posts.length} blog post(s) and indexes (PT + EN).`);
