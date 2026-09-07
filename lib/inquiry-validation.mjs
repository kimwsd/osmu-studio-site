export function validateInquiry(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {error:'문의 내용을 확인해주세요.'};
  const text = key => typeof input[key] === 'string' ? input[key].trim() : '';
  const name=text('name'), email=text('email'), phone=text('phone'), message=text('message'), budget=text('budget'), service=text('service');
  if(text('website'))return {error:'문의 내용을 확인해주세요.'};
  if(!name || name.length>120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length>254 || !/^[0-9+\-\s().]{7,30}$/.test(phone))return {error:'이름, 이메일, 연락처를 확인해주세요.'};
  if(input.agree!=='on')return {error:'개인정보 수집·이용에 동의해주세요.'};
  if(message.length>5000 || budget.length>100 || service.length>100)return {error:'입력한 내용이 너무 깁니다.'};
  return {data:{name,email,phone,message:message||null,budget:budget||null,type:service||'기타',biz_type:null}};
}
