import type {MetadataRoute} from 'next';
import {baseUrl,isPublic} from '@/lib/seo';
export const dynamic='force-static';
// Search and user-requested retrieval are separate from model training.
// Preserve the existing wildcard training policy; Google-Extended is a product
// control token (Gemini grounding/training), not an HTTP crawler user-agent.
export default function robots():MetadataRoute.Robots{
 if(!isPublic)return {rules:{userAgent:'*',disallow:'/'}};
 const policy={allow:'/',disallow:['/admin','/editor']};
 return {rules:[{userAgent:'*',...policy},{userAgent:['Googlebot','Googlebot-Image','bingbot','Yeti','OAI-SearchBot','ChatGPT-User','Claude-SearchBot','Claude-User','PerplexityBot','Perplexity-User','Google-Extended'],...policy}],sitemap:baseUrl+'/sitemap.xml'};
}
