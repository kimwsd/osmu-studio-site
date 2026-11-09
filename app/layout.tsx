import type {Metadata} from 'next';
import {business,officialChannels} from '@/lib/business';
import {Header} from '@/components/interactive';
import {Footer} from '@/components/pages';
import {baseUrl,JsonLd} from '@/lib/seo';
import './globals.css';
import './admin.css';
import './admin-operations.css';
import './admin-expansion.css';
import {SiteShell} from '@/components/site-shell';
export const metadata:Metadata={metadataBase:new URL(baseUrl),verification:{google:"VEpDz2ie4fMpY75s5TFRZHtoYPJySlKi-06ns_2dhik",other:{"naver-site-verification":"7a90952de38b230228d16d2761baf5529ba2ec5d","msvalidate.01":"82D0FACC8FE30E8C6014BBB0ABB91F36"}},title:{default:"오스무 스튜디오 | SEO·AEO·GEO 마케팅 · 3EO",template:'%s | 오스무 스튜디오'},description:"검색과 AI 답변에서 발견되는 브랜드를 설계하는 오스무 스튜디오(OSMU STUDIO). SEO·AEO·GEO 통합 최적화부터 마케팅 컨설팅, 웹사이트 구축, 콘텐츠 제작·발행, 퍼포먼스 마케팅, 데이터 측정·분석까지 함께합니다.",icons:{icon:[{url:'/favicon-logo.svg',type:'image/svg+xml'},{url:'/favicon-logo-48.png',type:'image/png',sizes:'48x48'},{url:'/favicon-logo-192.png',type:'image/png',sizes:'192x192'}],apple:'/apple-touch-icon.png'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="ko"><body id="top"><SiteShell header={<Header/>} footer={<Footer/>}>{children}</SiteShell><JsonLd data={{'@context':'https://schema.org','@type':'WebSite','@id':baseUrl+'/#website',name:business.name,alternateName:[business.englishName,'OSMUstudio',business.brand],url:baseUrl+'/',publisher:{'@id':baseUrl+'/#organization'}}}/><JsonLd data={{'@context':'https://schema.org','@type':'Organization','@id':baseUrl+'/#organization',name:business.name,legalName:business.name,alternateName:[business.englishName,business.brand],brand:{'@type':'Brand',name:business.brand},taxID:business.registration,sameAs:[officialChannels.kakao],email:business.email,address:{'@type':'PostalAddress',streetAddress:'불당17길 23, 크리스탈프라자',addressLocality:'천안시 서북구',addressRegion:'충청남도',addressCountry:'KR'},contactPoint:{'@type':'ContactPoint',contactType:'customer service',email:business.email,availableLanguage:'Korean'},url:baseUrl,logo:{'@type':'ImageObject',url:baseUrl+'/osmu-logo-square-20261109.png',width:512,height:512},image:baseUrl+'/osmu-logo-square-20261109.png',description:'SEO·AEO·GEO를 중심으로 웹사이트, 콘텐츠, 퍼포먼스 마케팅과 데이터 측정을 설계합니다.'}}/></body></html>}
