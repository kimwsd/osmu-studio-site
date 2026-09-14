
import { categories } from '@/lib/project-categories';
import Link from 'next/link';

export default function HomeCategoryBanner(){
  return <section className="home-category-banner" aria-label="OSMU STUDIO 작업 분야">
    <div className="category-banner-rule" aria-hidden="true"><span>OSMU STUDIO · Creative practice</span><span>Brand & Design</span></div>
    <div className="category-banner-content">
      <Link href="/work/" aria-label="OSMU STUDIO 작업 보기"><img className="category-banner-logo" src="/logo.svg" width="242" height="33" alt="OSMU STUDIO"/></Link>
      <ul className="category-banner-tags" aria-label="제공 분야">{categories.filter(category=>category!=='All').map(category=><li key={category}><Link href="/work/" aria-label={`${category} — 워크 페이지 보기`}>{category}</Link></li>)}</ul>
      <a className="category-banner-social" href="https://www.instagram.com/studio_osmu/" target="_blank" rel="noopener noreferrer"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg><span>@studio_osmu</span></a>
    </div>
    <div className="category-banner-rule" aria-hidden="true"><span>osmu-studio.com</span><span>Ideas into identity.</span></div>
  </section>;
}
