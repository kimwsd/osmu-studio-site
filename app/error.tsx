'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <section className="section-pad page-heading"><h1>잠시 연결이<br/>끊겼습니다.</h1><p>잠시 후 다시 시도해 주세요.</p><button className="button" onClick={reset}>다시 불러오기</button></section>}
