import test from 'node:test';
import assert from 'node:assert/strict';
import {submitInquiry} from '../lib/submit-inquiry.mjs';
const valid={name:'Test brand',email:'test@example.com',phone:'010-1234-5678',agree:'on',message:'Project inquiry',service:'branding'};
const config={url:'https://example.supabase.co',anonKey:'public-test-key'};
test('missing consent never reaches an external service',async()=>{let calls=0;await assert.rejects(submitInquiry({...valid,agree:undefined},config,'Branding',async()=>{calls++;}));assert.equal(calls,0)});
test('storage rejection does not send a notification',async()=>{const calls=[];await assert.rejects(submitInquiry(valid,config,'Branding',async(url,options)=>{calls.push({url,options});return {ok:false};}));assert.equal(calls.length,1)});
test('accepted inquiry uses the existing table and notifies only after storage',async()=>{const calls=[];await submitInquiry(valid,config,'Branding',async(url,options)=>{calls.push({url,options});return {ok:true};});assert.equal(calls.length,2);assert.equal(calls[0].url,config.url+'/rest/v1/inquiries');assert.deepEqual(JSON.parse(calls[0].options.body),{name:valid.name,email:valid.email,phone:valid.phone,message:valid.message,budget:null,type:'Branding',biz_type:null});assert.equal(calls[0].options.headers.apikey,config.anonKey);assert.equal(JSON.parse(calls[1].options.body)['회신 이메일'],valid.email)});
test('notification timeout does not turn an accepted inquiry into a retry',async()=>{let calls=0;await submitInquiry(valid,config,'Branding',async()=>{if(++calls===1)return {ok:true};throw new Error('Timed out')});assert.equal(calls,2)});
