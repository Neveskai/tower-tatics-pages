import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../_site');
const base='/tower-tatics-pages/';
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.mp4':'video/mp4','.ttf':'font/ttf','.txt':'text/plain; charset=utf-8'};
const server=createServer((req,res)=>{
  let pathname;
  try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
  if(pathname==='/'){res.writeHead(302,{Location:base}).end();return;}
  if(!pathname.startsWith(base)){res.writeHead(404).end();return;}
  let file=path.resolve(root,pathname.slice(base.length));
  if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  if(!existsSync(file)){res.writeHead(404).end();return;}
  if(statSync(file).isDirectory())file=path.join(file,'index.html');
  if(!existsSync(file)){res.writeHead(404).end();return;}
  const size=statSync(file).size;
  const headers={'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','Accept-Ranges':'bytes'};
  const range=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range||'');
  if(range){
    const start=Number(range[1]),end=range[2]?Math.min(Number(range[2]),size-1):size-1;
    if(start>=size||end<start){res.writeHead(416,{'Content-Range':`bytes */${size}`}).end();return;}
    res.writeHead(206,{...headers,'Content-Length':end-start+1,'Content-Range':`bytes ${start}-${end}/${size}`});
    if(req.method==='HEAD')res.end();else createReadStream(file,{start,end}).pipe(res);
  }else{
    res.writeHead(200,{...headers,'Content-Length':size});
    if(req.method==='HEAD')res.end();else createReadStream(file).pipe(res);
  }
});
server.listen(Number(process.env.PORT||4173),'127.0.0.1',()=>console.log('Preview: http://127.0.0.1:4173'+base));
