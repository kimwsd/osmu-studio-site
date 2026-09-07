export type HomeStory = {
  label: string;
  title: string;
  copy: string;
  href: string;
  image: string;
};

export type HomeContent = {
  ambitionEyebrow: string;
  ambition: string;
  insideTitle: string;
  stories: HomeStory[];
};

export const homeDefaults: HomeContent = {
  ambitionEyebrow: 'Our Ambition',
  ambition: 'We turn a clear thought into a brand people recognise, connect with and remember.',
  insideTitle: 'Inside OSMU',
  stories: [
    {label:'Our approach',title:'좋은 디자인의 시작은, 좋은 질문.',image:'creative-collaboration',href:'/studio',copy:'전략과 감각을 연결하는 오스무 스튜디오의 생각.'},
    {label:'Identity & Packaging',title:'한눈에 알아보고, 손끝에 기억되도록.',image:'package-system',href:'/services/ci-bi',copy:'로고에서 제품 패키지까지 이어지는 브랜드의 표정.'},
    {label:'Our process',title:'질문에서 납품까지, 같은 방향으로.',image:'identity-system',href:'/process',copy:'함께 결정하고 확인하는 디자인 진행 과정.'},
    {label:'Motion & Content',title:'브랜드의 리듬을 만드는 방법.',image:'brand-film',href:'/services/brand-film',copy:'브랜드 자산을 움직임과 콘텐츠로 확장합니다.'}
  ]
};

const cleanText = (value: unknown, fallback: string, maxLength: number) =>
  typeof value === 'string' && value.trim() ? value.trim().slice(0, maxLength) : fallback;

export function mergeHomeContent(value: unknown): HomeContent {
  const input = value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
  const inputStories = Array.isArray(input.stories) ? input.stories : [];
  return {
    ambitionEyebrow: cleanText(input.ambitionEyebrow, homeDefaults.ambitionEyebrow, 48),
    ambition: cleanText(input.ambition, homeDefaults.ambition, 280),
    insideTitle: cleanText(input.insideTitle, homeDefaults.insideTitle, 80),
    stories: homeDefaults.stories.map((story, index) => {
      const saved = inputStories[index] && typeof inputStories[index] === 'object' && !Array.isArray(inputStories[index])
        ? inputStories[index] as Record<string, unknown> : {};
      return {
        ...story,
        label: cleanText(saved.label, story.label, 60),
        title: cleanText(saved.title, story.title, 120),
        copy: cleanText(saved.copy, story.copy, 240)
      };
    })
  };
}
