import { chapter as ch, notion as n, SOURCES as S } from './content-authoring.mjs';
const inflation=['Inflation, Insee','https://www.insee.fr/fr/metadonnees/definition/c1473'];
const strategy=['Analyse stratégique externe, catalogue universitaire','https://www.enseignementsup-recherche.gouv.fr/ressources-pedagogiques/notice/view/oai%253Aaunege.fr%253Aaunege-901'];
const breakEven=['Seuil de rentabilité, Bpifrance Création','https://bpifrance-creation.fr/encyclopedie/previsions-financieres-business-plan/previsions-financieres/seuil-rentabilite'];
export const MANAGEMENT_CHAPTERS = {
UE5:[
 ch('production','Production, valeur ajoutée et croissance',
 'La valeur ajoutée évite de compter plusieurs fois les consommations intermédiaires. La croissance en valeur et la croissance en volume répondent à des questions différentes.',
 'Définissez la mesure, son unité et son périmètre. Calculez une variation sur la base initiale. Pour le volume, neutralisez l’effet des prix selon les indices fournis.',
 ['Une hausse du chiffre d’affaires n’est pas forcément une hausse des quantités.','Ne confondez pas production et profit.'],[
 n('Valeur ajoutée','Dans un schéma simple, valeur ajoutée = production − consommations intermédiaires. Elle mesure une contribution productive, pas le bénéfice net.','Production 200 000 €, consommations intermédiaires 80 000 € : valeur ajoutée ?','120 000 €.','280 000 €.','80 000 €.','200 000 €.'),
 n('Taux de croissance','Le taux de croissance vaut variation / valeur initiale. Une hausse de 100 à 110 correspond à 10 %, et non à 10 points de pourcentage.','Une production passe de 500 à 550. Quel est son taux de croissance ?','10 %.','50 %.','9,09 %.','110 %.'),
 n('Volume et prix','La variation en valeur combine volumes et prix. Pour des indices cohérents, indice de volume = indice de valeur / indice de prix, avec la base adaptée.','Valeur en hausse de 10 %, prix en hausse de 5 % : hausse de volume arrondie à deux décimales ?','4,76 %.','15 %.','5 % exactement.','10 %.'),
 n('Productivité apparente','La productivité apparente du travail rapporte une production à une quantité de travail. Elle ne démontre pas que seul le travail explique la performance.','Production 1 000 unités pour 200 heures : productivité horaire ?','5 unités par heure.','200 unités par heure.','0,2 unité par heure.','1 200 unités par heure.'),
 ],'Une entreprise produit pour 300 000 € et consomme 120 000 € d’achats intermédiaires. L’année précédente, la production en valeur était 270 000 €. L’exercice ne fournit pas d’indice des prix.',[
 ['Calculez la valeur ajoutée de l’année.','300 000 − 120 000 = 180 000 €.'],
 ['Calculez la croissance de la production en valeur.','(300 000 − 270 000) / 270 000 = 11,11 % environ.'],
 ['Peut-on conclure à une croissance identique en volume ?','Non, il manque l’évolution des prix et les informations de volume.'],
 ],[S.economy]),
 ch('marches','Marchés, incitations et externalités',
 'Un prix renseigne sur un marché, mais ne résume pas tous les coûts et bénéfices d’une activité. Les externalités et asymétries d’information peuvent modifier les résultats.',
 'Identifiez les acteurs, les échanges et les informations. Distinguez effet sur le marché et effet sur un tiers. Formulez une conséquence conditionnelle plutôt qu’une loi universelle.',
 ['Une corrélation n’établit pas une causalité.','Un prix faible n’implique pas l’absence de coût social.'],[
 n('Demande','Toutes choses égales par ailleurs, une variation du prix peut modifier la quantité demandée. L’élasticité mesure une sensibilité, pas une quantité absolue.','Quantité demandée −10 %, prix +5 % : élasticité-prix donnée ?','−2.','2.','−0,5.','15.'),
 n('Externalité','Une externalité touche un tiers sans être intégralement reflétée dans le prix de l’échange. Elle peut être favorable ou défavorable.','Une pollution affecte des riverains sans compensation incluse dans le prix. Quel phénomène ?','Une externalité négative.','Un dividende.','Une consommation intermédiaire obligatoire.','Un amortissement fiscal.'),
 n('Information asymétrique','L’information est asymétrique lorsque les parties ne disposent pas des mêmes informations pertinentes. Cela peut modifier le comportement ou la sélection.','Un vendeur connaît un défaut que l’acheteur ignore. Quelle difficulté illustrée ?','Une asymétrie d’information.','Une égalité parfaite d’information.','Une réserve comptable.','Un équilibre bancaire.'),
 n('Coût d’opportunité','Le coût d’opportunité est la valeur de la meilleure option à laquelle on renonce. Il peut exister sans paiement comptable supplémentaire.','À quoi correspond le coût d’opportunité d’une décision ?','À la meilleure alternative abandonnée.','À tous les bénéfices passés.','À la seule TVA collectée.','À une dépense sans lien avec le choix.'),
 ],'Une entreprise utilise un terrain qu’elle possède. Elle pourrait le louer pour 6 000 € par an, mais l’utilise pour un projet. Aucune location n’est effectivement conclue.',[
 ['Identifiez le coût d’opportunité annuel donné.','6 000 € de revenu de location auquel elle renonce selon l’alternative décrite.'],
 ['S’agit-il nécessairement d’un paiement comptabilisé ?','Non. Le coût d’opportunité éclaire la décision sans être nécessairement une dépense comptable.'],
 ['Pourquoi le comparer au projet ?','Pour évaluer la décision par rapport à l’alternative pertinente, et pas seulement aux paiements observés.'],
 ],[S.economy]),
 ch('politiques','Inflation et politiques économiques',
 'L’inflation concerne l’évolution générale des prix. Les politiques monétaires et budgétaires agissent par des mécanismes distincts, dont les effets dépendent du contexte et des délais.',
 'Distinguez prix, revenu nominal et pouvoir d’achat. Identifiez ensuite l’instrument, son canal et les effets attendus, en signalant les incertitudes.',
 ['Une hausse du prix d’un seul produit n’est pas à elle seule l’inflation générale.','Une hausse nominale de revenu ne garantit pas une hausse réelle.'],[
 n('Inflation','Une augmentation générale et durable des prix réduit le pouvoir d’achat d’une unité monétaire. Sa mesure dépend de l’indicateur et du panier étudiés.','Que faut-il distinguer d’une hausse isolée de prix ?','L’évolution générale et durable des prix.','Le seul capital social.','Le nombre de banques.','La durée d’un contrat.'),
 n('Revenu réel','Dans le modèle d’indices, le revenu réel évolue selon le rapport entre l’indice de revenu nominal et l’indice des prix.','Revenu nominal +6 %, prix +4 % : variation réelle arrondie à deux décimales ?','1,92 %.','10 %.','2 % exactement.','−10 %.'),
 n('Taux directeur','Le taux directeur influence les conditions monétaires et de financement. Sa transmission passe par plusieurs canaux et n’est pas instantanée ni uniforme.','Quel instrument relève de la politique monétaire ?','La modification d’un taux directeur.','Le vote du budget de l’État uniquement.','La fixation de chaque salaire individuel.','La gestion du stock d’une entreprise.'),
 n('Politique budgétaire','Les dépenses publiques et prélèvements relèvent de la politique budgétaire. Leurs effets doivent être analysés selon financement, contexte et horizon.','Quelle mesure relève d’un instrument budgétaire ?','Une modification des dépenses publiques.','Une variation automatique du taux directeur.','Le remboursement d’un fournisseur privé seul.','Une réécriture du plan comptable.'),
 ],'Un revenu mensuel passe de 2 000 € à 2 100 €. Dans le même cas, l’indice des prix passe de 100 à 104.',[
 ['Calculez l’évolution nominale.','(2 100 − 2 000) / 2 000 = 5 %.'],
 ['Calculez l’évolution réelle dans le modèle fourni.','1,05 / 1,04 − 1 = 0,9615 %, soit environ 0,96 %.'],
 ['Interprétez le résultat.','Le pouvoir d’achat progresse légèrement dans ce modèle, moins que le revenu nominal. L’indice retenu ne représente pas chaque panier individuel.'],
 ],[inflation,S.monetary]),
],
UE7:[
 ch('organisation','Organisation et coordination',
 'Une organisation répartit les tâches et doit ensuite coordonner les personnes. La structure affichée et les pratiques réelles ne sont pas toujours identiques.',
 'Décrivez le travail, les responsabilités et les échanges. Repérez comment les équipes se coordonnent, puis reliez les difficultés aux caractéristiques de la structure.',
 ['L’organigramme ne décrit pas toutes les relations informelles.','Une structure n’est pas efficace indépendamment de son contexte.'],[
 n('Division du travail','La division du travail répartit les activités. Elle crée un besoin de coordination entre les tâches et les acteurs.','Quelle conséquence accompagne la spécialisation des tâches ?','Un besoin de coordination.','La disparition automatique de tout échange.','La garantie de zéro conflit.','L’absence de besoin d’information.'),
 n('Coordination','Des procédures, échanges directs, supervision ou objectifs partagés peuvent coordonner l’activité. Leur pertinence dépend de la nature du travail.','Une équipe ajuste son travail par échanges directs. Quel mécanisme illustré ?','L’ajustement mutuel.','Une distribution de dividendes.','Un amortissement linéaire.','Une actualisation financière.'),
 n('Centralisation','La centralisation concentre les décisions à un niveau. Elle doit être distinguée de la standardisation des procédures.','Qu’est-ce qui caractérise une forte centralisation ?','La concentration du pouvoir de décision.','L’absence systématique de procédure.','La dispersion automatique de toutes les décisions.','Le seul nombre de clients.'),
 n('Structure matricielle','Une structure matricielle croise des dimensions, comme fonction et projet. Elle peut améliorer la coordination mais aussi créer des tensions de priorités.','Quel risque analyser dans une structure matricielle ?','Des priorités contradictoires entre responsables.','Une absence obligatoire de compétences.','L’interdiction de tout projet.','La disparition du budget.'),
 ],'Un analyste travaille pour un responsable métier et pour deux chefs de projet. Les trois demandent leurs livrables le même jour.',[
 ['Quelle difficulté de coordination observer ?','Des demandes concurrentes et des priorités non arbitrées entre plusieurs responsables.'],
 ['Quelle mesure proposer ?','Un mécanisme d’arbitrage explicite, une planification partagée et une clarification des responsabilités.'],
 ['Pourquoi ne pas conclure que toute structure matricielle échoue ?','Le problème décrit dépend des pratiques d’arbitrage ; une structure se juge dans son contexte et sa mise en œuvre.'],
 ],[strategy]),
 ch('diagnostic-strategique','Diagnostic interne et externe',
 'Le diagnostic stratégique sépare ce qui appartient à l’organisation de ce qui vient de son environnement. Les outils servent à structurer des faits, pas à produire une liste décorative.',
 'Justifiez chaque constat par un fait. Distinguez ressource interne, compétence, opportunité et menace. Reliez les facteurs au positionnement et aux options possibles.',
 ['Un même élément peut évoluer selon le contexte.','Une SWOT sans preuves ni conséquences reste peu utile.'],[
 n('Forces et faiblesses','Dans une SWOT, forces et faiblesses relèvent du diagnostic interne. Elles doivent être appréciées par rapport aux besoins et concurrents pertinents.','Une compétence technique propre à l’entreprise relève de quelle catégorie ?','Une force interne potentielle.','Une menace externe par définition.','Un impôt.','Une dette client.'),
 n('Opportunités et menaces','Les opportunités et menaces relèvent de l’environnement. Une évolution externe peut créer des possibilités pour certaines organisations et des risques pour d’autres.','Une nouvelle demande de marché est d’abord quoi dans la SWOT ?','Une opportunité externe potentielle.','Une réserve comptable.','Une faiblesse interne nécessaire.','Un amortissement.'),
 n('Ressource et compétence','Une ressource est un moyen disponible ; une compétence combine des moyens et savoir-faire pour agir. La possession d’un outil ne démontre pas sa maîtrise.','Posséder un logiciel prouve-t-il une compétence organisationnelle ?','Non, il faut examiner sa maîtrise et son usage.','Oui, automatiquement.','Oui, si son prix est élevé.','Oui, dès qu’une licence est achetée.'),
 n('Avantage concurrentiel','Un avantage demande une valeur pertinente pour les clients et une comparaison avec les concurrents. Sa durabilité n’est pas acquise par une bonne performance ponctuelle.','Quelle analyse soutient un avantage concurrentiel ?','La valeur pour le client et la comparaison avec les concurrents.','Le seul volume du logo.','Le nombre de pages du site.','Le solde d’un compte sans contexte.'),
 ],'Une petite entreprise possède un savoir-faire rare mais une distribution limitée. La demande augmente ; un concurrent doté d’un réseau national arrive.',[
 ['Classez les deux facteurs internes.','Savoir-faire rare : force potentielle. Distribution limitée : faiblesse potentielle, à justifier selon les marchés visés.'],
 ['Classez les deux facteurs externes.','Hausse de demande : opportunité potentielle. Arrivée d’un concurrent puissant : menace potentielle.'],
 ['Proposez une option argumentée.','Explorer un partenariat de distribution pour valoriser le savoir-faire, en examinant coûts, dépendance et capacité à répondre à la demande.'],
 ],[strategy]),
 ch('decision','Décision, motivation et changement',
 'Une décision s’appuie sur des objectifs et des informations imparfaites. L’adhésion à un changement dépend aussi de ses effets sur le travail et des moyens disponibles.',
 'Clarifiez le problème et les critères. Comparez les options, identifiez les effets sur les acteurs puis prévoyez accompagnement et suivi.',
 ['Une résistance ne s’explique pas toujours par un manque de bonne volonté.','Un indicateur unique peut orienter des comportements non souhaités.'],[
 n('Critères de décision','Les critères rendent les options comparables : coût, délai, qualité, risque ou autre objectif. Ils doivent être explicités avant de choisir.','Que définir avant de comparer deux solutions ?','Les critères et leur importance.','La conclusion sans examen.','Le nom du fournisseur le plus connu seulement.','Le résultat à inventer.'),
 n('Rationalité limitée','Les informations, capacités et délais sont limités. Une décision satisfaisante peut être recherchée sans démontrer qu’elle est la meilleure de toutes les options possibles.','Que rappelle la rationalité limitée ?','Les limites d’information et de traitement dans la décision.','L’absence de toute raison.','La certitude de choisir toujours l’optimum.','L’interdiction de comparer des options.'),
 n('Motivation','Les facteurs de motivation varient avec les personnes et le contexte. Reconnaissance, autonomie, conditions et rémunération ne se réduisent pas à un levier universel.','Quelle analyse de motivation est la plus adaptée ?','Examiner plusieurs facteurs dans le contexte.','Supposer un levier unique pour tous.','Écarter les conditions de travail.','Ignorer les objectifs de l’équipe.'),
 n('Accompagnement','L’accompagnement d’un changement relie information, formation, participation et soutien. Il doit répondre aux effets concrets sur les tâches.','Quel accompagnement soutient une nouvelle procédure ?','Une formation liée aux tâches et un suivi des difficultés.','Une annonce sans moyen.','La suppression de toute question.','Un indicateur sans explication.'),
 ],'Un cabinet impose un nouvel outil documentaire en une semaine. Les collaborateurs ne disposent ni de formation ni de temps pour migrer les dossiers.',[
 ['Quels obstacles concrets relever ?','Manque de formation, temps de migration insuffisant et possible perturbation du travail.'],
 ['Proposez un accompagnement.','Un pilote, des formations sur les usages réels, un calendrier de migration et un point de soutien identifié.'],
 ['Quel suivi retenir ?','Des retours sur les difficultés, la qualité des dossiers et les délais, plutôt que le seul nombre de connexions.'],
 ],[strategy]),
],
UE11:[
 ch('couts','Coûts directs et indirects',
 'Un coût dépend de l’objet étudié et du périmètre retenu. Une charge directe peut être affectée à l’objet ; une charge indirecte demande une règle de répartition justifiée.',
 'Définissez l’objet de coût, puis affectez les charges directes. Calculez les unités d’œuvre et répartissez les charges indirectes. Contrôlez le total réparti.',
 ['Direct et variable ne sont pas synonymes.','Une clé arbitraire peut produire un coût précis en apparence mais peu pertinent.'],[
 n('Charge directe','Une charge est directe pour un objet lorsqu’elle peut lui être affectée sans répartition intermédiaire pertinente. Cette qualification dépend de l’objet choisi.','Une matière mesurée pour un produit est ici quel type de charge ?','Une charge directe du produit.','Une charge forcément fixe.','Un dividende.','Une recette fiscale.'),
 n('Charge indirecte','Une charge commune à plusieurs objets demande une répartition ou un modèle d’activité. Le choix doit refléter le lien avec la consommation de ressources.','Une dépense commune à deux ateliers demande quoi pour les coûts étudiés ?','Une règle de répartition adaptée.','Une affectation totale à chacun.','Une suppression du coût.','Une reconnaissance comme vente.'),
 n('Unité d’œuvre','Le coût d’une unité d’œuvre se calcule en divisant les charges du centre par le nombre d’unités. Unité et période doivent correspondre.','Centre 12 000 € pour 600 heures : coût par heure ?','20 €.','600 €.','7 200 000 €.','0,05 €.'),
 n('Coût complet','Le coût complet combine les éléments directs et les charges indirectes imputées dans le périmètre retenu. Il doit être rapporté à la bonne quantité.','Charges directes 8 000 €, indirectes imputées 2 000 €, 500 unités : coût unitaire ?','20 €.','16 €.','4 €.','10 000 €.'),
 ],'Un atelier coûte 18 000 € pour 900 heures. Le produit A consomme 200 heures et 6 000 € de charges directes. 400 unités de A sont produites.',[
 ['Calculez le coût de l’heure.','18 000 / 900 = 20 € par heure.'],
 ['Calculez les charges indirectes imputées à A.','200 × 20 = 4 000 €.'],
 ['Calculez le coût unitaire complet de A.','(6 000 + 4 000) / 400 = 25 € par unité.'],
 ]),
 ch('rentabilite','Marge et seuil de rentabilité',
 'Le modèle coût-volume-profit distingue charges fixes et variables dans un domaine d’activité donné. Le seuil dépend des prix, du mix et des hypothèses de variation des coûts.',
 'Calculez la marge sur coûts variables puis son taux. Divisez les charges fixes par ce taux, ou par la marge unitaire pour un modèle à produit unique.',
 ['Un coût fixe peut changer hors du domaine d’activité prévu.','Le taux de marge sur coûts variables se calcule sur le chiffre d’affaires.'],[
 n('Marge sur coûts variables','La marge sur coûts variables correspond au chiffre d’affaires diminué des charges variables. Elle contribue à couvrir les charges fixes puis le résultat.','CA 100 000 €, charges variables 60 000 € : marge ?','40 000 €.','60 000 €.','160 000 €.','−40 000 €.'),
 n('Taux de marge','Le taux de marge sur coûts variables est la marge divisée par le chiffre d’affaires. Il n’est pas la marge divisée par les seules charges variables.','Marge 30 000 € pour CA 120 000 € : taux de marge sur coûts variables ?','25 %.','40 %.','75 %.','4 %.'),
 n('Seuil en valeur','Le seuil en valeur vaut charges fixes / taux de marge sur coûts variables, lorsque le modèle et les hypothèses s’y prêtent.','Charges fixes 20 000 €, taux de marge 40 % : seuil ?','50 000 €.','8 000 €.','20 040 €.','30 000 €.'),
 n('Seuil en quantité','Pour un produit unique, seuil en quantité = charges fixes / marge unitaire. Si les unités sont indivisibles, le nombre requis est arrondi au supérieur.','Charges fixes 10 000 €, prix 50 €, coût variable 30 € : seuil en unités ?','500 unités.','200 unités.','333 unités.','10 000 unités.'),
 ],'Prix unitaire : 40 €. Coût variable unitaire : 25 €. Charges fixes : 30 000 €. Volume prévu : 2 400 unités. Modèle linéaire, produit unique.',[
 ['Calculez le seuil en quantité.','Marge unitaire : 40 − 25 = 15 €. Seuil : 30 000 / 15 = 2 000 unités.'],
 ['Calculez le résultat prévu.','2 400 × 15 − 30 000 = 6 000 €.'],
 ['Calculez la marge de sécurité en quantité.','2 400 − 2 000 = 400 unités. Ce résultat reste lié aux hypothèses du modèle.'],
 ],[breakEven]),
 ch('budgets','Budgets et analyse des écarts',
 'Un budget traduit des hypothèses en prévisions. Un écart n’est interprétable que si l’on précise la convention de signe et l’activité comparée.',
 'Établissez les hypothèses de volume, prix et délai. Pour analyser un écart, comparez des périmètres cohérents et séparez les effets de prix et de quantité lorsque le modèle le permet.',
 ['Un coût réel supérieur au budget initial peut provenir d’une activité plus forte.','Un encaissement prévu ne se situe pas toujours au mois de la vente.'],[
 n('Budget de ventes','Un budget de ventes simple combine les quantités et prix prévus. Il ne donne pas directement les encaissements lorsqu’il existe un délai client.','Quantité 800, prix 25 € : ventes budgétées ?','20 000 €.','825 €.','32 €.','800 €.'),
 n('Encaissement','Les encaissements se répartissent selon les conditions et délais de règlement. Leur calendrier doit distinguer ventes et créances antérieures.','Une vente à trente jours faite en fin de mois sera encaissée quand dans le modèle donné ?','La période suivante selon le délai fourni.','Obligatoirement le même jour.','Jamais.','Seulement à la dissolution.'),
 n('Budget flexible','Un budget flexible ajuste les composantes liées à l’activité au volume de comparaison. Il aide à ne pas attribuer au prix un simple effet de volume.','Pourquoi établir un budget à l’activité réelle ?','Pour comparer les coûts à une activité cohérente.','Pour supprimer tous les écarts.','Pour rendre les coûts fixes toujours nuls.','Pour garantir le chiffre d’affaires.'),
 n('Écart sur coût','Avec la convention réel − référence, un écart positif de coût indique un dépassement. Il faut expliquer la cause avant de qualifier la responsabilité.','Coût réel 5 200 €, référence 5 000 €, convention réel − référence : écart ?','+200 €.','−200 €.','+10 200 €.','0 €.'),
 ],'Budget : 1 000 unités à coût variable 8 € et charges fixes 4 000 €. Réel : 1 200 unités, coût total 14 100 €. Les charges fixes de référence restent 4 000 €. Convention d’écart : réel moins référence.',[
 ['Calculez le budget initial.','1 000 × 8 + 4 000 = 12 000 €.'],
 ['Calculez la référence à l’activité réelle.','1 200 × 8 + 4 000 = 13 600 €.'],
 ['Calculez l’écart sur la référence flexible.','14 100 − 13 600 = +500 €. Le dépassement à analyser est distinct de l’effet de volume de 1 600 €.'],
 ]),
],
DSCG3:[
 ch('pilotage','Performance et tableaux de bord',
 'La performance comporte plusieurs dimensions. Un tableau de bord est utile lorsque ses indicateurs sont reliés aux objectifs et aux leviers d’action.',
 'Reliez chaque objectif à un indicateur, une fréquence, une responsabilité et une action possible. Combinez résultats et facteurs qui permettent de les expliquer.',
 ['Un indicateur facile à mesurer n’est pas forcément pertinent.','Un indicateur financier ne résume pas toute la performance.'],[
 n('Objectif et indicateur','Un indicateur mesure un aspect d’un objectif. Il faut préciser son calcul, sa source et ses limites pour éviter les interprétations contradictoires.','Quel élément rend un indicateur exploitable ?','Une définition, une source et un lien avec l’objectif.','Un nom séduisant sans calcul.','Une variation sans période.','Une couleur sans donnée.'),
 n('Efficacité','L’efficacité concerne l’atteinte de l’objectif. Elle doit être distinguée de l’efficience, qui relie les résultats aux moyens utilisés.','Atteindre une cible de livraison relève d’abord de quoi ?','L’efficacité.','La seule efficience nécessairement.','La TVA collectée.','Le capital nominal.'),
 n('Efficience','L’efficience rapporte les résultats aux ressources. Une économie de moyens peut détériorer la qualité ; les dimensions doivent être combinées.','Réduire les ressources pour un résultat comparable concerne quoi ?','L’efficience.','L’existence d’une créance.','La personnalité morale.','Le taux directeur.'),
 n('Effet de comportement','Un objectif chiffré peut encourager l’optimisation de l’indicateur au détriment du but réel. Il faut examiner les effets de comportement.','Privilégier la quantité au détriment de la qualité illustre quoi ?','Un effet de comportement lié à un indicateur partiel.','Une garantie de performance globale.','Une annulation de tout risque.','Une baisse automatique du BFR.'),
 ],'Un centre est évalué sur le nombre de dossiers traités. La quantité augmente, mais le taux de dossiers retournés passe de 3 % à 9 %.',[
 ['Quel effet indésirable peut apparaître ?','La recherche de quantité peut se faire au détriment de la qualité ou favoriser un traitement incomplet.'],
 ['Calculez la variation en points du taux de retour.','9 % − 3 % = 6 points de pourcentage. Il a aussi été multiplié par trois.'],
 ['Proposez un pilotage plus équilibré.','Associer volume, qualité, délai et ressources, avec des définitions et actions de suivi précises.'],
 ],[strategy]),
 ch('couts-activites','Activités et décisions de gestion',
 'Une méthode de coûts par activités relie les ressources aux activités, puis aux objets de coût à l’aide d’inducteurs. Elle ne supprime pas le besoin de vérifier le modèle.',
 'Identifiez les activités significatives et leurs inducteurs. Calculez les coûts d’inducteur, imputez selon les consommations et comparez les résultats aux décisions envisagées.',
 ['Un inducteur doit traduire un lien plausible avec la consommation de ressources.','Un coût complet historique n’est pas toujours le coût pertinent d’une décision future.'],[
 n('Activité','Une activité regroupe des tâches liées à une finalité. Le modèle doit rester suffisamment compréhensible pour être utilisé et maintenu.','Quel exemple constitue une activité de gestion ?','Traiter les commandes clients.','Le capital nominal isolé.','Le taux de change isolé.','Le bénéfice net seul.'),
 n('Inducteur','L’inducteur mesure un facteur lié à la consommation d’une activité. Son choix exige une justification, pas seulement une donnée disponible.','Pour une activité de traitement de commandes, quel inducteur examiner ?','Le nombre de commandes traitées.','La taille du logo.','L’âge du bâtiment sans lien.','La météo seule.'),
 n('Coût d’inducteur','Le coût d’inducteur est le coût de l’activité divisé par son volume d’inducteurs. Il permet une imputation selon les consommations.','Activité 24 000 € pour 600 commandes : coût par commande ?','40 €.','600 €.','14 400 000 €.','0,025 €.'),
 n('Coût pertinent','Une décision future porte sur les coûts et revenus qu’elle modifie. Les coûts communs inchangés ne doivent pas être attribués comme des économies fictives.','Quel coût examiner pour une décision d’arrêt ?','Le coût évitable du fait de l’arrêt.','Tout coût historique sans distinction.','La totalité du capital dans tous les cas.','Le chiffre d’affaires d’un concurrent.'),
 ],'Une activité de contrôle coûte 30 000 € pour 1 500 inspections. Produit A : 120 inspections ; produit B : 80. L’exercice étudie uniquement cette activité.',[
 ['Calculez le coût par inspection.','30 000 / 1 500 = 20 €.'],
 ['Calculez les coûts imputés à A et B.','A : 120 × 20 = 2 400 €. B : 80 × 20 = 1 600 €.'],
 ['Peut-on en déduire leurs coûts complets ?','Non. Ces montants portent uniquement sur l’activité de contrôle ; les autres activités et coûts sont absents.'],
 ]),
 ch('strategie-changement','Stratégie, responsabilités et changement',
 'Un système de pilotage doit être compatible avec la stratégie et les responsabilités. Une transformation s’évalue autant sur ses résultats que sur son appropriation.',
 'Reliez les décisions aux objectifs stratégiques et aux marges d’action des responsables. Définissez un dispositif de suivi et comparez le prévu, le réalisé et les effets non attendus.',
 ['Un responsable ne maîtrise pas nécessairement tous les facteurs de son résultat.','Un projet déployé n’est pas forcément adopté dans les pratiques.'],[
 n('Contrôlabilité','L’évaluation d’un responsable doit distinguer les facteurs sur lesquels il peut agir de ceux qui lui échappent. Cela ne signifie pas ignorer les résultats globaux.','Quel principe éviterait une évaluation injustifiée ?','Distinguer les facteurs contrôlables et non contrôlables.','Attribuer tout écart à une personne sans analyse.','Supprimer tous les objectifs.','Ne mesurer que le nombre de réunions.'),
 n('Centre de responsabilité','Un centre reçoit des objectifs et une marge de décision. Son évaluation doit correspondre aux responsabilités réellement confiées.','Que vérifier avant de comparer deux centres ?','Leurs responsabilités et périmètres respectifs.','La couleur de leurs bureaux.','Le nom de leur logiciel seul.','Le même indicateur sans regarder les missions.'),
 n('Stratégie et pilotage','Un système cohérent mesure ce qui aide la stratégie à se réaliser. Des objectifs contradictoires peuvent créer des arbitrages non souhaités.','Une stratégie de qualité appelle quel pilotage ?','Des mesures de qualité et de leurs déterminants, en plus des coûts.','Le volume seul sans défauts.','La banque seule.','La suppression de toute information client.'),
 n('Adoption du changement','L’adoption s’observe dans les usages, les compétences et les effets sur le travail. Elle ne se réduit pas à la mise en production technique.','Un nouvel outil installé est-il nécessairement adopté ?','Non, les usages et l’appropriation doivent être examinés.','Oui, dès le premier lancement.','Oui, si son prix est élevé.','Oui, sans formation ni accès.'),
 ],'Une entreprise vise une relation client personnalisée, mais rémunère les équipes uniquement au nombre d’appels terminés rapidement.',[
 ['Quelle incohérence analyser ?','L’indicateur de vitesse peut contredire l’objectif de personnalisation et encourager des échanges trop courts.'],
 ['Quels indicateurs compléter ?','Qualité de résolution, satisfaction avec une méthode fiable, réitération des demandes et ressources mobilisées.'],
 ['Comment traiter la responsabilité ?','Distinguer les leviers des équipes des contraintes d’organisation, de volume et d’outillage.'],
 ],[strategy]),
],
};
