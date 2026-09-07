import legal from '@/lib/legal.json';
export const metadata={title:'개인정보처리방침',description:'오스무 스튜디오 웹사이트와 프로젝트 문의 과정에서 수집·이용되는 개인정보 처리방침을 안내합니다.',alternates:{canonical:'/privacy'}};
export default function Privacy(){return <section className="section-pad legal-page"><div className="page-heading"><span className="eyebrow">PRIVACY</span><h1>개인정보처리방침</h1></div><div className="legal-copy" dangerouslySetInnerHTML={{__html:legal.privacy}}/></section>}
