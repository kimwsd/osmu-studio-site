import WorkGrid from '@/components/work-grid';
import {getProjects} from '@/lib/projects';
export const metadata={title:'작업 — 그래픽·패키지·브랜드 디자인',description:'오스무 스튜디오가 브랜드 아이덴티티, 패키지, 공간 그래픽, 캠페인과 브랜드 영상의 방향을 탐색한 자체 콘셉트 스터디를 소개합니다.',alternates:{canonical:'/work'}};
export default async function WorkPage(){const projects=await getProjects();return <section className="work-page section-pad"><div className="page-intro"><h1>Ideas made visible. Through identities, objects and experiences that belong to a brand.</h1><p className="intro-note">그래픽과 패키지, 공간과 화면을 잇는 작업.<br/>오스무의 디자인 방향을 담은 자체 콘셉트 스터디를 소개합니다.</p></div><WorkGrid projects={projects} filters/></section>}
