import {Home} from '@/components/pages';
import {metaFor,JsonLd,pageSchema} from '@/lib/seo';
export const metadata=metaFor('/');
export default function HomePage(){return <><Home/><JsonLd data={pageSchema('/')}/></>}
