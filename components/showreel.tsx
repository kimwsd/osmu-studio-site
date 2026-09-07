'use client';
import { useEffect, useRef, useState } from 'react';
import { Pause, Play, Maximize } from 'lucide-react';
export default function Showreel(){
 const video=useRef<HTMLVideoElement>(null),[playing,setPlaying]=useState(false),[failed,setFailed]=useState(false);
 useEffect(()=>{const el=video.current;if(!el)return;const observer=new IntersectionObserver(([entry])=>{if(!entry.isIntersecting)el.pause();},{threshold:.15});observer.observe(el);return()=>observer.disconnect();},[]);
 async function toggle(){if(!video.current)return;if(playing)video.current.pause();else try{await video.current.play();setFailed(false);}catch{setFailed(true);}}
 return <figure className={`showreel ${playing?'is-playing':''}`}><video ref={video} src="/assets/osmu-concept-reel.mp4" poster="/assets/work-generated/brand-film-01.webp" muted playsInline loop preload="none" onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onError={()=>setFailed(true)} aria-label="OSMU 자체 콘셉트 비주얼 쇼릴"/><button className="reel-toggle" onClick={toggle} aria-label={playing?'쇼릴 일시 정지':'쇼릴 재생'}>{playing?<Pause/>:<Play fill="currentColor"/>}</button><div className="reel-caption"><span>OSMU STUDIO</span><span>Concept reel / 2026</span><button aria-label="쇼릴 전체 화면" onClick={()=>{const el=video.current;if(el?.requestFullscreen)void el.requestFullscreen().catch(()=>setFailed(true));}}><Maximize size={18}/></button></div>{failed&&<p className="reel-error" role="status">영상 재생이 지원되지 않습니다. 아래 프로젝트 이미지를 확인해 주세요.</p>}<figcaption className="sr-only">자체 콘셉트 이미지로 구성한 스튜디오 비주얼 쇼릴입니다.</figcaption></figure>;
}
