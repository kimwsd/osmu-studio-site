import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
const code=stripTypeScriptTypes(await readFile('lib/cms-status.ts','utf8'));
const {publicationStatus,releaseUrl}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
const draft={id:'a',document:{title:'saved',slug:'a'}};
const pub={...draft,updated_at:'2026-11-08T10:06:43.920383+00:00'};
const live={posts:[{id:'a',updatedAt:pub.updated_at}]};
test('local admin always checks production release',()=>assert.equal(new URL(releaseUrl(123),'http://127.0.0.1:3001').origin,'https://osmu-studio.com'));
test('published, waiting and draft edits remain distinct',()=>{
 assert.equal(publicationStatus(draft,[pub],live).label,'게시 중');
 assert.equal(publicationStatus(draft,[pub],{posts:[]}).label,'사이트 반영 대기');
 assert.equal(publicationStatus({...draft,document:{...draft.document,title:'edit'}},[pub],live).label,'수정 중 · 공개본 유지');
 assert.equal(publicationStatus(draft,[pub],null).label,'사이트 상태 확인 필요');
});
test('deletion stays pending until deployed page disappears',()=>{
 const deleted={...draft,deleted_at:'2026-11-08'};
 assert.equal(publicationStatus(deleted,[],live).label,'휴지통 · 사이트 반영 대기');
 assert.equal(publicationStatus(deleted,[],{posts:[]}).label,'휴지통');
 assert.equal(publicationStatus(draft,[],live).label,'공개 중단 반영 대기');
 assert.equal(publicationStatus(draft,[],{posts:[]}).label,'초안');
});
