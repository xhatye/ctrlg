import { INDEXABLE_PATHS } from './public-seo.mjs';
const measuredPaths=new Set([...INDEXABLE_PATHS,'/connexion','/inscription']);
// Public page views only: never student IDs, answers, query strings or payment identifiers.
export function publicAnalyticsEvent(event){
 if(event?.type!=='pageview')return null;
 try{const url=new URL(event.url);if(!['https:','http:'].includes(url.protocol)||!measuredPaths.has(url.pathname)||url.username||url.password)return null;url.search='';url.hash='';
  const clean={type:'pageview',url:url.href};if('referrer' in event){try{clean.referrer=event.referrer?new URL(event.referrer).origin:'';}catch{clean.referrer='';}}return clean;
 }catch{return null;}
}
