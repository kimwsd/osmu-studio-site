import {createClient} from 'npm:@supabase/supabase-js@2.119.0';
import {Resend} from 'npm:resend@6.14.0';
import {validateInquiry} from './validation.mjs';
import {sendWithRetry} from './delivery.mjs';
const origins=new Set(['https://osmu-studio.com','http://127.0.0.1:3001']);
const url=Deno.env.get('SUPABASE_URL')!;
const db=createClient(url,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false,autoRefreshToken:false}});
const key=Deno.env.get('RESEND_API_KEY');
const template='9bc594f8-dbb6-420d-9498-8c0a2abb034c';
const from='OSMU STUDIO <notifications@notify.osmu-studio.com>';
const to='osmu_studio@naver.com';
Deno.serve(async(req:Request)=>{
  const origin=req.headers.get('origin')||'';
  const headers={'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin',...(origins.has(origin)?{'Access-Control-Allow-Origin':origin}:{}),'Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS'};
  const reply=(status:number,body:unknown)=>new Response(JSON.stringify(body),{status,headers});
  if(!origins.has(origin))return reply(403,{error:'허용되지 않은 요청입니다.'});
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
  if(req.method!=='POST')return reply(405,{error:'지원하지 않는 요청입니다.'});
  if(!key||!template||Deno.env.get('CONTACT_INTAKE_ENABLED')!=='true')return reply(503,{error:'현재 온라인 접수 준비 중입니다. osmu_studio@naver.com으로 문의해 주세요.'});
  if(!req.headers.get('content-type')?.startsWith('application/json'))return reply(415,{error:'입력 형식을 확인해 주세요.'});
  let body;
  try{
    // Read a bounded body before parsing, even when Content-Length is absent.
    const reader=req.body?.getReader();if(!reader)return reply(400,{error:'입력 내용이 없습니다.'});
    const chunks:Uint8Array[]=[];let size=0;
    while(true){const part=await reader.read();if(part.done)break;size+=part.value.length;if(size>24000){await reader.cancel();return reply(413,{error:'입력 내용이 너무 깁니다.'})}chunks.push(part.value)}
    const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}
    body=JSON.parse(new TextDecoder().decode(bytes));
  }catch{return reply(400,{error:'입력 내용을 읽을 수 없습니다.'})}
  let document;
  try{document=validateInquiry(body)}catch(e){return reply(400,{error:e instanceof Error?e.message:'입력 내용을 확인해 주세요.'})}
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(document)));
  const hash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
  const {data,error}=await db.rpc('submit_contact_inquiry',{p_document:document,p_hash:hash});
  if(error||!data)return reply(503,{error:'접수 저장에 실패했습니다. 잠시 후 같은 내용으로 다시 시도해 주세요.'});
  if(data.error==='request_conflict')return reply(409,{error:'이전 접수 요청과 내용이 다릅니다. 새로고침 후 다시 작성해 주세요.'});
  if(data.error==='rate_limit')return reply(429,{error:'요청이 많습니다. 잠시 후 다시 시도하거나 이메일로 문의해 주세요.'});
  const id=data.id;
  // Atomic claim prevents concurrent duplicate sends. Durable outbox retains failures.
  const {data:claimed}=await db.from('inquiry_notifications').update({status:'sending',last_attempt_at:new Date().toISOString(),attempts:1}).eq('inquiry_id',id).eq('status','pending').select('inquiry_id').maybeSingle();
  if(claimed){
    const resend=new Resend(key);
    const outcome=await sendWithRetry(()=>resend.emails.send({from,to:[to],subject:'[OSMU STUDIO] 새 상담 접수 · '+id.slice(-8),template:{id:template}},{idempotencyKey:'inquiry/'+id}));
    const {error:recordError}=await db.from('inquiry_notifications').update({...outcome,...(outcome?.status==='sent'?{sent_at:new Date().toISOString()}:{})}).eq('inquiry_id',id);
    if(recordError)console.error('notification_status_write_failed');
  }
  return reply(200,{ok:true,reference:id});
});
