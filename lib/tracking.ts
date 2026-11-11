import snapshot from './cms-snapshot.json';
import {safeLabel,safeSitePath} from './attribution';
import type {TrackingConfig} from './cms-types';
export const tracking=snapshot.tracking as TrackingConfig;
export const measurementConsentKey='osmu-measurement-consent-v1';
export type MeasurementConsent={analytics:boolean;marketing:boolean;attribution:boolean;updatedAt:number};
type TagFunction=((...args:unknown[])=>void)&{queue?:unknown[][];loaded?:boolean;version?:string;push?:TagFunction;callMethod?:TagFunction};
declare global {interface Window {dataLayer:unknown[];gtag:TagFunction;fbq:TagFunction;_fbq:TagFunction}}
export function readMeasurementConsent():MeasurementConsent|null{try{const c=JSON.parse(localStorage.getItem(measurementConsentKey)||'null');return c&&typeof c.analytics==='boolean'&&typeof c.marketing==='boolean'&&typeof c.attribution==='boolean'&&Number.isFinite(c.updatedAt)&&Date.now()-c.updatedAt<180*86400000?c:null}catch{return null}}
export function publicPage(path:string){return safeSitePath(path)||(/^\/(?:resources|faq|privacy|terms|insights\/category\/[a-z0-9-]+)\/?$/.test(path)?path:'')}
export function pageGroup(path:string){return path.split('/').filter(Boolean)[0]||'home'}
export function campaignParameters(search:string){const q=new URLSearchParams(search),result:Record<string,string>={};for(const [source,target] of [['utm_source','campaign_source'],['utm_medium','campaign_medium'],['utm_campaign','campaign_name'],['utm_content','campaign_content'],['utm_term','campaign_term']]){const value=safeLabel(q.get(source));if(value)result[target]=value}return result}
export function measurementAllowed(kind:'analytics'|'marketing'){return typeof window!=='undefined'&&location.hostname==='osmu-studio.com'&&!!publicPage(location.pathname)&&tracking.mode!=='off'&&(kind==='analytics'?tracking.analyticsEnabled:tracking.marketingEnabled)&&readMeasurementConsent()?.[kind]===true}
function appendScript(id:string,src:string){if(document.getElementById(id))return;const s=document.createElement('script');s.id=id;s.async=true;s.src=src;document.head.appendChild(s)}
export function initializeMeasurement(){
 if(measurementAllowed('analytics')){
  if(!window.gtag){window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments)};window.gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});window.gtag('set',{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false});window.gtag('js',new Date())}
  window.gtag('consent','update',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  if(tracking.mode==='gtm'&&/^GTM-[A-Z0-9]+$/.test(tracking.gtmContainerId)){if(!document.getElementById('osmu-gtm'))window.dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'});appendScript('osmu-gtm','https://www.googletagmanager.com/gtm.js?id='+tracking.gtmContainerId);}
  if(tracking.mode==='direct'&&/^G-[A-Z0-9]+$/.test(tracking.ga4MeasurementId)){window.gtag('config',tracking.ga4MeasurementId,{send_page_view:false});appendScript('osmu-ga4','https://www.googletagmanager.com/gtag/js?id='+tracking.ga4MeasurementId)}
 }
 if(measurementAllowed('marketing')&&/^\d+$/.test(tracking.metaPixelId)&&!window.fbq){const f:TagFunction=function(...args:unknown[]){if(f.callMethod)f.callMethod(...args);else f.queue!.push(args)};f.push=f;f.loaded=true;f.version='2.0';f.queue=[];window.fbq=window._fbq=f;f('consent','grant');f('set','autoConfig',false,tracking.metaPixelId);f('init',tracking.metaPixelId);appendScript('osmu-meta-pixel','https://connect.facebook.net/en_US/fbevents.js')}
}
const allowedEvents=new Set(['page_view','view_service','view_solution','view_insight','select_service','contact_start','generate_lead','contact_click','consultation_click','navigation_click','interface_click','scroll_depth_25','scroll_depth_50','scroll_depth_75','scroll_depth_90']);
const areas=new Set(['header','menu','search','main','footer']);
export function safeClickId(value:string){return /^(header|menu|search|main|footer)(?:_(?:link|button)_\d{1,4})?$/.test(value)?value:''}
export function clickLabel(value:string,fallback:string){const short=value.replace(/\s+/g,' ').trim().slice(0,80);return safeLabel(short)||fallback}
export function scrollMilestones(scrollTop:number,height:number,viewport:number,seen:Set<number>){if(!Number.isFinite(scrollTop+height+viewport)||height<=viewport||viewport<=0)return [];const depth=Math.min(100,Math.max(0,(scrollTop+viewport)/height*100));return [25,50,75,90].filter(n=>depth>=n&&!seen.has(n))}
export function safeTrackedDestination(value:string){try{const u=new URL(value);if(u.origin==='https://osmu-studio.com'&&publicPage(u.pathname))return u.origin+u.pathname;if(['https://pf.kakao.com','https://www.instagram.com','https://instagram.com'].includes(u.origin))return u.origin+'/';if(value==='mailto:')return value;return ''}catch{return value==='mailto:'?value:''}}
export function navigationEvent(href:string,path:string,area:string){
 if(!publicPage(path)||!areas.has(area))return null;
 try{const u=new URL(href,'https://osmu-studio.com'+path);let name='navigation_click',label='',destination='',method='';
 if(u.origin==='https://osmu-studio.com'){if(!publicPage(u.pathname)||u.pathname.replace(/\/$/,'')===path.replace(/\/$/,''))return null;destination=u.origin+u.pathname;label=u.pathname.replace(/\/$/,'')==='/contact'?'상담하기':pageGroup(u.pathname)==='services'?'서비스 보기':pageGroup(u.pathname)==='insights'?'인사이트 보기':pageGroup(u.pathname)==='solutions'?'솔루션 보기':'페이지 이동';if(label==='상담하기')name='consultation_click'}
 else{method=u.protocol==='mailto:'?'email':u.hostname==='pf.kakao.com'?'kakao':['instagram.com','www.instagram.com'].includes(u.hostname)?'instagram':'';if(!method)return null;name='contact_click';label=method==='email'?'이메일 연락':method==='kakao'?'카카오톡 연락':'인스타그램 방문';destination=method==='email'?'mailto:':u.origin+'/'}
 return {name,parameters:{page_path:path,link_url:destination,link_text:label,link_id:area,...(method?{contact_method:method}:{})}};
 }catch{return null}
}
export function trackInterface(action:string,area:string){if(!/^(menu_(about|services|solutions|insights|resources|desk)|service_tab_(3eo|consulting|website|content|performance|analytics)|search_open|mobile_menu|insight_more|share_link|journey_industry_[0-2]|journey_stage_[0-4]|demand_keyword_[0-3]|research_view_[0-2]|research_topic_[0-5])$/.test(action)||!areas.has(area))return;trackEvent('interface_click',{page_path:location.pathname,link_text:action,link_id:area})}
export function trackEvent(name:string,parameters:Record<string,string|number>={}){
 if(!allowedEvents.has(name)||!measurementAllowed('analytics')||!window.gtag)return;
 const clean:Record<string,string|number>={};for(const key of ['service','content_group','content_slug','contact_method','page_path']){const value=parameters[key];if(typeof value==='string'&&(key==='page_path'?publicPage(value):safeLabel(value)))clean[key]=value}
 if(typeof parameters.link_url==='string'){const destination=safeTrackedDestination(parameters.link_url);if(destination)clean.link_url=destination}
 if(typeof parameters.link_text==='string'&&safeLabel(parameters.link_text))clean.link_text=parameters.link_text;
 if(typeof parameters.link_id==='string'&&safeClickId(parameters.link_id))clean.link_id=parameters.link_id;
 try{window.gtag('event',name,{...clean,send_to:tracking.ga4MeasurementId})}catch{}
}
let analyticsPage='',pixelPage='';const leads=new Set<string>();
export function trackPage(path:string){
 if(!publicPage(path))return;initializeMeasurement();
 if(measurementAllowed('analytics')&&window.gtag&&analyticsPage!==path){const prior=analyticsPage;analyticsPage=path;let referrer='';try{const r=new URL(document.referrer);referrer=r.origin===location.origin?location.origin+(publicPage(r.pathname)||'/'):r.origin+'/'}catch{}
  window.gtag('set',{page_location:location.origin+path,page_referrer:prior?location.origin+prior:referrer,page_title:document.title,...campaignParameters(location.search)});trackEvent('page_view',{page_path:path,content_group:pageGroup(path)});
  const group=pageGroup(path),slug=path.split('/').filter(Boolean)[1];if(slug&&slug!=='category'&&['services','solutions','insights'].includes(group))trackEvent(group==='services'?'view_service':group==='solutions'?'view_solution':'view_insight',{content_group:group,content_slug:slug});
 }
 if(measurementAllowed('marketing')&&window.fbq&&pixelPage!==path){pixelPage=path;window.fbq('track','PageView',{}, {eventID:crypto.randomUUID()})}
}
export function trackLead(reference:string){if(!/^[a-f0-9-]{36}$/i.test(reference)||leads.has(reference))return;leads.add(reference);trackEvent('generate_lead',{content_group:'contact'});try{if(measurementAllowed('marketing')&&window.fbq)window.fbq('track','Lead',{}, {eventID:'lead-'+reference})}catch{}}
export function clearMeasurementCookies(){for(const entry of document.cookie.split(';')){const name=entry.split('=')[0].trim();if(!/^(_ga($|_)|_gid$|_gat|_fbp$|_fbc$)/.test(name))continue;for(const domain of ['',location.hostname,'.'+location.hostname])document.cookie=name+'=;Max-Age=0;path=/;'+(domain?'domain='+domain+';':'')+'SameSite=Lax;Secure'}}
