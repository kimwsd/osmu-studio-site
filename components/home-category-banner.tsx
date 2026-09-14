
import { categories } from '@/lib/project-categories';
import Link from 'next/link';

export default function HomeCategoryBanner(){
  return <section className="home-category-banner" aria-label="OSMU STUDIO 작업 분야">
    <div className="category-banner-rule" aria-hidden="true"><span>OSMU STUDIO · Creative practice</span><span>Brand & Design</span></div>
    <div className="category-banner-content">
      <Link href="/work/" aria-label="OSMU STUDIO 작업 보기"><img className="category-banner-logo" src="/logo.svg" width="242" height="33" alt="OSMU STUDIO"/></Link>
      <ul className="category-banner-tags" aria-label="제공 분야">{categories.filter(category=>category!=='All').map(category=><li key={category}><Link href={`/work/?category=${encodeURIComponent(category)}`} aria-label={`${category} 작업 보기`}>{category}</Link></li>)}</ul>
    </div>
    <div className="category-banner-rule" aria-hidden="true"><span>osmu-studio.com</span><span>Ideas into identity.</span></div>
  </section>;
}
