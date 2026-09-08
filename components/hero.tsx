'use client';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';
import type { Project } from '@/lib/projects';
type HeroProject = Pick<Project,'slug'|'name'|'cat'|'summary'|'images'|'concept'> & {href?:string};
export default function Hero({projects,uncropped=false}:{projects:HeroProject[];uncropped?:boolean}) {
 const slides=projects.filter(p=>p.images.length).slice(0,8);
 const [index,setIndex]=useState(0),[paused,setPaused]=useState(false),[visible,setVisible]=useState(true),[reduced,setReduced]=useState(true);
 const stage=useRef<HTMLElement>(null),start=useRef<{x:number;y:number}|null>(null),dragged=useRef(false);
 const move=useCallback((direction:number)=>setIndex(i=>(i+direction+slides.length)%slides.length),[slides.length]);
 useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(media.matches);update();media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);
 useEffect(()=>{const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{threshold:.2});if(stage.current)observer.observe(stage.current);return()=>observer.disconnect();},[]);
 useEffect(()=>{if(paused||reduced||!visible||slides.length<2)return;const timer=setInterval(()=>{if(!document.hidden)move(1);},6000);return()=>clearInterval(timer);},[index,paused,reduced,visible,move,slides.length]);
 if(!slides.length)return null;
 return <section ref={stage} className="hero-slider" data-uncropped={uncropped} aria-label="대표 프로젝트 슬라이더" aria-roledescription="carousel" onKeyDown={e=>{if(e.key==='ArrowRight'){move(1);setPaused(true);}if(e.key==='ArrowLeft'){move(-1);setPaused(true);}}} onPointerDown={e=>{dragged.current=false;start.current={x:e.clientX,y:e.clientY};}} onPointerCancel={()=>{start.current=null;}} onPointerUp={e=>{const point=start.current;start.current=null;if(point&&Math.abs(e.clientX-point.x)>70&&Math.abs(e.clientY-point.y)<65){dragged.current=true;move(e.clientX>point.x?-1:1);setPaused(true);}}} onClickCapture={e=>{if(dragged.current){e.preventDefault();e.stopPropagation();dragged.current=false;}}}>
 <h1 className="sr-only">OSMU STUDIO — 브랜드의 생각을 사람들이 만나는 형태로.</h1>
 <div className="hero-track" style={{transform:`translate3d(-${index*100}%,0,0)`}}>{slides.map((p,i)=><article className="hero-slide" key={p.slug} aria-hidden={i!==index} inert={i!==index} aria-roledescription="slide" aria-label={`${i+1} / ${slides.length}`}>
 <img className="hero-media" src={p.images[0]} alt={`${p.name} — ${p.concept?'OSMU 콘셉트 비주얼':p.cat}`} width="1600" height="900" fetchPriority={i===0?'high':'auto'} loading={i===0||i===index||i===(index+1)%slides.length?'eager':'lazy'}/>
 <Link href={p.href||`/work/${p.slug}`} className="hero-project cursor-swarr" draggable={false} onFocus={()=>setPaused(true)} tabIndex={i===index?0:-1}><div className="hero-caption" key={`${p.slug}-${i===index}`}><span>{p.name}</span><p>{p.summary}</p><small>{p.concept?'Concept Project / 가상 브랜드':p.cat}</small></div><span className="sr-only">프로젝트 보기</span></Link>
 </article>)}</div>
 <button className="hero-zone hero-prev cursor-prev" aria-label="이전 프로젝트" onClick={()=>{move(-1);setPaused(true);}}/><button className="hero-zone hero-next cursor-next" aria-label="다음 프로젝트" onClick={()=>{move(1);setPaused(true);}}/>
 <div className="hero-controls"><button aria-label={paused||reduced?'슬라이드 자동 재생':'슬라이드 일시 정지'} aria-pressed={paused||reduced} onClick={()=>{if(reduced){setReduced(false);setPaused(false);}else setPaused(!paused);}}>{paused||reduced?<Play size={16}/>:<Pause size={16}/>}</button><button className="mobile-slide-arrow" aria-label="이전 슬라이드" onClick={()=>{move(-1);setPaused(true);}}><ArrowLeft size={20}/></button><span className="slide-counter" aria-live={paused?'polite':'off'}>{String(index+1).padStart(2,'0')}/{String(slides.length).padStart(2,'0')}</span><button className="mobile-slide-arrow" aria-label="다음 슬라이드" onClick={()=>{move(1);setPaused(true);}}><ArrowRight size={20}/></button></div>
 </section>;
}
