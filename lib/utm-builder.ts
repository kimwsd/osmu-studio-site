export type CampaignLink={id?:string;name:string;destination:string;source:string;medium:string;campaign:string;content:string;term:string};
export const presets=[
 {id:'instagram_profile',label:'인스타그램 · 프로필',source:'instagram',medium:'social',placement:'profile_bio'},
 {id:'instagram_story',label:'인스타그램 · 스토리',source:'instagram',medium:'social',placement:'story'},
 {id:'meta_paid',label:'메타 · 유료 광고',source:'facebook',medium:'paid_social',placement:'feed'},
 {id:'instagram_paid',label:'인스타그램 · 유료 광고',source:'instagram',medium:'paid_social',placement:'reels'},
 {id:'naver_blog',label:'네이버 블로그 · 자연 유입',source:'naver',medium:'referral',placement:'blog_post'},
 {id:'naver_search',label:'네이버 · 검색 광고',source:'naver',medium:'cpc',placement:'search'},
 {id:'google_search',label:'구글 · 검색 광고',source:'google',medium:'cpc',placement:'search'},
 {id:'kakao',label:'카카오 · 채널 메시지',source:'kakao',medium:'social',placement:'channel_message'},
 {id:'newsletter',label:'이메일 · 뉴스레터',source:'newsletter',medium:'email',placement:'body_cta'},
 {id:'qr',label:'오프라인 · QR',source:'offline',medium:'qr',placement:'business_card'}
];
export function slugPart(s:string){return s.trim().toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_-]/g,'').replace(/_+/g,'_').replace(/^_|_$/g,'')}
export function campaignUrl(u:CampaignLink){try{const url=new URL(u.destination);if(url.protocol!=='https:')return '';for(const [key,value] of Object.entries({utm_source:u.source,utm_medium:u.medium,utm_campaign:u.campaign,utm_content:u.content,utm_term:u.term})){if(value.trim())url.searchParams.set(key,value.trim());else url.searchParams.delete(key)}return url.href}catch{return ''}}
export function campaignProblems(u:CampaignLink){const errors:string[]=[];let url:URL;try{url=new URL(u.destination);if(url.protocol!=='https:'||url.hostname!=='osmu-studio.com'||url.username||url.password)errors.push('OSMU 운영 도메인의 https 주소를 사용해 주세요.');if(url.pathname.startsWith('/admin'))errors.push('관리자 주소를 캠페인에 사용할 수 없습니다.');if([...url.searchParams.keys()].some(k=>!['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].includes(k)))errors.push('개인정보나 알 수 없는 매개변수가 없는 도착 주소를 사용해 주세요.')}catch{errors.push('올바른 도착 페이지 주소를 입력해 주세요.')}
 for(const key of ['source','medium','campaign'] as const)if(!u[key].trim())errors.push(key+' 값을 입력해 주세요.');
 for(const key of ['source','medium','campaign','content','term'] as const){const value=u[key];if(value.length>100||(/@|\d{3}[- ]?\d{3,4}[- ]?\d{4}/.test(value)))errors.push(key+'에 개인정보 또는 너무 긴 값을 넣을 수 없습니다.');else if(value&&!/^[a-z0-9_-]+$/.test(value))errors.push(key+'는 영문 소문자·숫자·밑줄·하이픈만 사용해 주세요.');}
 return errors;
}
