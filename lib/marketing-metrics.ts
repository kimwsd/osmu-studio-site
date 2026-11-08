import type {Report,Lead} from './crm';
import {kstDay} from './crm';
export function ratio(n:number|undefined|null,d:number|undefined|null){return n==null||d==null||!Number.isFinite(n+d)||d<=0?null:n/d}
export function duration(seconds:number|null|undefined){if(seconds==null||!Number.isFinite(seconds))return '—';const n=Math.max(0,Math.round(seconds));return n<60?n+'초':Math.floor(n/60)+'분 '+n%60+'초'}
export function reportReady(report:Report|undefined,kind:string){return report?.totals.generalReportAvailable!==0&&!!report?.breakdowns.some(r=>r.kind==='journey_status'&&r.name===kind&&r.events===1)}
export function change(current:number|null|undefined,previous:number|null|undefined){if(current==null||previous==null||previous<=0)return '이전 기간 비교 불가';const p=(current-previous)/previous*100;return (p>0?'+':'')+p.toFixed(1)+'% · 이전 기간 대비'}
export function marketingCohort(leads:Lead[],start:string,end:string){const rows=leads.filter(l=>!l.is_test&&kstDay(new Date(l.created_at))>=start&&kstDay(new Date(l.created_at))<=end),contracts=rows.filter(l=>l.contract_date);return {rows,contracts:contracts.length,contractValue:contracts.reduce((s,l)=>s+Number(l.contract_value||0),0),qualified:rows.filter(l=>l.qualification==='상담 적합').length,rate:ratio(contracts.length,rows.length)}}
export function csvCell(value:unknown){const text=String(value??'');return '"'+(/^[=+@\-\t\r]/.test(text)?"'":'')+text.replaceAll('"','""')+'"'}
