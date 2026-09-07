'use client';

import Link from 'next/link';
import type { Project } from '@/lib/projects';

export default function Hero({projects}:{projects:Project[]}) {
 const cards=projects.filter(project=>project.images.length).slice(0,7);
 if(!cards.length)return null;
 return <section className={`hero-collage hero-collage-count-${cards.length}`} aria-label="대표 프로젝트">
   <h1 className="sr-only">OSMU STUDIO — 브랜드의 생각을 사람들이 만나는 형태로.</h1>
   <div className="hero-collage-stage">
     {cards.map((project,index)=><Link key={project.slug} href={`/work/${project.slug}`} className={`hero-collage-card hero-collage-card-${index+1} cursor-swarr`} aria-label={`${project.name} 프로젝트 보기`}>
       <img src={project.images[0]} alt={`${project.name} — OSMU 프로젝트 비주얼`} width="1600" height="900" fetchPriority={index<2?'high':'auto'} loading={index<3?'eager':'lazy'}/>
       <span className="hero-collage-caption"><b>{project.name}</b><small>{project.concept?'Concept Project / 가상 브랜드':project.cat}</small></span>
     </Link>)}
     <p className="hero-collage-index" aria-hidden="true">OSMU STUDIO<br/>SELECTED PROJECTS</p>
   </div>
 </section>;
}
