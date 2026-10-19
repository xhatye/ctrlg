// Purpose-authored retrieval tasks. Accepted synonyms are explicit, never substring matches.
const text=(...accepted)=>({type:'text',accepted});
const number=(expected,unit='',tolerance=.005)=>({type:'number',expected,unit,tolerance});
const e=(id,before,fields,explanation,after='.',between=[])=>({id,before,fields,explanation,after,between});
export const PILOT_CLOZE={
 'UE9/chaine-comptable':[
  e('recall-0','Une facture de prestation consommée de 1 800 € est comptabilisée à crédit, sans TVA. Le compte de charge est inscrit au…',[text('débit')],'La charge augmente au débit ; la contrepartie est une dette fournisseur au crédit.'),
  e('recall-1','Cette même facture est ensuite payée. Le montant de la nouvelle charge créée par le seul règlement est de…',[number(0,'€')],'La charge a déjà été enregistrée. Le règlement réduit la dette et la banque ; il ne crée pas une deuxième charge.'),
  e('recall-2','Le document qui regroupe les mouvements par compte est le…',[text('grand-livre','grand livre')],'Le journal organise la chronologie ; le grand-livre regroupe les mouvements par compte ; la balance récapitule mouvements et soldes.'),
  e('recall-3','Une facture est entièrement omise : les deux côtés de l’écriture manquent. La balance peut-elle malgré tout être équilibrée ? Répondez oui ou non.',[text('oui')],'Oui : l’absence simultanée du débit et du crédit ne déséquilibre pas les totaux. Le contrôle de l’exhaustivité reste nécessaire.',''),
  e('recall-4','Un emprunt encaissé augmente la banque et crée une dette. Le montant du produit de vente créé par cet emprunt est…',[number(0,'€')],'Recevoir un financement ne constitue pas un chiffre d’affaires. Une entrée de trésorerie n’est pas automatiquement un produit.'),
  e('recall-5','L’état qui décrit le patrimoine à une date donnée est le…',[text('bilan')],'Le bilan décrit une situation à une date ; le compte de résultat porte sur les charges et produits d’une période.'),
 ],
 'UE1/offre-acceptation':[
  e('recall-0','Pour constituer une offre, la proposition doit préciser les éléments essentiels et manifester une volonté de…',[text('se lier','être lié','s’engager en cas d’acceptation')],'Une proposition déterminée doit également exprimer la volonté de son auteur d’être lié en cas d’acceptation. Sinon, il peut s’agir d’une invitation à négocier.'),
  e('recall-1','Une offre porte sur une prestation à 2 000 €. Le destinataire répond « d’accord, mais à 1 800 € ». Cette réponse modifie le prix : il faut examiner une nouvelle…',[text('offre','proposition','contre-offre','contre proposition')],'L’acceptation suppose l’adhésion aux termes de l’offre. Une réponse qui en modifie les termes ne forme pas le contrat initial par elle-même.'),
  e('recall-2','En principe, le silence vaut-il acceptation ? Répondez oui ou non.',[text('non')],'Le principe est que le silence ne vaut pas acceptation. Il faut examiner les exceptions liées à la loi, aux usages, aux relations d’affaires ou aux circonstances particulières.',''),
  e('recall-3','Selon le principe de l’article 1121 du Code civil, le contrat est conclu lorsque l’acceptation… à l’offrant.',[text('parvient')],'L’analyse porte sur le moment où l’acceptation parvient à l’offrant. Il faut reconstituer la chronologie des échanges.',''),
  e('recall-4','Une personne peut prouver un accord mais manquer du pouvoir d’engager la société. La formation du contrat et les… du signataire sont donc deux questions distinctes.',[text('pouvoirs','pouvoirs de représentation')],'La rencontre d’une offre et d’une acceptation ne dispense pas d’examiner la capacité et les pouvoirs nécessaires.',''),
  e('recall-5','Une proposition précise et ferme adressée au destinataire appelle une acceptation de ses…',[text('termes','conditions')],'L’acceptation est l’adhésion aux termes de l’offre. Il faut comparer concrètement les documents, pas seulement leur intitulé.'),
 ],
 'DSCG4/audit-planification':[
  e('recall-0','L’observation physique d’un stock apporte d’abord des éléments sur son… ; elle ne suffit pas à justifier son évaluation.',[text('existence')],'Un article peut être présent tout en ayant perdu de la valeur. L’existence et l’évaluation appellent des travaux adaptés.',''),
  e('recall-1','La quantité d’éléments collectés concerne leur caractère…',[text('suffisant')],'Le caractère suffisant porte sur la quantité. Le caractère approprié dépend de la qualité, notamment pertinence et fiabilité.'),
  e('recall-2','La pertinence et la fiabilité concernent le caractère… des éléments probants.',[text('approprié')],'Des pièces nombreuses mais sans lien avec l’assertion contrôlée ne répondent pas au besoin de preuve.',''),
  e('recall-3','Le seuil de planification doit être… au seuil de signification.',[text('inférieur')],'Un seuil inférieur permet de tenir compte du cumul possible d’anomalies non corrigées et non détectées. Le choix relève du jugement professionnel.',''),
  e('recall-4','Dans un dossier pédagogique, le seuil de signification fourni est 40 000 € et une anomalie identifiée atteint 55 000 €. De combien cette anomalie dépasse-t-elle ce montant ?',[number(15000,'€')],'55 000 − 40 000 = 15 000 €. Ce calcul appelle une analyse ; il ne détermine pas automatiquement l’opinion et ne remplace pas l’examen qualitatif.',''),
  e('recall-5','L’audit recherche une assurance élevée mais non absolue, appelée assurance…',[text('raisonnable')],'Les travaux réduisent le risque à un niveau acceptable ; ils ne garantissent pas l’absence de toute anomalie.'),
 ],
};
