'use client';
import type { Project } from '@/lib/projects';
import WorkGrid from '@/components/work-grid';

export default function HomePortfolio({projects}:{projects:Project[]}){
  return <section className="home-portfolio section-pad" aria-labelledby="home-portfolio-title">
    <div className="home-portfolio-heading"><h2 id="home-portfolio-title">Selected Work</h2><p>브랜드가 실제 접점에서 작동하는 순간을 기록합니다.</p></div>
    <WorkGrid projects={projects} initialLimit={28} moreStep={28} variant="home"/>
  </section>;
}
