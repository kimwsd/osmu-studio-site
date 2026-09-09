'use client';
import { useEffect, useRef, useState } from 'react';
import { Pause, Play, Maximize } from 'lucide-react';
type ShowreelProps={src?:string;poster?:string;label?:string;caption?:string};
export default function Showreel({src='/assets/osmu-concept-reel-v2.mp4',poster='/assets/work-generated/v2/brand-film-01.webp',label='OSMU 자체 콘셉트 비주얼 쇼릴',caption='Concept reel / 2026'}:ShowreelProps){
 const video=useRef<HTMLVideoElement>(null),[playing,setPlaying]=useState(false),[failed,setFailed]=useState(false);
 useEffect(()=>{const el=video.current;if(!el)return;const observer=new IntersectionObserver(([entry])=>{if(!entry.isIntersecting)el.pause();},{threshold:.15});observer.observe(el);return()=>observer.disconnect();},[]);
 async function toggle(){if(!video.current)return;if(playing)video.current.pause();else try{await video.current.play();setFailed(false);}catch{setFailed(true);}}
 return <figure className={`showreel ${playing?'is-playing':''}`}><video ref={video} src={src} poster={poster} muted playsInline loop preload="none" onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onError={()=>setFailed(true)} aria-label={label}/><button className="reel-toggle" onClick={toggle} aria-label={playing?'쇼릴 일시 정지':'쇼릴 재생'}>{playing?<Pause/>:<Play fill="currentColor"/>}</button><div className="reel-caption"><span>OSMU STUDIO</span><span>{caption}</span><button aria-label="쇼릴 전체 화면" onClick={()=>{const el=video.current;if(el?.requestFullscreen)void el.requestFullscreen().catch(()=>setFailed(true));}}><Maximize size={18}/></button></div>{failed&&<p className="reel-error" role="status">영상 재생이 지원되지 않습니다. 아래 프로젝트 이미지를 확인해 주세요.</p>}<figcaption className="sr-only">{label}</figcaption></figure>;
}
