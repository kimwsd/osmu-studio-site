import test from 'node:test';
import assert from 'node:assert/strict';
import {validateInquiry} from '../lib/inquiry-validation.mjs';
const valid={name:'Test brand',email:'test@example.com',phone:'010-1234-5678',agree:'on',message:'Project inquiry',service:'branding'};
test('valid inquiry retains existing storage fields',()=>assert.deepEqual(validateInquiry(valid).data,{name:'Test brand',email:'test@example.com',phone:'010-1234-5678',message:'Project inquiry',budget:null,type:'branding',biz_type:null}));
test('missing consent never accepts an inquiry',()=>assert.ok(validateInquiry({...valid,agree:undefined}).error));
test('invalid email and phone rejected before storage',()=>{assert.ok(validateInquiry({...valid,email:'invalid'}).error);assert.ok(validateInquiry({...valid,phone:'abcd'}).error)});
test('malformed, oversized and bot payloads rejected',()=>{for(const input of [null,[],{...valid,message:'x'.repeat(5001)},{...valid,website:'spam.example'}])assert.ok(validateInquiry(input).error)});
test('optional fields can remain blank',()=>assert.equal(validateInquiry({...valid,message:''}).data.message,null));
