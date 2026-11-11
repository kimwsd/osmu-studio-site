import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';

const workItems = [
  ['기획', '서비스와 고객 질문을 페이지 구조로', '3EO, 웹사이트 구축, 콘텐츠, 광고, 데이터 분석의 역할을 구분하고 업종별로 고객이 확인할 질문·제공 범위·준비 자료를 정리했습니다.'],
  ['구축', '탐색에서 문의까지 이어지는 웹사이트', '서비스 상세, 업종별 솔루션, 인사이트, 자료실과 문의 페이지를 연결했습니다. 모바일에서도 서비스 범위와 다음 행동을 찾을 수 있도록 구성했습니다.'],
  ['콘텐츠', '검색과 AI가 이해할 수 있는 설명', '페이지마다 고객 질문에 대한 답, 실제 업무와 산출물을 작성했습니다. 제목·설명·대표 주소와 구조화 데이터를 해당 본문에 맞춰 적용했습니다.'],
  ['측정', '동의한 방문부터 접수 완료까지', '방문 분석 동의, 외부 캠페인 유입 정보, 페이지 탐색과 문의 접수 성공을 구분해 측정하도록 구성했습니다. 버튼 클릭과 실제 문의를 별도 기준으로 관리합니다.'],
];

export function SiteVerification(){return <article className="section container verification-case">
  <header><span className="eyebrow">OWN PROJECT / WEBSITE &amp; 3EO</span><h2>OSMU STUDIO<br/>서비스 웹사이트 구축</h2><p className="lead">고객이 검색과 AI를 통해 서비스를 발견하고, 의뢰 범위와 받을 결과물을 확인한 뒤 상담으로 이어질 수 있도록 자사 홈페이지를 재구성했습니다.</p></header>
  <div className="verification-meta"><span>유형 · 자사 프로젝트</span><span>범위 · 기획 · 개발 · 콘텐츠 · 측정</span><span>공개 사이트 · osmu-studio.com</span></div>
  <section><h3>해결하려던 과제</h3><p>여러 서비스가 나열된 소개만으로는 고객이 무엇부터 의뢰해야 하는지 판단하기 어려웠습니다. 회사명은 OSMU STUDIO, 핵심 서비스는 3EO로 정리하고, 진단·구축 및 개선·월간 운영에서 제공하는 결과물을 각각 설명하는 데 집중했습니다.</p></section>
  <section><h3>실제로 진행한 작업</h3><div className="info-rows">{workItems.map(([label,title,detail])=><div key={label}><h4>{label} · {title}</h4><p>{detail}</p></div>)}</div></section>
  <section><h3>완성한 결과물</h3><div className="two-col"><div><h4>서비스를 판단할 수 있는 페이지</h4><ul><li>서비스별 대상 고객·업무 범위·산출물 안내</li><li>업종별 검색 질문과 실행 계획</li><li>진단·구축 및 개선·월간 운영 비교</li></ul><Link className="text-link" href="/services/website">웹사이트 구축 범위 보기 <ArrowUpRight size={16}/></Link></div><div><h4>운영하며 개선할 수 있는 기반</h4><ul><li>질문에 답하는 인사이트와 실무 자료</li><li>유입·탐색·문의의 측정 기준</li><li>검색 수요와 고객 여정을 설명하는 시각 자료</li></ul><Link className="text-link" href="/process">일하는 방식 보기 <ArrowUpRight size={16}/></Link></div></div></section>
  <section><h3>적용 결과와 다음 확인 항목</h3><p>공개 사이트에서 서비스 설명, 업종별 실행 범위, 의뢰 단계별 결과물과 문의 경로를 확인할 수 있습니다. 이후에는 검색 유입과 실제 문의 데이터를 기준으로 콘텐츠와 전환 흐름을 개선합니다.</p><p>이 기록은 자사 웹사이트의 구축 사례입니다. 고객사의 성과 사례나 검색 순위·AI 인용·매출 증가를 증명하는 자료는 아닙니다.</p></section>
</article>}
