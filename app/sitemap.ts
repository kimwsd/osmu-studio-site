import {routes} from '@/lib/content';
import {baseUrl,isPublic} from '@/lib/seo';
export const dynamic='force-static';
export default function sitemap(){return isPublic?routes.filter(x=>x!=='/editor').map(x=>({url:baseUrl+(x==='/'?'/':x+'/'),lastModified:'2026-11-07'})):[]}
