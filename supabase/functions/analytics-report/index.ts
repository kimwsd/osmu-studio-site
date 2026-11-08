import {createClient} from 'npm:@supabase/supabase-js@2.119.0';
const origins=new Set(['https://osmu-studio.com','http://127.0.0.1:3001']);
const property='563224469';
const b64=(value:Uint8Array)=>btoa(String.fromCharCode(...value)).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
const encoded=(value:unknown)=>b64(new TextEncoder().encode(JSON.stringify(value)));
async function token(credentials:{client_email:string;private_key:string}){
 const now=Math.floor(Date.now()/1000),claim=encoded({alg:'RS256',typ:'JWT'})+'.'+encoded({iss:credentials.client_email,scope:'https://www.googleapis.com/auth/analytics.readonly',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600});
 const der=Uint8Array.from(atob(credentials.private_key.replace(/-----[^-]+-----|\s/g,'')),c=>c.charCodeAt(0));
 const key=await crypto.subtle.importKey('pkcs8',der,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['sign']);
 const signature=await crypto.subtle.sign('RSASSA-PKCS1-v1_5',key,new TextEncoder().encode(claim));
 const response=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion:claim+'.'+b64(new Uint8Array(signature))}),signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error('Google 인증을 확인해 주세요.');const data=await response.json();return data.access_token as string;
}
Deno.serve(async req=>{
 const origin=req.headers.get('origin')||'',headers={'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin',...(origins.has(origin)?{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS'}:{})};
 const respond=(status:number,body:unknown)=>new Response(JSON.stringify(body),{status,headers});
 if(origin&&!origins.has(origin))return respond(403,{error:'Origin denied'});
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(req.method!=='POST')return respond(405,{error:'POST required'});
 const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}});
 const auth=req.headers.get('authorization')||'';if(!auth.startsWith('Bearer '))return respond(401,{error:'로그인이 필요합니다.'});
 const {data:user,error:authError}=await db.auth.getUser(auth.slice(7));if(authError||!user.user)return respond(401,{error:'로그인을 확인해 주세요.'});
 if(!['admin','owner'].includes(user.user.app_metadata.role))return respond(403,{error:'관리자 전용 기능입니다.'});
 let days:number;try{const raw=await req.text();if(raw.length>100)return respond(400,{error:'잘못된 요청입니다.'});days=JSON.parse(raw).days;if(![7,30,90].includes(days))throw Error()}catch{return respond(400,{error:'조회 기간을 확인해 주세요.'})}
 const end=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());const startDate=new Date(end+'T00:00:00Z');startDate.setUTCDate(startDate.getUTCDate()-(days-1));const start=startDate.toISOString().slice(0,10);
 const {data:cached,error:cacheError}=await db.from('cms_report_snapshots').select('*').eq('source','ga4').eq('period_start',start).eq('period_end',end).maybeSingle();
 if(cacheError)return respond(503,{error:'보고서 저장공간을 확인해 주세요.'});
 if(cached&&'realtimeActiveUsers' in cached.totals&&Date.now()-Date.parse(cached.collected_at)<60000)return respond(200,{report:cached,cached:true});
 const secret=Deno.env.get('GA4_SERVICE_ACCOUNT_JSON');if(!secret)return respond(503,{code:'connection_pending',error:'GA4 집계 조회 권한 연결 대기입니다. 사이트 이벤트 수집과는 별도입니다.'});
 try{
  const access=await token(JSON.parse(secret));
  async function report(metrics:string[],dimensions:string[]=[]){const r=await fetch('https://analyticsdata.googleapis.com/v1beta/properties/'+property+':runReport',{method:'POST',headers:{Authorization:'Bearer '+access,'Content-Type':'application/json'},body:JSON.stringify({dateRanges:[{startDate:start,endDate:end}],metrics:metrics.map(name=>({name})),dimensions:dimensions.map(name=>({name})),limit:1000}),signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error(r.status===403?'GA4 뷰어 권한과 Analytics Data API 사용 설정을 확인해 주세요.':'GA4 응답을 확인하지 못했습니다. 기존 보고서는 유지됩니다.');return r.json()}
  const [total,daily,channel,events,campaign]=await Promise.all([report(['totalUsers','sessions','screenPageViews','engagedSessions']),report(['sessions','totalUsers'],['date']),report(['sessions'],['sessionDefaultChannelGroup']),report(['eventCount'],['eventName']),report(['sessions','keyEvents'],['sessionSource','sessionMedium','sessionCampaignName'])]);
  async function realtime(dimensions:string[]=[],metrics=['activeUsers']){const r=await fetch('https://analyticsdata.googleapis.com/v1beta/properties/'+property+':runRealtimeReport',{method:'POST',headers:{Authorization:'Bearer '+access,'Content-Type':'application/json'},body:JSON.stringify({metrics:metrics.map(name=>({name})),dimensions:dimensions.map(name=>({name})),limit:1000}),signal:AbortSignal.timeout(15000)});if(!r.ok)return null;return r.json()}
  const [live,liveEvents]=await Promise.all([realtime(),realtime(['eventName'],['eventCount'])]);
  const values=(r:any)=>r.metricValues.map((x:any)=>Number(x.value));
  const totals:Record<string,number|null>=Object.fromEntries(['totalUsers','sessions','screenPageViews','engagedSessions'].map((key,i)=>[key,total.rows?.[0]?values(total.rows[0])[i]:0]));
  totals.realtimeActiveUsers=live?(live.rows?.[0]?values(live.rows[0])[0]:0):null;totals.realtimeLeads=liveEvents?(Number(liveEvents.rows?.find((r:any)=>r.dimensionValues[0].value==='generate_lead')?.metricValues[0].value)||0):null;
  const payload={source:'ga4',period_start:start,period_end:end,totals,series:(daily.rows||[]).map((r:any)=>({date:r.dimensionValues[0].value.replace(/(\d{4})(\d{2})(\d{2})/,'$1-$2-$3'),sessions:values(r)[0],users:values(r)[1]})).sort((a:any,b:any)=>a.date.localeCompare(b.date)),breakdowns:[...(channel.rows||[]).map((r:any)=>({kind:'channel',name:r.dimensionValues[0].value,sessions:values(r)[0]})),...(events.rows||[]).map((r:any)=>({kind:'event',name:r.dimensionValues[0].value,events:values(r)[0]})),...(campaign.rows||[]).map((r:any)=>({kind:'campaign',name:r.dimensionValues.map((v:any)=>v.value).join(' / '),sessions:values(r)[0],keyEvents:values(r)[1]}))],collected_at:new Date().toISOString()};
  const {error}=await db.from('cms_report_snapshots').upsert(payload,{onConflict:'source,period_start,period_end'});if(error)throw Error('보고서를 저장하지 못했습니다.');return respond(200,{report:payload,cached:false});
 }catch(e){return respond(502,{error:e instanceof Error?e.message:'GA4 조회에 실패했습니다. 기존 보고서는 유지됩니다.'})}
});
