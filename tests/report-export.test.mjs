import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes,createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
const require=createRequire(import.meta.url);
const source=stripTypeScriptTypes((await readFile('lib/report-export.ts','utf8')).replace(/^import type.*$/mg,'')).replace("import('exceljs')",`import(${JSON.stringify(pathToFileURL(require.resolve('exceljs')).href)})`);
const {reportHtml,reportWorkbook,analyticsExport,rawTable}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const sample={title:'카카오 유입',source:'GA4',period:'2026-11-01 ~ 2026-11-10',filters:['카카오'],notes:['테스트 데이터'],tables:[{name:'유입 / 상세: [선택]',headers:['출처','세션','미확인','확인된 0','문자'],rows:[['kakao',3,null,0,'=SUM(1,2)']]}]};
test('workbook roundtrip retains Korean, numeric cells, true zeros and unknowns',async()=>{
 const book=await reportWorkbook(sample),buffer=await book.xlsx.writeBuffer();
 const ExcelJS=(await import('exceljs')).default,parsed=new ExcelJS.Workbook();await parsed.xlsx.load(buffer);
 assert.equal(parsed.worksheets.length,2);const sheet=parsed.worksheets[1];
 assert.doesNotMatch(sheet.name,/[\\/?*:\[\]]/);assert.equal(sheet.getCell('B2').value,3);assert.equal(sheet.getCell('C2').value,'미확인');assert.equal(sheet.getCell('D2').value,0);assert.equal(sheet.getCell('E2').value,'=SUM(1,2)');assert.equal(sheet.getCell('E2').type,ExcelJS.ValueType.String);
 assert.equal(parsed.worksheets[0].getCell('B2').value,'카카오 유입');assert.equal(sheet.views[0].state,'frozen');
});
test('report HTML escapes all user strings, does not execute imported content, and retains filters',()=>{
 const html=reportHtml({...sample,title:'<script>alert(1)</script>',tables:[{name:'<svg>',headers:['안내'],rows:[['<img src=x onerror=alert(1)>']]}]});
 assert.doesNotMatch(html,/<script|<img/);assert.match(html,/&lt;script&gt;/);assert.match(html,/선택 조건: 카카오/);assert.match(html,/PDF 저장 \/ 인쇄/);assert.match(html,/@media print/);
});
test('GA raw reports preserve missing and measured values and export explicit breakdown scope',()=>{
 const data={source:'ga4',period_start:'2026-11-01',period_end:'2026-11-10',collected_at:'2026-11-10T10:00:00Z',totals:{sessions:3,totalUsers:null},series:[{date:'2026-11-01',sessions:3}],breakdowns:[{kind:'campaign',name:'always_on',source:'kakao',sessions:3},{kind:'page',name:'/',views:5}]};
 const r=analyticsExport(data,'GA4',['campaign']);assert.equal(r.tables.length,3);assert.equal(r.tables[2].name,'캠페인');assert.equal(r.tables[0].rows.find(x=>x[0]==='사용자(명)')[1],null);assert.equal(r.chart.values[0],3);
 const table=rawTable('숫자',[{source:'kakao',sessions:0},{source:'instagram',sessions:null}]);assert.equal(table.rows[0][1],0);assert.equal(table.rows[1][1],null);
});
test('worksheet names are unique and nonfinite values remain unknown',async()=>{
 const book=await reportWorkbook({...sample,tables:[{name:'중복',headers:['수치'],rows:[[NaN]]},{name:'중복',headers:['수치'],rows:[[Infinity]]}]});
 assert.equal(new Set(book.worksheets.map(s=>s.name)).size,3);assert.equal(book.worksheets[1].getCell('A2').value,'미확인');assert.equal(book.worksheets[2].getCell('A2').value,'미확인');
});
