import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Hero from '@/components/hero';
import Showreel from '@/components/showreel';
import HomeSelected from '@/components/home-selected';
import HomeEditorial from '@/components/home-editorial';
import { homeHero } from '@/lib/home-selected';
import './home-selected.css';
export const metadata={title:'천안 브랜딩·그래픽·패키지 디자인 스튜디오',description:'브랜드 진단과 브랜딩부터 그래픽, 패키지, 사진·영상, 마케팅과 디지털 경험까지 설계하는 천안의 오스무 스튜디오입니다.',alternates:{canonical:'/'}};
export default function Home(){return <>
 <Hero projects={homeHero}/>
 <HomeEditorial section="ambition"/>
 <div className="reel-section section-pad"><Showreel src="/assets/osmu-showreel-2026.mp4" poster="/assets/osmu-showreel-2026-poster.webp" label="OSMU STUDIO 아이디어 쇼릴" caption="OSMU ideas / 2026"/></div>
 <section className="selected-work section-pad"><h2 className="section-rule">Selected Work</h2><HomeSelected/><Link className="pill-button all-work-link" href="/work">View all work <ArrowRight size={18}/></Link></section>
 </>}
