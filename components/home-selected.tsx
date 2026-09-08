import { homeSelected } from '@/lib/home-selected';

export default function HomeSelected(){
  return <div className="home-selected-list">{homeSelected.map((project,projectIndex)=><article className={`home-selected-case home-selected-${project.slug}`} data-home-project={project.slug} key={project.slug}>
    <header className="home-selected-intro"><div><span>{String(projectIndex+1).padStart(2,'0')}</span><h3>{project.name}</h3><p>{project.cat}</p></div><p>{project.summary}</p></header>
    <div className="home-selected-media" aria-label={`${project.name} 프로젝트 이미지`}>
      {['lead','poster','system','application'].map((view,imageIndex)=><a className={`home-selected-view home-selected-view-${view}`} href={project.href} aria-label={`${project.name} 프로젝트 상세 보기`} key={view}>
        <span className="home-selected-artboard"><img src={project.images[0]} alt={imageIndex===0?`${project.name} — ${project.summary}`:''} width={project.width} height={project.height} loading="lazy" decoding="async"/></span>
      </a>)}
    </div>
  </article>)}</div>;
}
