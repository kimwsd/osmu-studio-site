'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Check, LoaderCircle } from 'lucide-react';
import { services } from '@/lib/services';
import config from '@/lib/public-config.json';
import {submitInquiry} from '@/lib/submit-inquiry.mjs';
export default function ContactForm({initialService=''}:{initialService?:string}) {
  const form=useRef<HTMLFormElement>(null);
  const [selected,setSelected]=useState<string[]>(initialService?[initialService]:[]);
  const [state,setState]=useState<'idle'|'sending'|'success'|'error'>('idle');
  const [message,setMessage]=useState('');
  useEffect(()=>{const service=new URLSearchParams(location.search).get('service');if(service&&services.some(s=>s.slug===service))setSelected([service]);},[]);
  const toggleService=(slug:string)=>setSelected(current=>{
    if(slug==='not-sure')return current.includes(slug)?[]:['not-sure'];
    const withoutUnsure=current.filter(item=>item!=='not-sure');
    return withoutUnsure.includes(slug)?withoutUnsure.filter(item=>item!==slug):[...withoutUnsure,slug];
  });
  async function submit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault(); if(state==='sending')return;
    const data=new FormData(event.currentTarget);setState('sending');setMessage('');
    try {
      const selectedTitles=selected.map(slug=>services.find(s=>s.slug===slug)?.koreanTitle||(slug==='not-sure'?'아직 정하지 못했어요':'기타')).join(' · ');
      await submitInquiry({...Object.fromEntries(data),service:selected.join(',')},{url:process.env.NEXT_PUBLIC_SUPABASE_URL||config.url,anonKey:process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||config.anonKey},selectedTitles||'기타');
      setState('success');setSelected([]);form.current?.reset();
    }catch(error){setState('error');setMessage(error instanceof Error?error.message:'연결을 확인하고 다시 시도해 주세요.');}
  }
  if(state==='success')return <div className="contact-success" role="status"><Check size={50} strokeWidth={1}/><h2>이야기를 잘 받았습니다.</h2><p>내용을 확인한 뒤 남겨주신 연락처로 회신드리겠습니다.</p><Link href="/work" className="text-link">OSMU 작업 살펴보기 <ArrowUpRight size={18}/></Link></div>;
  return <form ref={form} onSubmit={submit} className="inquiry-form">
    <fieldset><legend><span>01</span> 어떤 도움이 필요하신가요? <small>복수 선택 가능</small></legend><div className="service-choices">{[...services.map(s=>({slug:s.slug,title:s.title})),{slug:'not-sure',title:'아직 정하지 못했어요'}].map(s=><button type="button" key={s.slug} aria-pressed={selected.includes(s.slug)} onClick={()=>toggleService(s.slug)}>{s.title}</button>)}</div></fieldset>
    <fieldset><legend><span>02</span> 회신받을 연락처를 남겨주세요.</legend><div className="form-grid"><label>이름 / 브랜드명 <span>*</span><input name="name" autoComplete="organization" placeholder="담당자 또는 브랜드 이름" required maxLength={120}/></label><label>이메일 <span>*</span><input name="email" type="email" autoComplete="email" placeholder="hello@yourbrand.com" required maxLength={254}/></label><label>연락처 <span>*</span><input name="phone" type="tel" autoComplete="tel" placeholder="010-0000-0000" required pattern={"[0-9+\\s\\-\\(\\).]{7,30}"} maxLength={30}/></label><label>예상 예산 <small>선택</small><select name="budget" defaultValue=""><option value="">아직 정해지지 않았어요</option><option>300만원 미만</option><option>300–700만원</option><option>700–1,500만원</option><option>1,500–3,000만원</option><option>3,000만원 이상</option><option>상담 후 결정</option></select></label></div></fieldset>
    <fieldset><legend><span>03</span> 만들고 싶은 변화를 들려주세요. <small>선택</small></legend><label className="sr-only" htmlFor="project-message">프로젝트 내용</label><textarea id="project-message" name="message" placeholder="지금의 고민, 필요한 작업, 희망 일정 등 편하게 남겨주세요." maxLength={5000} rows={5}/></fieldset>
    <label className="honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label>
    <label className="consent"><input name="agree" type="checkbox" required/><span><Link href="/privacy" target="_blank">개인정보 수집·이용</Link>에 동의합니다. (필수)<small>문의 응대를 위해 이름·이메일·연락처를 수집하며, 1년간 보관합니다.</small></span></label>
    {state==='error'&&<p className="form-error" role="alert">{message} 입력 내용은 유지됩니다. <a href="mailto:osmu_studio@naver.com">이메일로 문의하기 ↗</a></p>}
    <button className="submit-button" disabled={state==='sending'}>{state==='sending'?<>접수 중<LoaderCircle className="spin" size={22}/></>:<>프로젝트 이야기 보내기<ArrowUpRight size={25}/></>}</button>
  </form>;
}
