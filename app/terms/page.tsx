import legal from '@/lib/legal.json';
export const metadata={title:'이용약관',alternates:{canonical:'/terms'}};
export default function Terms(){return <section className="section-pad legal-page"><div className="page-heading"><span className="eyebrow">TERMS</span><h1>이용약관</h1></div><div className="legal-copy" dangerouslySetInnerHTML={{__html:legal.terms}}/></section>}
