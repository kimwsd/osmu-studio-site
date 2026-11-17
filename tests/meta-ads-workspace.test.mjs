import test from "node:test";
import assert from "node:assert/strict";
import {siteFor,owned,identifier,budget,draftForm,newAdPlan,updatePlan,activationAllowed,canonical,website} from "../supabase/functions/meta-ads-workspace/core.ts";
import {makeGraph,MetaError} from "../supabase/functions/meta-ads-workspace/graph.ts";
const origin="https://www.vertere-house.com";
const valid={name:"검증 초안",message:"테스트",headline:"제목",link:origin+"/?utm_source=facebook",dailyBudget:"10000",endTime:"2030-01-01T00:00:00.000Z",ageMin:"25",ageMax:"55",pageId:"123456789",imageHash:"abcdef0123456789abcdef0123456789",mediaType:"image",cta:"LEARN_MORE"};
test("site binding rejects another site's origin and unknown tenants",()=>{
 assert.equal(siteFor("vertere",origin).slug,"vertere");
 assert.throws(()=>siteFor("osmu",origin));assert.throws(()=>siteFor("attacker",origin));assert.throws(()=>siteFor("vertere","https://evil.example"));
});
test("object ownership rejects IDs from a different advertising account",()=>{
 assert.equal(owned({account_id:"12345"},"12345").account_id,"12345");
 assert.throws(()=>owned({account_id:"54321"},"12345"));assert.throws(()=>identifier("../123"));
});
test("new campaigns, ad sets and ads are always paused",()=>{
 const p=newAdPlan({...valid,status:"ACTIVE"},origin,"KRW");
 assert.equal(p.campaign.status,"PAUSED");assert.equal(p.adset.status,"PAUSED");assert.equal(p.ad.status,"PAUSED");
 assert.equal(p.adset.daily_budget,10000);assert.equal(p.campaign.objective,"OUTCOME_TRAFFIC");
});
test("invalid or ambiguous budgets cannot reach Meta",()=>{
 for(const v of [0,-1,1.5,"","NaN",Infinity,100000001])assert.throws(()=>budget(v));
 assert.throws(()=>newAdPlan(valid,origin,"USD"));
});
test("new ads require a future end time and valid adult targeting",()=>{
 assert.throws(()=>newAdPlan({...valid,endTime:"2020-01-01"},origin,"KRW"));
 assert.throws(()=>newAdPlan({...valid,ageMin:"17"},origin,"KRW"));
 assert.throws(()=>newAdPlan({...valid,ageMin:"60",ageMax:"25"},origin,"KRW"));
});
test("changing ages preserves existing city, interests and audience restrictions",()=>{
 const current={daily_budget:"10000",targeting:{geo_locations:{cities:[{key:"1234",radius:10}]},interests:[{id:"555"}],excluded_custom_audiences:[{id:"777"}]}};
 const p=updatePlan("adset",{name:"변경",ageMin:"30",ageMax:"50"},current,"KRW");
 assert.deepEqual(p.targeting,{...current.targeting,age_min:30,age_max:50});
});
test("budget edits cannot accidentally convert lifetime or inherited budgets",()=>{
 assert.throws(()=>updatePlan("adset",{name:"변경",dailyBudget:"5000"},{lifetime_budget:"100000",daily_budget:"0"},"KRW"));
 assert.throws(()=>updatePlan("campaign",{name:"변경",dailyBudget:"5000"},{daily_budget:0},"KRW"));
 assert.throws(()=>updatePlan("ad",{name:"변경",status:"ACTIVE"},{},"KRW"));
});
test("destinations stay on the tenant's site and exclude private query strings",()=>{
 assert.equal(website(valid.link,origin),valid.link);
 for(const url of ["https://osmu-studio.com/",origin+"/?email=secret@example.com",origin+"/#private","javascript:alert(1)"])assert.throws(()=>website(url,origin));
});
test("draft storage does not accept executable, credential or status fields",()=>{
 const p=draftForm({...valid,access_token:"secret",tenant_id:"other",status:"ACTIVE",object_story_spec:{evil:true}});
 assert.equal(p.access_token,undefined);assert.equal(p.tenant_id,undefined);assert.equal(p.status,undefined);
});
test("activation requires an active KRW account with a funding source",()=>{
 assert.throws(()=>activationAllowed({account_status:1,currency:"KRW"}));
 assert.throws(()=>activationAllowed({account_status:2,currency:"KRW",funding_source_details:{id:"1"}}));
 activationAllowed({account_status:1,currency:"KRW",funding_source_details:{id:"1"}});
});
test("database JSON key ordering does not invalidate the stale-write comparison",()=>{
 assert.equal(canonical({b:2,a:{y:1,x:2}}),canonical({a:{x:2,y:1},b:2}));
 assert.notEqual(canonical({budget:10}),canonical({budget:20}));
});
test("Meta transport sends credentials in headers and never follows returned pagination URLs",async()=>{
 const calls=[];
 const graph=makeGraph("test-secret",async(url,options)=>{calls.push({url:String(url),options});return new Response(JSON.stringify({data:[],paging:{next:"https://evil.example/"}}),{status:200});});
 await graph("act_12345/ads",{fields:"id,name"});
 assert.ok(!calls[0].url.includes("test-secret"));assert.equal(calls[0].options.headers.Authorization,"Bearer test-secret");assert.equal(calls.length,1);
 await assert.rejects(()=>graph("https://evil.example/"),/잘못된/);
});
test("uncertain writes are not automatically retried",async()=>{
 let count=0;const graph=makeGraph("secret",async()=>{count++;throw Error("timeout");});
 await assert.rejects(()=>graph("12345",{status:"ACTIVE"},"POST"),e=>e instanceof MetaError&&e.uncertain);
 assert.equal(count,1);
});
test("permission failures do not leak tokens or raw Meta errors",async()=>{
 const graph=makeGraph("private-secret",async()=>new Response(JSON.stringify({error:{code:200,message:"private-secret"}}),{status:403}));
 await assert.rejects(()=>graph("12345",{},"POST"),e=>e.message.includes("권한")&&!e.message.includes("private-secret")&&!e.uncertain);
});

import fs from "node:fs/promises";
const project=new URL("../",import.meta.url);
const source=await fs.readFile(new URL("supabase/functions/meta-ads-workspace/index.ts",project),"utf8");
const fixture=new URL("tmp/meta-handler-fixture.ts",project);
await fs.mkdir(new URL("tmp/",project),{recursive:true});
await fs.writeFile(fixture,source.replace('"npm:@supabase/supabase-js@2.119.0"','"@supabase/supabase-js"').replace('"./core.ts"','"../supabase/functions/meta-ads-workspace/core.ts"').replace('"./graph.ts"','"../supabase/functions/meta-ads-workspace/graph.ts"'));
let handler,role="owner",member=true,authValid=true,apiCalls=[];
globalThis.Deno={env:{get:k=>({SUPABASE_URL:"https://example.supabase.co",SUPABASE_SERVICE_ROLE_KEY:"fixture-key"})[k]},serve:h=>handler=h};
const originalFetch=globalThis.fetch;
globalThis.fetch=async(input,options={})=>{
 const url=String(input);apiCalls.push(url);
 if(url.includes("/auth/v1/user"))return new Response(JSON.stringify(authValid?{id:"00000000-0000-4000-8000-000000000001",aud:"authenticated"}:{message:"Invalid token"}),{status:authValid?200:401,headers:{"Content-Type":"application/json"}});
 if(url.includes("/rest/v1/mt_members"))return new Response(JSON.stringify(member?{role}:null),{status:200,headers:{"Content-Type":"application/json"}});
 if(url.includes("/rest/v1/mt_ads_connections"))return new Response(JSON.stringify({account_id:"3394834957369637",account_name:"fixture",token_secret:null}),{status:200,headers:{"Content-Type":"application/json"}});
 if(url.includes("/rest/v1/rpc/mt_ads_token"))return new Response("null",{status:200,headers:{"Content-Type":"application/json"}});
 throw Error("Unexpected network request: "+url);
};
await import(fixture.href);
const request=(body,headers={})=>new Request("https://example.supabase.co/functions/v1/meta-ads-workspace",{method:"POST",headers:{Origin:origin,"Content-Type":"application/json",Authorization:"Bearer fixture-session",...headers},body:JSON.stringify(body)});
test("real handler rejects missing auth before querying tenant data",async()=>{
 apiCalls=[];const r=await handler(request({site:"vertere",action:"status"},{Authorization:""}));assert.equal(r.status,401);assert.equal(apiCalls.length,0);
});
test("real handler validates Supabase identity, not browser-provided roles",async()=>{
 authValid=false;apiCalls=[];const r=await handler(request({site:"vertere",action:"status",role:"owner"}));assert.equal(r.status,401);assert.equal(apiCalls.length,1);authValid=true;
});
test("real handler blocks a tenant without live membership",async()=>{
 member=false;apiCalls=[];const r=await handler(request({site:"vertere",action:"status"}));assert.equal(r.status,403);assert.ok(!apiCalls.some(u=>u.includes("mt_ads_connections")));member=true;
});
test("real handler denies Meta writes to a viewer before loading secrets",async()=>{
 role="viewer";apiCalls=[];const r=await handler(request({site:"vertere",action:"prepare"}));assert.equal(r.status,403);assert.ok(!apiCalls.some(u=>u.includes("mt_ads_token")));role="owner";
});
test("real handler returns connection pending without fabricating a live account",async()=>{
 apiCalls=[];const r=await handler(request({site:"vertere",action:"status"}));assert.equal(r.status,200);const b=await r.json();assert.equal(b.connected,false);assert.equal(b.canManage,false);assert.equal(b.account,null);
 assert.ok(apiCalls.filter(u=>u.includes("mt_members")||u.includes("mt_ads_connections")).every(u=>u.includes("tenant_id=eq.63cbd2aa-2e10-4fad-90b4-8b30499095d2")));
});
test.after(()=>{globalThis.fetch=originalFetch;delete globalThis.Deno;});
