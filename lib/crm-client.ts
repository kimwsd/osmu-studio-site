import {cmsClient} from './cms-client';
import type {Lead} from './crm';
export async function loadLeads(){const rows:Lead[]=[];for(let page=0;;page++){const {data,error}=await cmsClient().from('crm_leads').select('*').order('created_at',{ascending:false}).order('id').range(page*1000,page*1000+999);if(error)throw new Error(error.message);rows.push(...(data||[]));if((data?.length||0)<1000)return rows}}
