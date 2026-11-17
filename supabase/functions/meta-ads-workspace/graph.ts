const version="v27.0";
type Data=Record<string,any>;
export class MetaError extends Error { uncertain=false; constructor(message:string,uncertain=false){super(message);this.uncertain=uncertain;} }
export function makeGraph(token:string,fetcher:typeof fetch=fetch) {
 return async (path:string,params:Data={},method="GET"):Promise<Data>=>{
  if(!/^[a-zA-Z0-9_]+(?:\/[a-zA-Z0-9_]+)?$/.test(path))throw Error("잘못된 광고 요청입니다.");
  const u=new URL("https://graph.facebook.com/"+version+"/"+path),body=new URLSearchParams();
  for(const [k,v] of Object.entries(params))body.set(k,typeof v==="object"?JSON.stringify(v):String(v));
  if(method==="GET")u.search=body.toString();
  let response:Response;
  try{response=await fetcher(u,{method,headers:{Authorization:"Bearer "+token,...(method==="POST"?{"Content-Type":"application/x-www-form-urlencoded"}:{})},...(method==="POST"?{body}:{}),signal:AbortSignal.timeout(25000)});}
  catch{throw new MetaError("Meta 응답을 받지 못했습니다. 변경 결과를 Meta에서 확인한 뒤 다시 작업해 주세요.",method==="POST");}
  let result:Data;try{result=await response.json();}catch{throw new MetaError("Meta 응답 형식을 확인하지 못했습니다.",method==="POST");}
  if(!response.ok||result.error) {
   const code=result.error?.code;
   throw new MetaError(code===190?"Meta 연결이 만료되었습니다. 다시 연결해 주세요.":code===10||code===200?"이 작업에 필요한 Meta 광고 관리 권한이 없습니다.":"Meta에서 요청을 처리하지 못했습니다. 오류 코드 "+String(code||response.status)+(result.error?.error_subcode?"/"+result.error.error_subcode:""),method==="POST"&&response.status>=500);
  }
  return result;
 };
}
