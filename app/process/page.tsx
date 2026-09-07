import {FAQ,FAQJsonLd,ContactInvite} from '@/components/sections';

const steps=[
 ['01','Align & Scope.','프로젝트 정렬','목표·우선순위·예산·일정·의사결정자를 정리해, 해결할 문제와 이번 단계의 범위를 먼저 합의합니다.'],
 ['02','Discover & Diagnose.','맥락 조사와 진단','브랜드 자산, 고객 경험, 경쟁 환경, 판매 채널과 제작 조건을 살펴 사실과 가설을 구분합니다.'],
 ['03','Define the Direction.','전략 방향 결정','타깃에게 남길 인상, 포지셔닝, 핵심 메시지와 성공 기준을 정리해 다음 디자인의 판단 기준을 승인합니다.'],
 ['04','Build the System.','정체성 설계','언어, 로고, 컬러, 그래픽과 이미지의 역할을 하나의 시스템으로 설계해 모든 접점에서 같은 인상을 만듭니다.'],
 ['05','Prototype & Produce.','응용·제작 검증','우선순위 매체에 적용하고 규격, 소재, 예산과 구현 가능성을 확인합니다. 검토를 거쳐 제작용 파일로 정리합니다.'],
 ['06','Launch & Learn.','런칭·운영 인수','최종 파일과 가이드를 전달하고 실제 적용 후 보완 지점을 확인합니다. 다음 캠페인과 확장 작업에 재사용할 기준을 남깁니다.']
] as const;

export const metadata={title:'브랜딩 프로세스 — 진단에서 운영까지',description:'목표와 범위 정리, 브랜드 진단, 전략 방향, 디자인 시스템, 제작 검증과 런칭·운영 인수까지 오스무 스튜디오의 브랜드 프로젝트 진행 과정을 소개합니다.',alternates:{canonical:'/process'}};

export default function ProcessPage(){
 return <><section className="page-intro section-pad"><h1>Good work moves from a shared question to a system that works in the real world.</h1><p className="intro-note">좋은 결과는 감각만으로 진행되지 않습니다. 확인할 사실, 승인할 결정과 제작 조건을 단계마다 맞춰 브랜드가 현장에서 작동하도록 만듭니다.</p></section><section className="process-content section-pad"><h2 className="section-rule">Our process</h2><div className="service-rows process-rows" role="list" aria-label="OSMU 프로젝트 진행 과정">{steps.map(([number,title,korean,copy])=><article key={number} className="service-row process-row" role="listitem" tabIndex={0}><span className="service-number">{number}</span><h3 className="service-title"><span className="service-title-en" aria-hidden="true">{title}</span><span className="service-title-ko">{korean}</span></h3><p>{copy}</p></article>)}</div></section><FAQ/><FAQJsonLd/><ContactInvite/></>;
}
