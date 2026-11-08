import {createClient} from 'npm:@supabase/supabase-js@2.119.0';
import {adsMetrics,RawInsight} from './normalize.ts';
const account='act_2622330841570584';
const origins=new Set(['https://osmu-studio.com','http://127.0.0.1:3001']);
Deno.serve(async req=>{
 const origin=req.headers.get('origin')||'',headers={'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin',...(origins.has(origin)?{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS'}:{})};
 const reply=(status:number,body:unknown)=>new Response(JSON.stringify(body),{status,headers});
 if(origin&&!origins.has(origin))return reply(403,{error:'Origin denied'});if(req.method==='OPTIONS')return new Response(null,{status:204,headers});if(req.method!=='POST')return reply(405,{error:'POST required'});
 const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}}),auth=req.headers.get('authorization')||'';
 const {data,error}=await db.auth.getUser(auth.replace(/^Bearer /,''));if(error||!data.user)return reply(401,{error:'관리자 로그인이 필요합니다.'});if(!['admin','owner'].includes(data.user.app_metadata.role))return reply(403,{error:'관리자 전용 기능입니다.'});
 let days:number;try{const raw=await req.text();if(raw.length>100)throw Error();days=JSON.parse(raw).days;if(![7,30,90].includes(days))throw Error()}catch{return reply(400,{error:'조회 기간을 확인해 주세요.'})}
 const access=Deno.env.get('META_REPORT_ACCESS_TOKEN');if(!access)return reply(503,{error:'메타 조회 키 연결이 필요합니다.'});
 try{
  async function get(path:string,params:Record<string,string>){const u=new URL('https://graph.facebook.com/v25.0/'+account+path);for(const [k,v] of Object.entries(params))u.searchParams.set(k,v);const r=await fetch(u,{headers:{Authorization:'Bearer '+access},signal:AbortSignal.timeout(20000)});const b=await r.json();if(!r.ok||b.error)throw Error(b.error?.code===190?'메타 조회 키가 만료되었습니다.':'광고계정 조회 오류 '+String(b.error?.code||r.status)+'. 계정 접근 권한을 확인해 주세요.');return b}
  const info=await get('',{fields:'id,name,currency,timezone_name'});if(!info.currency||!info.timezone_name)throw Error('광고계정 통화와 시간대를 확인하지 못했습니다.');
  const end=new Intl.DateTimeFormat('en-CA',{timeZone:info.timezone_name,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()),shift=(date:string,n:number)=>{const d=new Date(date+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)},start=shift(end,1-days),previousEnd=shift(start,-1),previousStart=shift(start,-days);
  const {data:cached,error:ce}=await db.from('cms_report_snapshots').select('*').eq('source','meta_ads').eq('period_start',start).eq('period_end',end).maybeSingle();if(ce)throw Error('광고 보고서 저장공간을 확인해 주세요.');if(cached&&Date.now()-Date.parse(cached.collected_at)<300000)return reply(200,{report:cached,cached:true});
  const fields='spend,impressions,reach,clicks,inline_link_clicks,actions';
  async function insights(s:string,e:string,extra:Record<string,string>={}){const rows:RawInsight[]=[];let after='';for(let page=0;page<50;page++){const b=await get('/insights',{fields,level:'account',time_range:JSON.stringify({since:s,until:e}),action_attribution_windows:JSON.stringify(['7d_click','1d_view']),action_report_time:'impression',limit:'500',...extra,...(after?{after}:{})});if(!Array.isArray(b.data))throw Error('광고 보고서 형식을 확인해 주세요.');rows.push(...b.data);if(!b.paging?.next)return rows;const cursor=b.paging?.cursors?.after;if(typeof cursor!=='string'||cursor===after)throw Error('광고 보고서를 모두 가져오지 못했습니다.');after=cursor}throw Error('광고 보고서가 너무 큽니다. 조회 기간을 줄여 주세요.')}
  const [total,daily,campaigns,previous]=await Promise.all([insights(start,end),insights(start,end,{time_increment:'1'}),insights(start,end,{level:'campaign',fields:fields+',campaign_id,campaign_name'}),insights(previousStart,previousEnd)]);
  if(total.length>1||previous.length>1)throw Error('기간 합계 응답을 확인해 주세요.');
  const report={source:'meta_ads',period_start:start,period_end:end,totals:adsMetrics(total[0]),series:daily.map(r=>({date:r.date_start,...adsMetrics(r)})).sort((a,b)=>String(a.date).localeCompare(String(b.date))),breakdowns:[{kind:'account',name:info.name,id:info.id,currency:info.currency,timezone:info.timezone_name,attribution:'7일 클릭 · 1일 조회',leadAction:'offsite_conversion.fb_pixel_lead',hasDelivery:total.length>0},{kind:'previous',name:'이전 동일 길이 기간',start:previousStart,end:previousEnd,...adsMetrics(previous[0])},...campaigns.map(r=>({kind:'campaign',id:r.campaign_id,name:r.campaign_name,...adsMetrics(r)})).sort((a,b)=>b.spend-a.spend)],collected_at:new Date().toISOString()};
  const {error:save}=await db.from('cms_report_snapshots').upsert(report,{onConflict:'source,period_start,period_end'});if(save)throw Error('광고 보고서 저장에 실패했습니다.');return reply(200,{report,cached:false});
 }catch(e){return reply(502,{error:e instanceof Error?e.message:'광고 통계를 확인하지 못했습니다.'})}
});
