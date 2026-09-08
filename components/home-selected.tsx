import { homeSelected } from '@/lib/home-selected';

export default function HomeSelected(){
  return <div className="home-selected-grid">{homeSelected.map(project=><figure className={`home-selected-card home-selected-${project.slug}`} id={`project-${project.slug}`} key={project.slug}>
    <img src={project.images[0]} alt={`${project.name} — ${project.summary}`} width={project.width} height={project.height} loading="lazy" decoding="async"/>
    <figcaption><h3>{project.name}</h3><p>{project.cat}</p></figcaption>
  </figure>)}</div>;
}
