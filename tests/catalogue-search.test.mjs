import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {searchCatalogue} from '../lib/catalogue-search.mjs';
const catalogue=JSON.parse(readFileSync(new URL('../src/catalogue.json',import.meta.url)));
test('search resolves diploma, spaced UE codes, accents and notion terms without leaking answers',()=>{
 assert.deepEqual(searchCatalogue(catalogue,''),[]);
 for(const query of ['DSCG UE 2','dscg ue2']){const results=searchCatalogue(catalogue,query);assert.ok(results.length);assert.ok(results.every(r=>r.module==='DSCG2'));assert.equal(results[0].kind,'subject');}
 const droit=searchCatalogue(catalogue,'fondamentaux droit');assert.equal(droit[0].module,'UE1');
 assert.ok(searchCatalogue(catalogue,'amortissement').some(r=>r.kind==='chapter'&&r.chapter));
 assert.ok(searchCatalogue(catalogue,'preuve').length);assert.deepEqual(searchCatalogue(catalogue,'unmotabsolumentintrouvable'),[]);
 assert.ok(searchCatalogue(catalogue,'comptabilite').length);assert.ok(searchCatalogue(catalogue,'UE 9').every(r=>r.module==='UE9'));
 assert.ok(searchCatalogue(catalogue,'comptabilité',2).length<=2);
 for(const item of searchCatalogue(catalogue,'droit'))assert.ok(!('answer'in item)&&!('body'in item)&&!('correct'in item));
});
