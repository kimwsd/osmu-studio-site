import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Hero from '@/components/hero';
import Showreel from '@/components/showreel';
import WorkGrid from '@/components/work-grid';
import HomeEditorial from '@/components/home-editorial';
import { getProjects } from '@/lib/projects';
export const metadata={title:'천안 브랜딩·그래픽·패키지 디자인 스튜디오',description:'브랜드 진단과 브랜딩부터 그래픽, 패키지, 사진·영상, 마케팅과 디지털 경험까지 설계하는 천안의 오스무 스튜디오입니다.',alternates:{canonical:'/'}};
export default async function Home(){const projects=await getProjects();return <>
 <Hero projects={projects}/>
 <HomeEditorial section="ambition"/>
 <div className="reel-section section-pad"><Showreel/></div>
 <section className="selected-work section-pad"><h2 className="section-rule">Selected Work</h2><WorkGrid projects={projects.slice(0,5)}/><Link className="pill-button all-work-link" href="/work">View all work <ArrowRight size={18}/></Link></section>
 <HomeEditorial section="stories"/>
 </>}
