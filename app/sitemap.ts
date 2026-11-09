import {routes,articles} from '@/lib/content';
import {baseUrl,isPublic} from '@/lib/seo';
export const dynamic='force-static';
export default function sitemap(){return isPublic?routes.filter(x=>x!=='/admin').map(x=>({url:baseUrl+(x==='/'?'/':x+'/'),lastModified:articles.find(a=>x==='/insights/'+a.slug)?.modified||articles.find(a=>x==='/insights/'+a.slug)?.date||(['/', '/about','/services','/solutions','/insights','/resources','/tools'].includes(x)?'2026-11-09':'2026-11-07')})):[]}
