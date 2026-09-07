'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import config from '@/lib/public-config.json';
import { homeDefaults, mergeHomeContent, type HomeContent } from '@/lib/home-content';

export default function HomeEditorial({section}:{section:'ambition'|'stories'}){
  const [content, setContent] = useState<HomeContent>(homeDefaults);

  useEffect(()=>{
    let active = true;
    fetch(`${config.url}/rest/v1/settings?id=eq.1&select=home_content`, {
      headers:{apikey:config.anonKey}, cache:'no-store'
    })
      .then(response=>response.ok ? response.json() : [])
      .then(rows=>{ if(active && Array.isArray(rows) && rows[0]) setContent(mergeHomeContent(rows[0].home_content)); })
      .catch(()=>{});
    return ()=>{ active = false; };
  },[]);

  if(section === 'ambition') return <section className="ambition section-pad"><h2>{content.ambitionEyebrow}</h2><p>{content.ambition}</p></section>;
  return <section className="inside-osmu section-pad"><h2 className="section-rule">{content.insideTitle}</h2><div className="story-grid">{content.stories.map(story=><article className="story-card" key={story.href}><Link href={story.href} className="story-image"><img src={`/assets/work-generated/${story.image}-02.webp`} alt={story.title} width="800" height="900" loading="lazy"/><span className="read-more-strip" aria-hidden="true"><span>READ MORE　READ MORE　READ MORE　</span><span>READ MORE　READ MORE　READ MORE　</span></span></Link><span className="story-category">{story.label}</span><h3><Link href={story.href}>{story.title}</Link></h3><p>{story.copy}</p><Link className="text-link" href={story.href}><ArrowRight size={16}/>Full story</Link></article>)}</div></section>;
}
