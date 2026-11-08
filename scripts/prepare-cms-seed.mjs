import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
async function source(path){const text=stripTypeScriptTypes(await readFile(path,'utf8'));return import('data:text/javascript;base64,'+Buffer.from(text).toString('base64'))}
const {insightArticles}=await source('lib/insight-guides.ts');
const {articleToDocument}=await source('lib/cms-seed.ts');
const posts=insightArticles.map(a=>({document:articleToDocument(a),published_at:a.date,updated_at:a.modified||a.date}));
await mkdir('tmp/cms',{recursive:true});
await writeFile('tmp/cms/seed.json',JSON.stringify(posts));
const payload=JSON.stringify(posts).replaceAll("'","''");
const sql=`begin;
do $$ begin if exists(select 1 from public.cms_posts) then raise exception 'CMS is not empty; seed aborted'; end if; end $$;
with input as (select document,published_at::timestamptz,updated_at::timestamptz from jsonb_to_recordset('${payload}'::jsonb) as x(document jsonb,published_at text,updated_at text)),
drafts as (insert into public.cms_posts(document,created_at,updated_at) select document,published_at,updated_at from input returning *)
insert into public.cms_public_posts(id,slug,document,published_at,updated_at) select id,document->>'slug',document,created_at,updated_at from drafts;
commit;`;
await writeFile('tmp/cms/seed.sql',sql);
console.log(JSON.stringify({posts:posts.length,blocks:posts.reduce((n,p)=>n+p.document.blocks.length,0),tables:posts.reduce((n,p)=>n+p.document.blocks.filter(b=>b.type==='table').length,0)}));
