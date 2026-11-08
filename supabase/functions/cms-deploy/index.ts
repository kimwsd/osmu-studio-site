import {createClient} from 'npm:@supabase/supabase-js@2.119.0';
const origins=new Set(['https://osmu-studio.com','http://127.0.0.1:3001']);
Deno.serve(async req=>{
 const origin=req.headers.get('origin')||'';
 const headers={'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin',...(origins.has(origin)?{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS'}:{})};
 const respond=(status:number,body:unknown)=>new Response(JSON.stringify(body),{status,headers});
 if(origin&&!origins.has(origin))return respond(403,{error:'Origin denied'});
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(req.method!=='POST')return respond(405,{error:'POST required'});
 const authorization=req.headers.get('authorization')||'';
 if(!authorization.startsWith('Bearer '))return respond(401,{error:'Sign in required'});
 const sb=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_ANON_KEY')!,{global:{headers:{Authorization:authorization}},auth:{persistSession:false}});
 const {data,error}=await sb.auth.getUser(authorization.slice(7));
 if(error||!data.user)return respond(401,{error:'Invalid session'});
 if(!['admin','owner'].includes(data.user.app_metadata.role))return respond(403,{error:'Administrator required'});
 const token=Deno.env.get('GITHUB_PUBLISH_TOKEN');
 if(!token)return respond(503,{error:'Deployment connection pending. Public snapshot is saved.'});
 try{
  const api='https://api.github.com/repos/kimwsd/osmu-studio-site/actions/workflows/deploy-pages.yml';
  const githubHeaders={Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'};
  const result=await fetch(api+'/dispatches',{method:'POST',headers:githubHeaders,body:JSON.stringify({ref:'main'}),signal:AbortSignal.timeout(15000)});
  if(!result.ok)return respond(502,{error:'Deployment request failed',status:result.status});
  return respond(202,{accepted:true});
 }catch{return respond(502,{error:'Deployment service unavailable. Retry from the dashboard.'})}
});
