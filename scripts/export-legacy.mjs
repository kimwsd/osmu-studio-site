import {mkdir,readFile,writeFile,rm} from 'node:fs/promises';
import {dirname,join,resolve,relative,isAbsolute} from 'node:path';
const origin=(process.env.NEXT_PUBLIC_SITE_URL||'http://127.0.0.1:3001').replace(/\/$/,'');
const {aliases,retired}=JSON.parse(await readFile(new URL('../lib/legacy-routes.json',import.meta.url),'utf8'));
const output=resolve('out');
function outputFile(route){
 if(!route.startsWith('/')||route.includes('..')||/[?#]/.test(route))throw new Error('Unsafe legacy route: '+route);
 const file=resolve(output,'.'+route+(route.endsWith('/')?'index.html':''));
 const within=relative(output,file);
 if(within.startsWith('..')||isAbsolute(within))throw new Error('Legacy path outside export: '+route);
 return file;
}
const style='body{font-family:Helvetica,Arial,sans-serif;margin:0;padding:10vh 24px;color:#111;background:#fff;line-height:1.8}main{max-width:650px;margin:auto}img{width:210px;height:auto}h1{font-size:32px;line-height:1.4;margin-top:50px}p{color:#666}a{color:#111}nav{display:flex;gap:24px;flex-wrap:wrap;margin-top:35px}';
for(const [url,target] of Object.entries(aliases)){
 if(aliases[target]||retired.includes(target))throw new Error('Legacy destination must be final: '+url);
 await readFile(outputFile(target),'utf8');
 const file=outputFile(url);await mkdir(dirname(file),{recursive:true});
 const robots=target==='/admin/'?'noindex,nofollow':'index,follow';
 // GitHub Pages cannot set per-path HTTP redirects. An immediate meta refresh
 // is the non-JavaScript fallback; JS also retains campaign parameters/fragments.
 const html=`<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>페이지 이동 안내 | OSMU STUDIO · 3EO</title><meta name="robots" content="${robots}"><link rel="canonical" href="${origin+target}"><script>location.replace(${JSON.stringify(target)}+location.search+location.hash)</script><meta http-equiv="refresh" content="0;url=${target}"><style>${style}</style></head><body><main><a href="/"><img src="/logo.svg" alt="OSMU STUDIO"></a><h1>새로운 페이지로 이동합니다.</h1><p>사이트 개편으로 페이지 주소가 변경되었습니다. 자동으로 이동하지 않으면 아래 링크를 눌러 주세요.</p><nav><a href="${target}">변경된 페이지 보기 →</a><a href="/">홈으로</a></nav></main></body></html>`;
 await writeFile(file,html);
}
// No equivalent content exists for retired projects/services. Leaving a thin
// notice at HTTP 200 creates a soft 404; let Pages serve the real custom 404.
for(const route of retired){
 if(aliases[route])throw new Error('Retired route overlaps alias: '+route);
 await rm(outputFile(route),{force:true});
}
await writeFile(join(output,'legacy-routes.json'),JSON.stringify({aliases,retired}));
console.log(`Preserved ${Object.keys(aliases).length} direct navigation aliases; ${retired.length} retired URLs return the custom 404.`);
