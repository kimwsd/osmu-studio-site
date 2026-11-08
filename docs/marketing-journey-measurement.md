# 방문 및 클릭 경로 측정

적용: 2026-11-08. OSMU 운영 사이트, GA4 563224469 / G-81RMZW4B6T. GTM 기존 공개 버전 2를 사용한다.

## 관리자에서 확인하는 항목

| 보기 | 실제 GA4 기준 | 해석 |
|---|---|---|
| 첫 방문 페이지 | landingPage + sessionSourceMedium, sessions / engagedSessions | 세션이 시작된 페이지와 유입 채널 |
| 랜딩별 문의 완료 | 동일 차원, generate_lead eventCount | 해당 랜딩·출처 세션의 문의 이벤트 수 |
| 많이 본 페이지 | pagePath, screenPageViews / totalUsers | 페이지별 조회와 사용자. 행별 사용자를 합쳐 전체 순 사용자로 해석하지 않음 |
| 페이지 이동 | pageReferrer + pagePath, page_view eventCount | 조회 시 직전 주소와 도착 페이지. 개인의 전체 여정 아님 |
| 클릭한 항목 | eventName + pagePath + linkUrl + linkText + linkId | 클릭 발생 페이지·목적지·종류·위치별 횟수 |
| 최근 30분 | runRealtimeReport / eventName / eventCount | 일반 보고서 처리 전 수신 확인 |

## 이벤트

- `navigation_click`: 다른 공개 내부 페이지로 이동하는 링크.
- `consultation_click`: 문의 페이지로 가는 링크. navigation_click과 중복 전송하지 않음.
- `contact_click`: 이메일·카카오톡·인스타그램. 주소/계정 식별 경로는 보내지 않고 채널만 전송.
- `interface_click`: 메뉴 클릭, 검색 열기, 서비스 탭, 인사이트 더 보기, 공유 버튼. 명시적으로 등록한 버튼만 전송. 마우스 위치, 입력 내용, 검색어는 전송하지 않음.
- `generate_lead`: 저장 성공한 문의만 전송. 클릭·작성 시작을 접수 완료로 계산하지 않음.

링크의 query/hash는 제외한다. 내부 경로는 공개 페이지 허용 목록만 사용한다. 개인별 사용자 ID나 세션 원본 로그를 새로 저장하지 않는다. 분석 동의 후에만 전송하며 관리자·로컬 페이지는 수집에서 제외한다. Meta/CAPI 전송 범위는 바꾸지 않는다.

새 클릭 필드는 적용 이후부터 수집된다. 과거의 클릭 목적지·위치를 복원할 수 없다. 내부 이동은 페이지 referrer 쌍의 집계이며 실제 이동 완료와 링크 클릭 횟수는 다를 수 있다. 일반 GA4 보고서 반영에는 처리 시간이 필요하다.

## 검증

- 개인정보/검색문자열 제외, 동의 거절, 관리자 제외, 문의 클릭 중복 방지, 직전 페이지 기록 테스트 통과.
- 확장 보고서 5개(landing / landing_leads / page / transition / click) 모두 실제 GA4 API 정상 응답 확인.
- 운영 배포 b21a856 / GitHub Actions 42491907492 성공. analytics-report v8 활성.
- 운영 홈페이지에서 서비스 탭과 상세 링크를 클릭한 뒤 2026-11-08 23:56 KST 관리자 실시간 집계에 interface_click 1회, navigation_click 1회 수신을 확인했다. 일반 보고서의 상세 행은 아직 처리 대기이며, 클릭별 파라미터 행까지 검증 완료한 것은 아니다.
- 읽기 권한은 기존 GA4 서비스 계정 사용. 보고서 조회 함수는 관리자 인증 필요.
- 오류·미조회는 ‘확인 필요’로 표시하고, API가 정상 반환한 빈 집계만 0으로 표시.

공식 필드 정의: https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema
