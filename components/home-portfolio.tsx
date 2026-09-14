'use client';
import type { Project } from '@/lib/projects';
import WorkGrid from '@/components/work-grid';

export default function HomePortfolio({projects}:{projects:Project[]}){
  return <section className="home-portfolio section-pad" aria-labelledby="home-portfolio-title">
    <h2 id="home-portfolio-title" className="sr-only">Selected Work</h2>
    <WorkGrid projects={projects} initialLimit={28} moreStep={28} variant="home"/>
  </section>;
}
