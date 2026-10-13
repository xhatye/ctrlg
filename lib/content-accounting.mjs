import { chapter as ch, notion as n, SOURCES as S } from './content-authoring.mjs';
const bfr=['Besoin en fonds de roulement, Bpifrance Création','https://bpifrance-creation.fr/besoin-fonds-roulement-bfr'];
const fr=['Fonds de roulement, Bpifrance Création','https://bpifrance-creation.fr/fonds-roulement'];
const impairment=['IAS 36, IFRS Foundation','https://www.ifrs.org/issued-standards/list-of-standards/ias-36-impairment-of-assets/'];
const consolidation=['IFRS 10, IFRS Foundation','https://www.ifrs.org/supporting-implementation/supporting-materials-by-ifrs-standards/ifrs-10/'];
const equity=['IAS 28, IFRS Foundation','https://www.ifrs.org/issued-standards/list-of-standards/ias-28-investments-in-associates-and-joint-ventures/'];
const audit=['Référentiel normatif, Haute Autorité de l’audit','https://h2a-france.org/referentiel-normatif-et-code-de-deontologie/acceder-au-referentiel-normatif/'];
export const ACCOUNTING_CHAPTERS = {
UE4:[
 ch('tva','Passer du prix à la TVA',
 'La TVA se calcule sur une base hors taxe et selon un taux applicable à l’opération. Dans les exercices, le taux fourni est une hypothèse de calcul, pas une règle valable pour toutes les opérations.',
 'Identifiez le prix hors taxe ou toutes taxes comprises. Calculez la taxe, distinguez TVA collectée et déductible, puis vérifiez les conditions du droit à déduction.',
 ['Un taux donné dans un exercice ne s’applique pas automatiquement à toute vente.','Un montant de TVA sur une facture ne suffit pas à établir sa déductibilité.'],[
 n('Prix hors taxe','Avec un prix hors taxe HT et un taux t, la TVA vaut HT × t et le prix TTC vaut HT × (1 + t).','Pour 500 € HT et un taux fourni de 20 %, quelle est la TVA ?','100 €.','500 €.','600 €.','400 €.'),
 n('Retour au hors taxe','Un prix TTC comprend déjà la taxe. Pour retrouver le HT, divisez le TTC par 1 + t ; ne retranchez pas t pour cent du TTC.','Pour 1 200 € TTC au taux fourni de 20 %, quel est le HT ?','1 000 €.','960 €.','1 440 €.','1 200 €.'),
 n('Taxe nette','Dans un schéma simple, la taxe à décaisser correspond à la TVA collectée moins la TVA déductible de la période. Les crédits et régularisations se traitent séparément.','TVA collectée 3 000 €, déductible 1 800 €, sans autre élément : quel solde ?','1 200 € à décaisser.','4 800 € à décaisser.','1 800 € de chiffre d’affaires.','3 000 € de crédit de TVA.'),
 n('Droit à déduction','Le droit à déduction dépend notamment de la nature de la dépense, de son affectation et des justificatifs. Les exclusions et règles de date doivent être examinées.','Quel réflexe précède une déduction de TVA ?','Vérifier les conditions et justificatifs applicables.','Déduire toute taxe affichée sans examen.','Déduire seulement selon le solde bancaire.','Confondre la TVA et le bénéfice.'),
 ],'L’exercice retient un taux de TVA de 20 %. Une vente s’élève à 4 000 € HT. Les achats ouvrant intégralement droit à déduction totalisent 1 500 € HT. Aucun crédit antérieur ni régularisation.',[
 ['Calculez le montant TTC de la vente.','TVA : 4 000 × 20 % = 800 €. TTC : 4 000 + 800 = 4 800 €.'],
 ['Calculez la TVA déductible donnée.','1 500 × 20 % = 300 €, sous les conditions expressément posées par l’énoncé.'],
 ['Calculez le solde de TVA.','800 − 300 = 500 € à décaisser pour ce schéma simplifié.'],
 ],[S.vat]),
 ch('resultat-fiscal','Du résultat comptable au résultat fiscal',
 'Le résultat fiscal part du résultat comptable, puis tient compte des traitements spécifiques. Une charge enregistrée peut être non déductible ; un produit peut relever d’un traitement distinct.',
 'Dressez un tableau par élément : traitement comptable, règle fiscale, correction et signe. Additionnez les réintégrations, retranchez les déductions et contrôlez les doublons.',
 ['Une charge non déductible se réintègre, elle ne se déduit pas une deuxième fois.','Ne présentez pas une correction fiscale comme une nouvelle écriture comptable par principe.'],[
 n('Réintégration','Une charge déjà soustraite du résultat comptable mais fiscalement non déductible augmente le résultat fiscal par une réintégration.','Une charge non déductible de 700 € est comptabilisée. Quelle correction retenir ?','Ajouter 700 € au résultat comptable.','Retirer encore 700 €.','Ajouter 700 € à la TVA.','Supprimer automatiquement la facture.'),
 n('Déduction extra-comptable','Une déduction fiscale diminue la base selon le régime applicable. Son existence et son montant doivent être justifiés indépendamment du traitement comptable.','Une déduction justifiée de 300 € agit comment sur la base ?','Elle la diminue de 300 €.','Elle l’augmente de 300 €.','Elle la multiplie par 300.','Elle ne peut jamais avoir d’effet.'),
 n('Passage au fiscal','Le schéma de passage est résultat comptable + réintégrations − déductions. Il faut utiliser les mêmes conventions et ne compter chaque élément qu’une fois.','Résultat comptable 10 000 €, réintégrations 900 €, déductions 400 € : résultat fiscal ?','10 500 €.','9 500 €.','11 300 €.','10 000 €.'),
 n('Taux fourni','Un impôt d’exercice se calcule sur la base retenue avec le taux fourni, lorsque le cas exclut les autres mécanismes. Le taux n’est pas une règle générale.','Base donnée de 8 000 €, taux d’exercice 25 %, sans autre mécanisme : impôt ?','2 000 €.','8 250 €.','6 000 €.','320 €.'),
 ],'Résultat comptable : 18 000 €. L’énoncé précise une charge non déductible de 1 200 € et un produit ouvrant droit à une déduction extra-comptable de 500 €. Taux d’exercice : 25 %, sans autre mécanisme.',[
 ['Calculez le résultat fiscal.','18 000 + 1 200 − 500 = 18 700 €.'],
 ['Calculez l’impôt de l’exercice.','18 700 × 25 % = 4 675 €, avec les seules hypothèses données.'],
 ['Pourquoi conserver le tableau de passage ?','Il explique les signes, la règle de chaque correction et l’absence de double comptage.'],
 ],[S.tax,S.bofip]),
 ch('dossier-fiscal','Justifier une position fiscale',
 'Une réponse fiscale doit être datée et rattachée à un régime. La base imposable, les obligations déclaratives et les preuves constituent trois niveaux d’analyse distincts.',
 'Précisez l’opération, le contribuable, la période et le régime. Consultez le texte et la doctrine pertinents. Documentez les hypothèses et les pièces utiles avant de chiffrer.',
 ['Une doctrine archivée n’est pas automatiquement applicable à une période actuelle.','Une provision comptable n’est pas automatiquement fiscalement déductible.'],[
 n('Date d’application','Les règles fiscales peuvent évoluer. Il faut vérifier la période et la version applicable, et distinguer la date de publication de la date d’effet.','Quel couple vérifier pour une règle fiscale ?','La période concernée et la version applicable.','La couleur du texte et la taille du fichier.','Le nom du comptable et celui du client.','Le taux de change sans lien avec l’opération.'),
 n('Pièces justificatives','Les pièces établissent la réalité, le montant et l’affectation de l’opération. Une facture ne résout pas à elle seule toute condition fiscale.','Quel dossier soutient une charge professionnelle ?','Des pièces sur sa réalité, son montant et son lien avec l’activité.','Un montant sans justification.','Une déclaration orale seule dans tous les cas.','Le chiffre d’affaires d’une autre société.'),
 n('Provision fiscale','La déductibilité d’une provision dépend des conditions fiscales, notamment d’un risque ou d’une charge suffisamment précisés et probables. Il faut aussi examiner leur nature.','Pourquoi une provision comptable peut-elle nécessiter une correction fiscale ?','Les conditions fiscales peuvent différer ou ne pas être remplies.','Toute provision est automatiquement une recette.','Une provision est toujours de la TVA.','Aucune règle fiscale ne concerne les provisions.'),
 n('Hypothèses explicites','Une information manquante doit être signalée. Une conclusion conditionnelle identifie ce qui doit être vérifié, plutôt que de transformer une supposition en certitude.','Le régime fiscal n’est pas indiqué. Quelle démarche retenir ?','Présenter les hypothèses et demander la précision nécessaire.','Inventer silencieusement un régime.','Appliquer toujours un taux unique.','Ignorer la période.'),
 ],'Une provision de 3 000 € est enregistrée pour un litige. Aucun courrier ni avis ne permet d’évaluer la probabilité du risque à la clôture. Le résultat comptable est 12 000 €.',[
 ['La seule écriture établit-elle la déductibilité ?','Non. Il faut examiner le risque, sa précision, sa probabilité à la clôture et les autres conditions fiscales.'],
 ['Quelle base obtiendrait-on si la totalité devait être réintégrée, sans autre correction ?','12 000 + 3 000 = 15 000 €. Il s’agit d’une hypothèse expressément conditionnelle.'],
 ['Quelle information compléter ?','Les faits et pièces connus à la clôture, l’objet du litige, l’estimation et la nature fiscale de la charge potentielle.'],
 ],[S.bofip,S.tax]),
],
UE6:[
 ch('equilibre','Fonds de roulement, BFR et trésorerie',
 'Une entreprise rentable peut manquer de trésorerie si elle finance des stocks et des clients avant d’être payée. L’analyse fonctionnelle relie les ressources stables au cycle d’exploitation.',
 'Classez les emplois et ressources selon la convention du cas. Calculez le fonds de roulement puis le BFR, enfin la trésorerie nette. Expliquez l’effet économique de chaque variation.',
 ['Ne confondez pas une vente et son encaissement.','N’assimilez pas un BFR élevé à une perte comptable.'],[
 n('Fonds de roulement','Dans le schéma fonctionnel fourni, le FRNG est l’excédent des ressources stables sur les emplois stables. Il représente une ressource pour financer le cycle.', 'Ressources stables 120 000 €, emplois stables 90 000 € : FRNG ?','30 000 €.','210 000 €.','−30 000 €.','90 000 €.'),
 n('BFR d’exploitation','Dans un cas simple hors trésorerie, le BFR d’exploitation regroupe stocks et créances d’exploitation, moins dettes d’exploitation. Le périmètre exact reste à préciser.','Stocks 20 000 €, clients 30 000 €, fournisseurs 18 000 € : BFR simplifié ?','32 000 €.','68 000 €.','−32 000 €.','50 000 €.'),
 n('Trésorerie nette','Avec les conventions fonctionnelles cohérentes, trésorerie nette = FRNG − BFR. Un résultat négatif signale un financement de trésorerie net.','FRNG 40 000 €, BFR 25 000 € : trésorerie nette ?','15 000 €.','65 000 €.','−15 000 €.','25 000 €.'),
 n('Délais clients','À activité comparable, un allongement du délai de paiement client immobilise davantage de ressources. Il augmente généralement le besoin de financement du cycle.','Des clients paient plus tard, toutes choses égales par ailleurs. Quel effet attendre ?','Une hausse du besoin de financement.','Une baisse automatique du BFR.','Une hausse certaine du bénéfice.','La disparition des stocks.'),
 ],'Ressources stables : 150 000 €. Emplois stables : 110 000 €. Stocks : 25 000 €. Créances clients : 35 000 €. Dettes fournisseurs : 22 000 €. Aucun autre poste.',[
 ['Calculez le FRNG.','150 000 − 110 000 = 40 000 €.'],
 ['Calculez le BFR simplifié.','25 000 + 35 000 − 22 000 = 38 000 €.'],
 ['Calculez et commentez la trésorerie nette.','40 000 − 38 000 = 2 000 €. La marge de trésorerie est positive mais faible dans le périmètre donné.'],
 ],[bfr,fr]),
 ch('investissement','Comparer des flux d’investissement',
 'Les flux futurs et la dépense initiale ne sont pas directement comparables lorsqu’ils interviennent à des dates différentes. L’actualisation exprime les flux à une même date.',
 'Placez les flux sur une frise. Identifiez le taux, les dates, les flux différentiels et la valeur finale. Calculez la valeur actuelle nette puis testez les hypothèses sensibles.',
 ['Le résultat comptable n’est pas un flux de trésorerie.','Une VAN positive selon un scénario n’est pas une garantie de réalisation.'],[
 n('Actualisation','Un flux F dans n années actualisé au taux r vaut F / (1 + r)^n. Taux et période doivent être cohérents.','110 € dans un an, taux 10 % : valeur actuelle ?','100 €.','121 €.','110 €.','90 €.'),
 n('Valeur actuelle nette','La VAN additionne les flux actualisés et retranche l’investissement initial. Une VAN positive traduit un excédent selon le taux et le scénario retenus.','Investissement 1 000 €, flux dans un an 1 155 €, taux 10 % : VAN ?','50 €.','155 €.','−50 €.','1 050 €.'),
 n('Coût irrécupérable','Une dépense déjà engagée et non modifiée par le choix ne constitue pas un flux différentiel futur. La décision doit porter sur ce qu’elle change réellement.','Une étude passée non récupérable et commune aux options doit être traitée comment ?','L’exclure des flux différentiels futurs.','La compter dans chaque encaissement.','La transformer en recette.','La doubler dans la VAN.'),
 n('Variation du BFR','Une augmentation du BFR consomme des ressources au moment considéré. Une récupération finale éventuelle doit être justifiée, pas présumée.','Une hausse initiale du BFR de 2 000 € produit quel flux ?','Un décaissement de 2 000 €.','Un encaissement de 2 000 €.','Un bénéfice de 2 000 €.','Aucun effet dans tous les cas.'),
 ],'Un projet coûte 10 000 € immédiatement et génère un unique flux de 11 550 € dans un an. Le taux d’actualisation est 10 %. Aucun autre flux.',[
 ['Actualisez le flux futur.','11 550 / 1,10 = 10 500 €.'],
 ['Calculez la VAN.','10 500 − 10 000 = 500 €.'],
 ['Quelle limite rappeler ?','La conclusion dépend du flux prévu, de sa date et du taux retenu. Il faut analyser l’incertitude et les autres contraintes de décision.'],
 ],[S.finance]),
 ch('financement','Emprunt et plan de financement',
 'Le financement doit couvrir les besoins aux dates où ils apparaissent. Les intérêts et le remboursement du capital n’ont pas le même rôle dans un tableau d’emprunt.',
 'Identifiez les besoins initiaux et futurs, les ressources, puis les flux de remboursement. Séparez capital, intérêts et annuité. Contrôlez le capital restant dû après chaque échéance.',
 ['Un emprunt reçu n’est pas un produit d’exploitation.','Les intérêts ne constituent pas un remboursement du capital.'],[
 n('Intérêt d’une période','Dans un tableau simple, les intérêts se calculent sur le capital restant dû au début de la période, au taux de cette période.','Capital initial 20 000 €, taux annuel 5 % : intérêts de la première année ?','1 000 €.','5 000 €.','20 000 €.','400 €.'),
 n('Annuité','Une échéance comprend le remboursement du capital et les intérêts, hors autres frais éventuels. Les deux composantes doivent être identifiées.','Capital remboursé 4 000 €, intérêts 600 € : échéance hors frais ?','4 600 €.','3 400 €.','600 €.','4 000 €.'),
 n('Capital restant dû','Le capital restant dû diminue du capital remboursé. Le paiement des seuls intérêts ne le réduit pas.','Capital restant 12 000 €, remboursement de capital 3 000 € : nouveau capital dû ?','9 000 €.','15 000 €.','3 000 €.','12 600 €.'),
 n('Plan de financement','Un plan relie besoins et ressources sur des périodes cohérentes. Une marge de trésorerie doit être distinguée des investissements et du BFR.','Quel besoin ajouter aux investissements lors d’un démarrage ?','Le BFR et la trésorerie de sécurité pertinents.','Le chiffre d’affaires comme décaissement automatique.','La totalité des bénéfices des concurrents.','Uniquement la TVA collectée future.'),
 ],'Un emprunt de 15 000 € porte un taux annuel de 4 %. Le capital est remboursé par fractions de 5 000 € en fin d’année, sans frais.',[
 ['Calculez les intérêts de la première année.','15 000 × 4 % = 600 €. Première échéance : 5 000 + 600 = 5 600 €.'],
 ['Calculez les intérêts de la deuxième année.','Après le premier remboursement, capital dû 10 000 €. Intérêts : 10 000 × 4 % = 400 €. Échéance : 5 400 €.'],
 ['Calculez le total des intérêts sur trois ans.','600 + 400 + 200 = 1 200 €, avec les dates et modalités données.'],
 ],[fr,S.finance]),
],
UE9:[
 ch('operations','Enregistrer achats, ventes et règlements',
 'L’écriture traduit une opération dans les comptes concernés. Pour la comprendre, séparez la nature économique, les montants hors taxe et la dette ou créance toutes taxes comprises.',
 'Repérez les pièces, le sens de chaque compte et les montants. Équilibrez débit et crédit. Traitez ensuite le règlement comme une opération distincte de la vente ou de l’achat.',
 ['Encaisser une créance déjà comptabilisée ne crée pas une deuxième vente.','Une TVA récupérable n’entre pas automatiquement dans le coût d’achat.'],[
 n('Achat avec TVA','Un achat à crédit distingue la charge ou l’actif, la TVA déductible lorsque ses conditions sont remplies, et la dette TTC envers le fournisseur.','Achat de marchandises 1 000 € HT, TVA déductible 200 €, à crédit : dette fournisseur ?','1 200 €.','1 000 €.','200 €.','800 €.'),
 n('Vente à crédit','Une vente à crédit crée une créance client TTC. Le produit et la TVA collectée sont distingués ; le paiement ultérieur solde la créance.','Vente 500 € HT, TVA 100 €, à crédit : créance client ?','600 €.','500 €.','100 €.','400 €.'),
 n('Règlement fournisseur','Le paiement d’une dette fournisseur débite le compte fournisseur et crédite la banque. L’achat ne doit pas être comptabilisé une seconde fois.','Quel effet produit le règlement d’une dette déjà enregistrée ?','Une diminution de la dette et de la banque.','Une nouvelle charge d’achat identique.','Un nouveau produit de vente.','Une augmentation de la dette.'),
 n('Balance','La balance récapitule les mouvements et soldes des comptes. L’égalité des totaux ne garantit pas l’absence de toute erreur d’imputation.','Une balance équilibrée prouve-t-elle que chaque compte est correct ?','Non, une erreur d’imputation peut rester équilibrée.','Oui, sans exception.','Oui, si la banque est positive.','Non, car les débits ne doivent jamais égaler les crédits.'),
 ],'Achat de marchandises à crédit : 2 000 € HT, TVA intégralement déductible 400 €. La dette est payée ensuite par virement. Ne considérez aucun autre élément.',[
 ['Décrivez l’écriture d’achat.','Débit achats 2 000 € et TVA déductible 400 € ; crédit fournisseur 2 400 €. Les comptes précis dépendent du plan utilisé.'],
 ['Décrivez le règlement.','Débit fournisseur 2 400 € ; crédit banque 2 400 €.'],
 ['Pourquoi ne pas débiter à nouveau les achats ?','La charge a été reconnue à l’achat. Le règlement éteint la dette, sans créer un deuxième achat.'],
 ],[S.pcg,S.vat]),
 ch('stocks','Stocks et rattachement à l’exercice',
 'La clôture rattache les charges et produits à l’exercice concerné. Les stocks, factures non parvenues et charges constatées d’avance demandent des analyses distinctes.',
 'Identifiez ce qui a été consommé, livré ou utilisé avant la clôture. Déterminez la période économique, puis les ajustements. Justifiez les quantités et les valorisations.',
 ['Une facture reçue après la clôture peut concerner l’exercice clos.','Un paiement anticipé n’implique pas que toute la charge concerne l’exercice.'],[
 n('Consommation de marchandises','Dans un cas simple, consommation = stock initial + achats − stock final. Les mêmes conventions de coût doivent être utilisées.','Stock initial 5 000 €, achats 30 000 €, stock final 7 000 € : consommation ?','28 000 €.','32 000 €.','42 000 €.','30 000 €.'),
 n('Charge constatée d’avance','Une dépense comptabilisée peut concerner une période future. La part future est retirée des charges de l’exercice dans le cadre du rattachement.','Une assurance annuelle couvre neuf mois futurs à la clôture. Quel ajustement examiner ?','Une charge constatée d’avance pour la part future.','Une nouvelle vente.','Une augmentation de la TVA collectée.','Une distribution de dividendes.'),
 n('Facture non parvenue','Une prestation déjà reçue avant la clôture peut générer une charge et une dette à constater même si la facture n’est pas encore arrivée.','Prestation reçue en décembre, facture en janvier : quelle question poser ?','Le rattachement de la charge et de la dette à décembre.','La suppression définitive de la dépense.','Une reconnaissance seulement au paiement dans tous les cas.','L’annulation automatique du contrat.'),
 n('Inventaire physique','L’inventaire confronte les quantités observées aux enregistrements. Les écarts doivent être expliqués et leur impact évalué.','Quel contrôle établit les quantités de stock ?','Un inventaire physique rapproché des données.','Le seul montant des ventes.','Le nombre de factures fournisseurs seul.','Le capital social uniquement.'),
 ],'Une assurance de 1 200 € est comptabilisée le 1er octobre pour douze mois. Clôture le 31 décembre. L’exercice demande une répartition mensuelle uniforme, hors TVA.',[
 ['Quelle part concerne l’exercice clos ?','Trois mois sur douze : 1 200 × 3 / 12 = 300 €.'],
 ['Quelle part concerne l’exercice suivant ?','Neuf mois sur douze : 1 200 × 9 / 12 = 900 €.'],
 ['Quel ajustement examiner ?','Une charge constatée d’avance de 900 € afin que la charge de l’exercice clos soit 300 € dans ce cas.'],
 ],[S.pcg]),
 ch('actifs','Immobilisations et dépréciations',
 'Un actif utilisé durablement se distingue d’une consommation courante. Son coût d’entrée, son amortissement et sa dépréciation répondent à des questions différentes.',
 'Déterminez le coût d’entrée selon le cadre applicable. Identifiez l’usage, la durée et la valeur résiduelle. Calculez la valeur nette comptable avant d’examiner une éventuelle perte de valeur.',
 ['Ne confondez pas amortissement et paiement du fournisseur.','Ne comptabilisez pas deux fois le même effet de perte de valeur.'],[
 n('Base amortissable','La base amortissable tient compte du coût et de la valeur résiduelle retenue dans les conditions applicables. Le mode doit refléter la consommation attendue.','Coût 10 000 €, valeur résiduelle donnée 1 000 €, durée cinq ans en linéaire : annuité complète ?','1 800 €.','2 000 €.','2 200 €.','9 000 €.'),
 n('Valeur nette comptable','La VNC résulte de la valeur brute diminuée des amortissements et dépréciations cumulés. Elle ne correspond pas automatiquement à une valeur de marché.','Valeur brute 12 000 €, amortissements 4 000 €, dépréciation 500 € : VNC ?','7 500 €.','8 500 €.','16 500 €.','12 000 €.'),
 n('Coût directement attribuable','Les coûts nécessaires pour mettre un actif en place et en état de fonctionner s’analysent dans son coût d’entrée. Les coûts sans lien direct ne s’y ajoutent pas mécaniquement.','Quel coût examiner dans le coût d’entrée d’une machine ?','Un coût d’installation directement nécessaire.','Toute dépense de publicité future.','Toute charge administrative sans lien.','Un dividende versé à un associé.'),
 n('Indication de perte de valeur','Une perte de valeur s’examine lorsque les conditions du cadre applicable le justifient. Un indice doit conduire à comparer les valeurs selon ce cadre.','Un actif devient techniquement obsolète. Quel examen ouvrir ?','L’existence d’une perte de valeur selon les règles applicables.','Une hausse automatique de sa valeur.','L’annulation de tous les amortissements passés.','Une reconnaissance systématique de chiffre d’affaires.'),
 ],'Machine : coût 18 000 €, valeur résiduelle nulle, durée six ans, linéaire. Deux annuités complètes ont été comptabilisées. Une valeur actuelle de 10 000 € est donnée pour le test PCG simplifié.',[
 ['Calculez l’amortissement cumulé.','Annuité : 18 000 / 6 = 3 000 €. Après deux annuités : 6 000 €.'],
 ['Calculez la VNC avant le test.','18 000 − 6 000 = 12 000 €.'],
 ['Calculez la dépréciation dans les hypothèses données.','12 000 − 10 000 = 2 000 €. Après cette dépréciation, VNC 10 000 €.'],
 ],[S.pcg]),
],
UE10:[
 ch('evaluation','Évaluer et documenter un actif',
 'La comptabilité approfondie demande de justifier les choix, pas seulement de produire un montant. Le cadre utilisé, les coûts retenus et les estimations doivent rester traçables.',
 'Identifier le référentiel et le type d’actif. Distinguer coût initial, dépenses ultérieures et estimations. Documenter les choix puis vérifier leur cohérence d’un exercice à l’autre.',
 ['PCG et IFRS ne sont pas interchangeables dans une réponse.','Une estimation modifiée ne signifie pas automatiquement une erreur passée.'],[
 n('Référentiel','Le traitement dépend du référentiel applicable aux comptes étudiés. Une norme internationale ne s’applique pas automatiquement aux comptes individuels français.','Que préciser avant de choisir un traitement ?','Le référentiel et le périmètre des comptes.','La taille de la police du bilan.','Le nom commercial du logiciel.','Le seul taux de TVA.'),
 n('Composants','Des éléments significatifs avec des usages ou durées différents peuvent demander un suivi distinct. Le raisonnement doit expliquer la consommation des avantages attendus.','Pourquoi séparer des composants pertinents ?','Pour refléter leurs rythmes distincts de consommation.','Pour créer automatiquement un produit.','Pour éviter toute estimation.','Pour annuler la valeur de l’ensemble.'),
 n('Estimation','Une durée ou une valeur résiduelle est une estimation fondée sur les informations disponibles. Elle doit être réexaminée lorsque ces informations évoluent.','Une nouvelle information modifie une durée d’usage. Quelle question analyser ?','Le traitement d’un changement d’estimation.','La suppression de toutes les écritures.','Une hausse automatique du capital.','Une annulation de la dette fiscale.'),
 n('Dépense ultérieure','Une dépense ultérieure s’analyse selon sa nature et les conditions de comptabilisation. Le seul fait qu’elle concerne une immobilisation ne la rend pas toujours immobilisable.','Toute réparation sur une machine augmente-t-elle automatiquement sa valeur ?','Non, sa nature et les conditions doivent être examinées.','Oui, sans autre examen.','Oui, si elle est payée en espèces.','Oui, seulement parce que le fournisseur est identique.'),
 ],'Un équipement comprend deux composants donnés : structure 24 000 € sur huit ans et module 6 000 € sur trois ans. Valeurs résiduelles nulles et annuités linéaires complètes.',[
 ['Calculez l’annuité de chaque composant.','Structure : 24 000 / 8 = 3 000 €. Module : 6 000 / 3 = 2 000 €.'],
 ['Calculez l’annuité totale.','3 000 + 2 000 = 5 000 €.'],
 ['Pourquoi une durée unique peut-elle être inadaptée ?','Les deux éléments ont des consommations différentes selon les données ; une durée unique pourrait ne pas refléter ces rythmes.'],
 ],[S.pcg]),
 ch('passifs','Dettes, provisions et événements',
 'Une dette certaine et une provision ne reflètent pas le même degré d’incertitude. Les faits connus à la clôture et les informations reçues ensuite doivent être analysés avec leur lien à cette date.',
 'Identifier l’obligation, l’origine du risque, la probabilité de sortie et la qualité de l’estimation. Distinguer les faits de clôture des événements créant une situation nouvelle.',
 ['Un risque vague ne justifie pas n’importe quelle provision.','Une réserve de capitaux propres n’est pas une provision pour risque.'],[
 n('Dette et provision','Une dette porte une obligation dont le montant ou l’échéance est suffisamment déterminé. Une provision comporte une incertitude à analyser selon le cadre comptable.','Quel point distingue notamment une provision d’une dette ordinaire ?','L’incertitude sur le montant ou l’échéance.','L’interdiction d’utiliser des justificatifs.','L’absence nécessaire de toute obligation.','La création automatique de trésorerie.'),
 n('Obligation présente','La reconnaissance d’une provision nécessite notamment une obligation actuelle issue d’un événement passé dans les conditions applicables. Une dépense future souhaitée ne suffit pas.','Un projet de campagne commerciale future crée-t-il toujours une provision ?','Non, une simple intention future ne suffit pas.','Oui, toute dépense prévue est une provision.','Oui, si le budget est signé par un salarié.','Oui, car toute prévision est une dette.'),
 n('Estimation documentée','Le montant doit être fondé sur une estimation justifiable, utilisant les faits disponibles. Une somme choisie pour réduire le bénéfice n’est pas une méthode.','Quelle justification soutenir pour une provision ?','Une estimation fondée sur des éléments pertinents.','Un montant choisi pour lisser le résultat.','Le solde bancaire seul.','Le salaire du dirigeant sans lien.'),
 n('Événement postérieur','Un événement postérieur peut préciser une situation existant à la clôture ou créer une situation nouvelle. Cette distinction oriente le traitement comptable et l’information.','Quel critère aide à traiter un événement après clôture ?','Son lien avec une situation existant à la clôture.','Le nombre de jours uniquement dans tous les cas.','La couleur de la lettre reçue.','Le choix de la banque.'),
 ],'Un litige existait à la clôture. Une estimation documentée de 4 000 € est retenue selon les conditions de l’énoncé. Une lettre reçue avant l’établissement des comptes apporte une information liée au même litige et porte l’estimation à 5 500 €.',[
 ['Quel lien examiner ?','Le lien de la nouvelle information avec la situation existant à la clôture. L’énoncé la rattache au même litige.'],
 ['Quelle variation d’estimation est donnée ?','5 500 − 4 000 = 1 500 € supplémentaires, sous réserve du traitement applicable aux informations de clôture.'],
 ['Quelle distinction fiscale rappeler ?','La reconnaissance comptable et la déductibilité fiscale doivent être examinées séparément.'],
 ],[S.pcg]),
 ch('capitaux','Capitaux propres et affectation du résultat',
 'Les capitaux propres ne se limitent pas à la banque ni au capital social. L’affectation du résultat répartit un montant selon les décisions et règles applicables.',
 'Repérer capital, primes, réserves, report à nouveau et résultat. Identifier les mouvements, les décisions et leur effet sur le total des capitaux propres et la trésorerie.',
 ['Un transfert du résultat vers une réserve ne crée pas un nouveau bénéfice.','Une augmentation de capital par incorporation ne constitue pas forcément une entrée d’argent.'],[
 n('Affectation','Transférer un bénéfice vers une réserve change la composition des capitaux propres, sans changer leur total par ce seul transfert.','Quel effet a une mise en réserve seule ?','Une modification de composition, sans variation du total.','Une nouvelle recette bancaire garantie.','Une baisse automatique des ventes.','Une hausse automatique de la TVA.'),
 n('Prime d’émission','La prime distingue la valeur d’émission des titres de leur valeur nominale. Elle s’analyse séparément du capital nominal.','Action nominale 10 €, émission 14 € : prime unitaire ?','4 €.','14 €.','10 €.','24 €.'),
 n('Incorporation de réserves','Une incorporation de réserves au capital est un mouvement interne des capitaux propres. Elle ne doit pas être présentée comme un apport de trésorerie nouveau.','Quelle conséquence d’une incorporation de réserves seule ?','Un transfert interne des capitaux propres.','Un encaissement obligatoire égal au transfert.','Une nouvelle vente.','Une dette fournisseur supplémentaire.'),
 n('Distribution et trésorerie','Une distribution décidée et son paiement sont deux étapes. Leur traitement dépend du stade et des règles applicables à la décision.','Pourquoi distinguer décision de distribution et paiement ?','Les dates et effets comptables ne sont pas identiques.','Le dividende devient une vente.','Le paiement augmente la banque.','Aucune écriture ne peut intervenir.'),
 ],'Une société émet 1 000 actions de nominal 10 € au prix de 14 €, intégralement versé selon l’énoncé, sans frais. Analysez les montants de financement.',[
 ['Quel montant est encaissé ?','1 000 × 14 = 14 000 €.'],
 ['Quel montant correspond au capital nominal ?','1 000 × 10 = 10 000 €.'],
 ['Quelle prime d’émission totale ?','1 000 × (14 − 10) = 4 000 €. Le total de financement est 10 000 + 4 000 = 14 000 €.'],
 ],[S.pcg]),
],
DSCG2:[
 ch('valorisation','Valoriser des flux et choisir un taux',
 'La valorisation relie des flux, des dates et un risque. Le taux doit correspondre à la nature des flux : une valeur d’entreprise et une valeur des capitaux propres ne sont pas interchangeables.',
 'Identifier le destinataire des flux, le taux cohérent et la période. Actualiser séparément les flux puis expliciter les ajustements nécessaires pour passer à la valeur recherchée.',
 ['Ne mélangez pas flux pour tous les financeurs et taux des seuls actionnaires.','Une valeur calculée reste sensible au scénario et au taux.'],[
 n('Nature des flux','Les flux disponibles pour l’entreprise et ceux revenant aux actionnaires ne suivent pas le même périmètre. Le choix du taux doit rester cohérent.','Quelle vérification précède une actualisation ?','La cohérence entre les flux et le taux.','Le nom du tableur uniquement.','Le montant du capital nominal uniquement.','Le classement alphabétique des sociétés.'),
 n('Dette nette','Dans un schéma simplifié, la dette nette financière est la dette financière diminuée de la trésorerie retenue. Les autres ajustements dépendent du périmètre.','Dette financière 80 000 €, trésorerie retenue 20 000 € : dette nette ?','60 000 €.','100 000 €.','20 000 €.','−60 000 €.'),
 n('Valeur des capitaux propres','Dans le schéma fourni sans autre ajustement, valeur des capitaux propres = valeur d’entreprise − dette nette. Ne confondez pas valeur et capital nominal.','Valeur d’entreprise 500 000 €, dette nette 120 000 € : valeur des capitaux propres ?','380 000 €.','620 000 €.','120 000 €.','500 120 €.'),
 n('Valeur terminale','La valeur terminale d’une rente croissante est F de la période suivante / (r − g), sous les hypothèses du modèle et r supérieur à g.','Flux suivant 10 000 €, r = 8 %, g = 3 % : valeur terminale non actualisée ?','200 000 €.','125 000 €.','333 333 €.','909 €.'),
 ],'Valeur d’entreprise calculée : 900 000 €. Dette financière : 250 000 €. Trésorerie retenue : 70 000 €. Aucun autre ajustement. 10 000 actions existent.',[
 ['Calculez la dette nette.','250 000 − 70 000 = 180 000 €.'],
 ['Calculez la valeur des capitaux propres.','900 000 − 180 000 = 720 000 €.'],
 ['Calculez la valeur par action.','720 000 / 10 000 = 72 €, selon le périmètre et les hypothèses donnés.'],
 ],[S.finance]),
 ch('portefeuille','Rendement, risque et diversification',
 'Le rendement espéré n’est pas un rendement garanti. La diversification dépend des relations entre les actifs, pas seulement de leur nombre.',
 'Identifier les pondérations, scénarios, risques et horizons. Calculer les rendements pondérés puis étudier la corrélation et les limites de la mesure de risque retenue.',
 ['La diversification ne supprime pas tout risque de marché.','Une faible volatilité ne démontre pas l’absence de risque de liquidité ou de crédit.'],[
 n('Rendement pondéré','Le rendement d’un portefeuille s’obtient par la moyenne des rendements pondérée par les parts investies, selon les conventions et périodes cohérentes.','60 % à rendement 5 % et 40 % à rendement 10 % : rendement pondéré ?','7 %.','15 %.','6 %.','8 %.'),
 n('Corrélation','La corrélation décrit le mouvement conjoint des rendements. Des actifs imparfaitement corrélés peuvent réduire la fluctuation du portefeuille.','Quelle information aide à étudier le bénéfice de diversification ?','La corrélation entre les rendements.','Le nom des actifs uniquement.','Le nombre de logos uniquement.','La date de la dernière publicité.'),
 n('Risque spécifique','La diversification peut réduire des risques propres à un actif. Elle ne neutralise pas automatiquement les facteurs communs au marché.','Quel risque la diversification peut-elle réduire ?','Une partie du risque spécifique aux actifs.','Tout risque de marché sans exception.','Tout risque juridique de l’investisseur.','Toute variation de taux dans tous les cas.'),
 n('Prime de risque','Dans le modèle fourni, le rendement exigé peut intégrer un taux sans risque et une prime liée au risque. Il ne faut pas présenter le résultat comme une promesse.','Taux sans risque 3 %, bêta 1,2 et prime de marché 5 % : rendement du modèle ?','9 %.','8 %.','6 %.','15 %.'),
 ],'Un portefeuille pédagogique comprend 30 % d’un actif au rendement de période 4 % et 70 % d’un actif au rendement 8 %. Il est exposé au même secteur industriel.',[
 ['Calculez le rendement de période pondéré.','0,30 × 4 % + 0,70 × 8 % = 6,8 %.'],
 ['Deux actifs assurent-ils une diversification suffisante ?','Pas nécessairement. Le secteur commun et la corrélation peuvent maintenir une forte exposition à des facteurs communs.'],
 ['Ce rendement est-il garanti pour la période suivante ?','Non. Un rendement observé ou supposé ne constitue pas une garantie future.'],
 ],[S.diversification,S.finance]),
 ch('risques','Taux, change et financement',
 'Un financement et une couverture modifient des flux et des risques. Il faut distinguer la protection recherchée, son coût et ce qu’elle ne couvre pas.',
 'Identifier montant, devise, date et exposition. Définir la convention de cotation. Comparer les scénarios avant et après couverture sans promettre une suppression universelle du risque.',
 ['Ne multipliez pas une devise sans vérifier la cotation.','Une couverture n’est pas automatiquement gratuite ni adaptée à tous les volumes.'],[
 n('Cotation de change','Une cotation doit indiquer combien d’unités d’une monnaie valent une unité de l’autre. Le calcul dépend du sens de cette convention.','Si 1 € = 1,20 dollar, combien d’euros représentent 1 200 dollars ?','1 000 €.','1 440 €.','1 200 €.','120 €.'),
 n('Risque de taux','Un emprunt à taux variable expose les intérêts à l’évolution du taux selon le contrat. Un taux fixe ne supprime pas tous les autres risques du financement.','Quel poste varie directement avec le taux d’un emprunt variable ?','Les intérêts selon les conditions du contrat.','Le nombre d’actions dans tous les cas.','Le stock physique obligatoirement.','Le prix de toute vente automatiquement.'),
 n('Obligation et taux','Toutes choses égales par ailleurs, la valeur d’une obligation à flux fixes tend à diminuer si le taux d’actualisation de marché augmente.','Quel mouvement attendre d’une obligation à flux fixes si le taux de marché monte ?','Sa valeur actuelle tend à baisser.','Sa valeur actuelle augmente toujours.','Ses flux contractuels doublent automatiquement.','Son émetteur disparaît nécessairement.'),
 n('Couverture adaptée','Une couverture se choisit selon le risque, le montant et l’échéance. Une mauvaise correspondance peut laisser une exposition résiduelle.','Que vérifier pour une couverture d’un paiement futur ?','La devise, le montant et la date couverts.','La couleur du contrat.','Le seul nombre de comptes bancaires.','Le diplôme du client uniquement.'),
 ],'Une entreprise doit payer 12 000 dollars. Le cas compare deux cotations : 1 € = 1,20 dollar puis 1 € = 1 dollar. Aucun coût de couverture n’est inclus.',[
 ['Quel coût en euros avec la première cotation ?','12 000 / 1,20 = 10 000 €.'],
 ['Quel coût avec la seconde cotation ?','12 000 / 1 = 12 000 €, soit 2 000 € de plus.'],
 ['Quelle exposition identifier ?','Une dette en devise étrangère : une baisse de la valeur de l’euro face au dollar accroît ici le coût en euros.'],
 ],[S.finance]),
],
DSCG4:[
 ch('consolidation','Périmètre et logique de consolidation',
 'Les comptes consolidés présentent un groupe selon un référentiel défini. Le contrôle, l’influence notable et la détention économique sont des notions distinctes.',
 'Définir le référentiel, analyser les droits et la relation de contrôle, puis choisir la méthode pertinente. Distinguer pourcentage de contrôle et pourcentage d’intérêt.',
 ['Un pourcentage de capital ne suffit pas toujours à conclure au contrôle.','Ne transposez pas sans vérification une méthode d’un référentiel à un autre.'],[
 n('Contrôle en IFRS','Le contrôle IFRS combine pouvoir, exposition à des rendements variables et capacité d’utiliser le pouvoir pour influer sur ces rendements.','Quel ensemble décrit le contrôle selon IFRS 10 ?','Pouvoir, rendements variables et capacité de les influencer.','Un logo commun uniquement.','Un fournisseur commun uniquement.','Une dette client isolée uniquement.'),
 n('Influence notable','L’influence notable permet de participer aux décisions financières et opérationnelles sans les contrôler. Les indices concrets et le référentiel doivent être examinés.','Que distingue l’influence notable du contrôle ?','Une participation aux décisions sans pouvoir de contrôle.','La propriété automatique de tous les actifs.','Une absence de toute relation.','Un contrôle total sans droits.'),
 n('Intérêt indirect','Dans une chaîne simple de participations, l’intérêt économique indirect se calcule par multiplication des pourcentages. Cela ne suffit pas à calculer le contrôle.','M détient 80 % de F, F détient 60 % de G : intérêt indirect simple de M dans G ?','48 %.','140 %.','60 %.','80 %.'),
 n('Opérations internes','Les opérations internes doivent être analysées pour éviter que le groupe se présente comme réalisant une opération avec lui-même. Les éliminations suivent le référentiel.','Pourquoi examiner les ventes entre sociétés consolidées ?','Pour traiter les opérations internes selon le référentiel.','Pour doubler automatiquement le chiffre d’affaires.','Pour supprimer toutes les ventes externes.','Pour transformer les dettes en capital sans condition.'),
 ],'M détient 75 % de F et F détient 80 % de G. La structure ne comporte pas d’autre lien. L’énoncé demande seulement l’intérêt économique indirect et l’identification des vérifications de contrôle.',[
 ['Calculez l’intérêt indirect de M dans G.','75 % × 80 % = 60 %.'],
 ['Ce calcul suffit-il à déterminer la méthode ?','Non. Il faut analyser le contrôle ou l’influence et le référentiel applicable.'],
 ['Que vérifier pour une vente interne ?','Son appartenance au périmètre et les traitements d’élimination pertinents, notamment les résultats internes restant dans les actifs.'],
 ],[consolidation,equity]),
 ch('audit','Assertions et éléments probants',
 'L’audit relie les risques d’anomalies aux procédures et aux éléments collectés. Un document n’est pas probant pour toutes les assertions à la fois.',
 'Identifier le poste et l’assertion : existence, exhaustivité, évaluation ou séparation des exercices, notamment. Choisir une procédure adaptée et documenter le résultat.',
 ['Voir un stock ne suffit pas à vérifier sa valeur.','Une procédure doit répondre à un risque identifié, pas seulement produire une pièce.'],[
 n('Existence','Une procédure d’existence cherche si un élément enregistré est réel. Elle ne démontre pas à elle seule que tous les éléments ont été enregistrés.','Vérifier physiquement un stock enregistré vise d’abord quoi ?','Son existence.','La seule exhaustivité de toutes les dettes.','Le taux de change de chaque facture.','La compétence du dirigeant.'),
 n('Exhaustivité','L’exhaustivité examine si les éléments à enregistrer le sont. Rechercher des dettes non enregistrées appelle des procédures distinctes de la confirmation d’une dette déjà inscrite.','Quel objectif vise la recherche de factures non enregistrées ?','L’exhaustivité des dettes et charges concernées.','La suppression du bilan.','La hausse du capital.','Le calcul du cours d’une action.'),
 n('Évaluation','L’évaluation examine les montants et estimations. La présence matérielle d’un actif n’établit pas sa recouvrabilité ou sa valeur comptable.','Pourquoi vérifier une créance au-delà de son existence ?','Pour apprécier notamment sa recouvrabilité et son évaluation.','Parce qu’une créance n’a jamais de montant.','Pour la transformer toujours en stock.','Pour supprimer automatiquement le débiteur.'),
 n('Séparation des exercices','La séparation des exercices rattache les opérations à la bonne période. Les dates de livraison ou de prestation peuvent être essentielles au contrôle.','Quel élément vérifier autour de la clôture pour une vente ?','La période de réalisation et les pièces de livraison pertinentes.','Le nom de domaine uniquement.','Le nombre d’actionnaires seul.','Le montant des salaires uniquement.'),
 ],'Le compte client comprend une créance de 8 000 €. Le client confirme ce montant mais indique une difficulté financière importante. Aucun paiement ultérieur n’est observé.',[
 ['Quelle assertion la confirmation peut-elle éclairer ?','L’existence et le montant confirmé de la créance, dans les conditions de fiabilité de la procédure.'],
 ['Quelle assertion reste particulièrement sensible ?','L’évaluation, notamment la recouvrabilité compte tenu des difficultés signalées.'],
 ['Quelles vérifications complémentaires proposer ?','Examiner les paiements ultérieurs, les pièces du litige éventuel, les informations financières disponibles et l’estimation de la dépréciation.'],
 ],[audit]),
 ch('normes','Comparer les cadres et tester une perte de valeur',
 'Une réponse normative commence par le cadre applicable. Les valeurs comptables, les valeurs d’usage et les valeurs de cession ne sont pas interchangeables.',
 'Énoncer le référentiel, la valeur comptable et la mesure requise. Calculer la valeur recouvrable dans le modèle puis la perte de valeur éventuelle, sans mélanger les définitions.',
 ['La valeur recouvrable IAS 36 est le plus élevé des deux montants pertinents.','Ne réduisez pas un actif en prenant arbitrairement la plus petite valeur.'],[
 n('Valeur recouvrable','Dans IAS 36, la valeur recouvrable retient la plus élevée entre valeur d’utilité et juste valeur diminuée des coûts de sortie.','Valeur d’utilité 80 000 €, juste valeur nette de sortie 75 000 € : valeur recouvrable ?','80 000 €.','75 000 €.','155 000 €.','5 000 €.'),
 n('Perte de valeur','Lorsque la valeur comptable dépasse la valeur recouvrable dans le cadre donné, l’écart constitue la perte de valeur à examiner.','Valeur comptable 100 000 €, valeur recouvrable 82 000 € : perte de valeur ?','18 000 €.','182 000 €.','82 000 €.','−18 000 € de produit automatique.'),
 n('Hypothèses de flux','Une valeur d’utilité dépend des hypothèses de flux, des dates et du taux. Le contrôle des calculs ne valide pas à lui seul les prévisions.','Quel contrôle complète la vérification arithmétique d’une valeur d’utilité ?','L’examen des hypothèses de flux et du taux.','Le changement de police de caractères.','La suppression de toutes les prévisions.','La copie du résultat sans explication.'),
 n('Périmètre du test','Le périmètre dépend des flux identifiables et des règles applicables. Regrouper arbitrairement des actifs peut masquer une perte.','Pourquoi justifier le périmètre du test ?','Pour appliquer la mesure aux actifs ou unités pertinents.','Pour garantir une absence de dépréciation.','Pour choisir toujours l’ensemble du groupe sans analyse.','Pour confondre capitaux propres et trésorerie.'),
 ],'Dans un cas IAS 36, valeur comptable : 160 000 €. Valeur d’utilité : 140 000 €. Juste valeur diminuée des coûts de sortie : 150 000 €.',[
 ['Déterminez la valeur recouvrable.','Maximum de 140 000 et 150 000 : 150 000 €.'],
 ['Calculez la perte de valeur.','160 000 − 150 000 = 10 000 €.'],
 ['Quelles hypothèses contrôler ?','La construction des flux et du taux pour la valeur d’utilité, ainsi que la justification de la juste valeur et des coûts de sortie.'],
 ],[impairment,S.pcg]),
],
};
