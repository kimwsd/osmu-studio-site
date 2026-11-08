export type RawInsight={spend?:string;impressions?:string;reach?:string;clicks?:string;inline_link_clicks?:string;actions?:{action_type:string;value:string}[];date_start?:string;campaign_id?:string;campaign_name?:string};
export function adsMetrics(row:RawInsight={}){
 const num=(v:unknown)=>{if(v===undefined)return 0;const n=Number(v);if(!Number.isFinite(n)||n<0)throw Error('광고 수치 형식을 확인해 주세요.');return n};
 const spend=num(row.spend),impressions=num(row.impressions),reach=num(row.reach),clicks=num(row.clicks),linkClicks=num(row.inline_link_clicks);
 // Count only the website Lead action, never add nested/aggregate lead aliases.
 const leads=num(row.actions?.find(a=>a.action_type==='offsite_conversion.fb_pixel_lead')?.value);
 return {spend,impressions,reach,clicks,linkClicks,leads,ctr:impressions?clicks/impressions*100:null,cpc:clicks?spend/clicks:null,cpm:impressions?spend/impressions*1000:null,cpa:leads?spend/leads:null,frequency:reach?impressions/reach:null};
}
