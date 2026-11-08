import {createClient} from 'npm:@supabase/supabase-js@2.119.0';
import {normalizeMeta} from './normalize.ts';
const origins=new Set(['https://osmu-studio.com','http://127.0.0.1:3001']);
const pixel='1951085012534198';
Deno.serve(async req=>{
 const origin=req.headers.get('origin')||'',headers={'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin',...(origins.has(origin)?{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS'}:{})};
 const reply=(status:number,body:unknown)=>new Response(JSON.stringify(body),{status,headers});
 if(origin&&!origins.has(origin))return reply(403,{error:'Origin denied'});if(req.method==='OPTIONS')return new Response(null,{status:204,headers});if(req.method!=='POST')return reply(405,{error:'POST required'});
 const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}}),auth=req.headers.get('authorization')||'';
 if(!auth.startsWith('Bearer '))return reply(401,{error:'로그인이 필요합니다.'});const {data,error}=await db.auth.getUser(auth.slice(7));if(error||!data.user)return reply(401,{error:'로그인을 확인해 주세요.'});if(!['admin','owner'].includes(data.user.app_metadata.role))return reply(403,{error:'관리자 전용 기능입니다.'});
 let days:number;try{const raw=await req.text();if(raw.length>100)throw Error();days=JSON.parse(raw).days;if(![7,28].includes(days))throw Error()}catch{return reply(400,{error:'Meta는 최근 7일 또는 28일을 조회할 수 있습니다.'})}
 const end=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()),startDate=new Date(end+'T00:00:00Z');startDate.setUTCDate(startDate.getUTCDate()-(days-1));const start=startDate.toISOString().slice(0,10);
 const {data:cached,error:cacheError}=await db.from('cms_report_snapshots').select('*').eq('source','meta_pixel').eq('period_start',start).eq('period_end',end).maybeSingle();if(cacheError)return reply(503,{error:'보고서 저장공간을 확인해 주세요.'});if(cached&&Date.now()-Date.parse(cached.collected_at)<300000)return reply(200,{report:cached,cached:true});
 const access=Deno.env.get('META_REPORT_ACCESS_TOKEN');if(!access)return reply(503,{code:'connection_pending',error:'Meta 통계 조회용 권한 연결이 필요합니다. 픽셀 수집은 별도로 유지됩니다.'});
 try{
  const rows:Parameters<typeof normalizeMeta>[0]=[];let after:string|undefined;
  for(let page=0;page<50;page++){
   const url=new URL('https://graph.facebook.com/v25.0/'+pixel+'/stats');url.searchParams.set('aggregation','event');url.searchParams.set('event_source','WEB_ONLY');url.searchParams.set('start_time',String(Math.floor(Date.parse(start+'T00:00:00+09:00')/1000)));url.searchParams.set('end_time',String(Math.floor(Date.now()/1000)));url.searchParams.set('limit','1000');if(after)url.searchParams.set('after',after);
   const response=await fetch(url,{headers:{Authorization:'Bearer '+access},signal:AbortSignal.timeout(20000)});const body=await response.json();
   if(!response.ok||body.error)throw Error(body.error?.code===190?'Meta 조회 권한이 만료되었습니다. 재연결이 필요합니다.':'Meta 조회 오류 '+String(body.error?.code||response.status)+': '+String(body.error?.message||'응답을 확인해 주세요.').replaceAll(access,'[hidden]').slice(0,300));if(!Array.isArray(body.data))throw Error('Meta 통계 응답 형식을 확인해 주세요.');rows.push(...body.data);
   if(!body.paging?.next)break;const next=body.paging?.cursors?.after;if(typeof next!=='string'||next===after||page===49)throw Error('Meta 보고서를 모두 가져오지 못했습니다. 기존 보고서는 유지됩니다.');after=next;
  }
  const report=normalizeMeta(rows,start,end);const {error:saveError}=await db.from('cms_report_snapshots').upsert(report,{onConflict:'source,period_start,period_end'});if(saveError)throw Error('통계를 저장하지 못했습니다.');return reply(200,{report,cached:false});
 }catch(e){return reply(502,{error:e instanceof Error?e.message:'Meta 통계 조회에 실패했습니다.'})}
});
