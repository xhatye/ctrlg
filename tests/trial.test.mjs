import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {MODULES} from '../lib/study-content.mjs';
import {QUIZ_V2} from '../lib/quiz-v2-data.mjs';
import {quizResult} from '../lib/first-session.mjs';
import {publicShareUrl} from '../lib/public-sharing.mjs';
import {publicAnalyticsEvent} from '../lib/public-analytics.mjs';
import {INDEXABLE_PATHS,seoForPath,structuredData} from '../lib/public-seo.mjs';
const data=JSON.parse(await readFile(new URL('../src/trial-samples.json',import.meta.url),'utf8'));
test('public trials cover every UE with a bounded fixed sample, not a public full bank',()=>{
 assert.equal(data.subjects.length,20);assert.equal(data.subjects.filter(s=>s.level==='DCG').length,13);assert.equal(data.subjects.filter(s=>s.level==='DSCG').length,7);
 assert.deepEqual(data.subjects.map(s=>s.id).sort(),Object.keys(MODULES).sort());let questions=0,cards=0;
 for(const s of data.subjects){
  const chapter=MODULES[s.id].chapters[0],source=QUIZ_V2.banks[s.id+'/'+chapter.id];assert.equal(s.chapter,chapter.id);assert.equal(s.questions.length,5);assert.equal(s.cards.length,3);assert.equal(s.chapterTitle,chapter.title);assert.ok(s.questions.length<source.length);assert.equal(new Set(s.questions.map(q=>q.id)).size,5);
  for(const q of s.questions){const original=source.find(n=>q.id===s.id+':trial:'+n.id);assert.ok(original);assert.equal(q.q,original.q);assert.deepEqual(q.options,original.options);assert.equal(q.options[q.answer],original.options[original.answer]);assert.equal(q.expl,original.explanation);assert.equal(q.chapter,chapter.id);assert.equal(q.references,undefined);questions++;}
  for(const card of s.cards){const original=chapter.cardIndices.map(i=>chapter.cards[i]).find(n=>n.q===card.q);assert.ok(original);assert.equal(card.a,original.a);assert.equal(card.explanation,original.explanation);assert.ok(!s.questions.some(q=>q.q===card.q));cards++;}
  assert.equal(s.modules,undefined);assert.equal(s.chapters,undefined);assert.equal(s.cases,undefined);
 }
 assert.equal(questions,100);assert.equal(cards,60);
});
test('every trial result is scored from the five actual selected answers',()=>{
 for(const s of data.subjects){const choices=s.questions.map(q=>q.answer);choices[0]=(choices[0]+1)%4;const result=quizResult(s.questions,choices,{module:s.id,name:s.label,sessionId:'local-trial',duration:30});assert.equal(result.score,4);assert.equal(result.total,5);assert.equal(result.ue,s.id);assert.equal(result.answers[0].correct,false);assert.equal(result.answers[0].right,s.questions[0].options[s.questions[0].answer]);}
});
test('sharing preserves only a valid public UE, never scores, identities, or tracking parameters',()=>{
 assert.equal(publicShareUrl('/test-gratuit?ue=DSCG2&score=5&email=private%40example.com#answer'),'https://www.simdcg.com/test-gratuit?ue=DSCG2');
 for(const value of ['UE99','__proto__','https://evil.example','<script>'])assert.equal(publicShareUrl('/test-gratuit?ue='+encodeURIComponent(value)), 'https://www.simdcg.com/test-gratuit');
 assert.equal(publicShareUrl('/outils?ue=DSCG2&score=5'),'https://www.simdcg.com/outils');
 const event=publicAnalyticsEvent({type:'pageview',url:'https://www.simdcg.com/test-gratuit?ue=DSCG2&score=5#answers',answers:['private']});assert.deepEqual(event,{type:'pageview',url:'https://www.simdcg.com/test-gratuit'});
});
test('trial is server-rendered, indexable and connected to the homepage and all 20 subject pages',async()=>{
 const seo=seoForPath('/test-gratuit');assert.equal(seo.index,true);assert.ok(INDEXABLE_PATHS.includes('/test-gratuit'));assert.ok(!structuredData('/test-gratuit').some(s=>s['@type']==='Quiz'));
 const html=await readFile(new URL('../dist/public-pages/test-gratuit.html',import.meta.url),'utf8');assert.ok(html.includes('Testez votre prochaine UE.'));assert.ok(html.includes('index, follow'));assert.ok(html.includes(seo.image));assert.ok(html.includes('trial-'));assert.ok(html.includes('href="/tarifs?ue=UE1"'));await access(new URL('../public/social/test-gratuit.png',import.meta.url));
 const home=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');assert.ok(home.includes('href="/test-gratuit"'));assert.ok(home.includes('Tester mon UE gratuitement'));
 for(const s of data.subjects){const page=await readFile(new URL('../dist/public-pages/'+s.path.slice(1).replaceAll('/','__')+'.html',import.meta.url),'utf8');assert.ok(page.includes('href="/test-gratuit?ue='+s.id+'"'),s.id);}
});
test('trial entry does not import authentication or the private bank; answers have no persistence code',async()=>{
 const manifest=JSON.parse(await readFile(new URL('../dist/.vite/manifest.json',import.meta.url),'utf8')),entry=Object.keys(manifest).find(k=>manifest[k].name==='TrialPage');assert.ok(entry);
 const seen=new Set(),visit=k=>{if(seen.has(k))return;seen.add(k);for(const p of manifest[k]?.imports||[])visit(p);};visit(entry);
 for(const k of seen)assert.ok(!/firebase|App\.jsx|study-content|quiz-v2-data|DesignPreview/.test(k),k);
 const source=await readFile(new URL('../src/TrialPage.jsx',import.meta.url),'utf8');assert.ok(!/trainingRequest|loadStudy|localStorage|sessionStorage|fetch\s*\(/.test(source));
});
