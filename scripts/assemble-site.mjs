import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
const repo = path.resolve(import.meta.dirname,'..');
const output = path.join(repo,'_site');
if (output !== path.resolve(repo,'_site') || !output.startsWith(repo + path.sep)) throw new Error('Invalid output path');
rmSync(output,{recursive:true,force:true});
mkdirSync(output,{recursive:true});
// Explicit public allowlist: source scripts, posts and private files are never deployed.
for (const entry of ['index.html','privacy.html','app_icon_192.png','styles','js','fonts','media','img','shots','en']) {
  cpSync(path.join(repo,entry),path.join(output,entry),{recursive:true});
}
mkdirSync(path.join(output,'blog'),{recursive:true});
cpSync(path.join(repo,'blog/index.html'),path.join(output,'blog/index.html'));
for (const entry of readdirSync(path.join(repo,'blog'),{withFileTypes:true})) {
  if (!entry.isDirectory()) continue;
  const source=path.join(repo,'blog',entry.name,'index.html');
  if (existsSync(source)) {
    mkdirSync(path.join(output,'blog',entry.name),{recursive:true});
    cpSync(source,path.join(output,'blog',entry.name,'index.html'));
  }
}
console.log('Assembled _site with PT/EN pages and public assets.');
