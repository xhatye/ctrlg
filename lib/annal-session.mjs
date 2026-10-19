// Store transitions, not ticking seconds: deadlines survive sleeping tabs and reloads.
export function newAnnalSession(minutes, mode='exam') {
 return {version:1,mode:mode==='practice'?'practice':'exam',status:'ready',remaining:minutes*60000,deadline:null,notes:'',page:1,finishedAt:null};
}
export function remainingTime(session,now=Date.now()) {
 return Math.max(0,session.status==='running'?session.deadline-now:session.remaining);
}
export function transitionSession(session,action,now=Date.now()) {
 const remaining=remainingTime(session,now);
 if(action==='start'&&['ready','paused'].includes(session.status))return {...session,status:'running',deadline:now+remaining,remaining};
 if(action==='pause'&&session.mode==='practice'&&session.status==='running')return {...session,status:'paused',remaining,deadline:null};
 if(action==='finish'&&['running','paused'].includes(session.status)||action==='expire'&&session.status==='running'&&remaining===0)return {...session,status:'finished',remaining,deadline:null,finishedAt:now};
 return session;
}
export function restoreSession(raw,minutes,now=Date.now()) {
 const fresh=newAnnalSession(minutes);
 try {
  const s=JSON.parse(raw),max=minutes*60000;
  if(!s||s.version!==1||!['exam','practice'].includes(s.mode)||!['ready','running','paused','finished'].includes(s.status)||!Number.isFinite(s.remaining)||s.remaining<0||s.remaining>max||s.status==='paused'&&s.mode!=='practice')return fresh;
  if(s.status==='running'&&(!Number.isFinite(s.deadline)||s.deadline>now+max))return fresh;
  const clean={...fresh,mode:s.mode,status:s.status,remaining:s.remaining,deadline:s.status==='running'?s.deadline:null,notes:typeof s.notes==='string'?s.notes.slice(0,60000):'',page:Number.isInteger(s.page)?Math.max(1,Math.min(s.page,300)):1,finishedAt:Number.isFinite(s.finishedAt)?s.finishedAt:null};
  return transitionSession(clean,'expire',now);
 }catch{return fresh;}
}
export const annalStorageKey=(uid,id)=>`simdcg:annal:v1:${encodeURIComponent(uid)}:${id}`;
export function clockLabel(ms){const s=Math.ceil(Math.max(0,ms)/1000);return [Math.floor(s/3600),Math.floor(s%3600/60),s%60].map(n=>String(n).padStart(2,'0')).join(':');}
