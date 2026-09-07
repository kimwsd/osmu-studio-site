import type { Metadata } from 'next';
import { Header, Footer, KakaoQuickLink } from '@/components/site-shell';
import PageMotion from '@/components/page-motion';
import './globals.css';
import { getProjects } from '@/lib/projects';
import { services } from '@/lib/services';
export const metadata: Metadata = {
  metadataBase: new URL('https://osmu-studio.com'),
  title: { default: '오스무 스튜디오 | OSMU STUDIO — 그래픽·패키지 디자인', template: '%s | OSMU STUDIO' },
  description: '브랜드의 생각을 사람들이 만나는 형태로. 브랜드 전략에서 그래픽, 패키지와 디지털까지, 시각적 정체성을 만드는 오스무 스튜디오.',
  openGraph: { type: 'website', locale: 'ko_KR', siteName: 'OSMU STUDIO', images: [{url: '/og-image.png', width: 1200, height: 630}] },
  twitter: { card: 'summary_large_image', images: ['/og-image.png'] },
  icons: {
    icon: [
      { url: '/favicon.ico?v=svg-brand', sizes: '16x16 32x32 48x48', type: 'image/x-icon' },
      { url: '/favicon.svg?v=svg-brand', sizes: 'any', type: 'image/svg+xml' },
    ],
    apple: { url: '/apple-touch-icon.png?v=svg-brand', sizes: '180x180', type: 'image/png' },
  },
  verification: { google: 'VEpDz2ie4fMpY75s5TFRZHtoYPJySlKi-06ns_2dhik', other: { 'naver-site-verification': '7a90952de38b230228d16d2761baf5529ba2ec5d' } }
};
export default async function RootLayout({ children }: { children: React.ReactNode }) {
 const projects=await getProjects();
 const searchItems=[...projects.map(p=>({title:p.name,href:`/work/${p.slug}`,description:p.summary,category:p.cat})),...services.map(s=>({title:s.title,href:`/services/${s.slug}`,description:s.description,category:'Services'})),{title:'About OSMU STUDIO',href:'/studio',description:'오스무 스튜디오 소개',category:'Studio'},{title:'How we work',href:'/process',description:'진행 과정 프로세스 견적 일정 질문 FAQ',category:'Process'},{title:'Contact',href:'/contact',description:'프로젝트 문의 연락처 상담',category:'Contact'}];
 return <html lang="ko"><body id="top"><Header items={searchItems}/><main id="main">{children}</main><Footer/><KakaoQuickLink/><PageMotion/></body></html>;
}
