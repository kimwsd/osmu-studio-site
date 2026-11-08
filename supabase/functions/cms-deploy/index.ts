import {createClient} from 'npm:@supabase/supabase-js@2.119.0';
import {Resend} from 'npm:resend@6.14.0';
const origins=new Set(['https://osmu-studio.com','http://127.0.0.1:3001']);
const api='https://api.github.com/repos/kimwsd/osmu-studio-site/actions/workflows/deploy-pages.yml';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
Deno.serve(async req=>{
 const origin=req.headers.get('origin')||'';
 const headers={'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin',...(origins.has(origin)?{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS'}:{})};
 const respond=(status:number,body:unknown)=>new Response(JSON.stringify(body),{status,headers});
 if(origin&&!origins.has(origin))return respond(403,{error:'Origin denied'});
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(req.method!=='POST')return respond(405,{error:'POST required'});
 let body:any={};try{const text=await req.text();if(text.length>1500)return respond(413,{error:'Request too large'});body=text?JSON.parse(text):{}}catch{return respond(400,{error:'Invalid request'})}
 const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}});
 let scheduledId:string|null=null;
 if(body.action==='scheduled-deploy'){
  if(origin||!uuid.test(body.jobId||'')||!uuid.test(body.jobToken||''))return respond(403,{error:'Invalid job'});
  const {data,error}=await db.from('cms_deploy_jobs').update({status:'dispatching',updated_at:new Date().toISOString()}).eq('id',body.jobId).eq('token',body.jobToken).eq('status','pending').gte('created_at',new Date(Date.now()-10*60000).toISOString()).select('id').maybeSingle();
  if(error||!data)return respond(403,{error:'Invalid or consumed job'});scheduledId=data.id;
 }else{
  const authorization=req.headers.get('authorization')||'';if(!authorization.startsWith('Bearer '))return respond(401,{error:'Sign in required'});
  const {data,error}=await db.auth.getUser(authorization.slice(7));if(error||!data.user)return respond(401,{error:'Invalid session'});
  if(!['admin','owner'].includes(data.user.app_metadata.role))return respond(403,{error:'Administrator required'});
  if(body.action==='retry-notification'){
   if(!uuid.test(body.inquiryId||''))return respond(400,{error:'Invalid inquiry'});
   const {data:notice}=await db.from('inquiry_notifications').select('*').eq('inquiry_id',body.inquiryId).single();
   if(!notice||notice.status==='sent')return respond(409,{error:'이미 발송됐거나 재시도할 알림이 없습니다.'});
   if(notice.attempts>=8)return respond(409,{error:'재시도 한도입니다. 발송 서비스에서 상태를 확인해 주세요.'});
   if(notice.last_attempt_at&&Date.now()-Date.parse(notice.last_attempt_at)>23*3600000)return respond(409,{error:'이전 전송 결과를 발송 서비스에서 먼저 확인해 주세요. 중복 발송 방지를 위해 자동 재시도를 중단했습니다.'});
   if(notice.status==='sending'&&Date.now()-Date.parse(notice.last_attempt_at)<10*60000)return respond(409,{error:'아직 발송 중입니다.'});
   const key=Deno.env.get('RESEND_API_KEY');if(!key)return respond(503,{error:'알림 발송 연결을 확인해 주세요.'});
   const {data:claimed}=await db.from('inquiry_notifications').update({status:'sending',attempts:notice.attempts+1,last_attempt_at:new Date().toISOString()}).eq('inquiry_id',notice.inquiry_id).eq('status',notice.status).eq('attempts',notice.attempts).select('inquiry_id').maybeSingle();if(!claimed)return respond(409,{error:'다른 요청에서 처리 중입니다.'});
   let outcome:any;try{const result=await new Resend(key).emails.send({from:'OSMU STUDIO <notifications@notify.osmu-studio.com>',to:['osmu_studio@naver.com'],subject:'[OSMU STUDIO] 새 상담 접수 · '+notice.inquiry_id.slice(-8),template:{id:'9bc594f8-dbb6-420d-9498-8c0a2abb034c'}},{idempotencyKey:'inquiry/'+notice.inquiry_id});outcome=result.error?{status:'failed',last_error:'provider_rejected'}:{status:'sent',email_id:result.data?.id,sent_at:new Date().toISOString(),last_error:null}}catch{outcome={status:'failed',last_error:'transport_failed'}}
   await db.from('inquiry_notifications').update(outcome).eq('inquiry_id',notice.inquiry_id);
   await db.from('ops_audit').insert({entity:'inquiry_notifications',record_id:notice.inquiry_id,action:'RETRY',actor:data.user.id});return respond(outcome.status==='sent'?200:502,{ok:outcome.status==='sent',error:outcome.status==='sent'?undefined:'알림 재전송에 실패했습니다. 문의 원본은 저장되어 있습니다.'});
  }
 }
 const token=Deno.env.get('GITHUB_PUBLISH_TOKEN');
 async function finish(status:string,error:string|null){if(scheduledId)await db.from('cms_deploy_jobs').update({status,error,updated_at:new Date().toISOString()}).eq('id',scheduledId)}
 if(!token){await finish('failed','배포 연결 대기');return respond(503,{error:'Deployment connection pending. Public snapshot is saved.'})}
 const gh={Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'};
 try{
  if(body.action==='status'){
   const result=await fetch(api+'/runs?per_page=8',{headers:gh,signal:AbortSignal.timeout(15000)});if(!result.ok)return respond(502,{error:'배포 이력을 가져오지 못했습니다.'});const content=await result.json();return respond(200,{runs:content.workflow_runs.map((r:any)=>({id:r.id,status:r.status,conclusion:r.conclusion,url:r.html_url,created_at:r.created_at,updated_at:r.updated_at,title:r.display_title}))});
  }
  if(body.action&&!['deploy','scheduled-deploy'].includes(body.action))return respond(400,{error:'Unknown action'});
  const result=await fetch(api+'/dispatches',{method:'POST',headers:gh,body:JSON.stringify({ref:'main'}),signal:AbortSignal.timeout(15000)});
  if(!result.ok){await finish('failed','배포 요청 실패 '+result.status);return respond(502,{error:'Deployment request failed',status:result.status})}
  await finish('accepted',null);return respond(202,{accepted:true});
 }catch{await finish('failed','배포 서비스 응답 지연');return respond(502,{error:'Deployment service unavailable. Retry from the dashboard.'})}
});
