import type {Metadata} from 'next';
import {business} from '@/lib/business';
import {Header} from '@/components/interactive';
import {Footer} from '@/components/pages';
import {baseUrl,isPublic,JsonLd} from '@/lib/seo';
import './globals.css';
import './admin.css';
import {SiteShell} from '@/components/site-shell';
export const metadata:Metadata={metadataBase:new URL(baseUrl),title:{default:'3EO | SEO · AEO · GEO 마케팅',template:'%s | 3EO'},description:'검색과 답변, 고객의 선택을 연결하는 3EO 마케팅.',robots:{index:isPublic,follow:isPublic},icons:{icon:'/favicon.svg'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="ko"><body id="top"><SiteShell header={<Header/>} footer={<Footer/>}>{children}</SiteShell><JsonLd data={{'@context':'https://schema.org','@type':'Organization','@id':baseUrl+'/#organization',name:business.name,legalName:business.name,alternateName:[business.englishName,business.brand],brand:{'@type':'Brand',name:business.brand},taxID:business.registration,email:business.email,address:{'@type':'PostalAddress',streetAddress:'불당17길 23, 크리스탈프라자',addressLocality:'천안시 서북구',addressRegion:'충청남도',addressCountry:'KR'},contactPoint:{'@type':'ContactPoint',contactType:'customer service',email:business.email,availableLanguage:'Korean'},url:baseUrl,logo:baseUrl+'/logo.svg',description:'SEO·AEO·GEO를 중심으로 웹사이트, 콘텐츠, 퍼포먼스 마케팅과 데이터 측정을 설계합니다.'}}/></body></html>}
