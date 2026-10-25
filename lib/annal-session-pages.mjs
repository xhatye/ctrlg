import catalogue from './annals-catalogue.json' with {type:'json'};
// Metadata from the existing verified subject catalogue, no new scraping or PDF copies.
export const ANNAL_SESSION_PAGES=[...new Set(catalogue.items.map(a=>a.level+'/'+a.year))].sort().reverse().map(key=>{
 const [level,year]=key.split('/');const items=catalogue.items.filter(a=>a.level===level&&a.year===Number(year)).map(({id,ue,subject,title,region,minutes,pages,sourceUrl,sourceName})=>({id,ue,subject,title,region,minutes,pages,sourceUrl,sourceName}));
 return {kind:'annal-session',path:'/annales/'+level.toLowerCase()+'-'+year,title:`Annales ${level} ${year} : sujets par UE et durée des épreuves`,summary:`Retrouvez les ${items.length} sujets ${level} de la session ${year} disponibles dans notre catalogue, leurs sources PDF, leur durée et une méthode pour préparer votre entraînement.`,level,year,items};
});
