import {notFound} from 'next/navigation';
import {routes} from '@/lib/content';
import {PageContent} from '@/components/pages';
import {metaFor,JsonLd,pageSchema} from '@/lib/seo';
export const dynamicParams=false;
export function generateStaticParams(){return routes.filter(x=>x!=='/').map(x=>({slug:x.slice(1).split('/')}))}
export async function generateMetadata({params}:{params:Promise<{slug:string[]}>}){return metaFor('/'+(await params).slug.join('/'))}
export default async function Page({params}:{params:Promise<{slug:string[]}>}){const path='/'+(await params).slug.join('/');if(!routes.includes(path))notFound();return <><PageContent path={path}/><JsonLd data={pageSchema(path)}/></>}
