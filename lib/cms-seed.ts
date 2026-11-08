import type {Article} from './content';
import type {PostDocument,ContentBlock} from './cms-types';

export function articleToDocument(a:Article):PostDocument{
 const blocks:ContentBlock[]=a.blocks||a.sections.flatMap((s,i)=>{
  const result:ContentBlock[]=[{id:`${i}-heading`,type:'heading',text:s.title},{id:`${i}-body`,type:'paragraph',text:s.body}];
  if(s.list)result.push({id:`${i}-list`,type:'list',text:s.list.join('\n')});
  if(s.table)result.push({id:`${i}-table`,type:'table',caption:s.table.caption,text:[s.table.headers,...s.table.rows].map(r=>r.join('\t')).join('\n')});
  if(s.note)result.push({id:`${i}-note`,type:'quote',text:s.note});
  if(s.links)result.push({id:`${i}-links`,type:'links',text:s.links.map(l=>l.name+' | '+l.url).join('\n')});
  return result;
 });
 const asset=({'3eo':'aeo-geo',consulting:'content'} as Record<string,string>)[a.service]||a.service;
 return {title:a.title,slug:a.slug,summary:a.summary,category:a.category,service:a.service,author:a.author||'3EO Editorial',cover:a.cover||`/images/editorial-${asset}.jpg`,coverAlt:a.coverAlt||a.summary,seoTitle:a.seoTitle||'',seoDescription:a.seoDescription||'',ogImage:a.ogImage||'',blocks,sources:a.sources,related:a.related||[]};
}
