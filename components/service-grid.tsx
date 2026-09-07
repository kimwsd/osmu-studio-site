import Link from 'next/link';
import { services } from '@/lib/services';
export default function ServiceGrid(){
 return <div className="service-rows" role="list" aria-label="서비스 목록">{services.map(service=><Link key={service.slug} href={`/services/${service.slug}`} className="service-row" role="listitem" aria-label={`${service.koreanTitle} 서비스 보기`}><span className="service-number">{service.number}</span><h3 className="service-title"><span className="service-title-en" aria-hidden="true">{service.title}</span><span className="service-title-ko">{service.koreanTitle}</span></h3><p>{service.rowCopy}</p></Link>)}</div>;
}
