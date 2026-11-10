"use client";
import {useState} from 'react';
import {FileSpreadsheet,FileText} from 'lucide-react';
import {type ExportReport,reportWorkbook,reportHtml,exportFilename} from '@/lib/report-export';
export function ReportExport({report,disabled=false}:{report:()=>ExportReport;disabled?:boolean}){const [busy,setBusy]=useState(false),[status,setStatus]=useState('');
 async function excel(){setBusy(true);setStatus('');try{const r=report(),book=await reportWorkbook(r),buffer=await book.xlsx.writeBuffer();const url=URL.createObjectURL(new Blob([new Uint8Array(buffer)],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));const a=document.createElement('a');a.href=url;a.download=exportFilename(r,'xlsx');a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);setStatus('엑셀 파일을 내려받았습니다. 숫자는 계산 가능한 셀로 저장됩니다.')}catch(e){setStatus('내보내지 못했습니다. '+(e instanceof Error?e.message:'다시 시도해 주세요.'))}finally{setBusy(false)}}
 function pdf(){setStatus('');try{const w=window.open('','_blank');if(!w){setStatus('브라우저의 팝업 차단을 해제한 뒤 다시 눌러 주세요.');return}w.opener=null;w.document.open();w.document.write(reportHtml(report()));w.document.close();w.document.getElementById('print-report')?.addEventListener('click',()=>w.print());setStatus('새 보고서 창에서 “PDF 저장 / 인쇄”를 누르고 “PDF로 저장”을 선택하세요.')}catch{setStatus('PDF 보고서를 열지 못했습니다. 다시 시도해 주세요.')}}
 return <div className="report-export"><div role="group" aria-label="선택 데이터 내보내기"><button className="admin-btn" disabled={disabled||busy} onClick={()=>void excel()}><FileSpreadsheet size={15}/>{busy?'엑셀 생성 중':'엑셀 다운로드'}</button><button className="admin-btn" disabled={disabled||busy} onClick={pdf}><FileText size={15}/>PDF 보고서</button></div>{status&&<p role="status">{status}</p>}</div>
}
