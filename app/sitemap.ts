import type {MetadataRoute} from 'next';
export const dynamic='force-static';
import {getProjects} from '@/lib/projects';
import {services} from '@/lib/services';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const paths=['','/work','/studio','/services','/process','/contact','/privacy','/terms',...services.map(s=>`/services/${s.slug}`),...(await getProjects()).map(p=>`/work/${p.slug}`)];return paths.map(path=>({url:`https://osmu-studio.com${path}`,changeFrequency:'monthly',priority:path===''?1:0.7}))}
