import {readFile,stat} from 'node:fs/promises';
import {join} from 'node:path';
const origin=(process.env.NEXT_PUBLIC_SITE_URL||'https://osmu-studio.com').replace(/\/$/,'');
const xml=await readFile('out/sitemap.xml','utf8');
const urls=[...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
const errors=[],titles=new Set(),descriptions=new Set(),localLinks=new Set(),assets=new Set(),pages=new Map();
const snapshot=JSON.parse(await readFile('lib/cms-snapshot.json','utf8'));
const expected=snapshot.initialized?39+snapshot.articles.length:47;
if(urls.length!==expected||new Set(urls).size!==urls.length)errors.push(`Expected ${expected} unique public pages; got ${urls.length}`);
const meta=(html,name)=>html.match(new RegExp('<meta (?:name|property)="'+name+'" content="([^"]*)"'))?.[1];
for(const url of [...urls,origin+'/admin/']){
 const route=new URL(url).pathname;
 const html=await readFile(join('out',route,'index.html'),'utf8');pages.set(route,html);
 const title=html.match(/<title>(.*?)<\/title>/s)?.[1];
 const description=meta(html,'description');
 const canonical=html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
 if(!title||titles.has(title))errors.push(route+': missing/duplicate title');titles.add(title);
 if(!description||descriptions.has(description))errors.push(route+': missing/duplicate description');descriptions.add(description);
 if(canonical!==url)errors.push(route+': canonical mismatch '+canonical);
 if((html.match(/<h1(?:\s|>)/g)||[]).length!==1)errors.push(route+': expected one H1');
 if(/127\.0\.0\.1|localhost/.test(html))errors.push(route+': local URL leaked');
 const robots=[...html.matchAll(/<meta name="robots" content="([^"]*)"/g)].map(m=>m[1]);
 if(robots.length!==1||(route==='/admin/'?!robots[0].includes('noindex'):robots[0].includes('noindex')||!robots[0].includes('index')))errors.push(route+': robots mismatch');
 const schemaMatches=[...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)];
 if(!schemaMatches.length)errors.push(route+': missing JSON-LD');
 for(const match of schemaMatches){try{const data=JSON.parse(match[1]);if(data['@type']==='BlogPosting')for(const image of [data.image].flat()){const src=typeof image==='string'?image:image?.url;if(src?.startsWith(origin+'/'))assets.add(src.slice(origin.length));else if(src?.startsWith('/'))assets.add(src)}}catch{errors.push(route+': invalid JSON-LD')}}
 for(const field of ['og:title','og:description','og:image','twitter:card','twitter:image'])if(!meta(html,field))errors.push(route+': missing '+field);
 if(meta(html,'og:url')!==url)errors.push(route+': OG URL mismatch');
 for(const field of ['og:image','twitter:image']){const src=meta(html,field);if(src?.startsWith(origin+'/'))assets.add(src.slice(origin.length))}
 for(const m of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)){const link=new URL(m[1].replaceAll('&amp;','&'),url);if(link.origin===origin)localLinks.add(link.pathname+link.search+link.hash)}
 for(const m of html.matchAll(/(?:src|href)="(\/(?:images|_next|logo|favicon|apple-touch|og-)[^"?#]*)/g))assets.add(m[1]);
 for(const m of html.matchAll(/<source[^>]*srcSet="([^"]*)"/g))for(const item of m[1].split(','))assets.add(item.trim().split(' ')[0]);
}
for(const href of localLinks){
 const url=new URL(href,origin),route=url.pathname;
 const file=join('out',/\.[a-z0-9]+$/i.test(route)?route:route+'/index.html');
 try{await stat(file)}catch{errors.push('Missing linked page '+route);continue}
 if(url.hash){const html=pages.get(route)||await readFile(file,'utf8');const id=decodeURIComponent(url.hash.slice(1));if(![...html.matchAll(/\bid="([^"]*)"/g)].some(m=>m[1]===id))errors.push('Missing anchor '+href)}
}
for(const asset of assets){try{await stat(join('out',decodeURIComponent(asset)))}catch{errors.push('Missing asset '+asset)}}
const robots=await readFile('out/robots.txt','utf8');
if(!robots.includes('Allow: /')||robots.includes('Disallow: /\n')||!robots.includes(origin+'/sitemap.xml'))errors.push('Production robots mismatch');
if((await readFile('out/CNAME','utf8')).trim()!=='osmu-studio.com')errors.push('CNAME mismatch');
const home=pages.get('/');
if(!meta(home,'google-site-verification')||!meta(home,'naver-site-verification')||!meta(home,'msvalidate.01'))errors.push('Missing existing site ownership verification');
const legacy=JSON.parse(await readFile('out/legacy-routes.json','utf8'));
const manifest=JSON.parse(await readFile('lib/legacy-routes.json','utf8'));
if(JSON.stringify(legacy)!==JSON.stringify(manifest))errors.push('Exported legacy manifest is stale');
for(const [route,target] of Object.entries(legacy.aliases)){
 const html=await readFile(join('out',route.endsWith('/')?route+'index.html':route),'utf8');
 if(!pages.has(target))errors.push('Legacy destination missing '+target);
 if(legacy.aliases[target]||legacy.retired.includes(target))errors.push('Legacy redirect chain '+route);
 if(!html.includes(`content="0;url=${target}"`)||!html.includes(`href="${origin+target}"`))errors.push('Legacy redirect/canonical mismatch '+route);
 if(!html.includes('location.search+location.hash'))errors.push('Legacy loses attribution '+route);
 if(target==='/admin/'?!html.includes('noindex,nofollow'):html.includes('noindex'))errors.push('Legacy robots mismatch '+route);
 if(urls.includes(origin+route))errors.push('Legacy URL in sitemap '+route);
}
for(const route of legacy.retired){
 const file=join('out',route.endsWith('/')?route+'index.html':route);
 try{await stat(file);errors.push('Retired URL must return 404, not a 200 notice: '+route)}catch(error){if(error.code!=='ENOENT')throw error}
 if(urls.includes(origin+route))errors.push('Retired URL in sitemap '+route);
}
const notFound=await readFile('out/404.html','utf8');
const directives=[...notFound.matchAll(/<meta name="robots" content="([^"]*)"/g)].map(m=>m[1]);
if(directives.length!==1||!directives[0].includes('noindex'))errors.push('404 robots conflict');
const report={pages:urls.length+1,indexed:urls.length,localLinks:localLinks.size,assets:assets.size,aliases:Object.keys(legacy.aliases).length,retired404:legacy.retired.length,errors};
console.log(JSON.stringify(report,null,2));
if(errors.length)process.exitCode=1;
