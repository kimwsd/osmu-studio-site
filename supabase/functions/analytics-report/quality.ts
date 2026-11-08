// Empty/thresholded responses are not proof that no visitors existed.
export function numericValues(row:any){
 if(!Array.isArray(row?.metricValues))throw Error('GA4 수치 응답 형식을 확인해 주세요.');
 return row.metricValues.map((x:any)=>{if(typeof x.value!=='string'||x.value.trim()==='')throw Error('GA4 수치가 누락되었습니다.');const n=Number(x.value);if(!Number.isFinite(n)||n<0)throw Error('GA4 수치 형식을 확인해 주세요.');return n});
}
export function reportQuality(result:any,name:string){
 const m=result.metadata||{},notes:string[]=[];
 if(m.subjectToThresholding)notes.push('개인정보 임계값 적용 가능');
 if(m.dataLossFromOtherRow)notes.push('일부 세부 항목이 기타로 통합됨');
 if(m.samplingMetadatas?.some((s:any)=>Number(s.samplesReadCount)<Number(s.samplingSpaceSize)))notes.push('표본 집계');
 if(m.dataTruncationReasons?.length)notes.push('일부 데이터 잘림');
 if(m.schemaRestrictionResponse?.activeMetricRestrictions?.length)throw Error('GA4 일부 수치 조회 권한이 제한되어 있습니다.');
 if(m.timeZone&&m.timeZone!=='Asia/Seoul')throw Error('GA4 속성 시간대가 한국 시간과 다릅니다. 기간 비교 전 속성 시간대를 확인해 주세요.');
 if(m.emptyReason)notes.push('빈 응답: '+String(m.emptyReason).slice(0,200));
 for(const row of result.rows||[])numericValues(row);
 return {kind:'report_quality',name,note:notes.join(' · '),timezone:m.timeZone||'',events:(result.rows||[]).length};
}
