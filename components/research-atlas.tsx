'use client';

import {useId,useState} from 'react';
import Link from 'next/link';
import {QuestionNetwork,ContentFlow} from './research-graphs';

const topics=[
 {name:'업무 정리',color:'#c7e9bc',question:'영업 보고를 반복해서 만드는 시간을 줄이려면?',keywords:['영업 보고 자동화','고객 정보 정리'],page:'문제 해결 가이드',proof:'현재 업무와 개선할 작업의 구체적인 예',output:'문제별 콘텐츠 기획서',stage:'문제 발견'},
 {name:'팀 협업',color:'#c7e9bc',question:'여러 담당자가 같은 고객 정보를 쓰려면?',keywords:['영업팀 고객 관리','고객 인수인계 방법'],page:'팀·역할별 활용 페이지',proof:'담당자 역할과 협업 절차',output:'사용 상황별 페이지 구조',stage:'해결책 탐색'},
 {name:'기능·연동',color:'#b6d6f0',question:'기존 CRM과 사용하는 업무 도구를 연결할 수 있나요?',keywords:['CRM 연동','영업 관리 기능'],page:'기능·연동 상세페이지',proof:'지원 범위와 연결 조건',output:'기능 설명·연동 조건표',stage:'해결책 탐색'},
 {name:'보안·권한',color:'#b6d6f0',question:'고객 정보 접근 권한을 팀별로 나눌 수 있나요?',keywords:['CRM 접근 권한','고객 데이터 보안'],page:'보안·권한 안내',proof:'공개 가능한 보안 정책과 권한 범위',output:'검토 담당자용 질문·답변',stage:'대안 비교'},
 {name:'비용·계약',color:'#f2d4a5',question:'사용 인원과 필요한 기능에 따라 비용이 어떻게 달라지나요?',keywords:['CRM 도입 비용','CRM 계약 조건'],page:'범위·견적 안내',proof:'비용에 포함되는 항목과 추가 조건',output:'비교표·견적 기준 안내',stage:'상담·도입'},
 {name:'도입·교육',color:'#f2d4a5',question:'기존 정보를 옮기고 팀이 적응하는 데 무엇이 필요한가요?',keywords:['CRM 데이터 이전','CRM 사용자 교육'],page:'도입 절차·운영 가이드',proof:'준비 자료, 담당자, 검수와 교육 범위',output:'도입 체크리스트·운영 콘텐츠',stage:'활용·재검토'},
];
export function ResearchAtlas(){
 const [view,setView]=useState(0),[selected,setSelected]=useState(0),id=useId(),topic=topics[selected];
 return <section className="section container research-atlas" id="research-atlas">
  <div className="desk-section-heading"><span className="eyebrow">SEARCH RESEARCH / WORKING VIEWS</span><h2>흩어진 질문을 연결하면,<br/>만들어야 할 콘텐츠가 보입니다.</h2><p>고객이 서비스를 찾는 상황, 함께 검토하는 조건, 마지막으로 확인하는 근거를 나누어 봅니다. OSMU는 이 분석을 홈페이지 구조·답변 콘텐츠·상담 동선과 다음 달 실행 계획으로 연결합니다.</p></div>
  <div className="atlas-board atlas-paper"><header className="atlas-header"><div><span className="eyebrow">OSMU RESEARCH ATLAS</span><h3>영업 관리 솔루션을 검토하는 고객</h3></div><span className="example-badge">설명용 분석 예시</span></header>
   <div className="atlas-tabs" role="group" aria-label="분석 시각화 선택">{['질문 지도','탐색 경로','콘텐츠 설계'].map((label,i)=><button key={label} aria-pressed={view===i} aria-controls={id+'-view'} data-analytics-action={'research_view_'+i} onClick={()=>setView(i)}><small>0{i+1}</small>{label}</button>)}</div>
   <div className="atlas-workspace"><aside className="atlas-sidebar"><span className="eyebrow">ANALYSIS LENS</span><h4>질문에서<br/>실행까지.</h4><p>고객이 무엇을 확인하려는지 읽고, 답할 페이지를 정합니다.</p><div className="atlas-side-card"><small>분석 대상 예시</small><strong>B2B 영업 관리</strong><span>도입을 검토하는 팀의 질문</span></div><div className="atlas-side-card"><small>선택한 관심사</small><strong>{topic.name}</strong><span>{topic.stage}</span></div><div className="atlas-side-card"><small>전달하는 결과물</small><strong>{topic.output}</strong><span>페이지 기획과 근거 자료로 연결</span></div><p className="atlas-side-note">설명용 예시 · 실제 고객의 이동 기록이나 성과 수치가 아닙니다.</p></aside><div className="atlas-canvas" id={id+'-view'}>
    {view===0&&<><p className="atlas-intro">중앙의 주제에서 고객 질문과 세부 검색어로 펼쳐집니다. 원을 선택해 관련 질문과 제작할 콘텐츠를 확인하세요.</p><figure className="atlas-figure"><div className="atlas-scroll" tabIndex={0} role="region" aria-label="질문 지도, 좁은 화면에서는 좌우로 이동"><QuestionNetwork topics={topics} selected={selected} onSelect={setSelected} id={id}/></div><figcaption>큰 원은 중심 주제, 중간 원은 질문 묶음, 작은 원은 검색어 예시입니다. 원 크기는 검색량이나 중요도가 아닙니다.</figcaption></figure></>}
    {view===1&&<><p className="atlas-intro">하나의 고민에도 여러 검토 질문이 생깁니다. 선택한 주제가 어떤 근거와 콘텐츠로 이어지는지 따라가 보세요.</p><figure className="atlas-figure"><div className="atlas-scroll" tabIndex={0} role="region" aria-label="콘텐츠 설계 흐름, 좁은 화면에서는 좌우로 이동"><ContentFlow selected={selected} id={id}/></div><figcaption>연결은 콘텐츠 설계를 위한 가설입니다. 선의 폭은 동일하며 실제 이동량·전환율을 뜻하지 않습니다.</figcaption></figure></>}
    {view===2&&<div className="table-wrap atlas-table"><table><caption>분석 주제별로 고객에게 전달할 결과물</caption><thead><tr><th>고객 관심사</th><th>만들 페이지</th><th>준비할 근거</th></tr></thead><tbody>{topics.map(t=><tr key={t.name}><th>{t.name}</th><td>{t.page}</td><td>{t.proof}</td></tr>)}</tbody></table></div>}
   </div></div>
   <div className="atlas-topics" role="group" aria-label="고객 질문 주제 선택">{topics.map((t,i)=><button key={t.name} aria-pressed={selected===i} data-analytics-action={'research_topic_'+i} onClick={()=>setSelected(i)}><span style={{background:t.color}}/>{t.name}</button>)}</div>
   <div className="atlas-detail" aria-live="polite"><div><span className="eyebrow">{topic.stage}</span><h3>{topic.question}</h3><p>검색어 예시 · {topic.keywords.join(' / ')}</p></div><dl><dt>제작할 페이지</dt><dd>{topic.page}</dd><dt>확인할 근거</dt><dd>{topic.proof}</dd><dt>받게 될 결과물</dt><dd>{topic.output}</dd></dl></div>
  </div>
  <div className="atlas-next"><article><span className="eyebrow">SEO / 발견될 접점</span><h3>어떤 결과가 질문에 답하고 있는가</h3><p>검색결과의 페이지·영상·지도·질문 영역과 경쟁사의 설명 범위를 확인합니다. 주제별 검색 수요와 우리 사업의 적합성을 함께 보고 제작 우선순위를 정합니다.</p><strong>결과물 · 주제별 페이지 목록 · 검색결과 비교표</strong></article><article><span className="eyebrow">AEO / 답할 내용</span><h3>고객이 결정하는 데 빠진 답은 무엇인가</h3><p>대상·비용 조건·비교 기준·이용 절차를 질문별로 정리합니다. 이해하기 쉬운 답변, 비교표, 실제 확인 가능한 근거를 페이지에 배치합니다.</p><strong>결과물 · 질문·답변 원고 · 근거 자료 체크리스트</strong></article><article><span className="eyebrow">GEO / 확인할 출처</span><h3>AI 답변은 어떤 정보를 근거로 삼는가</h3><p>합의한 질문과 모델·검색 모드·관측일을 고정해 브랜드 언급과 출처 URL을 따로 기록합니다. 답변 원문을 확인한 뒤 공식 페이지와 외부 근거의 보완 작업을 정합니다.</p><strong>결과물 · AI 응답 관측표 · 출처 점검 · 개선 작업 목록</strong></article></div>
  <p className="atlas-note">위 지도는 작업 방식을 설명하는 예시입니다. 실제 분석에서는 출처·조회 조건·분류 기준을 기록하고, 미수집 값과 검색량 0을 구분합니다. 실제 검색 수요 샘플은 아래 월별 그래프에서 확인할 수 있습니다.</p>
  <Link href="/services/consulting/" className="text-link">우리 사업의 검색 질문과 제작 우선순위 정하기 ↗</Link>
 </section>
}
