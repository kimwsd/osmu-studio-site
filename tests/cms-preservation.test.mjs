import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
async function source(path){return import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(await readFile(path,'utf8'))).toString('base64'))}
const {articleToDocument}=await source('lib/cms-seed.ts');
const {insightArticles}=await source('lib/insight-guides.ts');
const {validatePost}=await source('lib/cms-types.ts');
test('every existing section, table, source and related article survives CMS migration',()=>{
 for(const article of insightArticles){const doc=articleToDocument(article);assert.deepEqual(doc.sources,article.sources);assert.deepEqual(doc.related,article.related||[]);assert.deepEqual(validatePost(doc),[]);
  for(const s of article.sections){assert.ok(doc.blocks.some(b=>b.text===s.title));assert.ok(doc.blocks.some(b=>b.text===s.body));if(s.list)assert.ok(doc.blocks.some(b=>b.type==='list'&&b.text===s.list.join('\n')));if(s.note)assert.ok(doc.blocks.some(b=>b.text===s.note));if(s.table){const b=doc.blocks.find(b=>b.type==='table'&&b.caption===s.table.caption);assert.deepEqual(b.text.split('\n').map(r=>r.split('\t')),[s.table.headers,...s.table.rows])}if(s.links)for(const l of s.links)assert.ok(doc.blocks.some(b=>b.text?.includes(l.name+' | '+l.url)))}
 }
});
test('editor rejects unsafe media and missing image descriptions',()=>{
 const doc=articleToDocument(insightArticles[0]);doc.blocks.push({id:'unsafe',type:'image',url:'javascript:alert(1)',alt:''});assert.ok(validatePost(doc).length);
});
