import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {GRADE_WEIGHTS,calculateGrades,gradeValue,straightLine,netPresentValue} from '../lib/grade-calculator.mjs';
import {INDEXABLE_PATHS,seoForPath} from '../lib/public-seo.mjs';
import {PUBLIC_ORIGIN} from '../lib/public-study-pages.mjs';
import {indexNowPayload} from '../lib/indexnow.mjs';
import {publicShareUrl} from '../lib/public-sharing.mjs';
const notes=(level,value='10')=>GRADE_WEIGHTS[level].map(()=>({mode:'note',value}));

test('search submissions contain canonical public URLs only, never private paths or student parameters',()=>{
 const payload=indexNowPayload('0123456789abcdef');assert.equal(payload.host,'www.simdcg.com');assert.equal(payload.urlList.length,INDEXABLE_PATHS.length);assert.ok(payload.urlList.every(u=>new URL(u).origin===PUBLIC_ORIGIN&&!new URL(u).search));
 for(const path of ['/interface','/api/study','/outils/calcul-moyenne-dcg?grade=5','https://example.com/'])assert.throws(()=>indexNowPayload('0123456789abcdef',[path]),/canonical public/);
 assert.throws(()=>indexNowPayload('short'));assert.equal(indexNowPayload('0123456789abcdef',['/','/']).urlList.length,1);
 assert.equal(publicShareUrl('/outils/calcul-moyenne-dcg?grade=5#score'),PUBLIC_ORIGIN+'/outils/calcul-moyenne-dcg');
 for(const path of ['/compte','/resultats/qcm?score=5','https://example.com/'])assert.throws(()=>publicShareUrl(path),/public resources/);
});

test('exam averages use official coefficients and never grant completion on partial inputs',()=>{
 assert.equal(GRADE_WEIGHTS.DCG.reduce((s,n)=>s+n),13);assert.equal(GRADE_WEIGHTS.DSCG.reduce((s,n)=>s+n),8.5);
 for(const level of ['DCG','DSCG']){const result=calculateGrades(level,notes(level));assert.equal(result.average,10);assert.equal(result.complete,true);assert.equal(result.thresholdsMet,true);const partial=notes(level);partial[0].value='';assert.equal(calculateGrades(level,partial).thresholdsMet,false);assert.equal(calculateGrades(level,partial).pending,1);}
 const weighted=notes('DSCG');weighted[0].value='14';weighted[1].value='6';assert.equal(calculateGrades('DSCG',weighted).average,87/8.5);
 const low=notes('DCG','12');low[0].value='5,99';assert.ok(calculateGrades('DCG',low).average>10);assert.equal(calculateGrades('DCG',low).thresholdsMet,false);assert.deepEqual(calculateGrades('DCG',low).low,[1]);
});
test('dispenses, VAE and optional language follow separate counting rules',()=>{
 const entries=notes('DCG').map(e=>({...e,mode:'dispense'}));for(let i=0;i<3;i++)entries[i]={mode:'note',value:'10'};
 assert.equal(calculateGrades('DCG',entries,'20').bonus,0);entries[3]={mode:'note',value:'10'};assert.equal(calculateGrades('DCG',entries,'20').average,12.5);assert.equal(calculateGrades('DCG',entries,'4').average,10);assert.deepEqual(calculateGrades('DCG',entries,'4').low,[]);
 const dscg=notes('DSCG');dscg[0].mode='dispense';dscg[3].mode='dispense';assert.deepEqual(calculateGrades('DSCG',dscg).errors,[1,4]);dscg[0].mode='vae';dscg[3].mode='vae';assert.equal(calculateGrades('DSCG',dscg).errors.length,0);assert.equal(calculateGrades('DSCG',dscg).weight,5.5);
});
test('grade input rejects misleading coercions and keeps unrounded threshold decisions',()=>{
 for(const value of ['-1','20,01','1e1','0x10','Infinity','10abc','10.999'])assert.ok(Number.isNaN(gradeValue(value)),value);
 assert.equal(gradeValue(''),null);assert.equal(gradeValue('0'),0);assert.equal(gradeValue(' 9,99 '),9.99);
 const close=notes('DCG');close[0].value='9,99';assert.ok(calculateGrades('DCG',close).average<10);assert.equal(calculateGrades('DCG',close).thresholdsMet,false);
 assert.equal(calculateGrades('DCG',notes('DCG'),'21').invalidOptional,true);
});
test('worked calculators return known examples and reject unsupported assumptions',()=>{
 assert.deepEqual(straightLine(12000,2000,5,3),{base:10000,annual:2000,cumulative:6000,net:6000});assert.equal(straightLine(12000,2000,5,5).net,2000);
 for(const input of [[12000,13000,5,3],[12000,0,0,0],[12000,0,5,6],[12000,0,5.5,3]])assert.throws(()=>straightLine(...input));
 assert.equal(netPresentValue(100000,10,[110000]).value,0);assert.equal(netPresentValue(100000,5,[110000]).value,4761.9);assert.equal(netPresentValue(100,0,[30,40,50]).value,20);assert.equal(netPresentValue(100,0,[50,-10,70]).value,10);
 assert.throws(()=>netPresentValue(100,-100,[120]));assert.throws(()=>netPresentValue(100,10,[]));assert.throws(()=>netPresentValue(100,10,[NaN]));
});
test('public presentation dependency graph excludes authentication and private study bundles',async()=>{
 const manifest=JSON.parse(await readFile(new URL('../dist/.vite/manifest.json',import.meta.url),'utf8'));
 const root=Object.keys(manifest).find(k=>manifest[k].name==='PublicPresentation');assert.ok(root);
 const seen=new Set();const visit=k=>{if(seen.has(k))return;seen.add(k);for(const child of manifest[k]?.imports||[])visit(child);};visit(root);
 for(const key of seen){assert.ok(!/firebase|App\.jsx|study-content|quiz-v2-data/i.test(key),key);assert.ok(!/firebase/.test(manifest[key]?.file||''),key);}
});
test('every public page has a working share image and the new resources are crawlable HTML',async()=>{
 for(const path of INDEXABLE_PATHS){const image=seoForPath(path).image;assert.ok(image.startsWith(PUBLIC_ORIGIN+'/social/'));await access(new URL('../public'+image.slice(PUBLIC_ORIGIN.length),import.meta.url));}
 const html=await readFile(new URL('../dist/public-pages/outils__calcul-moyenne-dscg.html',import.meta.url),'utf8');assert.equal(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1].replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim(),'Calculez votre moyenne DSCG.');assert.ok(html.includes('Coef.'));assert.ok(html.includes('href="/exemple-gratuit"'));assert.ok(html.includes('og:image'));assert.ok(html.includes('index, follow'));
 const guide=await readFile(new URL('../dist/public-pages/guides__amortissement-lineaire-exercice-corrige.html',import.meta.url),'utf8');assert.ok(guide.includes('2 000'));assert.ok(guide.includes('Calculateur pédagogique'));assert.ok(guide.includes('href="/exemple-gratuit"'));
});
