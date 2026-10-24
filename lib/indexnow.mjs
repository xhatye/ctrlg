import {INDEXABLE_PATHS} from './public-seo.mjs';
import {PUBLIC_ORIGIN} from './public-study-pages.mjs';
export function indexNowPayload(key,paths=INDEXABLE_PATHS){
 if(typeof key!=='string'||!/^[a-zA-Z0-9-]{8,128}$/.test(key))throw Error('Invalid IndexNow ownership token.');
 if(!Array.isArray(paths)||!paths.length||paths.length>10000||paths.some(p=>!INDEXABLE_PATHS.includes(p)))throw Error('Only canonical public pages may be submitted.');
 return {host:new URL(PUBLIC_ORIGIN).hostname,key,keyLocation:PUBLIC_ORIGIN+'/indexnow.txt',urlList:[...new Set(paths)].map(p=>PUBLIC_ORIGIN+p)};
}
