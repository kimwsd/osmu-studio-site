# OSMU STUDIO — Next.js / GitHub Pages

Next.js App Router + React + TypeScript로 개발하고 정적 HTML로 내보냅니다. 고객 화면의 원본은 `app/`, `components/`, `lib/`이며 루트의 이전 HTML은 전환 전 소스입니다.

## 실행과 검증

```sh
npm ci
npm run dev
# 정적 배포와 같은 방식으로 확인
npm run build
npm start
# 별도 터미널
npm test
npm run typecheck
```

로컬 주소: http://127.0.0.1:3000. `out/`이 배포 결과물입니다. `postbuild`가 기존 `.html` 주소를 새 페이지로 연결하고 CNAME 및 `.nojekyll`을 생성합니다.

## 페이지와 디자인

| 메뉴 | 경로 | 내용 |
|---|---|---|
| Work | /work/ | 프로젝트 필터, 목록/격자, 프로젝트별 상세 |
| About | /studio/ | 스튜디오 소개, 가치, 경력 |
| Services | /services/ | 6개 서비스 및 각각의 상세 |
| Process | /process/ | 4단계 진행 방식과 FAQ |
| Contact | /contact/ | 문의 폼과 실제 연락처 |

Wolff Olins의 전체 화면 슬라이더, 축소되는 내비게이션, 검색, 비대칭 작업 목록, 검정 상세 화면과 노란 푸터를 OSMU 내용으로 구성했습니다. `docs/reference-wolff.md`에 관찰한 상호작용과 적용 범위를 기록합니다.

- Helvetica → Helvetica Neue → Arial → 한글 시스템 고딕 순으로 지정합니다. Helvetica 웹폰트 파일은 포함하지 않으며 미설치 Windows에서는 Arial로 표시됩니다.
- `public/logo.svg`, `public/favicon.svg`는 사용자가 제공한 원본입니다. ICO/Apple 아이콘은 `scripts/build-brand-icons.mjs`로 생성합니다.
- 자체 콘셉트 작업 8개와 구형 상세 주소용 작업 6개를 보존합니다. 실제 고객 사례로 표시하지 않습니다.
- `public/assets/osmu-concept-reel.mp4`: 자체 콘셉트 이미지 8개로 구성한 12초, 1280×720, 30fps 영상. 재생/정지 및 전체 화면을 제공합니다. 재생성 스크립트는 `scripts/build-concept-reel.mjs`입니다.

## 기존 Supabase 연결

- `lib/projects.ts`가 빌드 시 기존 `projects` 테이블의 공개 데이터를 읽습니다. 공개 데이터가 없거나 연결에 실패하면 명시적으로 표시한 로컬 콘셉트 작업을 사용합니다.
- 2026-09-07 공개 GET 확인: HTTP 200, 공개 조회 0건. 관리자 전체 데이터 건수를 의미하지 않습니다.
- `lib/submit-inquiry.mjs`가 브라우저에서 기존 공개 anon 권한으로 `inquiries`에 저장합니다. 저장 성공 후 기존 FormSubmit 알림을 요청합니다. 기존 관리자와 동일한 테이블 및 입력 필드를 유지합니다.
- RLS, 스키마, 관리자 계정은 변경하지 않았습니다. service-role 키는 사용하지 않습니다. 공개 anon 기본 설정은 `lib/public-config.json`, 이전할 때 환경 변수는 `.env.example`을 참고합니다.
- 실제 문의/알림은 검수 중 발송하지 않았습니다. 저장 거부, 동의 누락, 알림 실패는 외부 요청을 대체한 단위 테스트로 확인합니다. 서버 API Route는 정적 호스팅에서 제공하지 않습니다.
- 관리자는 기존 `/admin.html`을 사용합니다. **프로젝트를 추가/수정한 후 Actions의 `Deploy Next.js to GitHub Pages` → `Run workflow`를 실행해야 공개 목록과 정적 상세 페이지에 반영됩니다.** 문의 접수와 관리자 조회는 실시간으로 기존 Supabase에 연결됩니다.

## 배포

기존 저장소: https://github.com/kimwsd/osmu-studio-site

기존 운영 도메인: https://osmu-studio.com/

`.github/workflows/deploy-pages.yml`이 main push 또는 수동 실행 시 Node 22에서 설치, 정적 빌드, 타입 검사, 14개 테스트를 수행한 다음 `out/`을 GitHub Pages에 배포합니다. 저장소 Pages 설정은 GitHub Actions를 사용합니다. CNAME과 기존 DNS는 유지합니다.

검수 기록: `design-qa.md`, `docs/qa-wolff/`. 이전 Fineworks/NAV 검수 자료는 이력으로 보존합니다.
