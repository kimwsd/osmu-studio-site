type Bucket={start_time:string;data:{value:string;count:number}[]};
export function normalizeMeta(rows:Bucket[],start:string,end:string){
 const byDate=new Map<string,{date:string;events:number;leads:number}>(),counts=new Map<string,number>();
 for(const row of rows){const parsed=new Date(row.start_time);if(!Number.isFinite(parsed.getTime())||!Array.isArray(row.data))throw Error('Meta 통계 형식을 확인해 주세요.');const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(parsed);if(date<start||date>end)continue;
  const daily=byDate.get(date)||{date,events:0,leads:0};
  for(const item of row.data){if(typeof item.value!=='string'||!Number.isFinite(item.count)||item.count<0)throw Error('Meta 수신 건수 형식을 확인해 주세요.');counts.set(item.value,(counts.get(item.value)||0)+item.count);daily.events+=item.count;if(item.value==='Lead')daily.leads+=item.count;}byDate.set(date,daily);
 }
 return {source:'meta_pixel',period_start:start,period_end:end,totals:{events:[...counts.values()].reduce((a,b)=>a+b,0),pageViews:counts.get('PageView')||0,leads:counts.get('Lead')||0},series:[...byDate.values()].sort((a,b)=>a.date.localeCompare(b.date)),breakdowns:[...counts.entries()].map(([name,events])=>({kind:'event',name,events})).sort((a,b)=>b.events-a.events),collected_at:new Date().toISOString()};
}
