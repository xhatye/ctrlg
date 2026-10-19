import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {ANNAL_SUBJECTS} from '../lib/annal-subjects.mjs';
import {newAnnalSession,remainingTime,restoreSession,transitionSession,annalStorageKey,clockLabel} from '../lib/annal-session.mjs';
import {annalForRequest,fetchAnnalPdf,annalFileHandler} from '../lib/annal-file.mjs';
const catalogue=JSON.parse(fs.readFileSync(new URL('../lib/annals-catalogue.json',import.meta.url)));
test('verified annals have unique IDs, sources, pages and the correct subject duration',()=>{
 assert.equal(catalogue.items.length,139);assert.equal(new Set(catalogue.items.map(a=>a.id)).size,139);
 for(const a of catalogue.items){const s=ANNAL_SUBJECTS.find(s=>s.id===a.subject);assert.equal(s.kind,'written');assert.equal(a.minutes,s.minutes);assert.ok(a.pages>0&&a.pages<100);assert.ok(a.sourceUrl.startsWith('https://documents.sujets-dcg.com/'));assert.match(a.sha256,/^[a-f0-9]{64}$/);}
 for(const s of ANNAL_SUBJECTS)assert.equal(catalogue.items.some(a=>a.subject===s.id),s.kind==='written');
});
test('clock survives background tabs, reload and expiry without gaining time',()=>{
 const started=transitionSession(newAnnalSession(180),'start',1000);
 assert.equal(remainingTime(started,61000),179*60000);
 const restored=restoreSession(JSON.stringify(started),180,61000);assert.equal(restored.deadline,started.deadline);
 assert.equal(restoreSession(JSON.stringify(started),180,10802000).status,'finished');
 assert.equal(remainingTime(restoreSession(JSON.stringify(started),180,10802000)),0);
 assert.equal(clockLabel(179999),'00:03:00');
});
test('exam cannot pause; practice resumes only its remaining duration and keeps notes',()=>{
 const exam=transitionSession(newAnnalSession(180),'start',1000);assert.equal(transitionSession(exam,'pause',2000),exam);
 const s=transitionSession({...newAnnalSession(180,'practice'),notes:'Mon plan'},'start',1000),p=transitionSession(s,'pause',61000);
 assert.equal(remainingTime(p,999999),179*60000);assert.equal(transitionSession(p,'start',1000000).deadline,1000000+179*60000);
 assert.equal(transitionSession(p,'finish',1000000).notes,'Mon plan');
});
test('invalid saved data resets safely; notes and drafts remain scoped to each account and subject',()=>{
 for(const raw of ['{','null',JSON.stringify({version:1,status:'running',remaining:-1})])assert.equal(restoreSession(raw,180).status,'ready');
 assert.notEqual(annalStorageKey('alice','dcg-1-2026'),annalStorageKey('bob','dcg-1-2026'));
 assert.notEqual(annalStorageKey('alice','dcg-1-2026'),annalStorageKey('alice','dcg-2-2026'));
});
test('PDF endpoint accepts catalogue IDs only, never URLs or redirects',async()=>{
 assert.equal(annalForRequest('https://127.0.0.1/private'),undefined);assert.equal(annalForRequest(['dcg-1-2026']),undefined);
 const item=annalForRequest('dcg-1-2026');
 const bytes=await fetchAnnalPdf(item,async(url,opts)=>{assert.equal(opts.redirect,'error');return new Response('%PDF-1.7 test',{headers:{'content-type':'application/pdf'}});});assert.equal(bytes.subarray(0,5).toString(),'%PDF-');
 for(const response of [new Response('HTML',{headers:{'content-type':'text/html'}}),new Response('invalid',{headers:{'content-type':'application/pdf'}}),new Response('%PDF-',{headers:{'content-type':'application/pdf','content-length':'9000000'}})])await assert.rejects(()=>fetchAnnalPdf(item,async()=>response));
 const res={setHeader(){},status(n){this.code=n;return this;},json(){return this;}};await annalFileHandler({method:'GET',url:'/api/annal-file?id=https://example.com'},res);assert.equal(res.code,404);
 await annalFileHandler({method:'POST',url:'/api/annal-file?id=dcg-1-2026'},res);assert.equal(res.code,405);
});
