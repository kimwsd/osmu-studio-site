import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, ArrowLeft } from 'lucide-react';
import { services, getService } from '@/lib/services';
import { serviceVisuals } from '@/lib/service-visuals';
type Props = {params: Promise<{slug:string}>};
export const dynamicParams=false;
export function generateStaticParams() {return [...services.map(({slug}) => ({slug})),...['brand-identity','packaging','space-design'].map(slug=>({slug}))];}
export async function generateMetadata({params}: Props) { const {slug} = await params; const service = getService(slug); return {title: service?.title, description: service?.description, alternates:{canonical:`/services/${service?.slug || slug}`}}; }
export default async function ServicePage({params}: Props) {
  const {slug}=await params; const s=getService(slug); if(!s) notFound(); const visual=serviceVisuals[s.slug];
  return <><section className="service-detail section-pad"><Link href="/services" className="text-link"><ArrowLeft size={16}/> All services</Link><div className="page-heading"><span className="eyebrow">SERVICE / {s.number}</span><h1>{s.title.split(' & ')[0]}{s.title.includes(' & ') && <><br/><em>& {s.title.split(' & ')[1]}</em></>}</h1><h2>{s.korean}</h2></div><div className="service-detail-grid"><figure className="service-visual" data-service-visual={s.slug}><div className="service-visual-images">{visual.images.map(image=><div key={image.src}>{image.label&&<p className="service-visual-label">{image.label}</p>}<a href={image.src} target="_blank" rel="noopener noreferrer" aria-label={`${image.alt} — 원본 이미지 크게 보기`}><img src={image.src} alt={image.alt} width={image.width} height={image.height}/></a></div>)}</div><figcaption><strong>{visual.title}</strong><p>{visual.caption}</p><small>{visual.note}</small></figcaption></figure><div><span className="eyebrow">WHEN YOU NEED US</span><h2>{s.intro}</h2><p className="service-answer"><strong>무엇을 제공하나요?</strong> 오스무 스튜디오는 {s.koreanTitle}을 통해 {s.outputs.slice(0,3).join(', ')} 등을 제공합니다.</p><p>{s.description}</p><ul>{s.outputs.map(o => <li key={o}>{o}</li>)}</ul><Link className="button" href={`/contact?service=${s.slug}`}>이 서비스 상담하기<ArrowUpRight size={18}/></Link></div></div></section></>;
}
