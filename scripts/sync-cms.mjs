import {readFile,writeFile,appendFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const config=JSON.parse(await readFile('lib/cms-public.json','utf8'));
if(config.ready!==true){console.log('CMS connection deferred; keeping current public content.');process.exit(0)}
const check=process.argv.includes('--check');
async function request(path){const response=await fetch(config.url+'/rest/v1/'+path,{headers:{apikey:config.publishableKey},signal:AbortSignal.timeout(60000)});if(!response.ok)throw new Error('CMS read failed '+response.status);return response.json()}
async function allPosts(){const rows=[];for(let offset=0;;offset+=500){const page=await request('cms_public_posts?select=*&order=published_at.desc,id.asc&limit=500&offset='+offset);if(!Array.isArray(page))throw new Error('Invalid CMS page');rows.push(...page);if(page.length<500)return rows}}
const [posts,settings]=await Promise.all([allPosts(),request('cms_public_settings?select=tracking&limit=1')]);
if(!Array.isArray(posts)||!settings[0]?.tracking)throw new Error('Invalid CMS snapshot; refusing to replace site content.');
if(posts.length===0)throw new Error('Empty CMS: refusing to remove every published article. Operator review required.');
const tracking=settings[0].tracking;
const revision=createHash('sha256').update(JSON.stringify({posts,tracking})).digest('hex');
if(check){let deployed;try{const r=await fetch('https://osmu-studio.com/cms-release.json?check='+Date.now(),{signal:AbortSignal.timeout(20000)});if(r.ok)deployed=await r.json()}catch{}const changed=deployed?.revision!==revision;if(process.env.GITHUB_OUTPUT)await appendFile(process.env.GITHUB_OUTPUT,`changed=${changed}\n`);console.log(JSON.stringify({changed,posts:posts.length}));process.exit(0)}
const articles=posts.map(p=>{const d=p.document;const text=d.blocks.map(b=>b.text||'').join(' ');return {slug:p.slug,title:d.title,category:d.category,summary:d.summary,date:p.published_at,modified:p.updated_at,service:d.service,read:Math.max(1,Math.ceil(text.length/650))+'분',sections:[],sources:d.sources||[],related:d.related||[],blocks:d.blocks,cover:d.cover,coverAlt:d.coverAlt,author:d.author||'3EO Editorial',seoTitle:d.seoTitle,seoDescription:d.seoDescription,ogImage:d.ogImage||d.cover,cmsId:p.id}});
await mkdir('public',{recursive:true});
await writeFile('lib/cms-snapshot.json',JSON.stringify({initialized:true,revision,articles,tracking},null,2));
await writeFile('public/cms-release.json',JSON.stringify({revision,builtAt:new Date().toISOString(),posts:posts.map(p=>({id:p.id,slug:p.slug,updatedAt:p.updated_at}))}));
console.log('CMS: '+articles.length+' published articles synchronized.');
