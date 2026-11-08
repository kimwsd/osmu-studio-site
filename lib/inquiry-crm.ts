import {cmsClient} from './cms-client';

export type Inquiry={id:string;created_at:string;name:string;company:string|null;email:string;phone:string|null;message:string;status:string;services:string[]|null;attribution?:Record<string,string>|null};
export type InquiryCustomer={id:string;inquiry_id:string;archived_at:string|null};
export async function loadInquiryCustomers(ids:string[]):Promise<InquiryCustomer[]>{
 if(!ids.length)return [];
 const {data,error}=await cmsClient().from('crm_leads').select('id,inquiry_id,archived_at').in('inquiry_id',ids);
 if(error)throw error;
 return data||[];
}
export async function registerInquiryCustomer(inquiry:Inquiry):Promise<InquiryCustomer>{
 const existing=(await loadInquiryCustomers([inquiry.id]))[0];
 if(existing)return existing;
 // The unique inquiry_id also protects concurrent clicks from different admins.
 const {error}=await cmsClient().from('crm_leads').upsert({
  inquiry_id:inquiry.id,name:inquiry.name,company:inquiry.company||'',email:inquiry.email,
  phone:inquiry.phone||'',services:inquiry.services||[],request_message:inquiry.message,
  attribution:inquiry.attribution||{},source:'홈페이지 문의',created_at:inquiry.created_at,
 },{onConflict:'inquiry_id',ignoreDuplicates:true});
 if(error)throw error;
 const customer=(await loadInquiryCustomers([inquiry.id]))[0];
 if(!customer)throw new Error('등록된 고객을 확인하지 못했습니다. 다시 시도해 주세요.');
 return customer;
}
