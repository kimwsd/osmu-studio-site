'use client';

type Topic={name:string;keywords:string[]};
const centers=[[255,190],[500,130],[745,190],[255,490],[500,550],[745,490]];
const leaves=[[[105,100],[95,270]],[[385,40],[615,40]],[[895,100],[905,270]],[[95,430],[105,590]],[[385,660],[615,660]],[[905,430],[895,590]]];

function labelLines(text:string){const words=text.split(' '),lines:string[]=[];for(const word of words){const last=lines.length-1;if(last>=0&&(lines[last]+' '+word).length<=7)lines[last]+=' '+word;else lines.push(word)}return lines}

export function QuestionNetwork({topics,selected,onSelect,id}:{topics:Topic[];selected:number;onSelect:(index:number)=>void;id:string}){
 return <svg className="atlas-network" viewBox="0 0 1000 710" role="group" aria-labelledby={id+'-network-title '+id+'-network-desc'}>
  <title id={id+'-network-title'}>고객의 고민에서 세부 검색어로 펼쳐지는 질문 지도</title>
  <desc id={id+'-network-desc'}>중앙은 영업 관리 도입, 중간 원은 여섯 가지 질문 주제, 바깥 원은 검색어 예시입니다. 주제를 선택하면 연결과 제작할 콘텐츠가 강조됩니다. 원의 크기는 정보 계층을 뜻하며 검색량이 아닙니다.</desc>
  <defs><radialGradient id={id+'-halo'}><stop stopColor="#b8e8ca" stopOpacity=".65"/><stop offset="1" stopColor="#b8e8ca" stopOpacity="0"/></radialGradient></defs>
  <circle cx="500" cy="340" r="240" fill={'url(#'+id+'-halo)'}/>
  <circle cx="500" cy="340" r="110" fill="none" stroke="#dcece3" strokeWidth="28"/>
  <circle cx="500" cy="340" r="85" fill="#d6ebdd"/>
  {centers.map(([x,y],i)=><g key={'connections-'+i} fill="none" stroke={i===selected?'#18805b':'#d3ded7'} strokeWidth={i===selected?2.5:1.5}>
   <line x1="500" y1="340" x2={x} y2={y}/>
   {leaves[i].map(([lx,ly],j)=><line key={j} x1={x} y1={y} x2={lx} y2={ly}/>)}
  </g>)}
  <circle cx="500" cy="340" r="67" fill="#0c4935"/>
  <text x="500" y="323" textAnchor="middle" fill="#bce9cd" fontSize="12" letterSpacing="2">SEARCH TOPIC</text>
  <text x="500" y="350" textAnchor="middle" fill="#fff" fontSize="20" fontWeight="700">영업 관리 도입</text>
  {centers.map(([x,y],i)=><g key={topics[i].name} role="button" tabIndex={0} aria-label={topics[i].name+' 질문 보기'} aria-pressed={selected===i} data-analytics-action={'research_topic_'+i} className="atlas-node" onClick={()=>onSelect(i)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(i)}}}>
   <circle cx={x} cy={y} r="54" fill={selected===i?'#d1eddb':'transparent'}/>
   <circle cx={x} cy={y} r="43" fill={selected===i?'#0c6043':'#d7eee1'} stroke={selected===i?'#0c6043':'#b9d5c5'} strokeWidth="2"/>
   <text x={x} y={y+5} textAnchor="middle" fill={selected===i?'#fff':'#234d3c'} fontSize="16" fontWeight="650">{topics[i].name}</text>
   {leaves[i].map(([lx,ly],j)=><g key={j}>
    <circle cx={lx} cy={ly} r="38" fill="#fff" stroke={selected===i?'#68a987':'#e2e9e4'} strokeWidth="1.5"/>
    <text x={lx} y={ly-(labelLines(topics[i].keywords[j]).length-1)*8+4} textAnchor="middle" fill="#365344" fontSize="12">{labelLines(topics[i].keywords[j]).map((line,k)=><tspan key={k} x={lx} dy={k?16:0}>{line}</tspan>)}</text>
   </g>)}
  </g>)}
 </svg>
}

const flowColumns=[
 {title:'고객의 상황',x:115,nodes:[{y:115,title:'보고서 수작업',sub:'반복 업무를 줄이고 싶다'},{y:285,title:'고객 정보 분산',sub:'팀의 정보를 연결하고 싶다'},{y:455,title:'정보 접근 불안',sub:'권한과 관리 범위를 알고 싶다'}]},
 {title:'검토하는 질문',x:365,nodes:[{y:70,title:'업무 정리',sub:'어떤 작업부터 바꿀까?'},{y:156,title:'팀 협업',sub:'담당자가 바뀌면 어떻게 할까?'},{y:242,title:'기능·연동',sub:'기존 도구와 연결될까?'},{y:328,title:'보안·권한',sub:'팀별 접근을 나눌 수 있을까?'},{y:414,title:'비용·계약',sub:'무엇이 비용에 포함될까?'},{y:500,title:'도입·교육',sub:'이전과 교육은 어떻게 할까?'}]},
 {title:'확인할 근거',x:615,nodes:[{y:100,title:'업무 개선 예시',sub:'역할과 작업 흐름'},{y:240,title:'연동 범위',sub:'지원 항목과 연결 조건'},{y:380,title:'접근 정책',sub:'권한과 데이터 관리'},{y:520,title:'계약·지원 범위',sub:'견적 조건과 교육 절차'}]},
 {title:'만들 콘텐츠',x:865,nodes:[{y:100,title:'문제 해결 가이드',sub:'고민에 답하는 첫 페이지'},{y:240,title:'기능·보안 상세',sub:'검토 담당자의 확인 자료'},{y:380,title:'견적·비교 안내',sub:'상담 전에 판단할 조건'},{y:520,title:'도입·운영 가이드',sub:'준비와 활용을 돕는 자료'}]},
];
const routes=[[0,0,0,0],[1,1,0,0],[1,2,1,1],[2,3,2,1],[1,4,3,2],[1,5,3,3]];
function flowPath(route:number[],col:number){const a=flowColumns[col],b=flowColumns[col+1],ay=a.nodes[route[col]].y,by=b.nodes[route[col+1]].y;return 'M'+(a.x+94)+','+ay+' C'+(a.x+126)+','+ay+' '+(b.x-126)+','+by+' '+(b.x-94)+','+by}

export function ContentFlow({selected,id}:{selected:number;id:string}){
 return <svg className="atlas-flow" viewBox="0 0 1000 590" role="img" aria-labelledby={id+'-flow-title '+id+'-flow-desc'}>
  <title id={id+'-flow-title'}>고객 상황에서 질문, 근거, 콘텐츠로 연결하는 설계 흐름</title>
  <desc id={id+'-flow-desc'}>여러 고객 상황이 여섯 가지 검토 질문을 거쳐 필요한 근거와 제작 페이지로 이어집니다. 선택한 질문의 경로가 녹색으로 강조됩니다. 연결선의 폭은 동일하며 실제 방문자 수나 전환율을 나타내지 않습니다.</desc>
  {flowColumns.map(c=><text key={c.title} x={c.x} y="20" textAnchor="middle" fill="#52665b" fontSize="14" fontWeight="600">{c.title}</text>)}
  {routes.map((route,i)=><g key={i} stroke="#dbe4de" strokeWidth="2" fill="none">{[0,1,2].map(col=><path key={col} d={flowPath(route,col)}/>)}</g>)}
  <g stroke="#14825c" strokeWidth="3" fill="none">{[0,1,2].map(col=><path key={col} d={flowPath(routes[selected],col)}/>)}</g>
  {flowColumns.map((c,col)=>c.nodes.map((n,i)=>{const active=routes[selected][col]===i;return <g key={col+'-'+i}>
   <rect x={c.x-94} y={n.y-29} width="188" height="58" rx="9" fill={active?'#fff':'#f8faf8'} stroke={active?'#b1d8c1':'#e4eae5'}/>
   <rect x={c.x-94} y={n.y-29} width="5" height="58" rx="2" fill={active?'#14825c':'#d9e2db'}/>
   <text x={c.x-77} y={n.y-4} fill={active?'#134b34':'#52665b'} fontSize="14" fontWeight="650">{n.title}</text>
   <text x={c.x-77} y={n.y+17} fill="#62766a" fontSize="10.5">{n.sub}</text>
  </g>}))}
 </svg>
}
