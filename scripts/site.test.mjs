import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const repo=path.resolve(import.meta.dirname,'..');
const site=path.join(repo,'_site');
function files(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const pages=files(site).filter(f=>f.endsWith('.html'));
test('all eight public PT/EN pages and their local assets resolve under the Pages subpath',()=>{
  assert.equal(pages.length,8);
  for(const file of pages){
    const html=readFileSync(file,'utf8');
    const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
    assert.equal(new Set(ids).size,ids.length,`Duplicate ID: ${file}`);
    assert.equal((html.match(/<h1\b/g)||[]).length,1,`One H1: ${file}`);
    for(const [,link] of html.matchAll(/\b(?:href|src|poster|data-src)="([^"]*)"/g)){
      if(!link||/^(?:https?:|mailto:|data:)/.test(link))continue;
      const [pathname,hash]=link.split('#');
      let target=path.resolve(path.dirname(file),pathname||path.basename(file));
      assert.ok(target.startsWith(site),`Escapes public root: ${link}`);
      assert.ok(existsSync(target),`Missing ${link} in ${file}`);
      if(statSync(target).isDirectory())target=path.join(target,'index.html');
      assert.ok(existsSync(target),`Missing index: ${link}`);
      if(hash&&target.endsWith('.html'))assert.ok(readFileSync(target,'utf8').includes(`id="${hash}"`),`Missing anchor ${link}`);
    }
    assert.match(html,/<link rel="canonical" href="https:\/\/neveskai.github.io\/tower-tatics-pages\//);
  }
  for(const [,url] of readFileSync(path.join(site,'styles/site.css'),'utf8').matchAll(/url\(['"]?([^)'"\s]+)/g))assert.ok(existsSync(path.resolve(site,'styles',url)),`Missing CSS asset ${url}`);
});
test('home pages advertise only current modes, with store/demo links and usable static content',()=>{
  for(const prefix of ['','en/']){
    const html=readFileSync(path.join(site,prefix,'index.html'),'utf8');
    const text=html.replace(/<[^>]*>/g,' ');
    assert.doesNotMatch(text,/\bCrystal\b|central crystal|cristal central|ramos de torre|progressão de conta|Em breve no|Steam|App Store/i);
    assert.equal((html.match(/class="world-scene"/g)||[]).length,11);
    assert.equal((html.match(/data-gallery/g)||[]).length,7);
    assert.equal((html.match(/class="arsenal-panel"/g)||[]).length,3);
    assert.doesNotMatch(html,/<article[^>]*\bhidden\b/);
    assert.match(html,/https:\/\/play.google.com\/store\/apps\/details\?id=com.neveskai.towertactics3d/);
    assert.match(html,/https:\/\/piggy-against-the-world.netlify.app\//);
    assert.doesNotMatch(html,/<(?:source|video)[^>]*\ssrc=/);
    const motionLocale = prefix ? 'en/' : '';
    for (const clip of ['combat','construction']) {
      assert.ok(html.includes(`media/${motionLocale}${clip}.mp4`), `Localized loop: ${prefix}${clip}`);
      assert.ok(html.includes(`media/${motionLocale}${clip}-poster.webp`), `Localized poster: ${prefix}${clip}`);
    }
    assert.match(html,/<iframe src="https:\/\/www\.youtube-nocookie\.com\/embed\/vvlwDFHf8fo" title="[^"]+"[^>]*loading="lazy"[^>]*referrerpolicy="strict-origin-when-cross-origin"[^>]*allowfullscreen><\/iframe>/);
    assert.doesNotMatch(html,/trailer\.mp4|data-trailer|trailer-load/);
  }
});
test('English blog keeps original Portuguese article language and canonical URL',()=>{
  const html=readFileSync(path.join(site,'en/blog/pipeline-ia-godot-publicacao/index.html'),'utf8');
  assert.match(html,/<html lang="en">/);
  assert.match(html,/<div class="post-body" lang="pt-BR">/);
  assert.match(html,/Article in Portuguese/);
  assert.match(html,/rel="canonical" href="https:\/\/neveskai.github.io\/tower-tatics-pages\/blog\//);
});
function motionHarness({reduce=false,saveData=false}={}){
  const documentEvents={};let observer;
  const video={dataset:{src:'loop.mp4'},src:'',paused:true,playCount:0,load(){},pause(){this.paused=true;},play(){this.paused=false;this.playCount++;return Promise.resolve();},getAttribute(){return this.src;},closest(){return null;}};
  const button={dataset:{pause:'Pause',resume:'Play'},setAttribute(){},addEventListener(type,callback){this[type]=callback;}};
  const navigation={classList:{remove(){}},addEventListener(){}};
  const document={hidden:false,documentElement:{classList:{add(){}}},querySelectorAll(selector){return selector==='video[data-src]'?[video]:[];},querySelector(selector){if(selector==='[data-motion-toggle]')return button;return null;},getElementById(){return navigation;},addEventListener(type,callback){documentEvents[type]=callback;}};
  const window={matchMedia(){return {matches:reduce,addEventListener(){}};},IntersectionObserver:true};
  class IntersectionObserver{constructor(callback){observer ??= callback;}observe(){}unobserve(){}}
  vm.runInNewContext(readFileSync(path.join(repo,'js/site.js'),'utf8'),{document,window,navigator:{connection:{saveData,addEventListener(){}}},IntersectionObserver,Set,console});
  return {video,button,document,documentEvents,intersect(value){observer([{target:video,isIntersecting:value}]);}};
}
test('loops load only in view, pause offscreen/hidden and respect the manual pause control',()=>{
  const h=motionHarness();assert.equal(h.video.src,'');
  h.intersect(true);assert.equal(h.video.src,'loop.mp4');assert.equal(h.video.paused,false);
  h.intersect(false);assert.equal(h.video.paused,true);
  h.intersect(true);h.button.click();assert.equal(h.video.paused,true);
  h.button.click();assert.equal(h.video.paused,false);
  h.document.hidden=true;h.documentEvents.visibilitychange();assert.equal(h.video.paused,true);
});
test('reduced motion and data saving keep loops as posters without requesting video',()=>{
  for(const options of [{reduce:true},{saveData:true}]){const h=motionHarness(options);h.intersect(true);assert.equal(h.video.src,'');assert.equal(h.video.playCount,0);}
});
test('public bundle contains no authoring sources or private configuration',()=>{
  assert.ok(!existsSync(path.join(site,'trailer.mp4')), 'Trailer is hosted on YouTube, not deployed');
  for(const file of files(site))assert.doesNotMatch(path.relative(site,file),/(^|[\\/])(?:\.git|\.env|node_modules|posts|templates|scripts)([\\/]|$)|\.md$/);
});
