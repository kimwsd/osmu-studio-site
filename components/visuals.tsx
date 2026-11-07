export const imageAsset=(name:string)=>({'3eo':'aeo-geo',consulting:'content'}[name]||name);
export const visualDescriptions:Record<string,string>={hero:'검색 자료를 살피고 웹사이트로 들어가는 고객의 여정을 표현한 흑백·라임 일러스트',seo:'검색 결과 카드를 조사하고 필요한 정보를 골라내는 두 사람의 일러스트','aeo-geo':'자료의 근거를 확인하고 답변에 연결하는 콘텐츠 검수 일러스트',website:'PC와 모바일의 정보와 문의 동선을 함께 설계하는 두 사람의 일러스트',content:'원고를 쓰고 원자료를 검토하는 콘텐츠 기획·편집 일러스트',performance:'광고 소재 두 안과 랜딩페이지의 연결을 검토하는 캠페인 기획 일러스트',analytics:'측정 기록과 보고서를 서로 대조하는 데이터 검증 일러스트'};
export function GeneratedImage({name,priority=false,decorative=false}:{name:string;priority?:boolean;decorative?:boolean}){
 name=imageAsset(name); const prefix='/images/editorial-'+name;
 return <picture><source type="image/webp" srcSet={`${prefix}-640.webp 640w, ${prefix}-1280.webp 1280w, ${prefix}-2048.webp 2048w`} sizes={priority?'(max-width: 700px) 100vw, 1010px':'(max-width: 640px) 100vw, (max-width: 900px) 50vw, 600px'}/><img src={`${prefix}.jpg`} alt={decorative?'':visualDescriptions[name]||''} width={1280} height={name==='hero'?640:720} loading={priority?'eager':'lazy'} decoding="async" fetchPriority={priority?'high':'auto'}/></picture>
}
export function ServiceArtwork({slug,name,en}:{slug:string;name:string;en:string}){return <figure className="service-art"><GeneratedImage name={slug}/><figcaption><b>{name}</b><span>{en}</span></figcaption></figure>}
