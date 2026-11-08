import test from 'node:test';
import assert from 'node:assert/strict';
import {validateInquiry} from '../supabase/functions/contact-submit/validation.mjs';
const base={requestId:'17ce9654-4c0e-4801-9f09-27c81742e384',name:'테스트 담당자',company:'OSMU 테스트',email:'qa@example.com',website:'https://example.com',message:'상담 접수 연결 테스트입니다.',services:['3eo','website'],consent:true,transferConsent:true,consentVersion:'2026-11-08',fax:''};
test('valid inquiry preserves multiple services and normalizes email',()=>{assert.deepEqual(validateInquiry({...base,email:' QA@EXAMPLE.COM '}).services,['3eo','website']);assert.equal(validateInquiry({...base,email:' QA@EXAMPLE.COM '}).email,'qa@example.com')});
test('rejects missing consent, unknown service and blank identity',()=>{for(const change of [{consent:false},{transferConsent:false},{services:['not-real']},{name:'  '},{consentVersion:'old'}])assert.throws(()=>validateInquiry({...base,...change}))});
test('rejects invalid website protocols and oversized content',()=>{for(const website of ['javascript:alert(1)','data:text/html,test','ftp://example.com'])assert.throws(()=>validateInquiry({...base,website}));assert.throws(()=>validateInquiry({...base,message:'a'.repeat(4001)}))});
test('rejects honeypot and invalid request id',()=>{assert.throws(()=>validateInquiry({...base,fax:'spam'}));assert.throws(()=>validateInquiry({...base,requestId:'bad'}))});
test('does not accept client supplied admin state',()=>{const x=validateInquiry({...base,status:'완료',notification:'sent'});assert.equal(x.status,undefined);assert.equal(x.notification,undefined)});

test('name, company and email reject empty and whitespace',()=>{for(const key of ['name','company','email'])for(const value of ['', '   '])assert.throws(()=>validateInquiry({...base,[key]:value}))});
test('phone is optional, preserved when valid and rejects invalid content',()=>{assert.equal(validateInquiry(base).phone,'');assert.equal(validateInquiry({...base,phone:'010-0000-0000'}).phone,'010-0000-0000');for(const phone of ['abc','123','1'.repeat(16)])assert.throws(()=>validateInquiry({...base,phone}))});
