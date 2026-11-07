import Link from 'next/link';
export default function NotFound(){return <section className="section container empty"><span className="eyebrow">404 / NOT FOUND</span><h1>페이지를 찾을 수 없습니다.</h1><p>주소를 확인하거나 아래에서 다시 시작해 주세요.</p><Link className="button" href="/">홈으로 돌아가기</Link></section>}
