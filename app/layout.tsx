import type {Metadata} from 'next';
import {business} from '@/lib/business';
import {Header} from '@/components/interactive';
import {Footer} from '@/components/pages';
import {baseUrl,JsonLd} from '@/lib/seo';
import './globals.css';
import './admin.css';
import './admin-operations.css';
import {SiteShell} from '@/components/site-shell';
export const metadata:Metadata={metadataBase:new URL(baseUrl),verification:{google:"VEpDz2ie4fMpY75s5TFRZHtoYPJySlKi-06ns_2dhik",other:{"naver-site-verification":"7a90952de38b230228d16d2761baf5529ba2ec5d","msvalidate.01":"82D0FACC8FE30E8C6014BBB0ABB91F36"}},title:{default:'3EO | SEO · AEO · GEO 마케팅',template:'%s | 3EO'},description:'검색과 답변, 고객의 선택을 연결하는 3EO 마케팅.',icons:{icon:[{url:'/favicon-osmu.svg',type:'image/svg+xml'},{url:'/favicon-osmu-32.png',type:'image/png',sizes:'32x32'},{url:'/favicon-osmu-192.png',type:'image/png',sizes:'192x192'}],apple:'/apple-touch-icon.png'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="ko"><body id="top"><SiteShell header={<Header/>} footer={<Footer/>}>{children}</SiteShell><JsonLd data={{'@context':'https://schema.org','@type':'Organization','@id':baseUrl+'/#organization',name:business.name,legalName:business.name,alternateName:[business.englishName,business.brand],brand:{'@type':'Brand',name:business.brand},taxID:business.registration,email:business.email,address:{'@type':'PostalAddress',streetAddress:'불당17길 23, 크리스탈프라자',addressLocality:'천안시 서북구',addressRegion:'충청남도',addressCountry:'KR'},contactPoint:{'@type':'ContactPoint',contactType:'customer service',email:business.email,availableLanguage:'Korean'},url:baseUrl,logo:baseUrl+'/logo.svg',description:'SEO·AEO·GEO를 중심으로 웹사이트, 콘텐츠, 퍼포먼스 마케팅과 데이터 측정을 설계합니다.'}}/></body></html>}
