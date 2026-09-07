'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowUpRight, LayoutGrid, List } from 'lucide-react';
import type { Project } from '@/lib/projects';
import { categories, categoryMatches } from '@/lib/project-categories';
export default function WorkGrid({projects,filters=false,initialLimit}:{projects:Project[];filters?:boolean;initialLimit?:number}){
 const [category,setCategory]=useState('All'),[list,setList]=useState(false),[limit,setLimit]=useState(initialLimit??projects.length);
 const matching=projects.filter(p=>categoryMatches(p,category)),shown=matching.slice(0,limit);
 return <>{filters&&<div className="work-toolbar"><div className="work-filters" role="group" aria-label="작업 분야 필터">{categories.map(cat=><button key={cat} onClick={()=>setCategory(cat)} aria-pressed={category===cat}>{cat}<sup>{projects.filter(p=>categoryMatches(p,cat)).length}</sup></button>)}</div><div className="view-switch" role="group" aria-label="작업 보기 방식"><button aria-label="그리드 보기" aria-pressed={!list} onClick={()=>setList(false)}><LayoutGrid size={18}/></button><button aria-label="목록 보기" aria-pressed={list} onClick={()=>setList(true)}><List size={20}/></button></div></div>}
 <p className="sr-only" role="status">{category}: {shown.length}개 프로젝트 표시</p><div key={`${category}-${list}`} className={`work-grid ${list?'work-list-view':''}`}>{shown.map(p=><Link className="project-card cursor-swarr" href={`/work/${p.slug}`} key={p.slug}><div className="project-image">{p.images[0]?<img src={p.images[0]} alt={`${p.name} ${p.cat} 작업`} width="1600" height="900" loading="lazy"/>:p.videos[0]?<video src={p.videos[0]} muted playsInline preload="metadata" aria-label={`${p.name} 영상`}/>:<div className="project-type-cover">{p.name}</div>}</div><div className="project-caption"><h3>{p.name}</h3><p>{p.summary||p.cat}</p><div className="project-tags"><span>{p.cat}</span><span>{p.concept?'Concept Project / 가상 브랜드':p.year}</span></div></div></Link>)}</div>
 {matching.length>limit&&<button className="load-more" onClick={()=>setLimit(projects.length)}>더보기</button>}
 {shown.length===0&&<div className="empty-state"><h3>이 분야의 작업을 준비하고 있습니다.</h3><p>필요한 작업을 알려주시면 진행 범위를 안내해드립니다.</p><Link className="text-link" href="/contact">문의하기 <ArrowUpRight size={18}/></Link></div>}</>;
}
