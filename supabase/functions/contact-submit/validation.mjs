const allowed = new Set(['3eo','consulting','website','content','performance','analytics']);
export function validateInquiry(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('입력 내용을 확인해 주세요.');
  const text=(key,max,required=true)=>{const value=input[key];if(typeof value!=='string'||value.length>max||(required&&!value.trim()))throw new Error('입력 내용을 확인해 주세요.');return value.trim();};
  const requestId=text('requestId',36);
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId))throw new Error('접수 요청을 새로 시작해 주세요.');
  if(input.fax)throw new Error('요청을 처리할 수 없습니다.');
  if(input.consent!==true||input.transferConsent!==true||input.consentVersion!=='2026-11-08')throw new Error('개인정보 안내와 동의를 확인해 주세요.');
  const name=text('name',80),company=text('company',120),email=text('email',254).toLowerCase(),message=text('message',4000),website=text('website',500,false);
  const phone=input.phone===undefined?'':text('phone',30,false);
  if(phone&&(!/^\+?[0-9 ()-]+$/.test(phone)||phone.replace(/\D/g,'').length<7||phone.replace(/\D/g,'').length>15))throw new Error('전화번호를 확인해 주세요.');
  if(!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email))throw new Error('이메일 주소를 확인해 주세요.');
  if(website){let url;try{url=new URL(website)}catch{throw new Error('웹사이트 주소를 확인해 주세요.')};if(!['https:','http:'].includes(url.protocol)||url.username||url.password)throw new Error('웹사이트 주소를 확인해 주세요.');}
  if(!Array.isArray(input.services)||!input.services.length||input.services.length>6||input.services.some(s=>typeof s!=='string'||!allowed.has(s)))throw new Error('서비스를 한 가지 이상 선택해 주세요.');
  return {requestId,name,company,email,phone,website,message,services:[...new Set(input.services)].sort(),consentVersion:'2026-11-08'};
}
