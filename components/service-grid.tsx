'use client';
import Link from 'next/link';
import { useRef } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { services } from '@/lib/services';
export default function ServiceGrid({expanded=false}:{expanded?:boolean}){
  const scroller=useRef<HTMLDivElement>(null);
  function move(direction:number){scroller.current?.scrollBy({left:296*direction,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
  return <div className="service-grid-wrap">{!expanded&&<div className="service-scroll-controls"><span>살펴보기</span><button aria-label="이전 서비스" onClick={()=>move(-1)}><ChevronLeft size={18}/></button><button aria-label="다음 서비스" onClick={()=>move(1)}><ChevronRight size={18}/></button></div>}<div ref={scroller} className={`service-grid ${expanded?'service-grid-full':''}`} tabIndex={0} role="region" aria-label="서비스 목록">{services.map(s=><article key={s.slug}><h3><Link href={`/services/${s.slug}`}>{s.title}.</Link></h3><ul>{s.outputs.map(o=><li key={o}>{o}</li>)}</ul><Link className="service-detail-link" href={`/services/${s.slug}`}>서비스 보기 <ArrowUpRight size={14}/></Link></article>)}</div></div>;
}
