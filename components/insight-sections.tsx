import Link from 'next/link';
import type {Article} from '@/lib/content';

export function InsightSections({sections}:{sections:Article['sections']}){
 return <>{sections.map((section,i)=><section className="insight-guide-section" key={i} id={'section-'+i}>
  <span className="guide-number" aria-hidden="true">{String(i+1).padStart(2,'0')}</span>
  <h2>{section.title}</h2>
  {section.body.split('\n\n').map((p,j)=><p key={j}>{p}</p>)}
  {section.list&&<ul className="guide-checklist">{section.list.map((item,j)=><li key={j}>{item}</li>)}</ul>}
  {section.table&&<div className="guide-table-wrap"><table className="guide-table"><caption>{section.table.caption}</caption><thead><tr>{section.table.headers.map(h=><th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{section.table.rows.map((row,j)=><tr key={j}>{row.map((cell,k)=>k===0?<th scope="row" key={k}>{cell}</th>:<td key={k} data-label={section.table!.headers[k]}>{cell}</td>)}</tr>)}</tbody></table></div>}
  {section.note&&<aside className="guide-note"><strong>적용 전에 확인하세요</strong><p>{section.note}</p></aside>}
  {section.links&&<div className="guide-source-links">{section.links.map(link=>link.url.startsWith('/')?<Link key={link.url} href={link.url}>{link.name} →</Link>:<a key={link.url} href={link.url} target="_blank" rel="noreferrer">{link.name} ↗</a>)}</div>}
 </section>)}</>;
}
