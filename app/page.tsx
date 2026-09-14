import HomeVideoHero from '@/components/home-video-hero';
import HomeCategoryBanner from '@/components/home-category-banner';
import HomePortfolio from '@/components/home-portfolio';
import { getProjects } from '@/lib/projects';
export const metadata={title:'천안 브랜딩·그래픽·패키지 디자인 스튜디오',description:'브랜드 진단과 브랜딩부터 그래픽, 패키지, 사진·영상, 마케팅과 디지털 경험까지 설계하는 천안의 오스무 스튜디오입니다.',alternates:{canonical:'/'}};
export default async function Home(){const projects=await getProjects();return <>
 <HomeVideoHero/>
 <HomeCategoryBanner/>
 <HomePortfolio projects={projects.filter(project=>!project.archived)}/>
 </>}
