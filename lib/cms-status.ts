import type {DraftPost,PublishedPost} from './cms-types';
export type CmsRelease={revision:string;builtAt:string;posts:{id:string;slug:string;updatedAt:string}[]};
export function releaseUrl(now:number=Date.now()){return 'https://osmu-studio.com/cms-release.json?t='+now}
function stable(value:unknown):string{
 if(Array.isArray(value))return '['+value.map(stable).join(',')+']';
 if(value&&typeof value==='object')return '{'+Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>JSON.stringify(k)+':'+stable(v)).join(',')+'}';
 return JSON.stringify(value);
}
export function publicationStatus(post:DraftPost,published:PublishedPost[],release:CmsRelease|null,preview=false){
 if(preview)return {label:'공개 글 · 화면 미리보기',tone:'neutral'};
 const pub=published.find(x=>x.id===post.id),live=release?.posts.find(x=>x.id===post.id);
 if(!release)return {label:'사이트 상태 확인 필요',tone:'pending'};
 if(post.deleted_at)return {label:live?'휴지통 · 사이트 반영 대기':'휴지통',tone:live?'pending':'neutral'};
 if(!pub)return {label:live?'공개 중단 반영 대기':'초안',tone:live?'pending':'neutral'};
 if(live?.updatedAt!==pub.updated_at)return {label:'사이트 반영 대기',tone:'pending'};
 if(stable(pub.document)!==stable(post.document))return {label:'수정 중 · 공개본 유지',tone:'pending'};
 return {label:'게시 중',tone:'success'};
}
