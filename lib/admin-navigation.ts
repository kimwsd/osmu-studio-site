export const adminViews=['inquiries','dashboard','posts','media','utm','integrations','quality','editor'] as const;
export type AdminView=typeof adminViews[number];
export function adminRoute(hash:string){
 const [candidate,postId]=hash.replace(/^#/,'').split('/');
 const view=adminViews.includes(candidate as AdminView)?candidate as AdminView:'dashboard';
 return {view,postId:view==='editor'?postId:undefined};
}
export function adminHash(view:AdminView,postId?:string){return '#'+view+(view==='editor'?'/'+(postId||'new'):'')}
export function mediaReferences<T extends {id:string;document:unknown}>(url:string,posts:T[]){
 const used=posts.filter(p=>JSON.stringify(p.document).includes(url));
 return used.filter((p,i)=>used.findIndex(x=>x.id===p.id)===i);
}
