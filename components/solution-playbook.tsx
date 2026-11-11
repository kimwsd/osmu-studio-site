import {solutionPlaybooks} from '@/lib/solution-playbooks';

export function SolutionPlaybook({slug,name}:{slug:string;name:string}) {
  const data=solutionPlaybooks[slug];
  if(!data)return null;
  return <section id="measurement-map" className="section container solution-playbook">
    <div className="desk-section-heading"><span className="eyebrow">FROM SEARCH TO BUSINESS</span><h2>유입 숫자 너머,<br/>실제 다음 행동까지.</h2><p>{data.focus}</p></div>
    <figure className="solution-data-figure">
      <div className="solution-data-header"><span>OSMU / {name}</span><span>MEASUREMENT MAP</span></div>
      <div className="solution-data-layout">
        <div><span className="eyebrow">CUSTOMER JOURNEY</span><h3>어디에서 멈추고,<br/>무엇으로 이어질까요?</h3><p>각 단계의 행동을 나누면<br/>다음 개선점이 보입니다.</p><span className="solution-data-badge">측정 구조 예시 · 실제 성과 아님</span></div>
        <div><img src={`/images/solutions/${slug}-measurement.svg`} width="480" height="420" loading="lazy" alt={`${name}: ${data.stages.join(" → ")}. 실제 성과가 아닌 측정 구조 예시.`}/><ol className="sr-only">{data.stages.map((stage,i)=><li key={stage}><span className="solution-flow-number">0{i+1}</span><div><strong>{stage}</strong><small>{['검색 노출·클릭','페이지·콘텐츠 탐색','접수 성공 기록','업무 시스템에서 확인'][i]}</small></div><span aria-hidden="true">{i<3?'↓':'✓'}</span></li>)}</ol></div>
      </div>
      <div className="solution-data-sources"><span>SEARCH CONSOLE <b>검색 기회</b></span><span>GA4 <b>동의한 방문 행동</b></span><span>접수 DB / CRM <b>고유 문의·진행 결과</b></span></div>
      <figcaption>흐름도는 단계 간 연결을 설명합니다. 방문자의 이탈률이나 실제 전환 규모를 나타내는 그래프가 아닙니다. 서로 다른 도구의 수치를 단순 합산하지 않습니다.</figcaption>
    </figure>
    <div className="solution-execution-grid">{data.assets.map(([title,body,output],i)=><article key={title}><span className="eyebrow">BUILD / 0{i+1}</span><h3>{title}</h3><p>{body}</p><div><small>실행 산출물</small><strong>{output}</strong></div></article>)}</div>
    <div className="solution-metric-heading"><h3>성과는 이렇게 정의합니다.</h3><p>계정·조회 기간·집계 단위를 맞춘 뒤 비교합니다. 수집되지 않은 값은 0으로 바꾸지 않고 미확인으로 남깁니다.</p></div>
    <div className="solution-map-table"><table><caption className="sr-only">{name} 측정 지표와 해석 기준</caption><thead><tr><th scope="col">확인할 지표</th><th scope="col">데이터·계산 기준</th><th scope="col">해석할 때 확인</th></tr></thead><tbody>{data.measures.map(([label,definition,note])=><tr key={label}><th scope="row">{label}</th><td data-label="계산 기준">{definition}</td><td data-label="해석 기준">{note}</td></tr>)}</tbody></table></div>
    <div className="solution-operation-grid"><article><span className="eyebrow">01 / DIAGNOSE</span><h3>진단</h3><p>기존 페이지·검색 질문·계정 상태를 확인하고 우선순위와 개선 범위를 정리합니다.</p></article><article><span className="eyebrow">02 / BUILD</span><h3>구축</h3><p>합의한 페이지와 콘텐츠, 동의 기반 측정·접수 흐름을 구현하고 실패·성공·중복 상황을 검수합니다.</p></article><article><span className="eyebrow">03 / OPERATE</span><h3>월간 운영</h3><p>검색·콘텐츠·고유 문의를 대조하고 다음 개선안을 정합니다. 제작 수량과 광고 운영·연동 범위는 계약에서 확정합니다.</p></article></div>
  </section>;
}
