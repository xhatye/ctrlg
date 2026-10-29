import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {REVISION_HUBS} from '../lib/revision-hubs.mjs';
import {INDEXABLE_PATHS,seoForPath,structuredData} from '../lib/public-seo.mjs';
import {PUBLIC_SUBJECTS} from '../lib/public-study-pages.mjs';

test('revision hubs link to real public resources and describe distinct diploma methods',()=>{
 for(const [level,hub] of Object.entries(REVISION_HUBS)){
  for(const path of [...hub.resources.map(r=>r[3]),...hub.method.map(r=>r[2]),hub.example.source])assert.ok(INDEXABLE_PATHS.includes(path),path);
  assert.equal(hub.method.length,4);assert.equal(hub.week.length,4);assert.equal(hub.faq.length,4);
  const example=hub.example;assert.equal(example.options.length,4);assert.equal(new Set(example.options).size,4);assert.ok(example.answer>=0&&example.answer<4);assert.ok(example.explanation.length>100);
  assert.ok(seoForPath('/'+level.toLowerCase()).title.startsWith('Révision '+level));
 }
 assert.notDeepEqual(REVISION_HUBS.DCG.method,REVISION_HUBS.DSCG.method);
 assert.equal(REVISION_HUBS.DSCG.example.options[REVISION_HUBS.DSCG.example.answer],String(1000-(300-80)));
});

test('initial hub HTML exposes actual study content and structured subject links without unlocking the bank',async()=>{
 for(const level of ['DCG','DSCG']){
  const path='/'+level.toLowerCase(),html=await readFile(new URL('../dist/public-pages/'+level.toLowerCase()+'.html',import.meta.url),'utf8');
  for(const id of ['ressources-gratuites','ues','methode-revision','exemple-revision','questions-revision'])assert.ok(html.includes('id="'+id+'"'),id);
  assert.ok(html.includes(REVISION_HUBS[level].heading));assert.ok(html.includes('Voir la réponse expliquée'));assert.ok(html.includes('couverture partielle'));assert.ok(!html.includes('NaN'));
  const data=structuredData(path).find(x=>x['@type']==='CollectionPage'),subjects=PUBLIC_SUBJECTS.filter(s=>s.level===level);
  assert.equal(data.mainEntity.itemListElement.length,subjects.length);assert.equal(data.dateModified,'2026-10-29');
  for(const [i,item] of data.mainEntity.itemListElement.entries()){assert.equal(item.position,i+1);assert.ok(html.includes('href="'+subjects[i].path+'"'));assert.ok(item.url.endsWith(subjects[i].path));}
 }
 const component=await readFile(new URL('../src/RevisionHub.jsx',import.meta.url),'utf8');
 assert.ok(!/firebase|trainingRequest|fetch\s*\(/.test(component));
});

test('sitemap dates identify the two edited hubs and all legal/private exclusions remain intact',async()=>{
 const xml=await readFile(new URL('../dist/sitemap.xml',import.meta.url),'utf8');
 assert.equal((xml.match(/<lastmod>/g)||[]).length,2);
 for(const level of ['dcg','dscg'])assert.ok(xml.includes('/'+level+'</loc><lastmod>2026-10-29</lastmod>'));
 for(const path of ['/cgu','/confidentialite','/interface','/qcm'])assert.equal(seoForPath(path).index,false);
 assert.equal((xml.match(/<loc>/g)||[]).length,INDEXABLE_PATHS.length);
});
