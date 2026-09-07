import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Hero from '@/components/hero';
import Showreel from '@/components/showreel';
import WorkGrid from '@/components/work-grid';
import { getProjects } from '@/lib/projects';
export const metadata={alternates:{canonical:'/'}};
const stories=[{label:'Our approach',title:'좋은 디자인의 시작은, 좋은 질문.',image:'creative-collaboration',href:'/studio',copy:'전략과 감각을 연결하는 오스무 스튜디오의 생각.'},{label:'Identity & Packaging',title:'한눈에 알아보고, 손끝에 기억되도록.',image:'package-system',href:'/services/ci-bi',copy:'로고에서 제품 패키지까지 이어지는 브랜드의 표정.'},{label:'Our process',title:'질문에서 납품까지, 같은 방향으로.',image:'identity-system',href:'/process',copy:'함께 결정하고 확인하는 디자인 진행 과정.'},{label:'Motion & Content',title:'브랜드의 리듬을 만드는 방법.',image:'brand-film',href:'/services/brand-film',copy:'브랜드 자산을 움직임과 콘텐츠로 확장합니다.'}];
export default async function Home(){const projects=await getProjects();return <>
 <Hero projects={projects}/>
 <section className="ambition section-pad"><h2>Our Ambition</h2><p>We turn a clear thought into a brand people <Link href="/work">recognise</Link>, <Link href="/services">connect with</Link> and <Link href="/studio">remember</Link>.</p></section>
 <div className="reel-section section-pad"><Showreel/></div>
 <section className="selected-work section-pad"><h2 className="section-rule">Selected Work</h2><WorkGrid projects={projects.slice(0,5)}/><Link className="pill-button all-work-link" href="/work">View all work <ArrowRight size={18}/></Link></section>
 <section className="inside-osmu section-pad"><h2 className="section-rule">Inside OSMU</h2><div className="story-grid">{stories.map(s=><article className="story-card" key={s.href}><Link href={s.href} className="story-image"><img src={`/assets/work-generated/${s.image}-02.webp`} alt={s.title} width="800" height="900" loading="lazy"/><span className="read-more-strip" aria-hidden="true"><span>READ MORE　READ MORE　READ MORE　</span><span>READ MORE　READ MORE　READ MORE　</span></span></Link><span className="story-category">{s.label}</span><h3><Link href={s.href}>{s.title}</Link></h3><p>{s.copy}</p><Link className="text-link" href={s.href}><ArrowRight size={16}/>Full story</Link></article>)}</div></section>
 <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({'@context':'https://schema.org','@type':'ProfessionalService',name:'OSMU STUDIO',alternateName:'오스무 스튜디오',url:'https://osmu-studio.com',logo:'https://osmu-studio.com/logo.svg',email:'osmu_studio@naver.com',description:'브랜드 전략에서 그래픽과 패키지까지, 브랜드의 시각적 정체성을 만드는 디자인 스튜디오',address:{'@type':'PostalAddress',addressLocality:'Cheonan',addressCountry:'KR'}})}}/>
 </>}
