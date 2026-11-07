import {baseUrl,isPublic} from '@/lib/seo';
export const dynamic='force-static';
export default function robots(){return {rules:{userAgent:'*',...(isPublic?{allow:'/',disallow:'/editor/'}:{disallow:'/'})},...(isPublic?{sitemap:baseUrl+'/sitemap.xml'}:{})}}
