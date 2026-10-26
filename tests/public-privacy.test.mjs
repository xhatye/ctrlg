import test from 'node:test';
import assert from 'node:assert/strict';
import {readdir,readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {INDEXABLE_PATHS,seoForPath,structuredData} from '../lib/public-seo.mjs';

test('the complete publishable output contains no personal owner name or personal handle',async()=>{
 const output=new URL('../dist/',import.meta.url);
 const forbidden=/marcus|bonnafis|eythax|eythube/i;
 for(const file of await readdir(output,{recursive:true,withFileTypes:true})){
  if(!file.isFile())continue;
  const bytes=await readFile(join(file.parentPath,file.name));
  assert.ok(!forbidden.test(bytes.toString('utf8')),file.name);
 }
});

test('legal documents remain public and readable but are excluded from search discovery',async()=>{
 const sitemap=await readFile(new URL('../dist/sitemap.xml',import.meta.url),'utf8');
 const robots=await readFile(new URL('../dist/robots.txt',import.meta.url),'utf8');
 const config=JSON.parse(await readFile(new URL('../vercel.json',import.meta.url),'utf8'));
 for(const path of ['/cgu','/confidentialite']){
  assert.equal(seoForPath(path).index,false);assert.equal(structuredData(path).length,0);
  assert.ok(!INDEXABLE_PATHS.includes(path));assert.ok(!sitemap.includes('<loc>https://www.simdcg.com'+path+'</loc>'));
  assert.ok(!robots.includes('Disallow: '+path));
  const route=config.rewrites.find(r=>r.source===path);assert.ok(route);
  const html=await readFile(new URL('../dist'+route.destination,import.meta.url),'utf8');
  assert.ok(html.includes('noindex, follow'));assert.ok(html.includes('France'));assert.ok(html.includes('contact.simdcg@gmail.com'));assert.ok(html.includes('<h1'));
  assert.ok(config.headers.some(r=>r.source===path&&r.headers.some(h=>h.key==='X-Robots-Tag'&&h.value==='noindex, follow')));
 }
});
