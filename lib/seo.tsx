import {pageLastModified} from './page-updates';
import {solutionDetails} from './solution-details';
import type {Metadata} from 'next';
import {services,solutions,articles,categories} from './content';
export const baseUrl=(process.env.NEXT_PUBLIC_SITE_URL||'http://127.0.0.1:3001').replace(/\/$/,'');
export const isPublic=process.env.SITE_PUBLIC==='true'&&!!process.env.NEXT_PUBLIC_SITE_URL;
export function JsonLd({data}:{data:unknown}){return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(data).replace(/</g,'\\u003c')}}/>}
const labels:Record<string,[string,string]>={'/tools':['3EO Desk · 무료 마케팅 도구','웹사이트 자가 점검, 서비스 찾기, UTM 링크 생성과 검색·공유 미리보기. 로그인 없이 다음 실행을 준비하세요.'],'/tools/utm-builder':['UTM 링크 만들기','채널·매체·캠페인을 구분하는 UTM 링크를 브라우저에서 만들고 복사하세요.'],'/tools/share-preview':['검색·공유 미리보기','제목·요약·대표 이미지로 검색 결과와 링크 공유의 구성 예시를 확인하세요.'],'/':['오스무 스튜디오 | SEO·AEO·GEO 마케팅 · 3EO',"검색과 AI 답변에서 발견되는 브랜드를 설계하는 오스무 스튜디오(OSMU STUDIO). SEO·AEO·GEO 통합 최적화부터 마케팅 컨설팅, 웹사이트 구축, 콘텐츠 제작·발행, 퍼포먼스 마케팅, 데이터 측정·분석까지 함께합니다."],'/about':['회사소개 · About','오스무 스튜디오의 3EO 업무를 소개합니다. SEO·AEO·GEO, 웹사이트 제작, 콘텐츠 발행, 광고 운영과 데이터 분석의 제공 범위·결과물·협업 방식을 확인하세요.'],'/services':['마케팅 서비스 · Services','SEO·AEO·GEO를 통합한 3EO 검색 최적화, 마케팅 컨설팅, 웹사이트·콘텐츠·퍼포먼스·데이터 서비스의 범위와 결과물을 비교하세요.'],'/solutions':['마케팅 솔루션 · Solutions','B2B SaaS, 제조, IT·Tech, 전문 서비스, 커머스, 지역 비즈니스와 소셜 임팩트. 업종별 문제·실행 범위·산출물·측정 기준을 확인하세요.'],'/insights':['인사이트 · Insights','검색·AI·웹사이트·콘텐츠·데이터에 관한 3EO 실무 인사이트.'],'/contact':['프로젝트 상담','현재 고민과 목표를 바탕으로 필요한 서비스 범위와 진행 방식을 정리합니다.'],'/process':['검색 여정 분석과 3EO 진행 방식','11개 업종의 검색 질문과 고객 여정을 분석해 웹사이트·콘텐츠·측정으로 연결합니다. 질문 지도, 콘텐츠 설계와 진단·구축·월간 운영의 결과물을 확인하세요.'],'/resources':['자료실 · Resources','서비스 찾기와 웹사이트 점검, 마케팅 실무 가이드.'],'/pricing':['비용·일정 안내','페이지·콘텐츠·연동 범위 등 견적과 일정을 결정하는 기준.'],'/cases':['프로젝트 기록 · 웹사이트 구축 사례','OSMU STUDIO 자사 홈페이지 구축 사례. SEO·AEO·GEO를 고려한 기획, 개발, 콘텐츠와 측정의 작업 범위 및 완성한 결과물을 소개합니다.'],'/faq':['자주 묻는 질문','3EO 서비스와 일정, 준비 자료, 검색·AI 노출에 관한 질문과 답변.'],'/privacy':['개인정보처리방침','오스무 스튜디오의 상담 입력, 이메일 문의, 호스팅 기록과 개인정보 관련 권리 요청 방법을 안내합니다.'],'/terms':['사이트 이용 안내','3EO 공개 정보, 상담 접수, 관리자 편집 미리보기와 무료 도구의 이용 범위를 안내합니다.'],'/admin':['콘텐츠 관리자','인사이트 편집·미디어·UTM·측정 연결을 관리하는 3EO 워크스페이스.'],'/tools/checklist':['웹사이트 자가 점검','웹사이트 내용과 구조·문의 흐름을 살펴보는 8가지 기본 질문.'],'/tools/plan-finder':['서비스 찾기','현재 고민을 바탕으로 필요한 3EO 서비스를 찾아보세요.']};
export function metaFor(path:string):Metadata{
 const parts=path.split('/').filter(Boolean);let [title,description]=labels[path]||['3EO','3EO 마케팅'];
 if(parts[0]==='services'&&parts[1]){const s=services.find(s=>s.slug===parts[1]);if(s){title=s.name;description=s.intro}}
 if(parts[0]==='solutions'&&parts[1]){const s=solutions.find(s=>s.slug===parts[1]);if(s){title=s.name+' 마케팅 솔루션';description=solutionDetails[s.slug].answer}}
 const article=parts[0]==='insights'?articles.find(a=>a.slug===parts[1]):undefined;
 if(article){title=article.seoTitle||article.title;description=article.seoDescription||article.summary}
 if(parts[0]==='insights'&&parts[1]==='category'){const i=['seo','aeo-geo','website','content','performance','analytics'].indexOf(parts[2]);title=categories[i+1]+' 인사이트';description=title+'에 관한 3EO 실무 가이드.'}
 const asset=article?({'3eo':'aeo-geo',consulting:'content'} as Record<string,string>)[article.service]||article.service:'';
 const image=article?(article.ogImage||article.cover||'/images/editorial-'+asset+'.jpg'):'/osmu-logo-share-20261109.png';
 const images=article?[{url:image,alt:article.coverAlt||article.title}]:[{url:image,width:1200,height:630,alt:'OSMU STUDIO 로고'}];
 const url=path==='/'?'/':path+'/';
 return {title:{absolute:path==='/'||title.includes('오스무 스튜디오')?title:title+' | 오스무 스튜디오'},description,alternates:{canonical:url},robots:{index:isPublic&&path!=='/admin',follow:isPublic&&path!=='/admin',...(isPublic&&path!=='/admin'?{googleBot:{index:true,follow:true,'max-image-preview':'large' as const,'max-snippet':-1,'max-video-preview':-1}}:{})},openGraph:{title,description,url,locale:'ko_KR',siteName:'오스무 스튜디오',...(article?{type:'article',publishedTime:new Date(article.date).toISOString(),modifiedTime:new Date(article.modified||article.date).toISOString(),authors:[article.author||'3EO Editorial']}:{type:'website'}),images},twitter:{card:'summary_large_image',title,description,images:[image]}};
}

export function pageSchema(path:string){
 const meta=metaFor(path);
 const title=typeof meta.title==='object'&&meta.title&&'absolute' in meta.title?meta.title.absolute:'3EO';
 return {'@context':'https://schema.org','@type':path==='/about'?'AboutPage':['/insights','/services','/solutions','/resources','/cases'].includes(path)||path.includes('/category/')?'CollectionPage':'WebPage','@id':baseUrl+(path==='/'?'/':path+'/')+'#webpage',url:baseUrl+(path==='/'?'/':path+'/'),name:title,description:meta.description,...(pageLastModified(path)?{dateModified:pageLastModified(path)}:{}),...(path.startsWith('/insights/')?{}:{image:baseUrl+'/osmu-logo-square-20261109.png',primaryImageOfPage:{'@type':'ImageObject',url:baseUrl+'/osmu-logo-square-20261109.png',width:512,height:512}}),inLanguage:'ko-KR',...(path==='/about'?{about:{'@id':baseUrl+'/#organization'}}:{}),isPartOf:{'@type':'WebSite','@id':baseUrl+'/#website',name:'오스무 스튜디오',alternateName:['OSMU STUDIO','OSMUstudio'],url:baseUrl+'/',publisher:{'@id':baseUrl+'/#organization'}}};
}
