import {createClient,SupabaseClient} from '@supabase/supabase-js';
import config from './cms-public.json';
export const cmsReady=config.ready===true;
let client:SupabaseClient|undefined;
export function cmsClient(){if(!cmsReady)throw new Error('저장공간 연결 설정 대기 상태입니다.');return client||(client=createClient(config.url,config.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}))}
