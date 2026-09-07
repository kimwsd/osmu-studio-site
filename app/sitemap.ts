import type {MetadataRoute} from 'next';
export const dynamic='force-static';
import {getProjects} from '@/lib/projects';
import {services} from '@/lib/services';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const projects=(await getProjects()).filter(project=>!project.archived);const paths=['','/work','/studio','/services','/process','/contact','/privacy','/terms',...services.map(s=>`/services/${s.slug}`),...projects.map(p=>`/work/${p.slug}`)];const lastModified=new Date('2026-09-07T00:00:00.000Z');return paths.map(path=>({url:`https://osmu-studio.com${path}/`,lastModified,changeFrequency:'monthly',priority:path===''?1:0.7}))}
