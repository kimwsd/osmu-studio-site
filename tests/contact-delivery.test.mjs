import test from 'node:test';
import assert from 'node:assert/strict';
import {sendWithRetry} from '../supabase/functions/contact-submit/delivery.mjs';
test('successful provider send is not repeated',async()=>{let calls=0;const r=await sendWithRetry(async()=>{calls++;return {data:{id:'mail-id'},error:null}});assert.equal(calls,1);assert.deepEqual(r,{status:'sent',email_id:'mail-id',attempts:1,last_error:null})});
test('transport failure can recover without losing receipt',async()=>{let calls=0;const r=await sendWithRetry(async()=>{if(++calls<3)throw Error('private provider details');return {data:{id:'mail-id'}}},async()=>{});assert.equal(calls,3);assert.equal(r.status,'sent');assert.equal(r.attempts,3)});
test('persistent failure becomes a durable, sanitized failure result',async()=>{let calls=0;const r=await sendWithRetry(async()=>{calls++;throw Error('secret detail')},async()=>{});assert.equal(calls,3);assert.deepEqual(r,{status:'failed',attempts:3,last_error:'transport_error'})});
test('non transient error is not retried',async()=>{let calls=0;const r=await sendWithRetry(async()=>{calls++;return {error:{name:'validation_error',statusCode:422,message:'sensitive'}}},async()=>{});assert.equal(calls,1);assert.equal(r.last_error,'validation_error')});
test('rate limit retries are bounded',async()=>{let calls=0;const r=await sendWithRetry(async()=>{calls++;return {error:{name:'rate_limit_exceeded',statusCode:429}}},async()=>{});assert.equal(calls,3);assert.equal(r.status,'failed')});
