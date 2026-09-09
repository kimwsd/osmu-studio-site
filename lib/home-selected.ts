// Homepage-only artwork approved by the owner; existing project records stay unchanged.
export const homeSelected = [
  {slug:'odd-hours',name:'ODD HOURS',cat:'Graphic Design',summary:'문화와 음악이 교차하는 밤의 에너지를 대담한 타이포그래피와 색으로 구축한 페스티벌 포스터 시스템.',width:1122,height:1402},
  {slug:'mora',name:'MORA',cat:'Branding · Package Design',summary:'무화과와 시더의 온기를 절제된 세리프와 소재의 질감으로 연결한 바디 케어 패키지.',width:1672,height:941},
  {slug:'zest-club',name:'ZEST CLUB',cat:'Branding · Package Design',summary:'과즙의 생동감과 탄산의 리듬을 선명한 컬러와 친근한 레터링으로 풀어낸 음료 브랜드.',width:1672,height:941},
  {slug:'dianas',name:'DIANA’S',cat:'Package Design',summary:'차가운 바다의 색과 큰 타이포그래피를 결합해 진열대에서 빠르게 읽히는 씨푸드 패키지.',width:960,height:640},
  {slug:'bastet',name:'BASTÉT',cat:'Package Design',summary:'욕실의 오브제와 어울리는 고전적 인상과 현대적 여백을 조율한 오럴 케어 패키지.',width:960,height:640},
].map(project=>({...project,images:[`/assets/home-selected/${project.slug}.webp`],href:`/work/${project.slug}/`}));

const originalHeroSummaries: Record<string,string> = {
  mora: '바디 케어 패키지 디자인',
  'zest-club': '탄산음료 패키지 디자인',
};

export const homeHero = homeSelected
  .filter(project=>project.slug==='mora'||project.slug==='zest-club')
  .map(project=>({
    ...project,
    summary: originalHeroSummaries[project.slug],
    href: `#project-${project.slug}`,
  }));
