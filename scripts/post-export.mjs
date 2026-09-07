import {writeFileSync,readdirSync,mkdirSync} from 'node:fs';
import path from 'node:path';
const output=path.resolve('out');
function bridge(file,target){const destination=JSON.stringify(target);writeFileSync(path.join(output,file),`<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=${target}"><link rel="canonical" href="https://osmu-studio.com${target}"><title>OSMU STUDIO</title></head><body><a href="${target}">새 페이지로 이동</a><script>location.replace(${destination}+location.search+location.hash)</script></body></html>`);}
bridge('home.html','/');
for(const route of ['work','services','studio','process','contact','privacy','terms'])bridge(`${route}.html`,`/${route}/`);
bridge('service.html','/services/');bridge('project.html','/project/');
for(const type of ['work','services'])for(const entry of readdirSync(path.join(output,type),{withFileTypes:true})){if(entry.isDirectory()&&/^[\w-]+$/.test(entry.name)&&!entry.name.startsWith('_'))bridge(`${type==='work'?'project':'service'}-${entry.name}.html`,`/${type}/${entry.name}/`);}
mkdirSync(path.join(output,'admin'),{recursive:true});bridge('admin/index.html','/admin.html');
writeFileSync(path.join(output,'.nojekyll'),'');writeFileSync(path.join(output,'CNAME'),'osmu-studio.com\n');
console.log('GitHub Pages export ready: out/ with original domain and legacy URL bridges.');
