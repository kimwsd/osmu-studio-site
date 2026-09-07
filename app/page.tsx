import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Hero from '@/components/hero';
import Showreel from '@/components/showreel';
import WorkGrid from '@/components/work-grid';
import HomeEditorial from '@/components/home-editorial';
import { getProjects } from '@/lib/projects';
export const metadata={alternates:{canonical:'/'}};
export default async function Home(){const projects=await getProjects();return <>
 <Hero projects={projects}/>
 <HomeEditorial section="ambition"/>
 <div className="reel-section section-pad"><Showreel/></div>
 <section className="selected-work section-pad"><h2 className="section-rule">Selected Work</h2><WorkGrid projects={projects.slice(0,5)}/><Link className="pill-button all-work-link" href="/work">View all work <ArrowRight size={18}/></Link></section>
 <HomeEditorial section="stories"/>
 <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({'@context':'https://schema.org','@type':'ProfessionalService',name:'OSMU STUDIO',alternateName:'오스무 스튜디오',url:'https://osmu-studio.com',logo:'https://osmu-studio.com/logo.svg',email:'osmu_studio@naver.com',description:'브랜드 전략에서 그래픽과 패키지까지, 브랜드의 시각적 정체성을 만드는 디자인 스튜디오',address:{'@type':'PostalAddress',addressLocality:'Cheonan',addressCountry:'KR'}})}}/>
 </>}
