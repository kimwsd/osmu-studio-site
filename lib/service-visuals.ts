export type ServiceImage = {src:string;alt:string;width:number;height:number;label?:string};
export type ServiceVisual = {title:string;caption:string;note:string;images:ServiceImage[]};
const study='/assets/services/20260908/';
const perfume='/assets/work-generated/v2/';
export const serviceVisuals:Record<string,ServiceVisual>={
 branding:{title:'진단에서 실행 우선순위까지',caption:'브랜드·고객·시장 현황을 읽고, 포지셔닝 방향과 다음 실행의 기준을 정리합니다.',note:'서비스 산출물의 구성 예시',images:[{src:study+'consulting.webp',alt:'브랜드 현황 진단, 포지셔닝 방향, 실행 우선순위를 세 단계로 정리한 컨설팅 산출물 구성',width:1600,height:1000}]},
 'ci-bi':{title:'로고를 하나의 시각 체계로',caption:'Atelier Veld의 원본 로고를 중심으로 서체, 색상 역할, 명함과 가이드 표지의 관계를 보여줍니다.',note:'원본 로고를 보존한 브랜드 시스템 콘셉트',images:[{src:study+'branding.webp',alt:'Atelier Veld 원본 심볼과 워드마크, 타이포그래피, 색상 역할, 명함과 가이드 표지',width:1600,height:1000}]},
 'space-branding':{title:'브랜드를 실제 인쇄물과 패키지로',caption:'Buterra의 원본 로고를 패키지의 크기, 종이와 정보 위계에 맞춰 적용했습니다.',note:'원본 로고를 보존한 패키지 응용 콘셉트',images:[{src:study+'graphic-design.webp',alt:'기존 Buterra 로고를 그대로 적용한 정육 선물 상자와 포장 스티커 디자인',width:1536,height:1024}]},
 'brand-film':{title:'빛과 구도로 만드는 제품의 장면',caption:'유리의 질감과 제품의 형태가 드러나도록 조명, 배경과 촬영 구도를 설계합니다.',note:'사진·영상의 아트디렉션 방향을 보여주는 콘셉트 스틸',images:[{src:perfume+'brand-film-01.webp',alt:'빛과 그림자로 유리의 질감과 형태를 표현한 AFTER 01 향수 제품 콘셉트',width:1672,height:941}]},
 marketing:{title:'메시지에서 채널 운영까지',caption:'캠페인 키비주얼을 피드·숏폼 표지로 전개하고, 채널별 콘텐츠 운영 계획과 연결합니다.',note:'성과 수치를 포함하지 않은 자체 캠페인 구성 예시',images:[{src:study+'marketing.webp',alt:'AFTER 향수 키비주얼을 피드, 숏폼 표지와 주간 콘텐츠 운영안으로 확장한 마케팅 구성',width:1600,height:1000}]},
 'web-digital':{title:'실제 화면으로 확인하는 반응형 웹',caption:'OSMU 홈페이지가 PC에서는 넓은 정보 구조로, 모바일에서는 읽기 편한 세로 흐름으로 이어지는 모습입니다.',note:'OSMU STUDIO 홈페이지의 실제 PC·모바일 화면',images:[{src:study+'web-digital.webp',alt:'실제 OSMU 홈페이지의 데스크톱 메뉴와 모바일 서비스 목록을 비교한 반응형 웹 화면',width:1600,height:1000}]},
 'ai-image-film':{title:'기준 이미지에서 새로운 장면으로',caption:'제품의 기준 비주얼과 AI로 확장한 배경·공간을 비교해, 생성형 제작이 더하는 장면을 보여줍니다.',note:'AFTER 제품을 활용한 자체 AI 이미지 콘셉트 비교',images:[{src:perfume+'brand-film-01.webp',alt:'AI 장면 확장의 기준이 된 AFTER 향수 제품 비주얼',width:1672,height:941,label:'기준 제품 비주얼'},{src:perfume+'ai-image-film-01.webp',alt:'AFTER 향수를 물과 유리 리본, 가상 건축 공간으로 확장한 AI 콘셉트',width:1672,height:941,label:'AI로 확장한 장면'}]},
};
