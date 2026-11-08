import snapshot from './cms-snapshot.json';
import {safeLabel,safeSitePath} from './attribution';
import type {TrackingConfig} from './cms-types';
export const tracking=snapshot.tracking as TrackingConfig;
export const measurementConsentKey='osmu-measurement-consent-v1';
export type MeasurementConsent={analytics:boolean;marketing:boolean;attribution:boolean;updatedAt:number};
type TagFunction=((...args:unknown[])=>void)&{queue?:unknown[][];loaded?:boolean;version?:string;push?:TagFunction;callMethod?:TagFunction};
declare global {interface Window {dataLayer:unknown[];gtag:TagFunction;fbq:TagFunction;_fbq:TagFunction}}
export function readMeasurementConsent():MeasurementConsent|null{try{const c=JSON.parse(localStorage.getItem(measurementConsentKey)||'null');return c&&typeof c.analytics==='boolean'&&typeof c.marketing==='boolean'&&typeof c.attribution==='boolean'&&Number.isFinite(c.updatedAt)&&Date.now()-c.updatedAt<180*86400000?c:null}catch{return null}}
export function publicPage(path:string){return safeSitePath(path)||(['/', '/privacy/','/terms/'].includes(path)?path:'')}
export function pageGroup(path:string){return path.split('/').filter(Boolean)[0]||'home'}
export function campaignParameters(search:string){const q=new URLSearchParams(search),result:Record<string,string>={};for(const [source,target] of [['utm_source','campaign_source'],['utm_medium','campaign_medium'],['utm_campaign','campaign_name'],['utm_content','campaign_content'],['utm_term','campaign_term']]){const value=safeLabel(q.get(source));if(value)result[target]=value}return result}
export function measurementAllowed(kind:'analytics'|'marketing'){return typeof window!=='undefined'&&location.hostname==='osmu-studio.com'&&!!publicPage(location.pathname)&&tracking.mode!=='off'&&(kind==='analytics'?tracking.analyticsEnabled:tracking.marketingEnabled)&&readMeasurementConsent()?.[kind]===true}
function appendScript(id:string,src:string){if(document.getElementById(id))return;const s=document.createElement('script');s.id=id;s.async=true;s.src=src;document.head.appendChild(s)}
export function initializeMeasurement(){
 if(measurementAllowed('analytics')){
  if(!window.gtag){window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments)};window.gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});window.gtag('set',{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false});window.gtag('js',new Date())}
  window.gtag('consent','update',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  if(tracking.mode==='gtm'&&/^GTM-[A-Z0-9]+$/.test(tracking.gtmContainerId))appendScript('osmu-gtm','https://www.googletagmanager.com/gtm.js?id='+tracking.gtmContainerId);
  if(tracking.mode==='direct'&&/^G-[A-Z0-9]+$/.test(tracking.ga4MeasurementId)){window.gtag('config',tracking.ga4MeasurementId,{send_page_view:false});appendScript('osmu-ga4','https://www.googletagmanager.com/gtag/js?id='+tracking.ga4MeasurementId)}
 }
 if(measurementAllowed('marketing')&&/^\d+$/.test(tracking.metaPixelId)&&!window.fbq){const f:TagFunction=function(...args:unknown[]){if(f.callMethod)f.callMethod(...args);else f.queue!.push(args)};f.push=f;f.loaded=true;f.version='2.0';f.queue=[];window.fbq=window._fbq=f;f('consent','grant');f('set','autoConfig',false,tracking.metaPixelId);f('init',tracking.metaPixelId);appendScript('osmu-meta-pixel','https://connect.facebook.net/en_US/fbevents.js')}
}
const allowedEvents=new Set(['page_view','view_service','view_solution','view_insight','select_service','contact_start','generate_lead','contact_click','consultation_click']);
export function trackEvent(name:string,parameters:Record<string,string|number>={}){
 if(!allowedEvents.has(name)||!measurementAllowed('analytics')||!window.gtag)return;
 const clean:Record<string,string|number>={};for(const key of ['service','content_group','content_slug','contact_method','page_path']){const value=parameters[key];if(typeof value==='string'&&(key==='page_path'?publicPage(value):safeLabel(value)))clean[key]=value}
 try{window.gtag('event',name,{...clean,send_to:tracking.ga4MeasurementId})}catch{}
}
let analyticsPage='',pixelPage='';const leads=new Set<string>();
export function trackPage(path:string){
 if(!publicPage(path))return;initializeMeasurement();
 if(measurementAllowed('analytics')&&window.gtag&&analyticsPage!==path){const prior=analyticsPage;analyticsPage=path;let referrer='';try{const r=new URL(document.referrer);referrer=r.origin===location.origin?location.origin+(publicPage(r.pathname)||'/'):r.origin+'/'}catch{}
  window.gtag('set',{page_location:location.origin+path,page_referrer:prior?location.origin+prior:referrer,page_title:document.title,...campaignParameters(location.search)});trackEvent('page_view',{page_path:path,content_group:pageGroup(path)});
  const group=pageGroup(path),slug=path.split('/').filter(Boolean)[1];if(slug&&['services','solutions','insights'].includes(group))trackEvent(group==='services'?'view_service':group==='solutions'?'view_solution':'view_insight',{content_group:group,content_slug:slug});
 }
 if(measurementAllowed('marketing')&&window.fbq&&pixelPage!==path){pixelPage=path;window.fbq('track','PageView',{}, {eventID:crypto.randomUUID()})}
}
export function trackLead(reference:string){if(!/^[a-f0-9-]{36}$/i.test(reference)||leads.has(reference))return;leads.add(reference);trackEvent('generate_lead',{content_group:'contact'});try{if(measurementAllowed('marketing')&&window.fbq)window.fbq('track','Lead',{}, {eventID:'lead-'+reference})}catch{}}
export function clearMeasurementCookies(){for(const entry of document.cookie.split(';')){const name=entry.split('=')[0].trim();if(!/^(_ga($|_)|_gid$|_gat|_fbp$|_fbc$)/.test(name))continue;for(const domain of ['',location.hostname,'.'+location.hostname])document.cookie=name+'=;Max-Age=0;path=/;'+(domain?'domain='+domain+';':'')+'SameSite=Lax;Secure'}}
