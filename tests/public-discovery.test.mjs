import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PUBLIC_PAGES,PUBLIC_SUBJECTS,PUBLIC_GUIDES,OFFICIAL_SOURCES,findPublicPage,PUBLIC_ORIGIN } from '../lib/public-study-pages.mjs';
import { INDEXABLE_PATHS,APP_PATHS,seoForPath,structuredData } from '../lib/public-seo.mjs';
import { publicAnalyticsEvent } from '../lib/public-analytics.mjs';
test('public pages cover 20 distinct subjects and original guides without changing chapter access',async()=>{
 const bank=JSON.parse(await readFile(new URL('../src/catalogue.json',import.meta.url),'utf8'));
 assert.equal(PUBLIC_SUBJECTS.length,20);assert.equal(PUBLIC_GUIDES.length,11);assert.equal(new Set(PUBLIC_PAGES.map(p=>p.path)).size,PUBLIC_PAGES.length);
 for(const subject of PUBLIC_SUBJECTS){assert.ok(bank.modules[subject.id]);assert.ok(subject.intro.length>200);assert.equal(subject.practice.length,3);assert.equal(subject.pitfalls.length,3);assert.equal(subject.approach.steps.length,4);assert.equal(findPublicPage(subject.path+'/')?.id,subject.id);for(const id of subject.sources)assert.ok(OFFICIAL_SOURCES.some(s=>s.id===id));}
 for(const guide of PUBLIC_GUIDES){assert.equal(guide.sections.length,5);assert.ok(guide.sections.every(([title,text])=>title.length>10&&text.length>200));for(const id of guide.ues)assert.ok(PUBLIC_SUBJECTS.some(s=>s.id===id));}
});

test('publisher identity resolves consistently without fabricated endorsements or credentials',()=>{
 for(const path of INDEXABLE_PATHS){const data=structuredData(path);const org=data.find(s=>s['@type']==='Organization');const site=data.find(s=>s['@type']==='WebSite');const page=data.find(s=>s.url===PUBLIC_ORIGIN+path&&s['@type']!=='WebSite'&&s['@type']!=='Organization');assert.equal(org['@id'],PUBLIC_ORIGIN+'/#organization');assert.equal(site.publisher['@id'],org['@id']);assert.equal(page.publisher['@id'],org['@id']);assert.equal(page.isPartOf['@id'],site['@id']);assert.equal(org.sameAs,undefined);assert.equal(org.award,undefined);assert.equal(org.aggregateRating,undefined);}
 const about=structuredData('/a-propos').find(s=>s['@type']==='AboutPage');assert.equal(about.about['@id'],PUBLIC_ORIGIN+'/#organization');
});

test('verification and editorial information are present in initial public HTML',async()=>{
 const home=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');assert.ok(home.includes('name="google-site-verification"'));assert.ok(home.includes('href="/a-propos"'));
 const about=await readFile(new URL('../dist/public-pages/a-propos.html',import.meta.url),'utf8');for(const text of ['contact.simdcg@gmail.com','validation pédagogique indépendante','couverture','href="/sources"','href="/test-gratuit"'])assert.ok(about.toLowerCase().includes(text.toLowerCase()),text);
 const guide=await readFile(new URL('../dist/public-pages/guides__choisir-plateforme-revision-dcg-dscg.html',import.meta.url),'utf8');assert.ok(guide.includes('Comment choisir une plateforme'));assert.ok(guide.includes('href="/exemple-gratuit"'));assert.ok(guide.includes('garantir votre réussite'));
});
test('indexable URLs have distinct canonical metadata; private routes and unknown paths do not get indexed',()=>{
 const titles=new Set();for(const path of INDEXABLE_PATHS){const meta=seoForPath(path);assert.equal(meta.index,true);assert.equal(meta.canonical,PUBLIC_ORIGIN+path);assert.ok(meta.description.length>70);assert.ok(!titles.has(meta.title),path);titles.add(meta.title);for(const data of structuredData(path)){assert.ok(data['@context']);assert.equal(data.aggregateRating,undefined);}}
 for(const path of [...APP_PATHS,'/dcg/ue-99-inventee','/guide-inconnu','/api/study']){assert.equal(seoForPath(path).index,false);assert.equal(structuredData(path).length,0);}
});
test('analytics rejects private learning and removes every query and fragment, including payment identifiers',()=>{
 for(const path of APP_PATHS.filter(p=>!['/connexion','/inscription'].includes(p)))assert.equal(publicAnalyticsEvent({type:'pageview',url:PUBLIC_ORIGIN+path+'?uid=secret&session_id=cs_live_secret'}),null);
 const event=publicAnalyticsEvent({type:'pageview',url:PUBLIC_ORIGIN+'/tarifs?email=private@example.com&session_id=cs_live_secret#answer',referrer:'https://www.google.com/search?q=private'});
 assert.equal(event.url,PUBLIC_ORIGIN+'/tarifs');assert.equal(event.referrer,'https://www.google.com');assert.equal(publicAnalyticsEvent({type:'event',url:PUBLIC_ORIGIN+'/tarifs',data:{email:'secret'}}),null);assert.equal(publicAnalyticsEvent({type:'pageview',url:'not a URL'}),null);assert.equal(publicAnalyticsEvent({type:'pageview',url:PUBLIC_ORIGIN+'/page-inconnue'}),null);
 assert.equal(publicAnalyticsEvent({type:'pageview',url:PUBLIC_ORIGIN+'/tarifs',email:'private',answers:['private']}).email,undefined);assert.equal(publicAnalyticsEvent({type:'pageview',url:'ftp://example.com/tarifs'}),null);
});
test('built public HTML contains the actual page and links, while API and payment-return routing stays separate',async()=>{
 const config=JSON.parse(await readFile(new URL('../vercel.json',import.meta.url),'utf8'));
 const read=path=>readFile(new URL('../dist/'+path,import.meta.url),'utf8');
 for(const page of PUBLIC_PAGES){const route=config.rewrites.find(r=>r.source===page.path);assert.ok(route,page.path);const html=await read(route.destination.slice(1));assert.ok(html.includes('<h1>'),page.path);assert.ok(html.includes(`href="${PUBLIC_ORIGIN+page.path}"`));assert.ok(html.includes('index, follow'));assert.ok(html.includes('href="/tarifs'));assert.ok(html.includes('/assets/PublicStudySite-'));assert.ok(!html.includes('id="root"></div>'));}
 const sitemap=await read('sitemap.xml');assert.equal((sitemap.match(/<loc>/g)||[]).length,INDEXABLE_PATHS.length);for(const path of APP_PATHS)assert.ok(!sitemap.includes('<loc>'+PUBLIC_ORIGIN+path+'</loc>'));
 const shell=await read('app.html');assert.ok(shell.includes('noindex, follow'));assert.ok(config.rewrites.some(r=>r.source==='/compte'&&r.destination==='/app.html'));assert.ok(config.rewrites.some(r=>r.source==='/mot-de-passe-oublie'));assert.ok(!config.rewrites.some(r=>r.source.includes('api')||r.source.includes('(.*)')));
 const headingText=html=>html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1].replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
 const homepage=await read('index.html');assert.equal(headingText(homepage),'DCG &amp; DSCG. Comprendre. Pratiquer. Retenir.');assert.ok(homepage.includes('href="/sources"'));assert.ok(homepage.includes('href="/dcg/ue-9-comptabilite"')||homepage.includes('href="/dcg/ue-1-fondamentaux-du-droit"'));
 const presentation=await read('public-pages/fonctionnalites.html');assert.equal(headingText(presentation),'Moins de dispersion. Plus de révisions.');assert.ok(presentation.includes('Cours &amp; fiches'));assert.ok(presentation.includes('/previews-v4/exam.webp'));
});
