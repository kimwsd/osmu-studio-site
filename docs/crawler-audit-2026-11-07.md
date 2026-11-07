# 검색·AI 크롤러 점검 / 2026-11-07

## 범위와 변경
- 사이트맵의 공개 URL 44개 전체: 최초 HTML의 H1, 설명, canonical, robots, JSON-LD, Open Graph 및 공유 이미지 검사.
- 기존 robots.txt도 `User-agent: * / Allow: /`로 공개 페이지 수집을 허용했다. 이번 작업은 차단 해제가 아니라 정책 명시와 기업 정보 일관성 개선이다.
- Googlebot, Googlebot-Image, bingbot, Yeti, OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, Google-Extended를 명시했다. 특정 봇 그룹에도 관리자 경로 제한을 반복해 적용했다.
- GPTBot·ClaudeBot 학습 정책은 기존 wildcard 허용을 유지했다. 학습 허용이 검색 노출을 보장하거나 검색에 필수라는 의미는 아니다.
- 공개 페이지의 Googlebot 미리보기 제한은 이미지 large, 텍스트·영상 길이 -1로 명시했다. 관리자 noindex 및 sitemap 제외, 관리자·편집 경로 수집 제한은 유지했다.
- 공통 Organization에 실제 운영자명·사업자등록번호·주소·이메일·3EO 브랜드 관계를 추가했다. AboutPage, Service, BlogPosting의 운영자 참조를 동일한 @id로 연결했다.
- 회사소개는 업무 대상·실행 내용·산출물·협업 책임·사업자 정보와 업무 설명용 AI 일러스트를 보강했다. 실제 직원·프로젝트 사진으로 표시하지 않는다.
- 개인정보처리방침은 현재 상담·관리자 미연결 상태, 브라우저 도구 입력, 외부 이미지 요청, 이메일 문의, GitHub Pages 접속 기록을 구분한다. GA4/GTM/Meta Pixel/CAPI 및 Supabase 연결은 활성화하지 않았다.

## 검증과 해석
- 배포 전: 빌드와 타입 검사 통과. 공개 44개 및 관리자 1개, 자산 42개, 구형 URL 36개 export 검증 오류 0건.
- 공개 44개 × 13개 봇·정책 토큰 = 572개 경로 정책 점검에서 차단 없음. 관리자는 noindex이며 sitemap에서 제외됨.
- 배포 후 운영 도메인 HTML, robots, sitemap 및 봇 이름을 사용한 HTTP 요청 결과는 별도 JSON 증빙으로 기록한다.
- User-Agent 요청 검사는 실제 검색엔진 IP에서의 접속이나 서버 로그를 확인한 결과가 아니다. Google-Extended는 독립 HTTP User-Agent가 없으므로 요청을 가장하지 않고 정책 토큰으로만 점검한다.
- 실제 색인, 검색 순위, AI 언급·인용·추천 여부는 이 검사로 확정할 수 없다. Search Console·Bing Webmaster·네이버 서치어드바이저의 계정 및 실제 검색 관측은 별도 확인이 필요하다.
- llms.txt는 공식 서비스 정보를 요약하는 보조 파일이다. 모든 AI가 읽는 표준이나 노출 보장 장치로 해석하지 않는다.

## 공식 근거
- OpenAI: https://developers.openai.com/api/docs/bots — OAI-SearchBot 검색, GPTBot 학습, ChatGPT-User 사용자 요청 구분.
- Anthropic: https://privacy.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler — Claude-SearchBot, Claude-User, ClaudeBot 구분.
- Perplexity: https://docs.perplexity.ai/docs/resources/perplexity-crawlers — 검색 및 사용자 요청, 실제 IP/WAF 확인 필요.
- Google: https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers — Google-Extended의 Gemini 학습·grounding 범위, Google 검색 순위와 독립.
- Google Search: https://developers.google.com/search/docs/appearance/ai-features — 기본 검색 기술 요건과 콘텐츠 접근성, AI 전용 별도 마크업 불필요.
- Naver: https://searchadvisor.naver.com/guide/seo-basic-robots — Yeti 및 robots 적용.
- Bing: https://www.bing.com/webmasters/help/how-to-create-a-robots-txt-file-cb7c31ec — 명시적 봇 그룹과 일반 규칙 적용.
- GitHub Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages#data-collection — 보안 목적 방문 IP 기록.

참고 디자인: https://elifunt.kr/about/ 및 https://elifunt.kr/team/의 회사 역할·업무 원칙·협업 소개 흐름을 검토했다. 원문, 팀원·고객·성과 수치나 이미지는 가져오지 않았다.
