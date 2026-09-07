# Search Advisor · Bing Webmaster 연결 절차

이 단계는 사이트 소유자 계정이 필요합니다. 코드에는 Google과 네이버 소유 확인 메타가 이미 배포되며, sitemap URL은 다음과 같습니다.

`https://osmu-studio.com/sitemap.xml`

## 네이버 서치어드바이저

1. [네이버 서치어드바이저](https://searchadvisor.naver.com/)에서 `osmu-studio.com`을 사이트로 등록합니다.
2. HTML 메타 태그 방식으로 소유 확인을 실행합니다. 사이트의 `naver-site-verification` 메타가 확인되면 추가 코드는 필요하지 않습니다.
3. `요청 > 사이트맵 제출`에서 위 sitemap URL을 제출합니다.
4. `요청 > 웹 페이지 수집`에서 홈페이지, 서비스, 프로세스, 문의 페이지를 우선 요청합니다.
5. 2026-09-21에 `콘텐츠 노출·클릭`과 검색어 목록을 측정표에 입력합니다.

## Bing Webmaster Tools

1. [Bing Webmaster Tools](https://www.bing.com/webmasters/)에서 사이트를 추가합니다.
2. Google Search Console을 이미 사용한다면 Import를 선택하고, 그렇지 않으면 XML/메타 방식으로 소유 확인합니다.
3. Sitemaps에서 위 sitemap URL을 제출합니다.
4. IndexNow가 배포 워크플로에서 정상 처리됐는지 GitHub Actions의 `indexnow` 작업 로그를 확인합니다.
5. 2026-09-21에 Search Performance의 노출·클릭·CTR·평균 순위를 측정표에 입력합니다.

## 완료 기준

- 두 콘솔 모두 sitemap을 정상 수신한 상태
- 각 콘솔에서 홈페이지 URL의 수집 또는 색인 상태 확인
- `docs/search-measurement-baseline.md`에 첫 기준선과 14일 재측정값 기록
