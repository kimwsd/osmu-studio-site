import Link from 'next/link';
import { ArrowUpRight, Plus } from 'lucide-react';
import ServiceGrid from '@/components/service-grid';
export const faqEntries=[
['기획 단계에서 문의해도 되나요?','브랜드의 상황과 필요한 작업만 간단히 알려주세요. 첫 상담에서 작업 범위와 일정을 정리하고, 계약·착수금·브리프 확인 후 본격적인 리서치를 시작합니다.'],
['패키지 디자인만 맡길 수 있나요?','가능합니다. 제품 규격, 판매 채널, 제작 방식과 기존 브랜드 자료를 확인해 필요한 디자인 범위를 제안합니다.'],
['기존 로고를 유지하면서 작업할 수 있나요?','현재 로고와 그래픽 자산을 먼저 살펴봅니다. 유지할 기준을 정한 뒤 패키지, 인쇄물, 디지털 콘텐츠에 적용할 체계를 만듭니다.'],
['견적을 받으려면 무엇을 알려드려야 하나요?','작업 종류, 제품이나 품목 수, 희망 납기와 예상 예산을 알려주세요. 제작·인쇄가 필요한 경우 그 범위도 함께 확인해 제안드립니다.']
] as const;
export function ServiceRows() {
 return <ServiceGrid/>;
}
export function ContactInvite(){return <section className="contact-invite section-pad"><div><h2>Have a project in mind?</h2><p>필요한 작업과 일정을 들려주세요.</p></div><Link className="button" href="/contact">프로젝트 문의하기 <ArrowUpRight size={18}/></Link></section>}
export function Growth(){return <section className="touchpoints section-pad"><div className="split-heading"><h2>One idea.<br/>Many touchpoints.</h2><div><h3>A brand people recognise,<br/>wherever they meet it.</h3><p>포장지 한 장부터 화면 속 작은 이미지까지.<br/>매체의 크기와 쓰임에 맞춰 브랜드의 인상을 이어갑니다.</p></div></div><div className="touchpoint-wall">{['Identity','Packaging','Editorial','Signage','Digital','Motion','Campaign','Guidelines'].map(t=><span key={t}>{t}</span>)}</div></section>}
export function FAQ(){return <section className="faq section-pad"><h2>Before we start.</h2><div className="faq-items">{faqEntries.map(([q,a])=><details key={q}><summary>{q}<Plus size={20}/></summary><p>{a}</p></details>)}</div></section>}
export function FAQJsonLd(){const schema={'@context':'https://schema.org','@type':'FAQPage',mainEntity:faqEntries.map(([name,text])=>({'@type':'Question',name,acceptedAnswer:{'@type':'Answer',text}}))};return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/>}
