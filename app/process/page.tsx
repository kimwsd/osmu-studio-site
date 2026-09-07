import {FAQ,ContactInvite} from '@/components/sections';
export const metadata={title:'Process — 질문에서 납품까지',alternates:{canonical:'/process'}};
export default function ProcessPage(){return <><section className="page-intro section-pad"><h1>Good work takes a shared direction. Here’s how we get there, together.</h1><p className="intro-note">같은 목표를 바라볼 수 있도록. 질문, 결정과 확인의 과정을 나누어 진행합니다.</p></section><section className="process-content section-pad"><h2 className="section-rule">How we work</h2><div className="process-steps">{[
['01','Listen & scope.','문의와 작업 범위','지금 필요한 변화와 희망 일정을 듣습니다. 작업 종류와 수량, 납품 형식을 정리해 견적과 일정을 제안합니다.','문의 확인 → 작업 범위·견적 → 계약'],
['02','Research & define.','조사와 방향 설정','계약·착수금·필수 브리프가 준비되면 리서치를 시작합니다. 타깃과 시장, 브랜드의 자산을 살펴보고 판단 근거와 방향을 함께 확인합니다.','브리프 → 근거 정리 → 전략 방향 승인'],
['03','Design & develop.','디자인과 구체화','합의한 방향을 바탕으로 시각 표현을 탐색합니다. 피드백과 제작 조건을 반영해 디자인을 다듬고, 필요한 매체로 확장합니다.','비주얼 방향 → 디자인 검토 → 응용·제작 검수'],
['04','Deliver & use.','납품과 활용','최종 승인한 결과물을 합의된 형식으로 정리합니다. 인쇄와 운영에 필요한 사용 기준을 함께 전달하고, 적용 시 확인할 사항을 안내합니다.','최종 승인 → 파일·가이드 전달 → 활용 안내']
].map(([n,t,k,p,o])=><article key={n}><span>{n}</span><div><h2>{t}</h2><h3>{k}</h3><p>{p}</p><span className="process-output">{o}</span></div></article>)}</div></section><FAQ/><ContactInvite/></>}
