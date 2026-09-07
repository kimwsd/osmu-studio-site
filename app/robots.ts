import type {MetadataRoute} from 'next';
export const dynamic='force-static';
export default function robots():MetadataRoute.Robots{return {rules:{userAgent:'*',allow:'/',disallow:['/admin','/admin.html','/api/']},sitemap:'https://osmu-studio.com/sitemap.xml'}}
