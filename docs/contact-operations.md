# 문의 접수 운영 — 2026-11-08

## 연결 범위

- 공개 폼 → Supabase contact-submit → inquiries / inquiry_notifications → Resend → osmu_studio@naver.com.
- 발신: OSMU STUDIO <notifications@notify.osmu-studio.com>. DNS 4개 인증 완료. 기존 홈페이지 DNS 유지.
- Resend 키는 notify.osmu-studio.com 발송 전용, Supabase 서버 Secrets에만 저장. 저장 이름: RESEND_API_KEY, CONTACT_INTAKE_ENABLED. 키 값은 문서·소스에 기록하지 않는다.
- 공개 폼은 기존 공개 anon 자격으로 함수 호출. 서버는 필드·동의·허니팟·크기·서비스를 검증하며, 테이블 직접 INSERT와 접수 RPC는 서버만 허용한다.
- 이메일당 1시간 5건 / 전체 1시간 60건. 글로벌 제한에 도달하면 이메일 문의로 안내한다.
- 동일 요청번호와 동일 내용은 동일 접수번호 반환. 같은 번호의 다른 내용은 409. 이메일은 접수별 동일 멱등키 사용.
- 일시적 메일 오류(429, 5xx, 전송 예외)는 같은 발송 요청으로 최대 3회 시도. 문의 저장은 유지한다. 지속 실패는 failed로 남긴다.
- 관리자 CMS 활성화와 GA4/GTM/Meta/CAPI는 이번 단계에 포함하지 않는다.

## 문의 확인

Supabase 프로젝트 osmu-studio → Table Editor → inquiries에서 원문을 확인한다. 현재 웹사이트 관리자 콘텐츠 화면과는 별개다.

매일 신규 문의와 inquiry_notifications의 failed / 오래된 pending·sending을 함께 확인한다. sent는 발송 서비스가 접수했다는 의미이며 실제 수신 서버 전달은 Resend Emails의 Delivered로 확인한다. 받은편지함/스팸함 분류는 수신자가 확인한다.

실패 시 문의에 먼저 회신하고 Resend 발신 인증·한도·키 권한을 확인한다. 장시간 남은 sending은 실제 Resend 발송 기록을 대조한다. 24시간 뒤 무조건 재전송하면 중복 가능성이 있으므로 수동 확인 없이 상태를 초기화하지 않는다. 별도 주기적 재발송 작업은 아직 설치하지 않았다.

## 개인정보 운영

공개 방침과 동의는 상담 접수·회신, Supabase 싱가포르 저장, 최대 1년 보관을 안내한다. 운영자는 목적 달성·삭제 요청 건을 확인 후 삭제하며 월별로 만료 예정 기록을 확인해 1년을 넘기지 않도록 정리한다. 자동 삭제 예약은 아직 설치하지 않았으므로 운영자 관리가 필요하다. 법령·계약상 필요한 기록은 별도 근거·기간에 맞춰 분리 관리한다. 삭제하면 연결된 알림 기록도 함께 삭제된다.

Resend 알림에 고객 이름·이메일·회사·문의 본문을 넣지 않는다. 접수번호 일부와 관리자 저장공간 링크만 포함한다. 추적 이벤트로 고객 정보를 보내지 않는다.

## 검증 기록

- 필드/동의/허니팟/재시도 단위 검증 10개 통과.
- CORS 사전 요청 204, 허용하지 않은 Origin 403, 잘못된 입력 400, 동일 번호의 다른 내용 409.
- 실제 테스트 1건 저장 후 동일 요청 재전송: 동일 접수번호, 발송 1회 유지.
- 익명 inquiries 조회는 빈 배열, 알림 테이블 조회는 권한 거부. anon/authenticated 직접 INSERT 및 anon RPC 권한 없음.
- 이메일별 6번째 요청 제한을 DB 트랜잭션으로 확인하고 테스트 행은 롤백.
- Resend Delivered 확인: 01a1ba71-109d-71b1-bde1-f888d2a85a07. 실제 받은편지함 분류는 미확인.
- 320 CSS px 모바일 동의/버튼 배치와 가로 넘침 없음 확인.
- Next 정적 빌드, 타입 검사, 공개 페이지 48개 export 검증 통과.
- 보안 점검: 알림 테이블 정책 없음은 서버 전용 설계에 따른 의도적 접근 차단. 기존 Auth 유출 비밀번호 보호 경고는 다음 관리자 계정 단계에서 확인.

## 운영 제어

문의 폼 임시 중지: Supabase CONTACT_INTAKE_ENABLED=false. 이미 저장된 문의는 유지된다. 프런트 표시도 함께 맞추려면 lib/contact-config.ts enabled=false 후 정적 배포한다.

## 근거

- https://resend.com/setup.md
- https://resend.com/docs/dashboard/emails/idempotency-keys (서비스 멱등키 보관 24시간)
- https://supabase.com/privacy
- https://supabase.com/docs/guides/functions/secrets
