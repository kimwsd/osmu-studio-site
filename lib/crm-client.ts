import {cmsClient} from './cms-client';
import type {Lead} from './crm';
export async function loadLeads(includeTests=false){const rows:Lead[]=[];for(let page=0;;page++){let query=cmsClient().from('crm_leads').select('*');if(!includeTests)query=query.eq('is_test',false);const {data,error}=await query.order('created_at',{ascending:false}).order('id').range(page*1000,page*1000+999);if(error)throw new Error(error.message);rows.push(...(data||[]));if((data?.length||0)<1000)return rows}}
export async function loadInquiryCount(start:string,end:string,leads:Lead[]){
 const until=new Date(end+'T00:00:00+09:00');until.setTime(until.getTime()+86400000);
 const query=()=>cmsClient().from('inquiries').select('id',{count:'exact',head:true}).gte('created_at',start+'T00:00:00+09:00').lt('created_at',until.toISOString());
 const result=await query();if(result.error||result.count===null)throw Error(result.error?.message||'문의 건수를 확인하지 못했습니다.');
 const tests=[...new Set(leads.filter(l=>l.is_test&&l.inquiry_id).map(l=>l.inquiry_id!))];let excluded=0;
 for(let i=0;i<tests.length;i+=200){const r=await query().in('id',tests.slice(i,i+200));if(r.error||r.count===null)throw Error(r.error?.message||'테스트 문의 건수를 확인하지 못했습니다.');excluded+=r.count}
 if(excluded>result.count)throw Error('문의 기록이 변경되었습니다. 다시 조회해 주세요.');return result.count-excluded;
}
