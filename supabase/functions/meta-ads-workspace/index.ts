import {createClient} from "npm:@supabase/supabase-js@2.119.0";
import {siteFor,identifier,text,draftForm,newAdPlan,entityFields,owned,updatePlan,activationAllowed,creative,canonical} from "./core.ts";
import {makeGraph,MetaError} from "./graph.ts";
type Data=Record<string,any>;
Deno.serve(async(req:Request)=>{
 const origin=req.headers.get("origin")||"";
 const allowed=["https://osmu-studio.com","https://www.vertere-house.com"];
 const headers={"Content-Type":"application/json","Cache-Control":"no-store","Vary":"Origin",...(allowed.includes(origin)?{"Access-Control-Allow-Origin":origin,"Access-Control-Allow-Headers":"authorization,apikey,content-type,x-client-info","Access-Control-Allow-Methods":"POST,OPTIONS"}:{})};
 const reply=(status:number,data:Data)=>new Response(JSON.stringify(data),{status,headers});
 if(!allowed.includes(origin))return reply(403,{error:"허용되지 않은 사이트입니다."});
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers});
 if(req.method!=="POST")return reply(405,{error:"POST 요청만 지원합니다."});
 let actionId:string|undefined,writeStarted=false;
 const db=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false}});
 try {
  const bearer=req.headers.get("authorization")||"";
  if(!bearer.startsWith("Bearer "))return reply(401,{error:"관리자 로그인이 필요합니다."});
  const auth=await db.auth.getUser(bearer.slice(7));
  if(auth.error||!auth.data.user)return reply(401,{error:"관리자 로그인을 확인해 주세요."});
  const raw=await req.text();if(raw.length>7000000)return reply(413,{error:"업로드는 5MB 이하 이미지만 지원합니다."});
  const body=JSON.parse(raw),site=siteFor(body.site,origin),user=auth.data.user.id;
  const membership=await db.from("mt_members").select("role").eq("tenant_id",site.id).eq("user_id",user).maybeSingle();
  if(membership.error||!membership.data)return reply(403,{error:"이 업체의 관리자 권한이 없습니다."});
  const owner=membership.data.role==="owner",editor=owner||membership.data.role==="editor";
  const action=String(body.action||"status");
  if(!["status","list","assets","drafts","history","save_draft","connect","prepare","execute","upload_image"].includes(action))return reply(400,{error:"지원하지 않는 작업입니다."});
  if(["connect","prepare","execute","upload_image"].includes(action)&&!owner)return reply(403,{error:"광고 변경과 계정 연결은 소유자 관리자만 실행할 수 있습니다."});
  const connection=await db.from("mt_ads_connections").select("account_id,account_name,token_secret,updated_at").eq("tenant_id",site.id).single();
  if(connection.error)throw Error("광고 계정 연결 정보를 확인해 주세요.");
  const accountId=connection.data.account_id,accountPath="act_"+accountId;
  const tokenResult=await db.rpc("mt_ads_token",{t:site.id});if(tokenResult.error)throw Error("광고 연결 저장공간을 확인해 주세요.");
  const writeToken=tokenResult.data||Deno.env.get("META_ADS_"+site.slug.toUpperCase()+"_TOKEN")||"";
  const readToken=writeToken||(site.slug==="osmu"?Deno.env.get("META_REPORT_ACCESS_TOKEN")||"":"");
  const graph=makeGraph(readToken);
  const checked=async(result:any)=>{if(result.error)throw Error("광고 작업을 저장하지 못했습니다.");return result.data;};
  const tokenRequired=()=>{if(!readToken)throw Error("Meta 광고 계정 연결이 필요합니다.");};
  const accountInfo=async()=>{tokenRequired();return graph(accountPath,{fields:"id,name,currency,timezone_name,account_status,funding_source_details"});};
  const entity=async(kind:string,id:unknown)=>owned(await graph(identifier(id),{fields:entityFields(kind)}),accountId);
  const list=async(path:string,params:Data={},cursor="")=>{
   const r=await graph(path,{...params,limit:50,...(cursor?{after:text(cursor,2000)}:{})});
   if(!Array.isArray(r.data))throw Error("Meta 목록 응답을 확인해 주세요.");
   return {rows:r.data,cursor:r.paging?.next?r.paging?.cursors?.after||null:null};
  };
  if(action==="drafts")return reply(200,{drafts:await checked(await db.from("mt_ads_drafts").select("id,name,payload,updated_at").eq("tenant_id",site.id).order("updated_at",{ascending:false}).limit(100))});
  if(action==="history")return reply(200,{history:await checked(await db.from("mt_ads_actions").select("id,kind,state,payload,before_data,result,created_at,completed_at").eq("tenant_id",site.id).neq("state","prepared").order("created_at",{ascending:false}).limit(50))});
  if(action==="save_draft") {
   if(!editor)return reply(403,{error:"초안 편집 권한이 없습니다."});
   const payload=draftForm(body.payload),name=text(payload.name),row={tenant_id:site.id,payload,name,updated_by:user,updated_at:new Date().toISOString()};
   const saved=body.id?await db.from("mt_ads_drafts").update(row).eq("id",body.id).eq("tenant_id",site.id).eq("updated_at",body.updatedAt).select("id,updated_at").maybeSingle():await db.from("mt_ads_drafts").insert(row).select("id,updated_at").single();
   const result=await checked(saved);if(!result)throw Error("초안이 다른 화면에서 변경됐습니다. 다시 불러와 주세요.");
   return reply(200,{draft:result});
  }
  if(action==="connect") {
   const token=text(body.token,8000);if(/\s/.test(token)||token.length<40)throw Error("Meta 액세스 토큰을 확인해 주세요.");
   const candidate=makeGraph(token);
   const info=await candidate(accountPath,{fields:"id,name,currency,timezone_name,account_status"});
   const permissions=await candidate("me/permissions");
   if(!permissions.data?.some((p:Data)=>p.permission==="ads_management"&&p.status==="granted"))throw Error("ads_management 권한을 가진 Meta 연결이 필요합니다.");
   if(String(info.id)!==accountPath||info.currency!=="KRW")throw Error("지정된 원화 광고 계정에 대한 연결인지 확인해 주세요.");
   await checked(await db.rpc("mt_ads_store_token",{t:site.id,new_token:token}));
   await checked(await db.from("mt_ads_connections").update({account_name:info.name,updated_at:new Date().toISOString()}).eq("tenant_id",site.id));
   await checked(await db.from("mt_ads_actions").insert({tenant_id:site.id,actor:user,account_id:accountId,kind:"connect",payload:{accountId},state:"succeeded",completed_at:new Date().toISOString()}));
   return reply(200,{connected:true});
  }
  if(action==="status") {
   let account:Data|null=null,connectionError="";
   if(readToken)try{account=await accountInfo();}catch(e){connectionError=(e as Error).message;}
   return reply(200,{site:site.slug,accountId,accountName:account?.name||connection.data.account_name,connected:!!account,canManage:owner&&!!writeToken&&!!account,canEditDraft:editor,owner,account,connectionError,requiresManagementConnection:!writeToken});
  }
  tokenRequired();
  if(action==="list") {
   const kind=String(body.kind||"campaign"),edge=kind==="campaign"?"campaigns":kind==="adset"?"adsets":kind==="ad"?"ads":"";
   if(!edge)throw Error("광고 목록 종류를 확인해 주세요.");
   const result=await list(accountPath+"/"+edge,{fields:entityFields(kind)},body.cursor||"");
   const ids=result.rows.map((r:Data)=>String(r.id));
   return reply(200,{...result,kind,accountId,ids});
  }
  if(action==="assets") {
   const type=String(body.kind);
   const paths:Record<string,[string,string]>={pages:[accountPath+"/promote_pages","id,name"],instagram:[accountPath+"/instagram_accounts","id,username"],images:[accountPath+"/adimages","hash,name,url,width,height"],videos:[accountPath+"/advideos","id,title,picture"]};
   const item=paths[type];if(!item)throw Error("소재 종류를 확인해 주세요.");
   return reply(200,await list(item[0],{fields:item[1]},body.cursor||""));
  }
  if(!writeToken)throw Error("광고 관리 권한 연결이 필요합니다. 현재 조회 연결은 유지됩니다.");
  if(action==="upload_image") {
   const bytes=String(body.bytes||"");
   if(!/^[A-Za-z0-9+/]+=*$/.test(bytes)||bytes.length<50||bytes.length>6800000)throw Error("5MB 이하 이미지를 선택해 주세요.");
   const result=await graph(accountPath+"/adimages",{bytes,name:text(body.name,150)},"POST");
   const images=Object.values(result.images||{});if(!images.length)throw Error("Meta 이미지 업로드 결과를 확인하지 못했습니다.");
   return reply(200,{images});
  }
  const assetInAccount=async(edge:string,id:string,field="id")=>{
   let cursor="";for(let page=0;page<20;page++){const result=await list(accountPath+"/"+edge,{fields:field},cursor);if(result.rows.some((r:Data)=>String(r[field])===id))return; if(!result.cursor)break;cursor=result.cursor;}
   throw Error("선택한 자산이 이 광고 계정에 연결되어 있는지 확인해 주세요.");
  };
  const validateCreativeAssets=async(form:Data)=>{
   await assetInAccount("promote_pages",identifier(form.pageId));
   if(form.instagramId)await assetInAccount("instagram_accounts",identifier(form.instagramId));
   if(form.mediaType==="video")await assetInAccount("advideos",identifier(form.videoId));
   else { const images=await graph(accountPath+"/adimages",{fields:"hash",hashes:[form.imageHash]});if(!images.data?.some((r:Data)=>r.hash===form.imageHash))throw Error("광고 계정의 이미지를 선택해 주세요."); }
  };
  const preflight=async(kind:string,payload:Data)=>{
   const account=await accountInfo();
   if(account.currency!=="KRW")throw Error("현재 화면은 원화 계정만 지원합니다.");
   if(kind==="create") {
    const form=draftForm(payload.form),plan=newAdPlan(form,site.origin,account.currency);
    const draftId=String(payload.draftId||"");
    const draft=await checked(await db.from("mt_ads_drafts").select("payload,updated_at").eq("id",draftId).eq("tenant_id",site.id).maybeSingle());
    if(!draft||canonical(draft.payload)!==canonical(form)||draft.updated_at!==payload.updatedAt)throw Error("변경한 초안을 먼저 저장한 후 다시 검토해 주세요.");
    const prior=await checked(await db.from("mt_ads_actions").select("id").eq("tenant_id",site.id).eq("kind","create").contains("payload",{draftId}).neq("state","prepared").limit(1));
    if(prior.length)throw Error("이미 전송한 초안입니다. 변경 이력을 확인하거나 새 초안으로 복사해 주세요.");
    await validateCreativeAssets(form);
    return {payload:{form,plan,draftId,updatedAt:payload.updatedAt},before:{account:{id:accountId,name:account.name,currency:account.currency}}};
   }
   const level=String(payload.level),current=await entity(level,payload.id);
   if(kind==="update")return {payload:{level,id:identifier(payload.id),changes:updatePlan(level,payload.changes,current,account.currency)},before:current};
   if(kind==="creative") {
    if(level!=="ad")throw Error("광고에서만 소재를 변경할 수 있습니다.");
    const form=draftForm(payload.form); await validateCreativeAssets(form);
    return {payload:{level,id:identifier(payload.id),creative:creative(form,site.origin)},before:current};
   }
   if(kind==="status") {
    if(!["ACTIVE","PAUSED"].includes(payload.status))throw Error("집행 또는 중지를 선택해 주세요.");
    const impact:Data={...current};
    if(payload.status==="ACTIVE") {
     activationAllowed(account);
     if(level==="campaign") {
      const children=await list(identifier(payload.id)+"/adsets",{fields:entityFields("adset")});
      if(children.cursor)throw Error("광고세트가 50개보다 많은 캠페인은 Meta에서 집행 상태를 변경해 주세요.");
      impact.adsets=children.rows;
     }
     if(level==="ad")impact.adset=await entity("adset",current.adset_id);
     impact.account={currency:account.currency,name:account.name};
    }
    return {payload:{level,id:identifier(payload.id),status:payload.status},before:impact};
   }
   throw Error("지원하지 않는 광고 변경입니다.");
  };
  if(action==="prepare") {
   const recent=await db.from("mt_ads_actions").select("id",{count:"exact",head:true}).eq("tenant_id",site.id).eq("actor",user).gte("created_at",new Date(Date.now()-60000).toISOString());
   if(recent.error||Number(recent.count)>20)throw Error("요청이 많습니다. 잠시 후 다시 시도해 주세요.");
   const kind=String(body.kind),prepared=await preflight(kind,body.payload||{});
   const data=await checked(await db.from("mt_ads_actions").insert({tenant_id:site.id,actor:user,account_id:accountId,kind,payload:prepared.payload,before_data:prepared.before}).select("id,kind,payload,before_data,expires_at").single());
   return reply(200,{review:data});
  }
  if(action==="execute") {
   if(body.confirm!==true)throw Error("검토한 광고 변경 내용을 먼저 확인해 주세요.");
   const claimed=await db.from("mt_ads_actions").update({state:"running"}).eq("id",body.id).eq("tenant_id",site.id).eq("actor",user).eq("account_id",accountId).eq("state","prepared").gt("expires_at",new Date().toISOString()).select("*").maybeSingle();
   const operation=await checked(claimed);
   if(!operation)throw Error("이미 처리했거나 만료된 요청입니다. 변경 내용을 다시 검토해 주세요.");
   actionId=operation.id;
   const payload=operation.payload,kind=operation.kind,result:Data={};
   if(kind!=="create") {
    const before=kind==="status"?(await preflight(kind,payload)).before:await entity(payload.level,payload.id);
    if(canonical(before)!==canonical(operation.before_data))throw Error("Meta에서 광고가 변경됐습니다. 최신 내용으로 다시 검토해 주세요.");
   } else {
    newAdPlan(payload.form,site.origin,"KRW");
    const latest=await checked(await db.from("mt_ads_drafts").select("updated_at").eq("id",payload.draftId).eq("tenant_id",site.id).single());
    if(latest.updated_at!==payload.updatedAt)throw Error("초안이 변경됐습니다. 다시 검토해 주세요.");
   }
   const mutate=async(path:string,fields:Data)=>{writeStarted=true;return graph(path,fields,"POST");};
   const record=async()=>{await checked(await db.from("mt_ads_actions").update({result}).eq("id",actionId!));};
   if(kind==="create") {
    const p=payload.plan;
    result.campaign=await mutate(accountPath+"/campaigns",p.campaign);await record();
    result.adset=await mutate(accountPath+"/adsets",{...p.adset,campaign_id:result.campaign.id});await record();
    result.creative=await mutate(accountPath+"/adcreatives",p.creative);await record();
    result.ad=await mutate(accountPath+"/ads",{...p.ad,adset_id:result.adset.id,creative:{creative_id:result.creative.id}});await record();
   } else if(kind==="creative") {
    result.creative=await mutate(accountPath+"/adcreatives",payload.creative);await record();
    result.ad=await mutate(payload.id,{creative:{creative_id:result.creative.id}});await record();
   } else {
    result.change=await mutate(payload.id,kind==="status"?{status:payload.status}:payload.changes);await record();
   }
   await checked(await db.from("mt_ads_actions").update({state:"succeeded",result,completed_at:new Date().toISOString()}).eq("id",actionId));
   return reply(200,{ok:true,result,message:kind==="create"?"광고를 중지 상태로 만들었습니다. 캠페인·광고세트·광고를 확인한 후 집행해 주세요.":"Meta에 변경 내용을 반영했습니다."});
  }
  throw Error("지원하지 않는 요청입니다.");
 } catch(e) {
  const error=e instanceof Error?e.message:"요청을 처리하지 못했습니다.";
  if(actionId)await db.from("mt_ads_actions").update({state:(e instanceof MetaError?e.uncertain:writeStarted)?"unknown":"failed",completed_at:new Date().toISOString()}).eq("id",actionId);
  return reply(400,{error});
 }
});
