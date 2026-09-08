// Homepage-only artwork approved by the owner; existing project records stay unchanged.
export const homeSelected = [
  {slug:'odd-hours',name:'ODD HOURS',cat:'Graphic Design',summary:'문화 페스티벌 포스터',width:1122,height:1402},
  {slug:'mora',name:'MORA',cat:'Branding · Package Design',summary:'바디 케어 패키지 디자인',width:1672,height:941},
  {slug:'zest-club',name:'ZEST CLUB',cat:'Branding · Package Design',summary:'탄산음료 패키지 디자인',width:1672,height:941},
  {slug:'dianas',name:'DIANA’S',cat:'Package Design',summary:'씨푸드 패키지 디자인',width:960,height:640},
  {slug:'bastet',name:'BASTÉT',cat:'Package Design',summary:'오럴 케어 패키지 디자인',width:960,height:640},
].map(project=>({...project,images:[`/assets/home-selected/${project.slug}.webp`],href:`#project-${project.slug}`}));

export const homeHero = homeSelected.filter(project=>project.slug==='mora'||project.slug==='zest-club');
