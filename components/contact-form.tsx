"use client";
import {useRef,useState} from 'react';
import Link from 'next/link';
import {ArrowRight,CheckCircle2} from 'lucide-react';
import {services} from '@/lib/content';
import {readAttribution} from '@/lib/attribution';
import {trackEvent,trackLead} from '@/lib/tracking';
import {contactConfig} from '@/lib/contact-config';
export function ContactForm(){
 const [selected,setSelected]=useState<string[]>([]),[state,setState]=useState<'idle'|'sending'|'success'|'error'>('idle'),[message,setMessage]=useState(''),[reference,setReference]=useState('');
 const [fieldErrors,setFieldErrors]=useState<Record<string,string>>({});
 const request=useRef({payload:'',id:''});const busy=useRef(false);const started=useRef(false);const status=useRef<HTMLDivElement>(null);
 async function submit(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();if(busy.current)return;
  if(!contactConfig.enabled){setState('error');setMessage('온라인 접수를 준비 중입니다. osmu_studio@naver.com으로 문의해 주세요.');return;}
  const form=event.currentTarget;
  const fields=new FormData(form);
  const errors:Record<string,string>={};
  for(const [key,label] of [['name','이름을'],['company','회사 / 브랜드를'],['email','이메일을']])if(!String(fields.get(key)||'').trim())errors[key]=label+' 입력해 주세요.';
  if(!errors.email&&!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(String(fields.get('email')||'').trim()))errors.email='올바른 이메일 주소를 입력해 주세요.';
  setFieldErrors(errors);
  const first=Object.keys(errors)[0];
  if(first){setState('error');setMessage('필수 항목을 확인해 주세요.');(form.elements.namedItem(first) as HTMLInputElement)?.focus();return;}
  if(!selected.length){setState('error');setMessage('서비스를 한 가지 이상 선택해 주세요.');document.getElementById('service-error')?.focus();return;}
  if(!form.reportValidity())return;
  const data={attribution:readAttribution(),name:String(fields.get('name')||''),company:String(fields.get('company')||''),email:String(fields.get('email')||''),phone:String(fields.get('phone')||''),website:String(fields.get('website')||''),message:String(fields.get('message')||''),services:[...selected].sort(),consent:fields.get('consent')==='on',transferConsent:fields.get('transferConsent')==='on',consentVersion:contactConfig.consentVersion,fax:String(fields.get('fax')||'')};
  const payload=JSON.stringify(data);if(request.current.payload!==payload)request.current={payload,id:crypto.randomUUID()};
  busy.current=true;setState('sending');setMessage('상담 내용을 접수하고 있습니다.');
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),25000);
  try{
   const response=await fetch(contactConfig.endpoint,{method:'POST',headers:{'Content-Type':'application/json',apikey:contactConfig.publicAnonKey,Authorization:'Bearer '+contactConfig.publicAnonKey},body:JSON.stringify({...data,requestId:request.current.id}),signal:controller.signal});
   const result=await response.json();
   if(!response.ok||result.ok!==true||typeof result.reference!=='string')throw new Error(result.error||'접수 결과를 확인할 수 없습니다. 잠시 후 다시 시도해 주세요.');
   trackLead(result.reference);setReference(result.reference);setState('success');setMessage('상담이 접수되었습니다. 내용을 확인한 뒤 입력하신 이메일로 연락드리겠습니다.');
  }catch(error){setState('error');setMessage(error instanceof Error&&error.name==='AbortError'?'접수 결과 확인이 지연되고 있습니다. 같은 내용으로 다시 시도하면 중복 접수를 방지합니다.':error instanceof Error?error.message:'접수에 실패했습니다. 잠시 후 다시 시도해 주세요.');}
  finally{clearTimeout(timer);busy.current=false;setTimeout(()=>status.current?.focus(),0)}
 }
 if(state==='success')return <div className="contact-success" ref={status} role="status" tabIndex={-1}><CheckCircle2 size={36}/><span className="eyebrow">REQUEST RECEIVED</span><h2>상담이 접수되었습니다.</h2><p>{message}</p><dl><dt>접수번호</dt><dd>{reference}</dd></dl><p>추가 자료는 <a href="mailto:osmu_studio@naver.com">osmu_studio@naver.com</a>으로 접수번호와 함께 보내주세요.</p><button className="button outline" type="button" onClick={()=>{setState('idle');setSelected([]);setReference('');setMessage('');request.current={payload:'',id:''}}}>새 문의 작성</button></div>;
 return <form onFocusCapture={()=>{if(!started.current){started.current=true;trackEvent('contact_start',{content_group:'contact'})}}} noValidate className="contact-form" onSubmit={submit} onInvalidCapture={event=>{const field=event.target;if(field instanceof HTMLInputElement){const labels:Record<string,string>={name:'이름을',company:'회사 / 브랜드를',email:'이메일을'};if(labels[field.name])field.setCustomValidity(field.name==='email'&&field.value?'올바른 이메일 주소를 입력해 주세요.':labels[field.name]+' 입력해 주세요.');else if(field.name==='phone')field.setCustomValidity('전화번호를 숫자와 +, -, 괄호로 입력해 주세요.')}}} onInputCapture={event=>{const field=event.target;if(field instanceof HTMLInputElement){field.setCustomValidity('');setFieldErrors(current=>({...current,[field.name]:''}))}}} aria-busy={state==='sending'}>
 {!contactConfig.enabled&&<div className="preview-note">온라인 접수를 준비 중입니다. 실제 상담은 <a href="mailto:osmu_studio@naver.com">osmu_studio@naver.com</a>으로 보내주세요.</div>}
 <fieldset disabled={state==='sending'} className="contact-fields"><fieldset><legend>어떤 도움이 필요하신가요? <small>복수 선택</small></legend><div className="choice-list">{services.map(s=><label key={s.slug}><input type="checkbox" value={s.slug} checked={selected.includes(s.slug)} onChange={()=>{if(!selected.includes(s.slug))trackEvent('select_service',{service:s.slug});setSelected(current=>current.includes(s.slug)?current.filter(x=>x!==s.slug):[...current,s.slug])}}/><span>{s.name}</span></label>)}</div><small id="service-error" tabIndex={-1}>서비스를 한 가지 이상 선택해 주세요.</small></fieldset>
 <div className="form-grid"><label>이름 <small>필수</small><input required pattern={String.raw`.*\S.*`} aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name?'name-error':undefined} name="name" autoComplete="name" placeholder="담당자 이름" maxLength={80}/>{fieldErrors.name&&<small className="field-error" id="name-error">{fieldErrors.name}</small>}</label><label>회사 / 브랜드 <small>필수</small><input required pattern={String.raw`.*\S.*`} aria-invalid={Boolean(fieldErrors.company)} aria-describedby={fieldErrors.company?'company-error':undefined} name="company" autoComplete="organization" placeholder="회사 또는 브랜드명" maxLength={120}/>{fieldErrors.company&&<small className="field-error" id="company-error">{fieldErrors.company}</small>}</label><label>이메일 <small>필수</small><input required pattern={String.raw`[^\s@]+@[^\s@]+\.[^\s@]+`} type="email" aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email?'email-error':undefined} name="email" autoComplete="email" placeholder="hello@company.com" maxLength={254}/>{fieldErrors.email&&<small className="field-error" id="email-error">{fieldErrors.email}</small>}</label><label>전화번호 <small>선택</small><input type="tel" name="phone" autoComplete="tel" inputMode="tel" placeholder="010-0000-0000" maxLength={30} pattern={String.raw`\+?[0-9 \(\)\-]{7,29}`}/></label><label>웹사이트 <small>선택</small><input type="url" name="website" placeholder="https://" maxLength={500}/></label></div>
 <label>현재 고민을 알려주세요<textarea required name="message" rows={5} placeholder="필요한 변화와 준비된 자료, 희망 일정을 알려주세요." maxLength={4000}/></label>
 <div className="contact-honeypot" aria-hidden="true"><label>팩스<input name="fax" autoComplete="off" tabIndex={-1}/></label></div>
 <div className="contact-consents"><p>이름·회사·이메일·문의 내용과 선택한 서비스를 상담 접수와 회신에 사용합니다. 전화번호와 웹사이트 주소는 선택입니다. 접수일로부터 최대 1년간 보관하며, 목적 달성 또는 삭제 요청 시 관련 법령에 따라 삭제합니다.</p><label><input required type="checkbox" name="consent"/><span>[필수] 개인정보 수집·이용에 동의합니다. <Link href="/privacy" target="_blank">상세 안내 ↗</Link></span></label><p>문의는 Supabase의 싱가포르 저장공간으로 접수 시 암호화 전송되어 위 기간 동안 보관됩니다. 동의를 거부하면 온라인 접수가 제한되며 이메일로 상담할 수 있습니다.</p><label><input required type="checkbox" name="transferConsent"/><span>[필수] 문의 정보의 국외 이전·보관에 동의합니다.</span></label></div>
 <button className="button" type="submit" disabled={!contactConfig.enabled||state==='sending'}>{state==='sending'?'접수 중…':'상담 접수하기'}<ArrowRight size={17}/></button></fieldset>
 <div ref={status} role={state==='error'?'alert':'status'} tabIndex={-1} className={'contact-status '+state}>{message}</div>
 </form>
}
