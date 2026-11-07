import {readFile,stat} from 'node:fs/promises';
import {join} from 'node:path';
const origin=(process.env.NEXT_PUBLIC_SITE_URL||'https://osmu-studio.com').replace(/\/$/,'');
const xml=await readFile('out/sitemap.xml','utf8');
const urls=[...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
const errors=[],titles=new Set(),descriptions=new Set(),localLinks=new Set(),assets=new Set();
if(urls.length!==41)errors.push(`Expected 41 indexed pages; got ${urls.length}`);
for(const url of [...urls,origin+'/editor/']){
 const route=new URL(url).pathname;
 const html=await readFile(join('out',route,'index.html'),'utf8');
 const title=html.match(/<title>(.*?)<\/title>/s)?.[1];
 const description=html.match(/<meta name="description" content="([^"]*)"/)?.[1];
 const canonical=html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
 if(!title||titles.has(title))errors.push(route+': missing/duplicate title');titles.add(title);
 if(!description||descriptions.has(description))errors.push(route+': missing/duplicate description');descriptions.add(description);
 if(canonical!==url)errors.push(route+': canonical mismatch '+canonical);
 if((html.match(/<h1(?:\s|>)/g)||[]).length!==1)errors.push(route+': expected one H1');
 if(/127\.0\.0\.1|localhost/.test(html))errors.push(route+': local URL leaked');
 const robots=html.match(/<meta name="robots" content="([^"]*)"/)?.[1]||'';
 if(route==='/editor/'?!robots.includes('noindex'):robots.includes('noindex')||!robots.includes('index'))errors.push(route+': robots mismatch');
 for(const match of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)){try{JSON.parse(match[1])}catch{errors.push(route+': invalid JSON-LD')}}
 for(const m of html.matchAll(/<a\b[^>]*href="(\/[^"#?]*)/g))localLinks.add(m[1]);
 for(const m of html.matchAll(/(?:src|href)="(\/(?:images|_next|logo|favicon|og-image)[^"?#]*)/g))assets.add(m[1]);
 for(const m of html.matchAll(/<source[^>]*srcSet="([^"]*)"/g))for(const item of m[1].split(','))assets.add(item.trim().split(' ')[0]);
}
for(const route of localLinks){const file=join('out',/\.[a-z0-9]+$/i.test(route)?route:route+'/index.html');try{await stat(file)}catch{errors.push('Missing linked page '+route)}}
for(const asset of assets){try{await stat(join('out',decodeURIComponent(asset)))}catch{errors.push('Missing asset '+asset)}}
const robots=await readFile('out/robots.txt','utf8');
if(!robots.includes('Allow: /')||robots.includes('Disallow: /\n')||!robots.includes(origin+'/sitemap.xml'))errors.push('Production robots mismatch');
if((await readFile('out/CNAME','utf8')).trim()!=='osmu-studio.com')errors.push('CNAME mismatch');
const legacy=JSON.parse(await readFile('out/legacy-routes.json','utf8'));
for(const route of [...Object.keys(legacy.aliases),...legacy.retired]){const html=await readFile(join('out',route.endsWith('/')?route+'index.html':route),'utf8');if(!html.includes('noindex,follow'))errors.push('Legacy URL indexed '+route)}
const report={pages:urls.length+1,indexed:urls.length,localLinks:localLinks.size,assets:assets.size,legacy:Object.keys(legacy.aliases).length+legacy.retired.length,errors};
console.log(JSON.stringify(report,null,2));
if(errors.length)process.exitCode=1;
