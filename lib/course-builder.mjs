import {chapter,notion} from './content-authoring.mjs';
export const point=(title,body,q,correct,...wrong)=>notion(title,body,q,correct,...wrong);
export function course(id,title,intro,method,prerequisites,pitfalls,points,scenario,corrections,sources=[]){
 const c=chapter(id,title,intro,method,pitfalls,points,scenario,corrections,sources);
 c.learningGoals=points.map(p=>p.title);c.prerequisites=prerequisites;c.courseKind='Comprendre et raisonner';return c;
}
