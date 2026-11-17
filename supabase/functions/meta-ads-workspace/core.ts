export type Site = "osmu" | "vertere";
export const sites = {
 osmu: {id:"e481e164-b873-47f6-9f86-71144464e1ad",origin:"https://osmu-studio.com",label:"OSMU STUDIO"},
 vertere: {id:"63cbd2aa-2e10-4fad-90b4-8b30499095d2",origin:"https://www.vertere-house.com",label:"베르테레 하우스"}
} as const;
export function siteFor(value:unknown,origin:string) {
 if(value!=="osmu"&&value!=="vertere")throw Error("사이트를 확인해 주세요.");
 const site=sites[value];
 if(origin!==site.origin)throw Error("이 사이트의 광고 계정에만 접근할 수 있습니다.");
 return {...site,slug:value as Site};
}
export function identifier(value:unknown) {
 const s=String(value||"");if(!/^\d{5,25}$/.test(s))throw Error("광고 항목 ID를 확인해 주세요.");return s;
}
export function text(value:unknown,max=200,required=true) {
 if(typeof value!=="string"||value.length>max||(required&&!value.trim()))throw Error("입력한 문구의 길이를 확인해 주세요.");
 return value.trim();
}
export function budget(value:unknown) {
 const n=Number(value);if(!Number.isSafeInteger(n)||n<1||n>100000000)throw Error("일 예산을 원 단위의 양의 정수로 입력해 주세요.");return n;
}
export function target(form:Record<string,unknown>) {
 const min=Number(form.ageMin),max=Number(form.ageMax);
 if(!Number.isInteger(min)||!Number.isInteger(max)||min<18||max>65||min>max)throw Error("타깃 연령을 18~65세 범위에서 확인해 주세요.");
 return {geo_locations:{countries:["KR"]},age_min:min,age_max:max};
}
export function endTime(value:unknown,now=Date.now()) {
 const s=String(value||""),time=Date.parse(s);
 if(!Number.isFinite(time)||time<=now+300000)throw Error("종료 시간을 현재보다 5분 이후로 지정해 주세요.");
 return new Date(time).toISOString();
}
export function website(value:unknown,origin:string) {
 let u:URL;try{u=new URL(String(value));}catch{throw Error("홈페이지 도착 주소를 확인해 주세요.");}
 if(u.origin!==origin||u.username||u.password||u.hash)throw Error("해당 업체 홈페이지의 HTTPS 주소를 사용해 주세요.");
 if([...u.searchParams.keys()].some(k=>!/^utm_(source|medium|campaign|content|term|id)$/.test(k)))throw Error("광고 주소에는 UTM 항목만 사용할 수 있습니다.");
 return u.href;
}
export function draftForm(raw:unknown) {
 if(!raw||typeof raw!=="object"||Array.isArray(raw))throw Error("광고 초안 형식을 확인해 주세요.");
 const allowed=["name","message","headline","link","dailyBudget","endTime","ageMin","ageMax","pageId","instagramId","imageHash","videoId","videoThumbnail","mediaType","cta"];
 const form:Record<string,string>={};
 for(const key of allowed) { const value=(raw as Record<string,unknown>)[key]; if(value!==undefined)form[key]=text(String(value),key==="message"?2000:2000,false); }
 return form;
}
export function creative(form:Record<string,unknown>,origin:string) {
 const page=identifier(form.pageId),link=website(form.link,origin);
 const cta=String(form.cta||"LEARN_MORE");if(!["LEARN_MORE","CONTACT_US"].includes(cta))throw Error("지원하는 광고 버튼을 선택해 주세요.");
 const story:Record<string,unknown>={page_id:page};
 if(form.instagramId)story.instagram_user_id=identifier(form.instagramId);
 if(form.mediaType==="video") {
  const thumbnail=String(form.videoThumbnail||"");let u:URL;try{u=new URL(thumbnail);}catch{throw Error("영상 대표 이미지를 선택해 주세요.");}
  if(u.protocol!=="https:"||u.username||u.password)throw Error("영상 대표 이미지 주소를 확인해 주세요.");
  story.video_data={video_id:identifier(form.videoId),image_url:thumbnail,message:text(form.message,2000),title:text(form.headline,100),call_to_action:{type:cta,value:{link}}};
 } else {
  const hash=String(form.imageHash||"");if(!/^[a-f0-9]{16,64}$/i.test(hash))throw Error("광고 계정에 업로드된 이미지를 선택해 주세요.");
  story.link_data={image_hash:hash,link,message:text(form.message,2000),name:text(form.headline,100),call_to_action:{type:cta,value:{link}}};
 }
 return {name:text(form.name),object_story_spec:story};
}
export function newAdPlan(form:Record<string,unknown>,origin:string,currency:string,now=Date.now()) {
 if(currency!=="KRW")throw Error("현재 운영 화면은 원화 광고 계정을 지원합니다.");
 return {
  campaign:{name:text(form.name),objective:"OUTCOME_TRAFFIC",special_ad_categories:[],is_adset_budget_sharing_enabled:false,status:"PAUSED"},
  adset:{name:text(form.name)+" · 타깃",daily_budget:budget(form.dailyBudget),billing_event:"IMPRESSIONS",optimization_goal:"LINK_CLICKS",bid_strategy:"LOWEST_COST_WITHOUT_CAP",targeting:target(form),end_time:endTime(form.endTime,now),status:"PAUSED"},
  creative:creative(form,origin),ad:{name:text(form.name),status:"PAUSED"}
 };
}
export function entityFields(kind:string) {
 if(kind==="campaign")return "id,account_id,name,status,effective_status,daily_budget,lifetime_budget,objective";
 if(kind==="adset")return "id,account_id,name,status,effective_status,daily_budget,lifetime_budget,start_time,end_time,targeting,campaign_id";
 if(kind==="ad")return "id,account_id,name,status,effective_status,adset_id,campaign_id,creative{id,name,thumbnail_url,object_story_spec}";
 throw Error("지원하지 않는 광고 항목입니다.");
}
export function owned(entity:Record<string,unknown>,account:string) {
 if(String(entity.account_id)!==account)throw Error("다른 광고 계정의 항목에는 접근할 수 없습니다.");return entity;
}
export function updatePlan(kind:string,raw:Record<string,unknown>,current:Record<string,unknown>,currency:string) {
 entityFields(kind);
 const result:Record<string,unknown>={name:text(raw.name)};
 if(kind!=="ad"&&raw.dailyBudget!==undefined&&raw.dailyBudget!=="") {
  if(currency!=="KRW"||Number(current.lifetime_budget)>0||!Number(current.daily_budget))throw Error("일 예산을 사용하는 원화 항목만 예산을 수정할 수 있습니다.");
  result.daily_budget=budget(raw.dailyBudget);
 }
 if(kind==="adset") {
  if(raw.endTime)result.end_time=endTime(raw.endTime);
  if(raw.ageMin!==undefined&&raw.ageMax!==undefined){ const ages=target(raw); result.targeting={...(current.targeting as object),age_min:ages.age_min,age_max:ages.age_max}; }
 }
 if(Object.keys(raw).some(k=>!["name","dailyBudget","endTime","ageMin","ageMax"].includes(k)))throw Error("지원하지 않는 수정 항목입니다.");
 return result;
}
export function activationAllowed(account:Record<string,unknown>) {
 if(Number(account.account_status)!==1)throw Error("현재 Meta 광고 계정 상태에서는 집행할 수 없습니다.");
 if(!account.funding_source_details)throw Error("Meta 광고 계정에 결제수단을 먼저 등록해 주세요.");
 if(account.currency!=="KRW")throw Error("현재 운영 화면은 원화 계정만 집행할 수 있습니다.");
}

export function canonical(value:unknown):string {
 if(Array.isArray(value))return "["+value.map(canonical).join(",")+"]";
 if(value&&typeof value==="object")return "{"+Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>JSON.stringify(k)+":"+canonical(v)).join(",")+"}";
 return JSON.stringify(value)??"null";
}
