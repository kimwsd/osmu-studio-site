'use client';

import {useId,useState} from 'react';
import Link from 'next/link';
import sample from '@/public/resources/search-demand-sample-2026-11-11.json';

const stages=['문제 발견','해결책 탐색','대안 비교','상담·도입','활용·재검토'];
const journeys=[
 {name:'B2B · SaaS',topics:[['업무 병목','수작업 부담','정보 분산'],['자동화 방법','기능·연동','도입 조건'],['대안 비교','사용 사례','보안·지원'],['데모 요청','견적·계약','이관 일정'],['팀 교육','활용 방법','갱신 검토']],questions:['반복되는 영업 보고를 줄이려면?','기존 CRM과 연동할 수 있나요?','우리 팀에 맞는 도구는 어떻게 비교하나요?','데모 전에 무엇을 준비해야 하나요?','도입한 기능을 팀이 잘 쓰려면?'],pages:['문제 해결 가이드','기능·연동 상세페이지','비교표·검증된 사례','데모·상담 페이지','운영 가이드·활용 콘텐츠']},
 {name:'제조 · 산업',topics:[['공정 문제','납기 지연','불량 원인'],['적용 방식','재료·규격','인증 조건'],['공급사 비교','품질 근거','생산 역량'],['샘플 요청','도면·견적','납품 조건'],['유지관리','재발주','사양 변경']],questions:['반복되는 공정 불량은 어떻게 줄이나요?','우리 설비에 적용 가능한 규격인가요?','공급사를 선택할 때 무엇을 확인하나요?','견적에 필요한 도면과 수량은 무엇인가요?','추가 발주와 사양 변경은 어떻게 하나요?'],pages:['문제·적용 분야 가이드','제품·기술 사양페이지','품질·인증·공급 역량','샘플·견적 접수','유지관리·재발주 안내']},
 {name:'지역 · 전문 서비스',topics:[['상황 변화','필요 서비스','지역 고민'],['이용 방법','서비스 범위','준비 자료'],['전문성','진행 사례','이용 조건'],['예약 가능일','상담 신청','방문 안내'],['사후 관리','다음 일정','재이용']],questions:['이런 상황에 어떤 서비스를 받아야 하나요?','내 지역에서 어디까지 이용할 수 있나요?','상담 전에 전문성과 조건을 어떻게 확인하나요?','예약과 방문에 무엇이 필요한가요?','이용 후에는 어떤 관리가 필요한가요?'],pages:['상황별 안내 콘텐츠','지역·서비스 상세페이지','담당자·실제 사례·FAQ','예약·상담·오시는 길','이용 후 안내·관리 콘텐츠']},
];
const actions=[
 {work:'문제와 상황을 묶어 첫 질문을 정리합니다.',seo:'주제별 검색 의도와 정보 공백을 찾습니다.',aeo:'문제의 원인·선택지를 간결하게 설명합니다.',geo:'사업 범위와 전문성을 뒷받침할 공식 자료를 정리합니다.',metric:'검색 노출·클릭, 안내 콘텐츠 방문'},
 {work:'질문마다 답할 페이지와 담당 콘텐츠를 지정합니다.',seo:'기능·서비스별 대표 URL과 내부 링크를 설계합니다.',aeo:'대상·조건·절차를 본문과 FAQ로 제공합니다.',geo:'정의·사양·제공 범위의 표현과 출처를 맞춥니다.',metric:'상세페이지 조회, 다음 콘텐츠 이동'},
 {work:'비교에 필요한 근거와 빠진 정보를 보완합니다.',seo:'비교 의도에 맞는 페이지 제목과 본문을 정비합니다.',aeo:'차이·포함 범위·제약을 비교표로 답합니다.',geo:'실제 사례·검수 책임·확인 가능한 자료를 연결합니다.',metric:'비교·사례 조회, 상담 이동'},
 {work:'고객이 문의를 마칠 수 있는 경로를 구현합니다.',seo:'문의 페이지의 접근과 내부 연결을 점검합니다.',aeo:'준비 자료·진행 절차·견적 기준을 설명합니다.',geo:'회사·서비스·연락처의 공식 정보를 일치시킵니다.',metric:'접수 성공, 고유 문의, 상담 상태'},
 {work:'운영 질문을 다음 콘텐츠와 개선 작업에 반영합니다.',seo:'오래된 안내와 변경된 URL을 갱신합니다.',aeo:'사용·문제 해결·후속 절차의 답변을 보강합니다.',geo:'변경 이력과 최신 근거를 지속적으로 관리합니다.',metric:'가이드 이용, 재문의·재계약 기록'},
];

export function SearchJourney({compact=false}:{compact?:boolean}){
 const [industry,setIndustry]=useState(0),[stage,setStage]=useState(0),id=useId();
 const j=journeys[industry],a=actions[stage];
 return <section className="section container search-journey" id="search-journey"><div className="desk-section-heading"><span className="eyebrow">FROM SEARCH INTENT TO ACTION</span><h2>검색어를 모으는 데서,<br/>고객의 다음 선택을 설계하는 데로.</h2><p>OSMU STUDIO는 검색 수요·연관 키워드·검색결과 데이터와 실제 고객 질문을 함께 분석합니다. 주제와 검토 단계로 정리한 뒤, 어떤 페이지를 만들고 무엇을 개선할지 결정합니다.</p></div>
 <div className="journey-board"><div className="journey-toolbar"><div><span className="eyebrow">OSMU / SEARCH JOURNEY</span><h3>검색 의도에서 콘텐츠까지</h3></div><span className="example-badge">업무 설명용 예시</span></div>
 <div className="journey-industries" role="group" aria-label="업종 예시 선택">{journeys.map((x,i)=><button key={x.name} data-analytics-action={"journey_industry_"+i} aria-pressed={industry===i} onClick={()=>{setIndustry(i);setStage(0)}}>{x.name}</button>)}</div>
 <div className="journey-stages" role="group" aria-label="검색 검토 단계 선택">{stages.map((x,i)=><button key={x} data-analytics-action={"journey_stage_"+i} aria-pressed={stage===i} aria-controls={id+'-detail'} onClick={()=>setStage(i)}><span className="stage-index">0{i+1}</span><strong>{x}</strong><span className="topic-cluster">{j.topics[i].map(t=><span key={t}>{t}</span>)}</span><small>{j.pages[i]}</small></button>)}</div>
 <p className="journey-legend">단계·색상은 검색 의도의 분류입니다. 실제 이용자의 이동 순서·인원·전환율을 뜻하지 않으며, 고객은 여러 단계를 오갈 수 있습니다.</p>
 <div className="journey-detail" id={id+'-detail'} aria-live="polite"><div><span className="eyebrow">{stages[stage]} / 고객의 질문</span><h3>“{j.questions[stage]}”</h3><p>{a.work}</p><span className="journey-output">제작·개선할 접점 <strong>{j.pages[stage]}</strong></span></div><dl><dt>SEO</dt><dd>{a.seo}</dd><dt>AEO</dt><dd>{a.aeo}</dd><dt>GEO</dt><dd>{a.geo}</dd><dt>확인 지표</dt><dd>{a.metric}</dd></dl></div></div>
 {compact&&<Link className="text-link" href="/process/#research-atlas">질문 지도·탐색 경로·콘텐츠 설계 예시 보기 →</Link>}{!compact&&<><div className="journey-evidence-grid">{[
 ['01 / 수집','분석 조건부터 고정합니다.','국가·언어·검색엔진·기기·조회일과 대상 키워드를 정합니다. 검색량의 기간, 누락 값, 유사 키워드 중복을 확인해 비교할 기준선을 만듭니다.','키워드 원자료 · 출처·조건 기록'],
 ['02 / 해석','고객 질문과 검토 단계를 연결합니다.','연관 검색어, 검색결과의 페이지 유형, 실제 상담 내용을 대조해 주제군을 만듭니다. AI로 제안한 분류와 질문은 사람이 서비스 맥락에 맞게 검토합니다.','주제군 지도 · 고객 질문 목록 · 여정 가설'],
 ['03 / 제작','분석을 제작할 페이지로 바꿉니다.','주제마다 대표 페이지, 답해야 할 질문, 필요한 근거, 내부 링크와 문의 동선을 정합니다. 경쟁사에만 있는 정보와 우리만 제공할 수 있는 정보를 구분합니다.','페이지별 기획서 · 콘텐츠 캘린더 · 개선 순서'],
 ['04 / 검증','검색·AI 답변·실제 문의를 나누어 봅니다.','Search Console의 검색 실적, 동의 기반 GA4 행동, 동일 조건에서 관측한 AI 답변과 접수 기록을 비교합니다. 월간 보고서에는 변화와 다음 실행을 함께 남깁니다.','관측표 · 작업 이력 · 월간 보고서'],
 ].map(([n,t,b,o])=><article key={n}><span className="eyebrow">{n}</span><h3>{t}</h3><p>{b}</p><strong>{o}</strong></article>)}</div><div className="table-wrap journey-definition"><table><caption>분석에 사용하는 자료와 판단 범위</caption><thead><tr><th>자료</th><th>확인하는 내용</th><th>해석할 때 구분할 것</th></tr></thead><tbody><tr><th>검색 시장 데이터</th><td>검색량 추정치, 연관 키워드, 검색결과·경쟁 도메인</td><td>제공 범위·갱신일 기준의 데이터이며 개인의 전체 검색 기록이 아닙니다. 네이버 데이터는 별도 출처와 범위를 확인합니다.</td></tr><tr><th>고객 여정·질문 지도</th><td>상황·목적·비교 조건별 페이지와 콘텐츠의 역할</td><td>검색 자료와 상담 정보를 분석해 만든 가설입니다. 실제 행동 데이터로 보완합니다.</td></tr><tr><th>AI 답변 관측</th><td>고정 질문의 브랜드 언급, 추천과 출처 URL</td><td>모델·검색 모드·지역·관측일·반복 횟수를 기록합니다. 언급과 인용은 별도로 집계합니다.</td></tr><tr><th>Search Console · GA4 · 접수 기록</th><td>검색 노출·클릭, 동의한 방문의 행동, 고유 문의</td><td>검색어와 개인 문의를 모두 연결할 수는 없습니다. 도구별 수치를 합산하지 않고 차이를 확인합니다.</td></tr></tbody></table></div></>}
 {compact&&<Link className="text-link" href="/process/#search-journey">데이터를 실행으로 바꾸는 방식 자세히 보기 ↗</Link>}
 </section>
}

export function SearchDemandSample(){
 const [selected,setSelected]=useState(0),id=useId(),item=sample.items[selected];
 const max=Math.max(...item.months.map(x=>x.search_volume),1),x=(i:number)=>66+i*62,y=(v:number)=>230-v/max*174;
 return <section className="section soft"><div className="container"><div className="desk-section-heading"><span className="eyebrow">REAL DATA / RESEARCH SAMPLE</span><h2>같은 시장도,<br/>검색어에 따라 다른 흐름을 보입니다.</h2><p>검색 시장 데이터를 분석해 정리한 검색 수요 샘플입니다. 조회일과 데이터 갱신일을 구분하고, 변화가 큰 달은 원자료와 사업 맥락을 함께 검토합니다.</p></div><div className="demand-sample"><div className="demand-selector" role="group" aria-label="검색량 그래프 키워드 선택">{sample.items.map((k,i)=><button key={k.keyword} data-analytics-action={"demand_keyword_"+i} aria-pressed={selected===i} onClick={()=>setSelected(i)}><span>{k.keyword}</span><strong>{k.searchVolume.toLocaleString('ko-KR')}</strong><small>월평균 검색량 추정치</small></button>)}</div><figure className="demand-chart"><figcaption><strong>{item.keyword} · 월별 검색량 추정치</strong><span>2025.10–2026.09 · Google · 대한민국 · 한국어</span></figcaption><svg viewBox="0 0 800 285" role="img" aria-labelledby={id+'-title '+id+'-desc'}><title id={id+'-title'}>{item.keyword} 월별 검색량</title><desc id={id+'-desc'}>단위 검색 횟수 추정치. 키워드 선택에 따라 세로축 최댓값이 바뀝니다. 월별 값은 아래 데이터 표에서 확인할 수 있습니다.</desc>{[0,.5,1].map(p=><g key={p}><line x1="66" x2="748" y1={y(max*p)} y2={y(max*p)} stroke="#dce5df"/><text x="56" y={y(max*p)+4} textAnchor="end" fontSize="12" fill="#52645d">{Math.round(max*p).toLocaleString('ko-KR')}</text></g>)}<path d={item.months.map((m,i)=>(i?'L':'M')+x(i)+','+y(m.search_volume)).join(' ')} fill="none" stroke="#12664e" strokeWidth="3"/>{item.months.map((m,i)=><g key={m.year+'-'+m.month}><circle cx={x(i)} cy={y(m.search_volume)} r="4" fill="#12664e"><title>{m.year}.{m.month}: {m.search_volume.toLocaleString('ko-KR')}</title></circle><text x={x(i)} y="256" textAnchor="middle" fontSize="12" fill="#52645d">{m.month}월</text></g>)}</svg><p className="note">세로축은 선택한 키워드의 범위에 맞춰 바뀝니다. 자료 조회 {sample.retrievedAt} · 선택 키워드 데이터 갱신 {item.updatedAt}</p></figure><details className="demand-source"><summary>월별 데이터와 출처 보기</summary><div className="table-wrap"><table><caption>{item.keyword} 월별 원자료</caption><thead><tr><th>기준 월</th><th>검색량 추정치</th></tr></thead><tbody>{item.months.map(m=><tr key={m.year+'-'+m.month}><th>{m.year}.{String(m.month).padStart(2,'0')}</th><td>{m.search_volume.toLocaleString('ko-KR')}</td></tr>)}</tbody></table></div><p>출처: {sample.source}. Google Ads 기반 데이터입니다. 자료에서 제공하는 월평균 값과 개별 월별 값을 구분해 표시했습니다.</p><a href="/resources/search-demand-sample-2026-11-11.json">공개 데이터 JSON 보기 ↗</a></details><p className="demand-caveat">검색량은 고객 수·매출·OSMU 수행 성과가 아닙니다. 이 샘플은 실시간 대시보드가 아닌 고정 조회 자료이며, 검색량만으로 제작 우선순위를 정하지 않습니다.</p></div></div></section>
}
