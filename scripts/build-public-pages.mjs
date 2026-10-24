import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createServer } from 'vite';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { PUBLIC_PAGES, PUBLIC_ORIGIN } from '../lib/public-study-pages.mjs';
import { CORE_PUBLIC_META, APP_PATHS, INDEXABLE_PATHS, seoForPath, structuredData } from '../lib/public-seo.mjs';
import { curriculumFor } from '../lib/curriculum.mjs';

// Server rendering creates public HTML only. It never reads user documents or calls APIs.
for(const [key,value] of Object.entries({VITE_FIREBASE_API_KEY:'public-render-placeholder',VITE_FIREBASE_PROJECT_ID:'public-render-placeholder',VITE_FIREBASE_AUTH_DOMAIN:'localhost',VITE_FIREBASE_APP_ID:'public-render-placeholder'}))process.env[key] ||= value;
const dist=resolve(process.cwd(),'dist');
const template=await readFile(resolve(dist,'index.html'),'utf8');
const manifest=JSON.parse(await readFile(resolve(dist,'.vite/manifest.json'),'utf8'));
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function cssFor(entry,seen=new Set()){if(seen.has(entry)||!manifest[entry])return [];seen.add(entry);return [...(manifest[entry].css||[]),...(manifest[entry].imports||[]).flatMap(key=>cssFor(key,seen))];}
const publicEntry=Object.entries(manifest).find(([,item])=>item.name==='PublicStudySite')?.[0];
const sampleEntry=Object.entries(manifest).find(([,item])=>item.name==='SamplePage')?.[0];
const allCss=[...new Set([...cssFor('index.html'),...cssFor(publicEntry),...cssFor(sampleEntry)])];
const extraStyles=allCss.filter(file=>!template.includes('/'+file)).map(file=>`<link rel="stylesheet" crossorigin href="/${file}">`).join('\n');
function htmlFor(path,body=''){
 const meta=seoForPath(path);
 let html=template.replace(/<title>[\s\S]*?<\/title>/,`<title>${escape(meta.title)}</title>`)
  .replace(/\s*<meta name="keywords"[^>]*>/g,'')
  .replace(/<meta name="description"[^>]*>/,`<meta name="description" content="${escape(meta.description)}">`)
  .replace(/<meta name="robots"[^>]*>/,`<meta name="robots" content="${meta.index?'index, follow':'noindex, follow'}">`)
  .replace(/<link rel="canonical"[^>]*>/,`<link rel="canonical" href="${escape(meta.canonical)}">`)
  .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g,'');
 for(const [key,value]of Object.entries({'og:title':meta.title,'og:description':meta.description,'og:url':meta.canonical,'og:type':meta.page?.kind==='guide'?'article':'website','og:image':meta.image,'twitter:image':meta.image,'og:image:alt':meta.title,'twitter:image:alt':meta.title,'twitter:title':meta.title,'twitter:description':meta.description})){
  const attr=key.startsWith('og:')?'property':'name';html=html.replace(new RegExp(`<meta ${attr}="${key}"[^>]*>`),`<meta ${attr}="${key}" content="${escape(value)}">`);
 }
 html=html.replace('</head>',extraStyles+'\n'+structuredData(path).map(data=>`<script type="application/ld+json">${JSON.stringify(data).replace(/</g,'\\u003c')}</script>`).join('\n')+'\n</head>');
 return html.replace('<div id="root"></div>',`<div id="root">${body}</div>`);
}
const server=await createServer({root:process.cwd(),mode:'production',server:{middlewareMode:true},optimizeDeps:{noDiscovery:true,include:[]},appType:'custom'});
let rewrites=[];
try{
 const {default:PublicPresentation}=await server.ssrLoadModule('/src/PublicPresentation.jsx');
 const {default:SamplePage}=await server.ssrLoadModule('/src/SamplePage.jsx');
 const {default:PublicStudySite}=await server.ssrLoadModule('/src/PublicStudySite.jsx');
 const {Marketing,OfferPage,PublicInfo,StudentReviews}=await server.ssrLoadModule('/src/modern.jsx');
 const {LegalScreen}=await server.ssrLoadModule('/src/App.jsx');
 const noop=()=>{};await mkdir(resolve(dist,'public-pages'),{recursive:true});
 for(const page of PUBLIC_PAGES){const file=page.path.slice(1).replaceAll('/','__')+'.html';await writeFile(resolve(dist,'public-pages',file),htmlFor(page.path,renderToString(React.createElement(PublicStudySite,{page}))));rewrites.push({source:page.path,destination:'/public-pages/'+file});}
 for(const path of Object.keys(CORE_PUBLIC_META)){
  let element;
  if(path==='/exemple-gratuit')element=React.createElement(SamplePage);
  else if(path==='/'||path==='/fonctionnalites')element=React.createElement(PublicPresentation,{path});
  else if(path==='/tarifs')element=React.createElement(OfferPage,{user:null,onCheckout:noop,onNav:noop});
  else if(path==='/cgu'||path==='/confidentialite')element=React.createElement(LegalScreen,{type:path==='/cgu'?'cgu':'confidentialite',onBack:noop});
  else if(path==='/avis')element=React.createElement(StudentReviews,{load:async()=>[],onNav:noop});
  else element=React.createElement(PublicInfo,{page:path==='/contact'?'support':'features',ues:curriculumFor('2027'),onNav:noop,onAuth:noop});
  const rendered=htmlFor(path,renderToString(element));if(path==='/')await writeFile(resolve(dist,'index.html'),rendered);else{const file=path.slice(1)+'.html';await writeFile(resolve(dist,'public-pages',file),rendered);rewrites.push({source:path,destination:'/public-pages/'+file});}
 }
}finally{await server.close();}
await writeFile(resolve(dist,'app.html'),htmlFor('/interface'));
await writeFile(resolve(dist,'404.html'),htmlFor('/page-introuvable','<main style="max-width:700px;margin:15vh auto;padding:24px"><h1>Cette page est introuvable.</h1><p>Retrouvez les révisions DCG et DSCG sur SIMDCG.</p><p><a href="/">Accueil</a> · <a href="/dcg">DCG</a> · <a href="/dscg">DSCG</a></p></main>').replace(/<script type="module"[^>]*><\/script>/g,''));
const sitemap=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${INDEXABLE_PATHS.map(path=>`\n<url><loc>${PUBLIC_ORIGIN}${path}</loc></url>`).join('')}\n</urlset>\n`;
await writeFile(resolve(dist,'sitemap.xml'),sitemap);
// Crawlers may read the noindex login shells. Protected API content remains inaccessible.
await writeFile(resolve(dist,'robots.txt'),`User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /public-pages/\nDisallow: /app.html\nDisallow: /404.html\nDisallow: /*?design=\n\nSitemap: ${PUBLIC_ORIGIN}/sitemap.xml\n`);
// Known app paths remain usable; unrecognised paths fall through to Vercel's real 404.
const config=JSON.parse(await readFile(resolve(process.cwd(),'vercel.json'),'utf8'));
config.rewrites=[...rewrites,...APP_PATHS.map(source=>({source,destination:'/app.html'}))];
await writeFile(resolve(process.cwd(),'vercel.json'),JSON.stringify(config,null,2)+'\n');
await writeFile(resolve(dist,'public-page-manifest.json'),JSON.stringify({origin:PUBLIC_ORIGIN,pages:INDEXABLE_PATHS.map(path=>({path,...seoForPath(path),page:undefined})),rewrites},null,2));
console.log(JSON.stringify({publicPages:INDEXABLE_PATHS.length,subjects:20,guides:PUBLIC_PAGES.filter(p=>p.kind==='guide').length,initialHtml:true,privateShellNoindex:true,sitemap:true}));
