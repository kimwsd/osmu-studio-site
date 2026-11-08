import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
const code=stripTypeScriptTypes(await readFile('lib/admin-navigation.ts','utf8'));
const {adminRoute,adminHash,mediaReferences}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
test('admin route preserves editor target and rejects unknown views',()=>{
 assert.deepEqual(adminRoute(adminHash('editor','saved-id')),{view:'editor',postId:'saved-id'});
 assert.equal(adminRoute('#unknown').view,'dashboard');
 assert.equal(adminRoute(adminHash('media')).view,'media');
});
test('media references include saved drafts and published versions',()=>{
 const url='https://example.test/image.jpg';
 assert.equal(mediaReferences(url,[{id:'1',document:{cover:'other'}},{id:'1',document:{cover:url}},{id:'2',document:{blocks:[{poster:url}]}}]).length,2);
});
