export const attributionKey='osmu-attribution-v1',consentKey='osmu-attribution-consent';
export function safeLabel(value:unknown){return typeof value==='string'&&/^[a-zA-Z0-9가-힣._ -]{1,100}$/.test(value)&&!/(?:[0-9]{7,}|[0-9]{3}[ ._-][0-9]{3,4}[ ._-][0-9]{4})/.test(value)?value:''}
export function safeSitePath(value:unknown){if(typeof value!=='string'||value.length>200)return '';return /^\/(?:|services(?:\/[a-z0-9-]+)?|insights(?:\/[a-z0-9-]+)?|solutions(?:\/[a-z0-9-]+)?|contact|about|pricing|process|cases|tools(?:\/[a-z0-9-]+)?)\/?$/.test(value)?value:''}
export function readAttribution(){try{if(sessionStorage.getItem(consentKey)!=='yes')return {};return JSON.parse(sessionStorage.getItem(attributionKey)||'{}')}catch{return {}}}
