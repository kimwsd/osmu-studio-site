import Link from 'next/link';
import {ArrowUpRight,ArrowRight} from 'lucide-react';
import {services,serviceGroups} from '@/lib/content';
export function ServiceDirectory({variant='page',onNavigate}:{variant?:'page'|'menu'|'mobile';onNavigate?:()=>void}){
 return <div className={'service-directory service-directory-'+variant}>
  {serviceGroups.map((group,i)=><section className="service-group" key={group.id}><div className="service-group-heading"><span>0{i+1}</span><h3>{group.name}</h3></div><p className="service-group-description">{group.description}</p><div className="service-group-links">{group.slugs.map(slug=>{const s=services.find(x=>x.slug===slug)!;return <Link key={slug} href={'/services/'+slug} onClick={onNavigate}><span className="service-directory-title">{s.name}<ArrowUpRight size={17}/></span><span className="service-directory-summary">{s.intro}</span></Link>})}</div></section>)}
  <aside className="service-finder-card"><span className="eyebrow">FIND YOUR START</span><h3>지금 필요한<br/>첫 단계는?</h3><p>현재의 고민을 선택하고, 필요한 서비스와 제공 범위를 확인해 보세요.</p><Link href="/tools/plan-finder" onClick={onNavigate}>나에게 맞는 서비스 <ArrowRight size={18}/></Link><Link className="service-finder-secondary" href="/services/consulting" onClick={onNavigate}>함께 방향 정하기 <ArrowUpRight size={15}/></Link></aside>
 </div>
}
