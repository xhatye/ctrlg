import { PUBLIC_ORIGIN, PUBLIC_PAGES, findPublicPage } from './public-study-pages.mjs';
export const CORE_PUBLIC_META = {
 '/test-gratuit':{title:'Quiz gratuits DCG et DSCG : testez votre UE | SIMDCG',summary:'Essayez cinq QCM expliqués et trois flashcards dans chacune des 20 UE du DCG et du DSCG. Un aperçu gratuit, sans compte ni carte bancaire.'},
 '/exemple-gratuit':{title:'Un chapitre gratuit de comptabilité : cours, fiche et 10 QCM | SIMDCG',summary:'Essayez gratuitement un chapitre de DCG UE9 avec son cours, sa fiche et dix QCM expliqués. Sans compte ni carte bancaire.'},
 '/':{title:'SIMDCG | Plateforme de révision DCG et DSCG',summary:'Préparez vos UE du DCG et DSCG : cours par chapitre, QCM expliqués, flashcards, cas corrigés et mode examen. Pro à 15 € par mois.'},
 '/tarifs':{title:'Tarifs SIMDCG : Pro DCG et DSCG à 15 € par mois',summary:'Choisissez Pro à 15 € par mois ou le Pack Examen à 29 € pour 90 jours. Cours, QCM, cartes, cas et suivi pour vos UE DCG et DSCG.'},
 '/fonctionnalites':{title:'La méthode SIMDCG : comprendre, pratiquer et retenir',summary:'Découvrez les cours, QCM expliqués, cartes de rappel, cas corrigés, mode examen et suivi par chapitre pour préparer le DCG et DSCG.'},
 '/contact':{title:'Contacter SIMDCG : aide et accès à votre abonnement',summary:'Un problème de connexion ou de droits Pro ? Retrouvez le contact du support SIMDCG et les informations utiles pour vérifier votre accès.'},
 '/avis':{title:'Retours d’étudiants sur SIMDCG',summary:'Consultez les retours publiés avec l’accord des étudiants ayant utilisé SIMDCG. Aucun témoignage de démonstration n’est ajouté.'},
 '/cgu':{title:'Conditions d’utilisation de SIMDCG',summary:'Les conditions d’utilisation de la plateforme SIMDCG et de ses contenus de révision DCG et DSCG.'},
 '/confidentialite':{title:'Confidentialité et données personnelles · SIMDCG',summary:'Comment SIMDCG traite les données de compte et de progression, et comment exercer vos droits.'},
};
export const PUBLIC_NOINDEX_PATHS=['/cgu','/confidentialite'];
export const APP_PATHS=['/diagnostic','/premiere-session','/mes-annales','/connexion','/inscription','/interface','/matiere','/matieres','/qcm','/flashcards','/resume-cours','/cas-pratique','/planning','/entretien/config','/entretien/simulation','/resultats/entretien','/resultats/qcm','/resultats/cas','/pro','/compte','/tuteur','/historique','/progression','/examens','/a-revoir','/mon-retour','/mot-de-passe-oublie'];
export const socialImage=path=>{const imagePath=findPublicPage(path)?.subjectPath||path;return PUBLIC_ORIGIN+'/social/'+(imagePath==='/'?'site':imagePath.slice(1).replaceAll('/','__'))+'.png';};
export function seoForPath(path){const normal=path==='/'?'/':path.replace(/\/$/,'');const page=findPublicPage(normal),core=CORE_PUBLIC_META[normal];return {title:page?.title?`${page.title} | SIMDCG`:core?.title||'Votre espace de révision | SIMDCG',description:page?.summary||core?.summary||'Connectez-vous à votre espace SIMDCG pour retrouver vos révisions.',canonical:PUBLIC_ORIGIN+normal,index:!!(page||core)&&!PUBLIC_NOINDEX_PATHS.includes(normal),page,image:socialImage(page||core?normal:'/')};}
export function structuredData(path){const seo=seoForPath(path),page=seo.page;if(!seo.index)return [];
 const organization={'@context':'https://schema.org','@type':'Organization','@id':PUBLIC_ORIGIN+'/#organization',name:'SIMDCG',url:PUBLIC_ORIGIN+'/',logo:PUBLIC_ORIGIN+'/brand-mark.png',email:'contact.simdcg@gmail.com',description:'Plateforme indépendante de révision DCG et DSCG.',subjectOf:{'@id':PUBLIC_ORIGIN+'/a-propos#webpage'}};
 const publisher={'@id':organization['@id']};
 const website={'@context':'https://schema.org','@type':'WebSite','@id':PUBLIC_ORIGIN+'/#website',name:'SIMDCG',url:PUBLIC_ORIGIN+'/',inLanguage:'fr',publisher};
 const base={'@context':'https://schema.org','@type':page?.kind==='guide'?'Article':page?.kind==='about'?'AboutPage':'WebPage','@id':seo.canonical+'#webpage',name:seo.title,url:seo.canonical,description:seo.description,image:seo.image,inLanguage:'fr',publisher,isPartOf:{'@id':website['@id']}};
 if(page?.kind==='about')base.about=publisher;
 if(page?.kind==='guide'){base.headline=page.title;base.author=publisher;}
 const items=[{name:'Accueil',url:PUBLIC_ORIGIN+'/'}];if(page?.kind==='subject')items.push({name:page.level,url:PUBLIC_ORIGIN+'/'+page.level.toLowerCase()});if(page?.kind==='guide')items.push({name:'Guides',url:PUBLIC_ORIGIN+'/guides'});if(path!=='/')items.push({name:page?.title||seo.title,url:seo.canonical});
 const breadcrumb={'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:items.map((s,i)=>({'@type':'ListItem',position:i+1,name:s.name,item:s.url}))};
 if(['grade-calculator','revision-planner'].includes(page?.kind)){base['@type']='WebApplication';base.applicationCategory='EducationalApplication';base.operatingSystem='Web';base.isAccessibleForFree=true;base.offers={'@type':'Offer',price:'0',priceCurrency:'EUR'};}
 const app={'@context':'https://schema.org','@type':'WebApplication',name:'SIMDCG',url:PUBLIC_ORIGIN+'/',applicationCategory:'EducationalApplication',operatingSystem:'Web',description:'Cours, QCM expliqués, flashcards et dossiers originaux pour préparer les UE du DCG et DSCG.',inLanguage:'fr',offers:[{'@type':'Offer',name:'Pro mensuel',price:'15',priceCurrency:'EUR'},{'@type':'Offer',name:'Pack Examen 90 jours',price:'29',priceCurrency:'EUR'}]};
 app.provider=publisher;
 return path==='/'?[organization,website,base,app]:[organization,website,base,breadcrumb];
}
export function applyPageMetadata(path){const seo=seoForPath(path);document.title=seo.title;
 const set=(selector,attrs)=>{let el=document.head.querySelector(selector);if(!el){el=document.createElement(selector.startsWith('link')?'link':'meta');document.head.append(el);}for(const [k,v]of Object.entries(attrs))el.setAttribute(k,v);};
 set('meta[name="description"]',{name:'description',content:seo.description});set('meta[name="robots"]',{name:'robots',content:seo.index?'index, follow':'noindex, follow'});set('link[rel="canonical"]',{rel:'canonical',href:seo.canonical});
 for(const [key,value]of Object.entries({'og:title':seo.title,'og:description':seo.description,'og:url':seo.canonical,'og:type':seo.page?.kind==='guide'?'article':'website','og:image':seo.image,'og:image:alt':seo.title}))set(`meta[property="${key}"]`,{property:key,content:value});
 for(const [key,value]of Object.entries({'twitter:title':seo.title,'twitter:description':seo.description,'twitter:image':seo.image,'twitter:image:alt':seo.title}))set(`meta[name="${key}"]`,{name:key,content:value});
 document.querySelectorAll('script[type="application/ld+json"]').forEach(el=>el.remove());for(const data of structuredData(path)){const el=document.createElement('script');el.type='application/ld+json';el.textContent=JSON.stringify(data);document.head.append(el);}
}
export const INDEXABLE_PATHS=[...Object.keys(CORE_PUBLIC_META),...PUBLIC_PAGES.map(p=>p.path)].filter(path=>!PUBLIC_NOINDEX_PATHS.includes(path));
