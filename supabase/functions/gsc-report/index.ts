import {createClient} from 'npm:@supabase/supabase-js@2.119.0';
const origins=new Set(['https://osmu-studio.com','http://127.0.0.1:3001']);
const site='https://osmu-studio.com/';
const b64=(value:Uint8Array)=>btoa(String.fromCharCode(...value)).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
const encoded=(value:unknown)=>b64(new TextEncoder().encode(JSON.stringify(value)));
async function token(credentials:{client_email:string;private_key:string}){
 const now=Math.floor(Date.now()/1000),claim=encoded({alg:'RS256',typ:'JWT'})+'.'+encoded({iss:credentials.client_email,scope:'https://www.googleapis.com/auth/webmasters.readonly',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600});
 const der=Uint8Array.from(atob(credentials.private_key.replace(/-----[^-]+-----|\s/g,'')),c=>c.charCodeAt(0));
 const key=await crypto.subtle.importKey('pkcs8',der,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['sign']);
 const signature=await crypto.subtle.sign('RSASSA-PKCS1-v1_5',key,new TextEncoder().encode(claim));
 const response=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion:claim+'.'+b64(new Uint8Array(signature))}),signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error('Google 인증을 확인해 주세요.');const data=await response.json();return data.access_token as string;
}
Deno.serve(async req=>{
 const origin=req.headers.get('origin')||'',headers={'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin',...(origins.has(origin)?{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS'}:{})};
 const reply=(status:number,body:unknown)=>new Response(JSON.stringify(body),{status,headers});
 if(origin&&!origins.has(origin))return reply(403,{error:'Origin denied'});
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(req.method!=='POST')return reply(405,{error:'POST required'});
 const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}});
 const auth=req.headers.get('authorization')||'';
 if(!auth.startsWith('Bearer '))return reply(401,{error:'로그인이 필요합니다.'});
 const {data,error}=await db.auth.getUser(auth.slice(7));
 if(error||!data.user)return reply(401,{error:'로그인을 확인해 주세요.'});
 if(!['admin','owner'].includes(data.user.app_metadata.role))return reply(403,{error:'관리자 전용 기능입니다.'});
 let days:number;
 try{const raw=await req.text();if(raw.length>100)throw Error();days=JSON.parse(raw).days;if(![7,30,90].includes(days))throw Error()}catch{return reply(400,{error:'조회 기간을 확인해 주세요.'})}
 const end=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const d=new Date(end+'T00:00:00Z');d.setUTCDate(d.getUTCDate()-(days-1));const start=d.toISOString().slice(0,10);
 const secret=Deno.env.get('GA4_SERVICE_ACCOUNT_JSON');
 if(!secret)return reply(503,{code:'connection_pending',error:'Google 조회 계정 연결이 필요합니다.'});
 try{
  const access=await token(JSON.parse(secret));
  async function query(dimensions:string[]=[]){
   const response=await fetch('https://www.googleapis.com/webmasters/v3/sites/'+encodeURIComponent(site)+'/searchAnalytics/query',{method:'POST',headers:{Authorization:'Bearer '+access,'Content-Type':'application/json'},body:JSON.stringify({startDate:start,endDate:end,dimensions,type:'web',dataState:'final',rowLimit:dimensions[0]==='date'?100:500}),signal:AbortSignal.timeout(25000)});
   if(!response.ok){const problem=await response.json().catch(()=>({}));const reason=problem.error?.errors?.[0]?.reason;throw Error(response.status===403?(reason==='accessNotConfigured'?'Search Console API 사용 설정이 필요합니다.':'GSC 속성의 조회 권한과 Search Console API 사용 설정을 확인해 주세요.'):response.status===401?'Google 인증 연결을 확인해 주세요.':'GSC 조회에 실패했습니다. 잠시 후 다시 시도해 주세요.')}
   const result=await response.json();return {rows:result.rows||[],aggregation:result.responseAggregationType||'auto'};
  }
  const [total,daily,queries,pages,devices,countries]=await Promise.all([query(),query(['date']),query(['query']),query(['page']),query(['device']),query(['country'])]);
  return reply(200,{report:{site,start,end,days,timezone:'America/Los_Angeles',dataState:'final',collected_at:new Date().toISOString(),totals:total.rows[0]||null,daily:daily.rows,queries:queries.rows,pages:pages.rows,devices:devices.rows,countries:countries.rows,latestDataDate:daily.rows.length?daily.rows[daily.rows.length-1].keys[0]:null,limit:500,aggregation:total.aggregation}});
 }catch(e){return reply(503,{code:'report_unavailable',error:e instanceof Error?e.message:'GSC 조회에 실패했습니다.'})}
});
