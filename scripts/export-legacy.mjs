import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
const origin=(process.env.NEXT_PUBLIC_SITE_URL||'http://127.0.0.1:3001').replace(/\/$/,'');
const aliases={'/admin.html':'/admin/','/editor/':'/admin/','/services/seo/':'/services/3eo/','/services/aeo-geo/':'/services/3eo/','/home.html':'/','/studio/':'/about/','/about.html':'/about/','/contact.html':'/contact/','/services.html':'/services/','/process.html':'/process/','/privacy.html':'/privacy/','/terms.html':'/terms/','/work/':'/cases/','/work.html':'/cases/'};
const retired=['/project/','/project.html',...['odd-hours','mora','zest-club','dianas','bastet','identity-system','package-system','campaign-graphic','brand-film','space-experience','brand-activation','creative-collaboration','film-production'].map(s=>'/work/'+s+'/'),...['branding','ci-bi','space-branding','brand-film','marketing','web-digital','ai-image-film'].map(s=>'/services/'+s+'/')];
const style='body{font-family:Helvetica,Arial,sans-serif;margin:0;padding:10vh 24px;color:#111;background:#fff;line-height:1.8}main{max-width:650px;margin:auto}img{width:210px;height:auto}h1{font-size:32px;line-height:1.4;margin-top:50px}p{color:#666}a{color:#111}nav{display:flex;gap:24px;flex-wrap:wrap;margin-top:35px}';
for(const [url,target] of [...Object.entries(aliases),...retired.map(url=>[url,null])]){
 const file=join('out',url.endsWith('/')?url.slice(1)+'index.html':url.slice(1));await mkdir(dirname(file),{recursive:true});
 const canonical=origin+(target||url);
 const html=`<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>페이지 안내 | OSMU STUDIO · 3EO</title><meta name="robots" content="noindex,follow"><link rel="canonical" href="${canonical}">${target?`<meta http-equiv="refresh" content="0;url=${target}">`:''}<style>${style}</style></head><body><main><a href="/"><img src="/logo.svg" alt="OSMU STUDIO"></a><h1>${target?'새로운 페이지로 이동합니다.':'홈페이지를 새롭게 정리했습니다.'}</h1><p>${target?'사이트 개편으로 페이지 주소가 변경되었습니다. 자동으로 이동하지 않으면 아래 링크를 눌러 주세요.':'요청한 이전 콘텐츠는 현재 공개 페이지에서 제공하지 않습니다. 새롭게 정리한 서비스와 인사이트를 확인해 주세요.'}</p><nav>${target?`<a href="${target}">변경된 페이지 보기 →</a>`:'<a href="/services/">서비스 보기 →</a><a href="/insights/">인사이트 보기 →</a>'}<a href="/">홈으로</a></nav></main></body></html>`;
 await writeFile(file,html);
}
await writeFile('out/legacy-routes.json',JSON.stringify({aliases,retired}));
console.log(`Preserved ${Object.keys(aliases).length} old navigation URLs and ${retired.length} retired-content notices.`);
