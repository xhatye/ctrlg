import { PUBLIC_ORIGIN, PUBLIC_PAGES, findPublicPage } from './public-study-pages.mjs';
export const CORE_PUBLIC_META = {
 '/':{title:'SIMDCG | Plateforme de révision DCG et DSCG',summary:'Préparez vos UE du DCG et DSCG : cours par chapitre, QCM expliqués, flashcards, cas corrigés et mode examen. Pro à 15 € par mois.'},
 '/tarifs':{title:'Tarifs SIMDCG : Pro DCG et DSCG à 15 € par mois',summary:'Choisissez Pro à 15 € par mois ou le Pack Examen à 29 € pour 90 jours. Cours, QCM, cartes, cas et suivi pour vos UE DCG et DSCG.'},
 '/fonctionnalites':{title:'La méthode SIMDCG : comprendre, pratiquer et retenir',summary:'Découvrez les cours, QCM expliqués, cartes de rappel, cas corrigés, mode examen et suivi par chapitre pour préparer le DCG et DSCG.'},
 '/contact':{title:'Contacter SIMDCG : aide et accès à votre abonnement',summary:'Un problème de connexion ou de droits Pro ? Retrouvez le contact du support SIMDCG et les informations utiles pour vérifier votre accès.'},
 '/avis':{title:'Retours d’étudiants sur SIMDCG',summary:'Consultez les retours publiés avec l’accord des étudiants ayant utilisé SIMDCG. Aucun témoignage de démonstration n’est ajouté.'},
 '/cgu':{title:'Conditions d’utilisation de SIMDCG',summary:'Les conditions d’utilisation de la plateforme SIMDCG et de ses contenus de révision DCG et DSCG.'},
 '/confidentialite':{title:'Confidentialité et données personnelles · SIMDCG',summary:'Comment SIMDCG traite les données de compte et de progression, et comment exercer vos droits.'},
};
export const APP_PATHS=['/mes-annales','/connexion','/inscription','/interface','/matiere','/matieres','/qcm','/flashcards','/resume-cours','/cas-pratique','/planning','/entretien/config','/entretien/simulation','/resultats/entretien','/resultats/qcm','/resultats/cas','/pro','/compte','/tuteur','/historique','/progression','/examens','/a-revoir','/mon-retour','/mot-de-passe-oublie'];
export function seoForPath(path){const normal=path==='/'?'/':path.replace(/\/$/,'');const page=findPublicPage(normal),core=CORE_PUBLIC_META[normal];return {title:page?.title?`${page.title} | SIMDCG`:core?.title||'Votre espace de révision | SIMDCG',description:page?.summary||core?.summary||'Connectez-vous à votre espace SIMDCG pour retrouver vos révisions.',canonical:PUBLIC_ORIGIN+normal,index:!!(page||core),page};}
export function structuredData(path){const seo=seoForPath(path),page=seo.page;if(!seo.index)return [];
 const website={'@context':'https://schema.org','@type':'WebSite',name:'SIMDCG',url:PUBLIC_ORIGIN+'/',inLanguage:'fr'};
 const base={'@context':'https://schema.org','@type':page?.kind==='guide'?'Article':'WebPage',name:seo.title,url:seo.canonical,description:seo.description,inLanguage:'fr',isPartOf:{'@type':'WebSite',name:'SIMDCG',url:PUBLIC_ORIGIN+'/'}};
 if(page?.kind==='guide'){base.headline=page.title;base.author={'@type':'Organization',name:'SIMDCG'};}
 const items=[{name:'Accueil',url:PUBLIC_ORIGIN+'/'}];if(page?.kind==='subject')items.push({name:page.level,url:PUBLIC_ORIGIN+'/'+page.level.toLowerCase()});if(page?.kind==='guide')items.push({name:'Guides',url:PUBLIC_ORIGIN+'/guides'});if(path!=='/')items.push({name:page?.title||seo.title,url:seo.canonical});
 const breadcrumb={'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:items.map((s,i)=>({'@type':'ListItem',position:i+1,name:s.name,item:s.url}))};
 const app={'@context':'https://schema.org','@type':'WebApplication',name:'SIMDCG',url:PUBLIC_ORIGIN+'/',applicationCategory:'EducationalApplication',operatingSystem:'Web',description:'Cours, QCM expliqués, flashcards et dossiers originaux pour préparer les UE du DCG et DSCG.',inLanguage:'fr',offers:[{'@type':'Offer',name:'Pro mensuel',price:'15',priceCurrency:'EUR'},{'@type':'Offer',name:'Pack Examen 90 jours',price:'29',priceCurrency:'EUR'}]};
 return path==='/'?[website,base,app]:[base,breadcrumb];
}
export function applyPageMetadata(path){const seo=seoForPath(path);document.title=seo.title;
 const set=(selector,attrs)=>{let el=document.head.querySelector(selector);if(!el){el=document.createElement(selector.startsWith('link')?'link':'meta');document.head.append(el);}for(const [k,v]of Object.entries(attrs))el.setAttribute(k,v);};
 set('meta[name="description"]',{name:'description',content:seo.description});set('meta[name="robots"]',{name:'robots',content:seo.index?'index, follow':'noindex, follow'});set('link[rel="canonical"]',{rel:'canonical',href:seo.canonical});
 for(const [key,value]of Object.entries({'og:title':seo.title,'og:description':seo.description,'og:url':seo.canonical,'og:type':seo.page?.kind==='guide'?'article':'website'}))set(`meta[property="${key}"]`,{property:key,content:value});
 for(const [key,value]of Object.entries({'twitter:title':seo.title,'twitter:description':seo.description}))set(`meta[name="${key}"]`,{name:key,content:value});
 document.querySelectorAll('script[type="application/ld+json"]').forEach(el=>el.remove());for(const data of structuredData(path)){const el=document.createElement('script');el.type='application/ld+json';el.textContent=JSON.stringify(data);document.head.append(el);}
}
export const INDEXABLE_PATHS=[...Object.keys(CORE_PUBLIC_META),...PUBLIC_PAGES.map(p=>p.path)];
