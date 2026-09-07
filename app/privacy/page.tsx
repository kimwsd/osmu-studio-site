import legal from '@/lib/legal.json';
export const metadata={title:'개인정보처리방침',alternates:{canonical:'/privacy'}};
export default function Privacy(){return <section className="section-pad legal-page"><div className="page-heading"><span className="eyebrow">PRIVACY</span><h1>개인정보처리방침</h1></div><div className="legal-copy" dangerouslySetInnerHTML={{__html:legal.privacy}}/></section>}
