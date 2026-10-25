import {INDEXABLE_PATHS} from './public-seo.mjs';
import {PUBLIC_ORIGIN,PUBLIC_SUBJECTS} from './public-study-pages.mjs';
export function publicShareUrl(path){
 const clean=typeof path==='string'?path.split(/[?#]/)[0]:'';
 if(!INDEXABLE_PATHS.includes(clean))throw Error('Only public resources may be shared.');
 const query=typeof path==='string'&&clean==='/test-gratuit'?new URLSearchParams(path.split('?')[1]?.split('#')[0]||'').get('ue'):null;
 const suffix=PUBLIC_SUBJECTS.some(s=>s.id===query)?'?ue='+encodeURIComponent(query):'';
 return PUBLIC_ORIGIN+clean+suffix;
}
