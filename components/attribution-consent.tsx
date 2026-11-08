'use client';
import {useEffect,useState} from 'react';import {usePathname} from 'next/navigation';
import {attributionKey,consentKey,safeLabel,safeSitePath,readAttribution} from '@/lib/attribution';
export function AttributionConsent(){const path=usePathname(),[choice,setChoice]=useState<string|null>('loading'),[open,setOpen]=useState(false);
 useEffect(()=>{try{setChoice(sessionStorage.getItem(consentKey));}catch{setChoice('no')}},[]);
 useEffect(()=>{if(choice!=='yes')return;try{const prior=readAttribution();const data:Record<string,string>={...prior};if(!data.landing_path){data.landing_path=safeSitePath(path)||'/';const query=new URLSearchParams(location.search);for(const key of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term']){const value=safeLabel(query.get(key));if(value)data[key]=value;}try{const ref=new URL(document.referrer);if(ref.origin!==location.origin)data.referrer_host=ref.hostname;}catch{}}if(path.startsWith('/insights/')&&safeSitePath(path))data.content_path=path;data.consent='session-v1';sessionStorage.setItem(attributionKey,JSON.stringify(data));}catch{}},[choice,path]);
 function choose(value:string){try{sessionStorage.setItem(consentKey,value);if(value!=='yes')sessionStorage.removeItem(attributionKey)}catch{}setChoice(value);setOpen(false)}
 if(path.startsWith('/admin'))return null;
 return <>{(choice===null||open)?<aside className="attribution-consent" aria-label="유입 정보 저장 선택"><strong>상담이 시작된 경로를 알려주세요.</strong><p>동의하면 방문 페이지와 캠페인 정보를 이 탭에 저장하고 문의 접수 시 함께 전달합니다. 외부 광고·분석 서비스로 보내지 않으며, 거절해도 상담할 수 있습니다.</p><div><button onClick={()=>choose('no')}>거절</button><button onClick={()=>choose('yes')}>동의</button><a href="/privacy/">안내</a></div></aside>:choice!=='loading'&&<button className="attribution-settings" onClick={()=>setOpen(true)}>유입 정보 설정</button>}</>
}
