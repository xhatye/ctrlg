import {INDEXABLE_PATHS} from './public-seo.mjs';
import {PUBLIC_ORIGIN} from './public-study-pages.mjs';
export function publicShareUrl(path){
 const clean=typeof path==='string'?path.split(/[?#]/)[0]:'';
 if(!INDEXABLE_PATHS.includes(clean))throw Error('Only public resources may be shared.');
 return PUBLIC_ORIGIN+clean;
}
