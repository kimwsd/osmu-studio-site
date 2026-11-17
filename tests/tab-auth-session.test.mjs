import test from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import { tabAuthStorage } from "../lib/tab-auth-storage.ts";
const key="test-admin-tab";
const disk=()=>{const values=new Map();return {getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k),values}};
function browser(type="navigate",session=disk(),local=disk()){
 const listeners={};let reloads=0;
 globalThis.window={sessionStorage:session,localStorage:local,performance:{getEntriesByType:()=>[{type}]},addEventListener:(n,fn)=>listeners[n]=fn,location:{reload:()=>reloads++}};
 return {session,local,listeners,reloads:()=>reloads};
}
function client(storage){
 return createClient("https://example.supabase.co","test-public-key",{auth:{storageKey:key,storage,persistSession:true,autoRefreshToken:false,detectSessionInUrl:false},global:{fetch:async()=>new Response(JSON.stringify({access_token:"test-access-token",refresh_token:"test-refresh-token",token_type:"bearer",expires_in:3600,user:{id:"test-user",aud:"authenticated",created_at:"2026-01-01T00:00:00Z"}}),{status:200,headers:{"Content-Type":"application/json"}})}});
}
test("actual Supabase sign-in survives reload, but not a fresh tab",async()=>{
 const first=browser();const c=client(tabAuthStorage(key));
 const signed=await c.auth.signInWithPassword({email:"test@example.invalid",password:"fixture-password"});
 assert.equal(signed.error,null);assert.ok(first.session.getItem(key));assert.equal(first.local.getItem(key),null);
 browser("reload",first.session,first.local);const reloaded=client(tabAuthStorage(key));assert.equal((await reloaded.auth.getSession()).data.session?.user.id,"test-user");
 browser();const fresh=client(tabAuthStorage(key));assert.equal((await fresh.auth.getSession()).data.session,null);
});
test("copied or restored tab credentials are discarded without affecting the original tab",()=>{
 const original=disk();original.setItem(key,"session");const copy=disk();copy.setItem(key,original.getItem(key));
 browser("navigate",copy);assert.equal(tabAuthStorage(key).getItem(key),null);assert.equal(original.getItem(key),"session");
 browser("back_forward",original);assert.equal(tabAuthStorage(key).getItem(key),null);
});
test("legacy durable auth is removed while unrelated drafts and consent survive",()=>{
 const b=browser("reload");for(const k of [key,"legacy","legacy-user","legacy-code-verifier"])b.local.setItem(k,"saved");
 b.local.setItem("draft","keep");b.session.setItem(key,"active");b.session.setItem("consent","yes");
 assert.equal(tabAuthStorage(key,["legacy"]).getItem(key),"active");assert.equal(b.local.values.size,1);assert.equal(b.local.getItem("draft"),"keep");assert.equal(b.session.getItem("consent"),"yes");
});
test("bfcache restore clears credentials and reloads the protected document",()=>{
 const b=browser("reload");const storage=tabAuthStorage(key);storage.setItem(key,"session");b.listeners.pageshow({persisted:false});assert.equal(storage.getItem(key),"session");b.listeners.pageshow({persisted:true});assert.equal(storage.getItem(key),null);assert.equal(b.reloads(),1);
});
test("blocked browser storage falls back only to document memory",()=>{
 browser();Object.defineProperty(window,"sessionStorage",{get(){throw Error("blocked")}});Object.defineProperty(window,"localStorage",{get(){throw Error("blocked")}});
 const one=tabAuthStorage(key);one.setItem(key,"session");assert.equal(one.getItem(key),"session");assert.equal(tabAuthStorage(key).getItem(key),null);one.removeItem(key);assert.equal(one.getItem(key),null);
});
test("server rendering never accesses browser storage or shares a session",()=>{
 delete globalThis.window;const one=tabAuthStorage(key);one.setItem(key,"session");assert.equal(tabAuthStorage(key).getItem(key),null);
});

