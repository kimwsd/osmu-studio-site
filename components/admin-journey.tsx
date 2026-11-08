'use client';
import {useState} from 'react';
import {ArrowRight,MousePointer2,Route,LogIn,FileText} from 'lucide-react';
import {type Report,amount} from '@/lib/crm';
import './admin-journey.css';
type Row=Report['breakdowns'][number];
const names:Record<string,string>={'/':'홈','/contact/':'문의','/services/':'서비스','/solutions/':'솔루션','/insights/':'인사이트','/about/':'회사소개','/pricing/':'비용 안내','/process/':'진행 과정'};
const areas:Record<string,string>={header:'상단 메뉴',menu:'하위 메뉴',search:'검색 결과',main:'본문',footer:'하단 메뉴'};
const actions:Record<string,string>={search_open:'검색 열기',mobile_menu:'모바일 메뉴',insight_more:'인사이트 더 보기',share_link:'링크 복사',menu_about:'회사소개 메뉴',menu_services:'서비스 메뉴',menu_solutions:'솔루션 메뉴',menu_insights:'인사이트 메뉴',menu_resources:'자료 메뉴',menu_desk:'도구 메뉴'};
const label=(p:string|undefined)=>!p||p==='(not set)'?'확인되지 않음':names[p]||p;
export function AdminJourney({report}:{report?:Report}){
 const [tab,setTab]=useState('landing'),[query,setQuery]=useState('');
 const ready=(kind:string)=>report?.breakdowns.some(r=>r.kind==='journey_status'&&r.name===kind&&r.events===1);
 const all=(kind:string)=>report?.breakdowns.filter(r=>r.kind===kind)||[];
 const filtered=(kind:string)=>all(kind).filter(r=>[r.name,r.path,r.source,r.from,r.destination,r.area].join(' ').toLowerCase().includes(query.toLowerCase()));
 const clicks=all('click'),pageRows=all('page'),landings=all('landing'),transitions=all('transition');
 const sum=(rows:Row[],key:'sessions'|'events'|'views')=>rows.reduce((total,r)=>total+(r[key]||0),0);
 const totalSessions=sum(landings,'sessions'),topPages=[...pageRows].sort((a,b)=>(b.views||0)-(a.views||0)).slice(0,5),max=Math.max(1,...topPages.map(r=>r.views||0));
 const from=(value:string|undefined)=>{if(!value||value==='(not set)')return '이전 주소 확인 안 됨';try{const u=new URL(value);return u.origin==='https://osmu-studio.com'?label(u.pathname):u.hostname}catch{return label(value)}};
 const keys=[['landing','첫 방문 페이지',LogIn],['page','많이 본 페이지',FileText],['transition','페이지 이동',Route],['click','클릭한 항목',MousePointer2]] as const;
 const rows=filtered(tab).sort((a,b)=>(b.sessions??b.views??b.events??0)-(a.sessions??a.views??a.events??0));
 return <section className="journey-hub" aria-label="방문과 클릭 경로"><header className="journey-heading"><div><span className="workspace-eyebrow">VISITOR JOURNEY</span><h2>어디서 시작해, 무엇을 눌렀나요?</h2><p>첫 방문 페이지와 유입 채널, 페이지 이동 및 주요 클릭을 함께 확인합니다.</p></div><span className="journey-period">GA4 · 선택 기간 집계</span></header>
 <div className="journey-summary">{[{kind:'landing',label:'진입 세션',value:totalSessions},{kind:'page',label:'페이지 조회',value:sum(pageRows,'views')},{kind:'click',label:'링크·주요 버튼 클릭',value:sum(clicks,'events')},{kind:'transition',label:'페이지 조회 경로',value:sum(transitions,'events')}].map(x=><article key={x.kind}><span>{x.label}</span><strong>{ready(x.kind)?amount(x.value):'—'}<small>회</small></strong></article>)}</div>
 <div className="journey-overview"><div><h3>관심을 받은 페이지</h3>{topPages.map(r=><div className="journey-ranking" key={r.path}><span>{label(r.path)}</span><strong>{amount(r.views||0)}</strong><i style={{width:(r.views||0)/max*100+'%'}}/></div>)}{!topPages.length&&<p className="journey-empty">{ready('page')?'아직 처리된 페이지별 조회가 없습니다.':'페이지별 보고서를 조회해 주세요.'}</p>}</div><div><h3>최근 30분 수신 이벤트</h3><p className="measurement-note">일반 보고서의 처리 대기와 실시간 수신을 구분합니다.</p><div className="journey-live">{(report?.breakdowns.filter(r=>r.kind==='realtime_event')||[]).map(r=><span key={r.name}>{r.name}<b>{amount(r.events||0)}</b></span>)}</div>{!report?.breakdowns.some(r=>r.kind==='realtime_event')&&<p className="journey-empty">최근 수신 이벤트 없음 또는 조회 전</p>}</div></div>
 <div className="journey-controls"><div role="tablist" aria-label="방문 경로 상세">{keys.map(([key,text,Icon])=><button key={key} role="tab" aria-selected={tab===key} onClick={()=>{setTab(key);setQuery('')}}><Icon size={15}/>{text}</button>)}</div><input aria-label="경로와 클릭 검색" value={query} onChange={e=>setQuery(e.target.value)} placeholder="페이지·채널·클릭 검색"/></div>
 {!ready(tab)?<p className="journey-empty">이 항목은 아직 조회되지 않았거나 조회 확인이 필요합니다. GA4 집계 갱신 후 확인해 주세요.</p>:<div role="tabpanel" className="journey-table"><table><thead><tr>{(tab==='landing'?['첫 방문 페이지','유입 출처 / 매체','세션','참여 세션','문의 완료']:tab==='page'?['페이지','조회','방문자']:tab==='transition'?['이전 주소','도착 페이지','조회 횟수']:['클릭이 발생한 페이지','클릭 항목','위치','이동 목적지','횟수']).map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={[r.kind,r.path,r.source,r.from,r.destination,r.name,r.area,i].join('|')}>{tab==='landing'?<><td>{label(r.path)}</td><td>{r.source||'확인되지 않음'}</td><td>{amount(r.sessions||0)}</td><td>{amount(r.engagedSessions||0)}</td><td>{ready('landing_leads')?amount(all('landing_leads').find(l=>l.path===r.path&&l.source===r.source)?.leads||0):'—'}</td></>:tab==='page'?<><td>{label(r.path)}</td><td>{amount(r.views||0)}</td><td>{amount(r.users||0)}</td></>:tab==='transition'?<><td>{from(r.from)}</td><td><ArrowRight size={13}/>{label(r.path)}</td><td>{amount(r.events||0)}</td></>:<><td>{label(r.path)}</td><td>{actions[r.name]||r.name.replace('service_tab_','서비스 탭 · ')||'확인되지 않음'}</td><td>{areas[r.area||'']||'확인되지 않음'}</td><td>{r.destination==='(not set)'||!r.destination?'화면 안에서 동작':r.destination==='mailto:'?'이메일':from(r.destination)}</td><td>{amount(r.events||0)}</td></>}</tr>)}</tbody></table>{!rows.length&&<p className="journey-empty">선택 기간과 검색 조건에 해당하는 처리된 기록이 없습니다.</p>}</div>}
 <p className="journey-help">이동 표는 페이지 조회에 기록된 직전 주소와 도착 주소의 집계입니다. 클릭만 하고 이동하지 않은 경우는 클릭 표에만 포함될 수 있습니다. 개인별 전체 이동 기록이나 순차 퍼널 전환율을 뜻하지 않습니다.<br/>새 클릭 항목은 적용 후부터 수집됩니다. 분석 동의가 없거나 차단된 방문은 포함되지 않으며, 일반 보고서 반영에는 처리 시간이 필요합니다.</p>
 </section>;
}
