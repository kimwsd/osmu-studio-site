"use client";
import {useEffect,useRef,useState} from "react";
import {Megaphone,RefreshCw,Plus,ArrowUpRight,Check,Image as ImageIcon,ShieldCheck} from "lucide-react";
import "./meta-ads-workspace.css";
type Data=Record<string,any>;
type Props={site:"osmu"|"vertere";readonly:boolean;call:(body:Record<string,unknown>)=>Promise<{data:any;error:any}>};
const names={osmu:"OSMU STUDIO",vertere:"베르테레 하우스"};
const origins={osmu:"https://osmu-studio.com",vertere:"https://www.vertere-house.com"};
const statusNames:Record<string,string>={ACTIVE:"활성",PAUSED:"중지",PENDING_REVIEW:"심사 중",DISAPPROVED:"반려",CAMPAIGN_PAUSED:"캠페인 중지",ADSET_PAUSED:"광고세트 중지",WITH_ISSUES:"확인 필요",ARCHIVED:"보관됨",DELETED:"삭제됨"};
const empty=(site:Props["site"]):Data=>({name:"",message:"",headline:"",link:origins[site]+"/?utm_source=facebook&utm_medium=paid_social",dailyBudget:"",endTime:"",ageMin:"18",ageMax:"65",pageId:"",instagramId:"",imageHash:"",videoId:"",videoThumbnail:"",mediaType:"image",cta:"LEARN_MORE"});
const money=(value:unknown)=>value==null?"—":Number(value).toLocaleString("ko-KR")+"원";
const when=(value:string)=>value?new Date(value).toLocaleString("ko-KR",{timeZone:"Asia/Seoul"}):"미설정";
const inputTime=(value:string)=>value?new Date(Date.parse(value)+9*3600000).toISOString().slice(0,16):"";
const isoTime=(value:string)=>value?new Date(value+"+09:00").toISOString():"";
export function MetaAdsWorkspace({site,readonly,call}:Props) {
 const [section,setSection]=useState("campaign"),[status,setStatus]=useState<Data>(),[rows,setRows]=useState<Data[]>([]),[cursor,setCursor]=useState<string|null>(null),[drafts,setDrafts]=useState<Data[]>([]),[history,setHistory]=useState<Data[]>([]),[busy,setBusy]=useState(""),[notice,setNotice]=useState(""),[error,setError]=useState("");
 const [form,setForm]=useState<Data>(()=>empty(site)),[draftId,setDraftId]=useState(""),[draftAt,setDraftAt]=useState(""),[editing,setEditing]=useState<Data|null>(null),[review,setReview]=useState<Data|null>(null),[confirmed,setConfirmed]=useState(false),[token,setToken]=useState(""),[connectOpen,setConnectOpen]=useState(false);
 const [assets,setAssets]=useState<Record<string,Data[]>>({pages:[],instagram:[],images:[],videos:[]}),[assetCursors,setAssetCursors]=useState<Record<string,string|null>>({});
 const generation=useRef(0),pending=useRef(false);
 async function api(action:string,body:Data={}) {
  const response=await call({site,action,...body});
  if(response.error){let message="광고 관리 요청을 처리하지 못했습니다.";try{message=(await response.error.context.json()).error||message;}catch{}throw Error(message);}
  if(response.data?.error)throw Error(response.data.error);
  return response.data;
 }
 async function run(label:string,work:()=>Promise<void>) {
  if(pending.current)return;pending.current=true;setBusy(label);setError("");setNotice("");
  try{await work();}catch(e){setError(e instanceof Error?e.message:"요청을 처리하지 못했습니다.");}finally{pending.current=false;setBusy("");}
 }
 async function load() {
  const n=++generation.current;
  const [s,d,h]=await Promise.all([api("status"),api("drafts"),api("history")]);
  if(n!==generation.current)return;
  setStatus(s);setDrafts(d.drafts);setHistory(h.history);return s;
 }
 async function list(kind=section,more=false) {
  if(!["campaign","adset","ad"].includes(kind))return;
  const result=await api("list",{kind,...(more&&cursor?{cursor}:{})});
  setRows(prior=>more?[...prior,...result.rows.filter((r:Data)=>!prior.some(p=>p.id===r.id))]:result.rows);setCursor(result.cursor);
 }
 useEffect(()=>{if(!readonly)void run("연결 확인 중",async()=>{const s=await load();if(s?.connected)await list("campaign");});return()=>{generation.current++;}},[site,readonly]);
 useEffect(()=>{setRows([]);setCursor(null);if(status?.connected&&!readonly&&["campaign","adset","ad"].includes(section))void run("광고 목록 조회 중",()=>list(section));},[section]);
 async function refresh(){const s=await load();if(s?.connected&&["campaign","adset","ad"].includes(section))await list();}
 async function loadAssets(kind:string,more=false){
  const result=await api("assets",{kind,...(more&&assetCursors[kind]?{cursor:assetCursors[kind]}:{})});
  setAssets(a=>({...a,[kind]:more?[...a[kind],...result.rows]:result.rows}));setAssetCursors(c=>({...c,[kind]:result.cursor}));
 }
 function openDraft(d?:Data){setForm(d?{...empty(site),...d.payload}:empty(site));setDraftId(d?.id||"");setDraftAt(d?.updated_at||"");setEditing(null);setSection("draft");setReview(null);setNotice("");}
 async function saveDraft(){
  const result=await api("save_draft",{payload:form,...(draftId?{id:draftId,updatedAt:draftAt}:{})});
  setDraftId(result.draft.id);setDraftAt(result.draft.updated_at);
  const d=await api("drafts");setDrafts(d.drafts);setNotice("광고 초안을 저장했습니다.");
  return result.draft;
 }
 async function prepare(kind:string,payload:Data){
  const result=await api("prepare",{kind,payload});setReview(result.review);setConfirmed(false);
 }
 function edit(row:Data){
  setEditing({level:section,row});setReview(null);
  setForm({...empty(site),name:row.name,dailyBudget:Number(row.daily_budget)>0?String(row.daily_budget):"",endTime:row.end_time||"",ageMin:String(row.targeting?.age_min??18),ageMax:String(row.targeting?.age_max??65)});
 }
 const canManage=!readonly&&status?.canManage,canDraft=!readonly&&status?.canEditDraft;
 const adsManager=status?.accountId?"https://adsmanager.facebook.com/adsmanager/manage/campaigns?act="+status.accountId:"https://adsmanager.facebook.com/";
 const updateForm=(key:string,value:string)=>setForm(f=>({...f,[key]:value}));
 const selectedImage=assets.images.find(a=>a.hash===form.imageHash);
 function showValue(key:string,value:any):string {
  if(value===undefined||value===null)return "—";
  if(key==="daily_budget")return money(value);
  if(key==="end_time"||key==="start_time")return when(value);
  if(key==="status")return statusNames[value]||String(value);
  return typeof value==="object"?JSON.stringify(value,null,2):String(value);
 }
 const fieldLabels:Record<string,string>={name:"이름",daily_budget:"일 예산",lifetime_budget:"총 예산",end_time:"종료",start_time:"시작",status:"설정 상태",effective_status:"실제 상태",targeting:"타깃",account_id:"광고 계정",id:"ID",campaign_id:"캠페인",adset_id:"광고세트",creative:"소재",adsets:"영향받는 광고세트",adset:"상위 광고세트",account:"계정"};
 const assetSelect=(kind:string,key:string,label:string)=> <label>{label}<div className="meta-field-action"><select value={form[key]||""} onChange={e=>{updateForm(key,e.target.value);if(kind==="videos"){const v=assets.videos.find(x=>x.id===e.target.value);if(v)updateForm("videoThumbnail",v.picture||"");}}}><option value="">선택하세요</option>{assets[kind].map(a=><option key={a.id||a.hash} value={a.id||a.hash}>{a.name||a.title||a.username||a.id||a.hash}</option>)}</select><button type="button" disabled={!status?.connected||!!busy} onClick={()=>void run("자산 조회 중",()=>loadAssets(kind))}>불러오기</button></div>{assetCursors[kind]&&<button type="button" disabled={!!busy} onClick={()=>void run("자산 조회 중",()=>loadAssets(kind,true))}>더 불러오기</button>}</label>;
 const creativeFields=<>
  {assetSelect("pages","pageId","Facebook 페이지")}
  {assetSelect("instagram","instagramId","Instagram 계정 · 선택")}
  <label>광고 문구<textarea maxLength={2000} value={form.message||""} onChange={e=>updateForm("message",e.target.value)}/></label>
  <label>제목<input maxLength={100} value={form.headline||""} onChange={e=>updateForm("headline",e.target.value)}/></label>
  <label>홈페이지 도착 주소 · UTM 포함<input type="url" value={form.link||""} onChange={e=>updateForm("link",e.target.value)}/></label>
  <div className="meta-form-grid"><label>소재<select value={form.mediaType} onChange={e=>updateForm("mediaType",e.target.value)}><option value="image">이미지</option><option value="video">Meta에 등록된 영상</option></select></label><label>광고 버튼<select value={form.cta} onChange={e=>updateForm("cta",e.target.value)}><option value="LEARN_MORE">더 알아보기</option><option value="CONTACT_US">문의하기</option></select></label></div>
  {form.mediaType==="video"?assetSelect("videos","videoId","광고 영상"):assetSelect("images","imageHash","광고 이미지")}
  {form.mediaType==="image"&&<label>새 이미지 업로드 · JPG/PNG, 최대 5MB<input type="file" accept="image/jpeg,image/png" disabled={!canManage||!!busy} onChange={e=>{const file=e.target.files?.[0];e.target.value="";if(!file)return;void run("이미지 업로드 중",async()=>{if(!["image/jpeg","image/png"].includes(file.type)||file.size>5*1024*1024)throw Error("5MB 이하 JPG 또는 PNG 이미지를 선택해 주세요.");const bytes=await new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(",")[1]);r.onerror=()=>reject(Error("이미지를 읽지 못했습니다."));r.readAsDataURL(file);});const result=await api("upload_image",{name:file.name,bytes});await loadAssets("images");if(result.images[0]?.hash)updateForm("imageHash",result.images[0].hash);});}}/></label>}
 </>;
 return <section className="meta-workspace" aria-label={names[site]+" 메타 광고 운영"}>
  <header className="meta-header"><div><span className="workspace-eyebrow">META ADS WORKSPACE</span><h1>메타 광고 운영</h1><p>{names[site]}의 광고를 준비하고, 변경 내용을 확인한 후 집행합니다.</p></div><div className="meta-actions"><button disabled={!!busy} onClick={()=>openDraft()}><Plus size={15}/>새 광고 초안</button><button disabled={readonly||!!busy} onClick={()=>void run("새로고침 중",refresh)}><RefreshCw size={15}/>새로고침</button></div></header>
  <div className="meta-connection"><div><Megaphone size={23}/><div><strong>{status?.accountName||names[site]}</strong><span>{status?.accountId?"광고 계정 "+status.accountId:readonly?"로그인 후 계정 확인":"연결 확인 중"}</span></div></div><div><span className={"meta-badge "+(status?.canManage?"ready":"")}>{readonly?"읽기 전용 미리보기":status?.canManage?"광고 관리 연결됨":status?.connected?"조회 연결 · 관리 권한 필요":"광고 관리 연결 대기"}</span>{!readonly&&status?.owner&&<button onClick={()=>setConnectOpen(!connectOpen)}>연결 설정</button>}<a href={adsManager} target="_blank" rel="noopener noreferrer">Meta에서 열기 <ArrowUpRight size={14}/></a></div></div>
  {readonly&&<p className="meta-note">공개 미리보기입니다. 실제 광고·초안·계정 정보는 관리자 로그인 후 표시합니다.</p>}
  {status?.connectionError&&<p className="meta-note">{status.connectionError}</p>}
  {status?.connected&&!status?.account?.funding_source_details&&<p className="meta-note">계정에 결제수단이 확인되지 않았습니다. 광고 초안과 수정은 준비할 수 있으며, 집행 전에 Meta에서 결제수단을 등록해야 합니다.</p>}
  {connectOpen&&status?.owner&&<section className="meta-card"><h2>광고 관리 연결</h2><p>현재 표시된 광고 계정에 대한 관리 권한을 연결합니다. 연결 정보는 서버에서 암호화해 보관하며 브라우저에 다시 표시하지 않습니다.</p><form onSubmit={e=>{e.preventDefault();const value=token;setToken("");void run("Meta 권한 확인 중",async()=>{await api("connect",{token:value});setConnectOpen(false);const s=await load();if(s?.connected&&["campaign","adset","ad"].includes(section))await list();setNotice("광고 관리 권한을 연결했습니다.");});}}><label>Meta 광고 관리 액세스 토큰<input type="password" autoComplete="off" value={token} onChange={e=>setToken(e.target.value)} required/></label><p className="meta-help">연동 담당자가 Meta 앱에서 발급한 ads_management 권한의 토큰을 입력합니다. 계정 비밀번호를 입력하지 마세요.</p><button disabled={!!busy||!token}>권한 확인 후 연결</button></form></section>}
  {busy&&<p role="status" className="meta-note">{busy}</p>}{error&&<p role="alert" className="meta-alert">{error}</p>}{notice&&<p role="status" className="meta-success"><Check size={16}/>{notice}</p>}
  <nav className="meta-tabs" aria-label="광고 운영 메뉴">{[["campaign","캠페인"],["adset","광고세트"],["ad","광고"],["drafts","저장한 초안"],["history","변경 이력"]].map(([key,label])=><button key={key} aria-pressed={section===key} disabled={!!busy} onClick={()=>{setEditing(null);setReview(null);setSection(key);}}>{label}</button>)}</nav>
  {["campaign","adset","ad"].includes(section)&&!editing&&<section className="meta-card"><div className="meta-card-heading"><h2>{section==="campaign"?"캠페인":section==="adset"?"광고세트":"광고"} 목록</h2><span>최근 조회 결과 · {rows.length}개</span></div>{!rows.length?<div className="meta-empty"><Megaphone size={32}/><h3>{status?.connected?"조회된 광고 항목이 없습니다.":"광고 계정 연결을 기다리고 있습니다."}</h3><p>{status?.connected?"새 광고 초안을 작성하거나 Meta 광고 관리자의 계정을 확인해 주세요.":"관리 권한 연결 후 실제 광고 목록과 상태를 불러옵니다."}</p></div>:<div className="meta-table"><table><thead><tr><th>이름 / ID</th><th>상태</th><th>예산</th><th>운영</th></tr></thead><tbody>{rows.map(row=><tr key={row.id}><td><strong>{row.name}</strong><small>{row.id}</small></td><td><span className="meta-badge">{statusNames[row.effective_status]||row.effective_status||"미확인"}</span></td><td>{Number(row.daily_budget)>0?"일 "+money(row.daily_budget):Number(row.lifetime_budget)>0?"총 "+money(row.lifetime_budget):"상위 설정 적용"}</td><td><div className="meta-actions"><button disabled={!canManage||!!busy} onClick={()=>edit(row)}>수정</button><button disabled={!canManage||!!busy} onClick={()=>void run("변경 검토 중",()=>prepare("status",{level:section,id:row.id,status:row.status==="ACTIVE"?"PAUSED":"ACTIVE"}))}>{row.status==="ACTIVE"?"중지":"집행 검토"}</button></div></td></tr>)}</tbody></table>{cursor&&<button disabled={!!busy} onClick={()=>void run("추가 조회 중",()=>list(section,true))}>더 불러오기</button>}</div>}<p className="meta-help">광고를 새로 만들면 캠페인·광고세트·광고가 모두 중지 상태로 등록됩니다. 세 단계가 활성 상태이고 Meta 심사를 통과해야 노출될 수 있습니다.</p></section>}
  {section==="drafts"&&<section className="meta-card"><h2>저장한 광고 초안</h2>{drafts.length?drafts.map(d=><div className="meta-draft-row" key={d.id}><div><strong>{d.name}</strong><small>{when(d.updated_at)}</small></div><button disabled={!!busy} onClick={()=>openDraft(d)}>열기</button><button disabled={!!busy} onClick={()=>{openDraft({...d,id:"",updated_at:""});setNotice("복사본입니다. 저장하면 새 초안으로 생성됩니다.");}}>복사</button></div>):<p>저장된 초안이 없습니다.</p>}</section>}
  {(section==="draft"||editing)&&<div className="meta-editor"><section className="meta-card"><h2>{editing?"광고 수정":"새 광고 초안"}</h2><label>이름<input maxLength={200} value={form.name} onChange={e=>updateForm("name",e.target.value)}/></label>
   {(!editing||editing.level!=="ad")&&<div className="meta-form-grid"><label>일 예산 · 원<input type="number" min="1" step="1" placeholder="예산 입력" disabled={!!editing&&!Number(editing.row.daily_budget)} value={form.dailyBudget} onChange={e=>updateForm("dailyBudget",e.target.value)}/></label>{(!editing||editing.level==="adset")&&<label>종료 일시 · 한국 시간<input type="datetime-local" value={inputTime(form.endTime)} onChange={e=>updateForm("endTime",isoTime(e.target.value))}/></label>}</div>}
   {(!editing||editing.level==="adset")&&<><p className="meta-help">{editing?"현재 타깃의 지역·관심사 설정을 유지하며 연령만 수정합니다.":"신규 광고: 홈페이지 방문 목적 · 대한민국 · 자동 게재 위치"}</p><div className="meta-form-grid"><label>최소 연령<input type="number" min="18" max="65" value={form.ageMin} onChange={e=>updateForm("ageMin",e.target.value)}/></label><label>최대 연령 · 65는 65세 이상<input type="number" min="18" max="65" value={form.ageMax} onChange={e=>updateForm("ageMax",e.target.value)}/></label></div></>}
   {!editing&&creativeFields}
   {editing?.level==="ad"&&<details className="meta-creative-edit"><summary>광고 문구·이미지·영상 교체</summary><p>교체할 소재를 완성한 뒤 ‘소재 변경 검토’를 누르세요. 변경 시 Meta에서 다시 심사할 수 있습니다.</p>{creativeFields}<button disabled={!canManage||!!busy} onClick={()=>void run("소재 변경 검토 중",()=>prepare("creative",{level:"ad",id:editing.row.id,form}))}>소재 변경 검토</button></details>}
   <div className="meta-actions">{editing?<><button disabled={!!busy} onClick={()=>setEditing(null)}>취소</button><button className="primary" disabled={!canManage||!!busy} onClick={()=>void run("수정 내용 검토 중",async()=>{const changes:Data={name:form.name};if(editing.level!=="ad"&&form.dailyBudget)changes.dailyBudget=form.dailyBudget;if(editing.level==="adset"){changes.ageMin=form.ageMin;changes.ageMax=form.ageMax;if(form.endTime)changes.endTime=form.endTime;}await prepare("update",{level:editing.level,id:editing.row.id,changes});})}>수정 내용 검토</button></>:<><button disabled={!canDraft||!!busy} onClick={()=>void run("초안 저장 중",async()=>{await saveDraft();})}>초안 저장</button><button className="primary" disabled={!canManage||!!busy} onClick={()=>void run("새 광고 검토 중",async()=>{const saved=await saveDraft();await prepare("create",{form,draftId:saved.id,updatedAt:saved.updated_at});})}>중지 상태로 만들기 검토</button></>}</div>
  </section><aside className="meta-card meta-preview"><span className="workspace-eyebrow">광고 미리보기</span><h3>{names[site]}</h3><p>{form.message||"광고 문구를 입력하면 여기에 표시됩니다."}</p>{(form.mediaType==="video"?form.videoThumbnail:selectedImage?.url)?<img src={form.mediaType==="video"?form.videoThumbnail:selectedImage?.url} alt="선택한 광고 소재"/>:<div className="meta-preview-placeholder"><ImageIcon size={40}/><span>광고 소재 선택</span></div>}<strong>{form.headline||"광고 제목"}</strong><small>{form.link||origins[site]}</small><p className="meta-help">내용 확인용 미리보기입니다. 실제 노출 형식은 게재 위치와 Meta 설정에 따라 달라집니다.</p></aside></div>}
  {review&&<section className="meta-review meta-card" aria-label="광고 변경 최종 확인"><div className="meta-card-heading"><h2><ShieldCheck size={20}/>변경 내용 확인</h2><button disabled={!!busy} onClick={()=>setReview(null)}>닫기</button></div><p>{names[site]} · 광고 계정 {status?.accountId} · 확인 유효시간 {when(review.expires_at)}</p>
   {review.kind==="create"?<><p>캠페인·광고세트·광고를 모두 <strong>중지 상태</strong>로 생성합니다.</p><dl className="meta-review-list">{[["광고 이름",review.payload.form.name],["일 예산",money(review.payload.plan.adset.daily_budget)],["종료",when(review.payload.plan.adset.end_time)],["타깃","대한민국 · "+review.payload.form.ageMin+"~"+review.payload.form.ageMax+"세"],["도착 주소",review.payload.form.link]].map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></>:<><h3>{review.before_data?.name}</h3><div className="meta-review-columns"><div><h4>현재 설정</h4>{Object.entries(review.before_data||{}).map(([k,v])=><div key={k}><strong>{fieldLabels[k]||k}</strong><pre>{showValue(k,v)}</pre></div>)}</div><div><h4>변경 내용</h4>{Object.entries(review.kind==="status"?{status:review.payload.status}:review.kind==="creative"?{creative:review.payload.creative}:review.payload.changes).map(([k,v])=><div key={k}><strong>{fieldLabels[k]||k}</strong><pre>{showValue(k,v)}</pre></div>)}</div></div></>}
   {review.payload.status==="ACTIVE"&&<p className="meta-alert">집행하면 Meta 심사 및 설정에 따라 광고비가 발생할 수 있습니다. 상위·하위 광고 상태와 예산, 종료 일시를 확인하세요.</p>}
   <label className="meta-confirm"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/>표시된 광고 계정과 변경 내용{review.payload.status==="ACTIVE"?"·예산·광고비 발생":""}을 확인했습니다.</label><button className="primary" disabled={!confirmed||!canManage||!!busy} onClick={()=>void run("Meta에 반영 중",async()=>{const current=review;setReview(null);const result=await api("execute",{id:current.id,confirm:true});setEditing(null);setNotice(result.message);await load();if(["campaign","adset","ad"].includes(section))await list();})}>{review.kind==="create"?"중지 상태로 생성":review.payload.status==="ACTIVE"?"집행 시작":review.payload.status==="PAUSED"?"광고 중지":"변경 적용"}</button></section>}
  {section==="history"&&<section className="meta-card"><h2>광고 변경 이력</h2>{history.length?history.map(h=><details className="meta-history" key={h.id}><summary><span>{({create:"광고 생성",update:"설정 수정",creative:"소재 교체",status:"상태 변경",connect:"계정 연결"} as Record<string,string>)[h.kind]||h.kind}</span><strong>{({succeeded:"반영 완료",running:"처리 중 · 재실행 금지",failed:"실패 · 결과 확인 필요",unknown:"결과 확인 필요 · 재실행 금지"} as Record<string,string>)[h.state]||h.state}</strong><small>{when(h.created_at)}</small></summary><pre>{JSON.stringify({변경:h.payload,결과:h.result},null,2)}</pre><p className="meta-help">일부 단계가 성공한 뒤 오류가 발생할 수 있습니다. 생성된 ID와 Meta 계정 상태를 확인한 후 후속 작업을 진행하세요.</p></details>):<p>실행된 변경 기록이 없습니다.</p>}</section>}
 </section>;
}
