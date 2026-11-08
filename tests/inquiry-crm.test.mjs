import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
const source=stripTypeScriptTypes((await readFile('lib/inquiry-crm.ts','utf8')).replace(/^import.*$/gm,'')).replaceAll('export ','');
const inquiry={id:'inquiry-1',name:'담당자',company:'회사',email:'test@example.com',phone:'010-1234-5678',services:['analytics'],message:'상담 요청',created_at:'2026-11-09T00:00:00Z',attribution:{utm_source:'newsletter'}};
function setup(initial=[],fail=false){
 const rows=[...initial];let writes=0;
 const db={from(){return {select(){return this},async in(key,ids){return {data:rows.filter(r=>ids.includes(r[key])),error:fail?new Error('permission'):null}},async upsert(payload,options){writes++;assert.equal(options.onConflict,'inquiry_id');assert.equal(options.ignoreDuplicates,true);if(!rows.some(r=>r.inquiry_id===payload.inquiry_id))rows.push({...payload,id:'customer-1',archived_at:null});return {error:null}}}}};
 const c=vm.createContext({cmsClient:()=>db,Error});vm.runInContext(source,c);return {register:c.registerInquiryCustomer,rows,writes:()=>writes};
}
test('register copies contact, request, attribution and original date; repeat opens the same customer',async()=>{const s=setup();const a=await s.register(inquiry);const b=await s.register(inquiry);assert.equal(a.id,b.id);assert.equal(s.rows.length,1);assert.equal(s.writes(),1);for(const k of ['name','company','email','phone','created_at','attribution'])assert.deepEqual(s.rows[0][k],inquiry[k]);assert.equal(s.rows[0].request_message,inquiry.message);assert.equal(s.rows[0].source,'홈페이지 문의')});
test('existing archived/test customer keeps stage, notes and ownership without writes',async()=>{const original={id:'existing',inquiry_id:inquiry.id,archived_at:'2026-11-08',is_test:true,stage:'계약',owner:'담당자',note:'보존'};const s=setup([original]);assert.equal((await s.register(inquiry)).id,'existing');assert.equal(s.writes(),0);assert.deepEqual(s.rows[0],original)});
test('concurrent registrations resolve to one customer',async()=>{const s=setup();const result=await Promise.all([s.register(inquiry),s.register(inquiry)]);assert.equal(result[0].id,result[1].id);assert.equal(s.rows.length,1)});
test('failed CRM read never attempts an insert',async()=>{const s=setup([],true);await assert.rejects(s.register(inquiry),/permission/);assert.equal(s.writes(),0)});
