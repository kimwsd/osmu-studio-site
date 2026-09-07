import {notFound} from 'next/navigation';
import Link from 'next/link';
import {ArrowLeft,ArrowUpRight} from 'lucide-react';
import {getProject,getProjects} from '@/lib/projects';
import ProjectNarrative from '@/components/project-narrative';
import local from '@/lib/local-projects.json';
export const dynamicParams=false;
export async function generateStaticParams(){const projects=await getProjects();return [...new Set([...projects,...local.featured,...local.legacy].map(p=>p.slug))].map(slug=>({slug}));}
type Props={params:Promise<{slug:string}>};
export async function generateMetadata({params}:Props){const {slug}=await params,p=await getProject(slug);return {title:p?.name||'프로젝트를 찾을 수 없습니다',description:p?.summary,alternates:{canonical:`/work/${slug}`},openGraph:{images:p?.images[0]?[p.images[0]]:['/og-image.png']}};}
export default async function ProjectPage({params}:Props){const {slug}=await params,p=await getProject(slug);if(!p)notFound();const all=await getProjects(),index=all.findIndex(item=>item.slug===slug),next=all[(index+1)%all.length];return <article className="project-page">
 {p.images[0]&&<div className="project-cover"><img src={p.images[0]} alt={`${p.name} 대표 이미지`} width="1600" height="900" fetchPriority="high"/></div>}
 <section className="project-story section-pad"><div className="project-facts"><h1>{p.name}</h1><dl><dt>Discipline</dt><dd>{p.cat}</dd><dt>Year</dt><dd>{p.year}</dd><dt>Project type</dt><dd>{p.concept?'Concept Project / 가상 브랜드':p.loc||'—'}</dd></dl>{p.concept&&<p className="concept-note">서비스의 시각적 방향을 탐색한 자체 콘셉트 작업입니다. 실제 고객 프로젝트나 사업 성과를 나타내지 않습니다.</p>}{p.images[0]?.startsWith('/')&&<a className="pill-button" href={p.images[0]} download>Download project image</a>}</div><ProjectNarrative summary={p.summary||'브랜드의 생각을 형태로.'} body={p.body||'프로젝트의 상세한 작업 내용은 문의를 통해 안내해 드립니다.'}/></section>
 <div className="project-gallery">{p.images.slice(1).map((src,i)=><figure key={src}><img src={src} alt={`${p.name} 디자인 상세 ${i+1}`} width="1600" height="900" loading="lazy"/><figcaption>{p.name} — {String(i+2).padStart(2,'0')}</figcaption></figure>)}{p.videos.map(src=><video key={src} src={src} controls playsInline preload="metadata" aria-label={`${p.name} 프로젝트 영상`}/>)}</div>
 <div className="section-pad"><Link href="/work" className="text-link"><ArrowLeft size={16}/>All work</Link></div>{next&&next.slug!==slug&&<Link href={`/work/${next.slug}`} className="next-project section-pad"><span className="eyebrow">NEXT PROJECT</span><h2>{next.name}<ArrowUpRight strokeWidth={1}/></h2></Link>}
 </article>}
