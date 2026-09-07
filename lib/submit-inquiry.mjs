import {validateInquiry} from './inquiry-validation.mjs';
export async function submitInquiry(input,config,serviceTitle,fetcher=fetch){
 const result=validateInquiry(input);
 if(result.error||!result.data)throw new Error(result.error||'문의 내용을 확인해 주세요.');
 const rec={...result.data,type:serviceTitle||'기타'};
 const response=await fetcher(`${config.url}/rest/v1/inquiries`,{method:'POST',headers:{'Content-Type':'application/json',apikey:config.anonKey,Prefer:'return=minimal'},body:JSON.stringify(rec),signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw new Error('현재 문의 접수에 연결할 수 없습니다. 잠시 후 다시 시도하거나 이메일로 문의해 주세요.');
 // Only notify after the database has accepted the inquiry. Notification failure must not invite a duplicate submission.
 await fetcher('https://formsubmit.co/ajax/osmu_studio@naver.com',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({_subject:`[프로젝트 문의] ${rec.name} — ${rec.type}`,_template:'table',_captcha:'false','이름/상호':rec.name,'회신 이메일':rec.email,'연락처':rec.phone,'문의 유형':rec.type,'예상 예산':rec.budget||'-','프로젝트 내용':rec.message||'(내용 없음)'}),signal:AbortSignal.timeout(2000)}).catch(()=>{});
}
