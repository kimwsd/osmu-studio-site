import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
import vm from 'node:vm';
const source=stripTypeScriptTypes(await readFile('lib/solution-playbooks.ts','utf8')).replaceAll('export ','');
const data=vm.runInNewContext(source+';solutionPlaybooks');
const escape=value=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
await mkdir('public/images/solutions',{recursive:true});
for(const [slug,{stages}] of Object.entries(data)){
  const rows=stages.map((label,i)=>{
    const y=18+i*101,last=i===3;
    return `<rect x="12" y="${y}" width="456" height="80" rx="12" fill="${last?'#d2ecac':'#2c332e'}" stroke="${last?'#d2ecac':'#58625b'}"/><text x="34" y="${y+33}" fill="${last?'#485a37':'#aab6ae'}" font-size="12">0${i+1}</text><text x="78" y="${y+34}" fill="${last?'#202522':'#fff'}" font-size="22" font-weight="700">${escape(label)}</text><text x="78" y="${y+60}" fill="${last?'#485a37':'#bdc5bf'}" font-size="13">${['검색 노출·클릭','페이지·콘텐츠 탐색','접수 성공 기록','업무 시스템에서 확인'][i]}</text>${last?'':`<path d="M240 ${y+84}v13m-4-4 4 4 4-4" fill="none" stroke="#a8c785" stroke-width="2"/>`}`;
  }).join('');
  await writeFile(`public/images/solutions/${slug}-measurement.svg`,`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 420" role="img" aria-labelledby="title desc"><title id="title">고객 행동과 측정 단계</title><desc id="desc">${stages.map(escape).join(' → ')}. 실제 성과가 아닌 측정 구조 예시.</desc><g font-family="Arial,Malgun Gothic,sans-serif">${rows}</g></svg>`);
}
console.log(`Generated ${Object.keys(data).length} explanatory SVG diagrams; no performance data implied.`);
