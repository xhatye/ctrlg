import {subjectArt} from '../lib/subject-art.mjs';
export default function SubjectIcon({id,size=60,className=''}){return <img className={'subject-icon '+className} src={subjectArt(id)} alt="" width={size} height={size} loading="lazy" decoding="async"/>;}
