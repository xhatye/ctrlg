// Local-only preview. Deliberately uses no Firebase credentials or external APIs.
import { createServer } from 'vite';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { EXAM_CATALOGUE } from '../lib/exam-bank.mjs';
import { startExam, getAttempt, listAttempts, updateAttempt } from '../lib/exam-service.mjs';
import { reviewQueue, recordReviews } from '../lib/review-service.mjs';
import {MODULES} from '../lib/study-content.mjs';
import { ownFeedback, saveFeedback, withdrawFeedback, publishedFeedback } from '../lib/feedback-service.mjs';

const uid='local-design-student';
const records=new Map([['users/'+uid,{isPro:true}],['userLearning/'+uid,{chapters:{}}]]);
let chain=Promise.resolve();
const snapshot=path=>({exists:records.has(path),data:()=>structuredClone(records.get(path)),id:path.split('/').at(-1),ref:document(path)});
function document(path) { return {path,get:async()=>snapshot(path),update:async value=>records.set(path,{...records.get(path),...value}),collection:name=>collection(path+'/'+name)}; }
function collection(path,filters=[],sort=null,limit=100) {
  return {doc:id=>document(path+'/'+id),where:(key,op,value)=>collection(path,[...filters,{key,op,value}],sort,limit),orderBy:(key,direction='asc')=>collection(path,filters,{key,direction},limit),limit:n=>collection(path,filters,sort,n),get:async()=>{
    let docs=[...records.keys()].filter(key=>key.startsWith(path+'/')&&!key.slice(path.length+1).includes('/')).map(snapshot)
      .filter(doc=>filters.every(f=>f.op==='=='?doc.data()[f.key]===f.value:doc.data()[f.key]<=f.value));
    if(sort)docs.sort((a,b)=>(a.data()[sort.key]>b.data()[sort.key]?1:-1)*(sort.direction==='desc'?-1:1));
    docs=docs.slice(0,limit);return {docs,size:docs.length};
  }};
}
const deps={db:{collection,runTransaction:fn=>{const run=chain.then(async()=>{
  const writes=[];const result=await fn({get:async ref=>snapshot(ref.path),set:(ref,value)=>writes.push([ref.path,structuredClone(value)])});
  for(const [path,value]of writes)records.set(path,value);return result;
});chain=run.catch(()=>{});return run;}}};
const catalogue=JSON.parse(await readFile(new URL('../src/catalogue.json',import.meta.url),'utf8'));
const firstChapter=MODULES.UE9.chapters[0];
await recordReviews(uid,[{receipt:'preview_reminder_card',kind:'card',itemId:`UE9:${firstChapter.id}:card${firstChapter.cardIndices[0]}`,known:false}],deps,Date.now()-2*86400000);
// Public-looking dummy configuration initializes imported UI modules only.
Object.assign(process.env,{VITE_FIREBASE_API_KEY:'local-preview-no-real-key',VITE_FIREBASE_PROJECT_ID:'local-design-preview',VITE_FIREBASE_AUTH_DOMAIN:'localhost',VITE_FIREBASE_APP_ID:'local-design-preview'});
const server=await createServer({root:fileURLToPath(new URL('../',import.meta.url)),server:{host:'127.0.0.1',port:5175,strictPort:true},plugins:[{
  name:'simdcg-local-isolated-preview',configureServer(vite){vite.middlewares.use(async(req,res,next)=>{
    // Prevent imported legacy controls from ever reaching cloud services in this preview.
    res.setHeader('Content-Security-Policy',"connect-src 'self' ws://127.0.0.1:5175; img-src 'self' data:; frame-src 'none'; object-src 'none'");
    if(!req.url.startsWith('/api/'))return next();
    res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');
    try {
      const url=new URL(req.url,'http://127.0.0.1:5175');
      if(url.pathname!=='/api/training')throw Object.assign(new Error('Action indisponible dans cet aperçu local. Aucun appel externe effectué.'),{status:503});
      if(!['GET','POST'].includes(req.method))throw Object.assign(new Error('Méthode indisponible.'),{status:405});
      let body={};if(req.method==='POST'){let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>35000)throw Object.assign(new Error('Requête trop longue.'),{status:413});}body=JSON.parse(raw);}
      const action=body.action||url.searchParams.get('type');let data;
      if(action==='exam-catalog')data={items:EXAM_CATALOGUE};
      else if(action==='attempts')data={items:await listAttempts(uid,deps)};
      else if(action==='attempt')data=await getAttempt(uid,url.searchParams.get('id'),deps);
      else if(action==='start')data=await startExam(uid,body,deps);
      else if(['save','finish','assess'].includes(action))data=await updateAttempt(uid,body,deps);
      else if(action==='queue')data=await reviewQueue(uid,deps);
      else if(action==='review')data=await recordReviews(uid,body.events,deps);
      else if(action==='own-feedback')data=await ownFeedback(uid,deps);
      else if(action==='withdraw-feedback')data=await withdrawFeedback(uid,deps);
      else if(action==='feedback')data=req.method==='POST'?await saveFeedback(uid,body,deps):{items:await publishedFeedback(deps.db)};
      else throw Object.assign(new Error('Action introuvable.'),{status:404});
      res.statusCode=200;res.end(JSON.stringify(data));
    }catch(error){res.statusCode=error.status||400;res.end(JSON.stringify({error:error.message}));}
  });},
}]});
await server.listen();
console.log('Aperçu SIMDCG : http://127.0.0.1:5175/?design=dashboard');
console.log('Données illustratives locales, aucun accès Firebase ou Stripe, aucune IA payante.');
