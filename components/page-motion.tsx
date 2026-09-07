'use client';
import {useEffect} from 'react';
import {usePathname} from 'next/navigation';
export default function PageMotion(){const path=usePathname();useEffect(()=>{
 const media=matchMedia('(prefers-reduced-motion: reduce)');if(media.matches)return;
 const main=document.querySelector('main');const transition=main?.animate([{opacity:0},{opacity:1}],{duration:500,easing:'ease-out'});
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;entry.target.animate([{opacity:0,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}],{duration:700,easing:'cubic-bezier(.2,.7,.2,1)'});observer.unobserve(entry.target);}),{threshold:.08});
 document.querySelectorAll('.project-card,.story-card,.studio-values article,.process-steps article,.service-grid article').forEach(el=>{if(el.getBoundingClientRect().top>innerHeight)observer.observe(el);});
 return()=>{observer.disconnect();transition?.cancel();};
 },[path]);return null;}
