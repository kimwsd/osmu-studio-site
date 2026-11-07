import type {Metadata} from 'next';
import {Header} from '@/components/interactive';
import {Footer} from '@/components/pages';
import {baseUrl,isPublic,JsonLd} from '@/lib/seo';
import './globals.css';
export const metadata:Metadata={metadataBase:new URL(baseUrl),title:{default:'3EO | SEO · AEO · GEO 마케팅',template:'%s | 3EO'},description:'검색과 답변, 고객의 선택을 연결하는 3EO 마케팅.',robots:{index:isPublic,follow:isPublic},icons:{icon:'/favicon.svg'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="ko"><body id="top"><Header/><main id="main">{children}</main><Footer/><JsonLd data={{'@context':'https://schema.org','@type':'Organization',name:'3EO',url:baseUrl,logo:baseUrl+'/logo.svg',description:'SEO·AEO·GEO를 중심으로 웹사이트, 콘텐츠, 퍼포먼스 마케팅과 데이터 측정을 설계합니다.'}}/></body></html>}
