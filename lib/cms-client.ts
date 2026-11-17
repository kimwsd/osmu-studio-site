import {createClient,SupabaseClient} from '@supabase/supabase-js';
import config from './cms-public.json';
import {tabAuthStorage} from './tab-auth-storage';
export const cmsReady=config.ready===true;
let client:SupabaseClient|undefined;
export function cmsClient(){if(!cmsReady)throw new Error('저장공간 연결 설정 대기 상태입니다.');return client||(client=createClient(config.url,config.publishableKey,{auth:{storageKey:'osmu-admin-tab-auth-v1',storage:tabAuthStorage('osmu-admin-tab-auth-v1',['sb-'+new URL(config.url).hostname.split('.')[0]+'-auth-token']),persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}}))}
