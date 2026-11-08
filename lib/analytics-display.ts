import type {Report} from './crm';

export const eventLabels:Record<string,string>={user_engagement:'활성 화면 참여',page_view:'페이지 조회',navigation_click:'페이지 이동 클릭',interface_click:'메뉴·버튼 클릭',scroll_depth_25:'25% 스크롤',scroll_depth_50:'50% 스크롤',scroll_depth_75:'75% 스크롤',scroll_depth_90:'90% 스크롤',view_service:'서비스 상세',view_solution:'솔루션 상세',view_insight:'인사이트 열람',consultation_click:'상담 버튼',contact_start:'문의 작성 시작',select_service:'서비스 선택',generate_lead:'접수 완료',contact_click:'연락 채널 클릭',scroll:'스크롤',PageView:'페이지 조회',Lead:'접수 완료'};
export function calendarSeries(report:Report|undefined,start:string,end:string,key:'sessions'|'users'|'events'|'leads'){
 const result:{date:string;value:number|null}[]=[];
 for(let d=new Date(start+'T00:00:00Z');d.toISOString().slice(0,10)<=end;d.setUTCDate(d.getUTCDate()+1)){
  const date=d.toISOString().slice(0,10),row=report?.series.find(x=>x.date===date);
  const usable=report&&date>=report.period_start&&date<=report.period_end&&report.totals?.generalReportAvailable!==0;
  result.push({date,value:usable?(row?.[key]??0):null});
 }
 return result;
}
export function eventCount(report:Report|undefined,name:string,kind='event'){
 if(!report||report.totals.generalReportAvailable===0)return null;
 return report.breakdowns.find(x=>x.kind===kind&&x.name===name)?.events??0;
}
export function percent(n:number|null,d:number|null){return n===null||d===null||d<=0?null:n/d*100}
export function channelRows(report:Report|undefined){return (report?.breakdowns||[]).filter(x=>(x.kind||'channel')==='channel').map(x=>({name:x.name,value:x.sessions||0})).sort((a,b)=>b.value-a.value)}
