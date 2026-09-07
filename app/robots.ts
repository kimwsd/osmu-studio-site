import type {MetadataRoute} from 'next';
export const dynamic='force-static';
export default function robots():MetadataRoute.Robots{return {rules:[{userAgent:'*',allow:'/',disallow:['/admin','/admin.html','/api/']},{userAgent:'GPTBot',allow:'/'},{userAgent:'OAI-SearchBot',allow:'/'},{userAgent:'ChatGPT-User',allow:'/'},{userAgent:'ClaudeBot',allow:'/'},{userAgent:'Claude-SearchBot',allow:'/'},{userAgent:'Claude-User',allow:'/'},{userAgent:'PerplexityBot',allow:'/'},{userAgent:'Perplexity-User',allow:'/'}],sitemap:'https://osmu-studio.com/sitemap.xml'}}
