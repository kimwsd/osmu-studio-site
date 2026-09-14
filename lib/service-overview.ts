import { categories } from './project-categories';

const details = [
 ['branding','브랜드 전략','시장과 고객, 브랜드의 현재를 분석해 포지셔닝과 실행의 우선순위를 정합니다.'],
 ['ci-bi','브랜드 · 기업 아이덴티티','로고와 컬러, 서체부터 응용 기준까지 브랜드를 일관되게 표현하는 시각 체계를 만듭니다.'],
 ['web-digital','사용자 경험 · 인터페이스','사용자의 목적과 행동을 바탕으로 정보 구조, 이용 흐름과 화면을 설계합니다.'],
 ['web-digital','웹사이트','브랜드 소개와 콘텐츠 탐색, 문의까지 자연스럽게 연결되는 반응형 웹사이트를 제작합니다.'],
 ['web-digital','앱 디자인','모바일 서비스의 핵심 기능을 정리하고 화면 흐름과 인터페이스를 디자인합니다.'],
 ['ci-bi','캐릭터 디자인','브랜드의 성격을 담은 캐릭터와 표정, 동작, 다양한 매체의 응용 디자인을 만듭니다.'],
 ['space-branding','패키지 디자인','제품의 특성과 진열 환경을 고려해 패키지, 라벨과 인쇄용 디자인을 설계합니다.'],
 ['space-branding','그래픽 디자인','포스터와 편집물, 공간 그래픽까지 정보와 브랜드의 인상을 매체에 맞게 구성합니다.'],
 ['brand-film','영상 제작','콘셉트와 스토리보드부터 촬영, 편집과 모션그래픽까지 브랜드의 이야기를 영상으로 만듭니다.'],
 ['brand-film','사진 촬영','제품과 공간, 인물의 특징을 조명과 구도로 담아 브랜드에 필요한 사진을 제작합니다.'],
 ['ai-image-film','AI 비주얼 스튜디오','브랜드의 기준에 맞춰 AI 이미지와 영상을 기획하고 합성·보정해 다양한 콘텐츠로 확장합니다.'],
 ['marketing','마케팅','고객에게 닿을 메시지와 채널을 정하고 캠페인, 콘텐츠와 개선 방향을 연결합니다.'],
];
export const serviceOverview = categories.filter(title=>title!=='All').map((title,index)=>({
 title, number:String(index+1).padStart(2,'0'), slug:details[index][0], koreanTitle:details[index][1], rowCopy:details[index][2],
}));
