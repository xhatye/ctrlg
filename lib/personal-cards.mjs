export function personalCardsKey(uid){
 if(typeof uid!=='string'||!uid||uid.length>128||!/^[\w-]+$/.test(uid))throw Error('Connectez-vous pour garder vos cartes personnelles.');
 return 'simdcg-personal-cards-v1-'+uid;
}
export function validatePersonalCard(card){
 if(!card||typeof card.front!=='string'||!card.front.trim()||card.front.length>400||typeof card.back!=='string'||!card.back.trim()||card.back.length>1500||!/^UE(?:[1-9]|1[0-3])$|^DSCG[1-7]$/.test(card.module)||typeof card.chapter!=='string'||!/^[\w-]{1,100}$/.test(card.chapter))throw Error('Complétez une question et une réponse dans les limites indiquées.');
 return {front:card.front.trim(),back:card.back.trim(),module:card.module,chapter:card.chapter};
}
export function readPersonalCards(storage,uid){
 const raw=storage.getItem(personalCardsKey(uid));if(!raw)return [];
 const data=JSON.parse(raw);if(data.version!==1||!Array.isArray(data.cards)||data.cards.length>100)throw Error('La sauvegarde des cartes est illisible. Aucune carte n’a été remplacée.');
 return data.cards.map(card=>{if(typeof card.id!=='string'||!/^[\w-]{1,80}$/.test(card.id))throw Error('Carte enregistrée invalide.');return {...validatePersonalCard(card),id:card.id};});
}
export function savePersonalCard(storage,uid,card,id){
 const cards=readPersonalCards(storage,uid),validated=validatePersonalCard(card);
 if(typeof id!=='string'||!/^[\w-]{1,80}$/.test(id))throw Error('Identifiant de carte invalide.');
 const index=cards.findIndex(c=>c.id===id);if(index<0&&cards.length>=100)throw Error('Vous avez atteint 100 cartes personnelles dans ce navigateur.');
 if(index<0)cards.push({...validated,id});else cards[index]={...validated,id};
 storage.setItem(personalCardsKey(uid),JSON.stringify({version:1,cards}));return cards;
}
