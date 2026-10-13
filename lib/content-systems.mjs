import { chapter as ch, notion as n, SOURCES as S } from './content-authoring.mjs';
export const SYSTEM_CHAPTERS = {
UE8:[
 ch('donnees','Structurer une base de données',
 'Une base relationnelle organise des données dans des tables liées. La structure doit refléter les règles de gestion et limiter les incohérences lors des mises à jour.',
 'Identifiez les objets, leurs attributs et leurs relations. Choisissez les clés. Vérifiez les dépendances et les contraintes avant de concevoir les requêtes.',
 ['Une clé étrangère n’est pas nécessairement unique dans sa table.','Répéter les coordonnées d’un client dans chaque commande crée un risque de mise à jour incohérente.'],[
 n('Clé primaire','Une clé primaire identifie une ligne de manière unique et ne doit pas être nulle. Elle doit rester adaptée aux règles de gestion.','Quelle fonction remplit la clé primaire ?','Identifier chaque ligne de manière unique.','Stocker obligatoirement le nom complet.','Autoriser toujours plusieurs valeurs nulles.','Remplacer toutes les autres colonnes.'),
 n('Clé étrangère','Une clé étrangère relie une ligne à une clé référencée. Les contraintes d’intégrité évitent notamment certaines références inexistantes.','Une commande contient l’identifiant d’un client référencé. Quelle fonction remplit ce champ ?','Une clé étrangère vers le client.','Une suppression de la table client.','Une somme automatique.','Un fichier image.'),
 n('Relation un à plusieurs','Dans une relation un à plusieurs, une occurrence peut être reliée à plusieurs occurrences de l’autre objet. La règle de gestion doit préciser les limites.','Un client peut avoir plusieurs commandes. Quel schéma simple convient ?','Une référence client dans chaque commande.','Une seule ligne contenant toutes les commandes sans structure.','La suppression de l’identifiant client.','Un client distinct inventé pour chaque article.'),
 n('Cohérence de mise à jour','Séparer des données dépendant d’objets différents limite les répétitions. La structure doit empêcher des coordonnées contradictoires pour un même client.','Pourquoi séparer clients et commandes ?','Pour limiter la répétition et les incohérences de mise à jour.','Pour empêcher toute requête.','Pour supprimer les données clients dans tous les cas.','Pour multiplier les copies sans contrôle.'),
 ],'Tables proposées : Client(idClient, nom) et Commande(idCommande, idClient, montant). Un client peut avoir plusieurs commandes. Chaque commande appartient à un client existant.',[
 ['Identifiez les clés primaires.','Client : idClient. Commande : idCommande, sous les règles d’unicité données.'],
 ['Identifiez la clé étrangère.','Commande.idClient référence Client.idClient.'],
 ['Quelle contrainte empêche une commande rattachée à un client inexistant ?','Une contrainte d’intégrité référentielle adaptée, appliquée au champ idClient de Commande.'],
 ]),
 ch('requetes','Interroger et contrôler les données',
 'Une requête répond à un besoin précis : sélectionner, relier, regrouper ou calculer. Avant de l’écrire, formulez le résultat attendu et sa granularité.',
 'Identifiez les tables et les liens. Choisissez les colonnes et filtres. Contrôlez les doublons produits par les jointures, puis vérifiez les agrégats sur un petit jeu d’essai.',
 ['Une jointure mal construite peut multiplier les lignes.','Une moyenne n’est pas toujours pertinente si les poids diffèrent.'],[
 n('Filtre SQL','WHERE filtre les lignes selon une condition. Il faut distinguer la condition sur une ligne d’une condition sur un groupe agrégé.','Quelle clause filtre les commandes dont le montant dépasse 100 ?','WHERE montant > 100.','ORDER BY montant > 100 uniquement.','GROUP BY 100 uniquement.','SELECT WHERE sans table ni condition.'),
 n('Agrégation','SUM additionne les valeurs du périmètre sélectionné. Le total dépend des filtres et des éventuelles duplications de lignes.','Quel calcul donne le total des montants sélectionnés ?','SUM(montant).','COUNT(montant) comme somme monétaire.','MAX(montant) comme total.','ORDER BY montant comme somme.'),
 n('Jointure','Une jointure relie des lignes selon une condition. Une condition erronée peut produire des associations sans lien avec la règle de gestion.','Quel lien joint Client et Commande dans le schéma donné ?','Client.idClient = Commande.idClient.','Client.nom = Commande.montant.','Client.idClient = Commande.montant.','Aucune condition n’est jamais nécessaire.'),
 n('Référence absolue','Dans un tableur, une référence absolue maintient la cellule lors d’une recopie. Les signes $ doivent correspondre à ce que l’on veut fixer.','Quelle référence fixe ligne et colonne dans une formule ?','$B$2.','B2.','B$2 seulement.','$B2 seulement.'),
 ],'Trois commandes ont des montants de 80 €, 120 € et 200 €. La requête retient celles dont le montant est strictement supérieur à 100 €. Aucun doublon.',[
 ['Combien de lignes sont retenues ?','Deux : celles de 120 € et 200 €.'],
 ['Quelle somme obtient-on ?','120 + 200 = 320 €.'],
 ['Quel contrôle avant une requête avec jointure ?','Vérifier que les conditions relient les bonnes clés et que le nombre de lignes attendu n’est pas artificiellement multiplié.'],
 ]),
 ch('securite','Sécuriser les usages et les données',
 'La sécurité protège disponibilité, intégrité et confidentialité. Les mesures doivent répondre à des risques identifiés et être vérifiées dans les usages réels.',
 'Identifiez les données et leurs usages. Limitez les droits, protégez les accès, testez les sauvegardes et documentez les incidents et procédures de reprise.',
 ['Une sauvegarde jamais restaurée ne démontre pas la capacité de reprise.','Un accès administrateur partagé empêche une bonne traçabilité individuelle.'],[
 n('Confidentialité','La confidentialité limite l’accès aux personnes autorisées. Elle ne signifie pas qu’aucun collaborateur ne doit jamais disposer de la donnée.','Quel contrôle protège la confidentialité ?','Des accès limités aux personnes autorisées.','Un compte public unique.','La diffusion de tous les mots de passe.','La désactivation des permissions.'),
 n('Intégrité','L’intégrité concerne l’exactitude et la préservation des données contre les modifications indues. Des contrôles de modification et de rapprochement peuvent y contribuer.','Quel objectif vise le contrôle des modifications d’une facture ?','L’intégrité de la donnée.','La hausse du chiffre d’affaires.','Le rendement d’un placement.','La valeur d’une action.'),
 n('Authentification renforcée','Un second facteur distinct peut réduire certains risques d’usurpation. Il complète les autres mesures, sans remplacer toutes les vérifications.','Quelle pratique renforce un accès sensible ?','Une authentification multifacteur adaptée.','Le partage du mot de passe.','Une question dont la réponse est publique seule.','La suppression de tout journal.'),
 n('Collecte proportionnée','Les données personnelles collectées doivent rester pertinentes au regard de la finalité. Une possibilité technique de collecte ne suffit pas à la justifier.','Quel principe guide une collecte de données ?','La pertinence et la nécessité pour la finalité.','La collecte maximale sans raison.','La conservation illimitée par principe.','La publication systématique des identités.'),
 ],'Une équipe partage un compte administrateur et conserve des fichiers clients sur une messagerie personnelle. Elle sauvegarde chaque nuit sans test de restauration.',[
 ['Identifiez deux risques d’accès.','Droits excessifs et absence d’identification individuelle, ainsi qu’une diffusion hors des outils autorisés.'],
 ['Proposez des mesures adaptées.','Comptes individuels, droits nécessaires, accès renforcés et stockage dans les outils approuvés avec des règles de partage.'],
 ['Quel test de continuité réaliser ?','Une restauration isolée, avec contrôle d’intégrité et mesure du délai de reprise, sans écraser les données de production.'],
 ],[S.cyber,S.privacy]),
],
DSCG5:[
 ch('gouvernance-si','Gouvernance et alignement du SI',
 'La gouvernance du SI relie les investissements numériques aux objectifs de l’organisation. Les responsabilités et arbitrages ne se limitent pas à la compétence technique.',
 'Identifier les besoins métier, les décisions, les risques et les responsables. Évaluer les investissements avec leurs bénéfices, coûts, dépendances et conditions d’usage.',
 ['Un projet techniquement réussi peut être inutile au métier.','Un investissement initial faible peut cacher des coûts de fonctionnement importants.'],[
 n('Alignement','L’alignement relie le SI aux besoins et priorités de l’organisation. Il doit être examiné à partir des usages et résultats attendus.','Quelle question vérifie l’alignement d’un projet SI ?','À quel objectif métier répond-il ?','Quelle couleur utilise le fournisseur ?','Combien de logos contient l’application ?','Le projet est-il nouveau uniquement ?'),
 n('Responsabilité','Une décision de SI appelle des responsabilités sur les besoins, les risques et l’exploitation. Les transférer au fournisseur ne les efface pas automatiquement.','Quel élément formaliser dans la gouvernance ?','Les responsabilités et pouvoirs de décision.','L’absence de toute validation.','La suppression des besoins métier.','Le partage universel des comptes.'),
 n('Coût total','Le coût total de possession comprend des coûts d’acquisition, fonctionnement, maintenance, migration ou autres coûts pertinents selon le périmètre.','Quel coût peut compléter le prix de licence ?','La maintenance et la formation nécessaires.','Le seul chiffre d’affaires du fournisseur.','Tous les bénéfices futurs comme coût.','Le capital nominal du client uniquement.'),
 n('Dépendance','Une dépendance à un fournisseur se mesure notamment par les possibilités de sortie et d’export des données. Elle ne se réduit pas au prix annuel.','Quel point analyser avant un service externalisé ?','Les conditions de réversibilité et d’accès aux données.','Le logo uniquement.','Le nombre de publicités.','L’absence de contrat par principe.'),
 ],'Solution A : licence 10 000 €, maintenance annuelle 3 000 €. Solution B : licence 16 000 €, maintenance annuelle 1 000 €. L’exercice compare trois ans, sans actualisation ni autre coût.',[
 ['Calculez le coût de A.','10 000 + 3 × 3 000 = 19 000 €.'],
 ['Calculez le coût de B.','16 000 + 3 × 1 000 = 19 000 €.'],
 ['Le coût seul départage-t-il les solutions ?','Non : il est identique ici. Il faut comparer adéquation métier, qualité, risques, conditions de sortie et les coûts absents du modèle.'],
 ],[S.cyber]),
 ch('projets','Piloter un projet numérique',
 'Un projet numérique combine livrables, acteurs, contraintes et incertitudes. Un calendrier sans définition du besoin ni critères de recette est insuffisant.',
 'Définir les besoins et critères d’acceptation. Identifier les dépendances et risques. Prévoir tests, migration et accompagnement, puis mesurer les résultats réellement obtenus.',
 ['Mettre en production n’équivaut pas à réussir la recette.','Changer constamment le périmètre sans arbitrage fragilise coûts et délais.'],[
 n('Besoin et solution','Le besoin décrit le problème à résoudre. La solution proposée doit être confrontée à ce besoin, plutôt que devenir le point de départ de toute l’analyse.','Quel document doit guider le choix d’une solution ?','Une définition claire du besoin et des contraintes.','Une publicité seule.','Un devis sans contexte.','Le choix du logiciel le plus récent uniquement.'),
 n('Recette','La recette vérifie les résultats face aux critères attendus. Elle doit couvrir des cas normaux, des erreurs et les exigences pertinentes.','Que vérifie une recette ?','La conformité aux critères d’acceptation.','La popularité du fournisseur uniquement.','Le nombre de pages du contrat seul.','Le prix sans usage.'),
 n('Dépendance de tâches','Une dépendance indique qu’une tâche nécessite une autre étape. La durée totale ne s’obtient pas toujours en additionnant des tâches pouvant se dérouler en parallèle.','Deux tâches indépendantes de trois jours menées en parallèle prennent au minimum combien de jours, hors contraintes ?','Trois jours.','Six jours nécessairement.','Un jour.','Neuf jours.'),
 n('Migration contrôlée','Une migration doit vérifier les données reprises, les correspondances et la possibilité de retour ou de reprise adaptée. Le seul transfert de fichiers ne suffit pas.','Quel contrôle complète une migration ?','Le rapprochement des données et les tests de reprise.','La suppression immédiate de tous les anciens justificatifs.','L’absence de sauvegarde.','Le transfert sans contrôle de montants.'),
 ],'Un projet comporte A : deux jours. Après A, B : quatre jours et C : trois jours peuvent être menées en parallèle. D : un jour commence après B et C. Aucune contrainte supplémentaire.',[
 ['Calculez la durée minimale.','2 + maximum(4, 3) + 1 = 7 jours.'],
 ['Quel chemin détermine cette durée ?','A puis B puis D, avec les dépendances données.'],
 ['Quelle limite rappeler ?','La durée suppose des ressources suffisantes et l’absence d’autres contraintes ; les tests et risques doivent aussi être prévus dans un projet réel.'],
 ],[S.cyber]),
 ch('risques-donnees','Risques, continuité et qualité des données',
 'La continuité et la qualité des données demandent des objectifs mesurables. Les sauvegardes, droits, journaux et contrôles de cohérence doivent être coordonnés.',
 'Identifier les données critiques et les conséquences d’une perte. Fixer des objectifs de reprise, tester les contrôles puis documenter les incidents et actions correctrices.',
 ['Une pseudonymisation n’est pas une anonymisation garantie.','La présence d’un journal ne prouve pas qu’il est protégé ou exploité.'],[
 n('Objectif de reprise','Le délai de reprise visé concerne le temps pour rendre un service de nouveau utilisable. Il se distingue du volume de données que l’on accepte de perdre.','À quoi correspond un objectif de temps de reprise ?','Au délai visé pour rétablir le service.','À la quantité de lignes vendues.','À la valeur des actions.','Au nombre de mots de passe.'),
 n('Perte de données','L’objectif de point de reprise correspond à la perte de données tolérée en durée ou périmètre. La fréquence des sauvegardes doit être confrontée à cet objectif.','Quel objectif concerne les données perdues entre deux reprises ?','L’objectif de point de reprise.','Le coût du capital.','Le taux de TVA.','La marge commerciale.'),
 n('Pseudonymisation','Remplacer les identifiants peut réduire l’identification directe sans empêcher toute réidentification. Des données pseudonymisées peuvent rester personnelles.','Un code remplace le nom, avec une table de correspondance. Que retenir ?','La réidentification reste possible.','Les données sont forcément anonymes.','Toute protection devient inutile.','Les données ne peuvent plus être utilisées.'),
 n('Qualité des données','La qualité demande notamment exactitude, complétude, cohérence et actualité selon le besoin. Une donnée bien formatée peut être factuellement erronée.','Un montant numérique valide est-il forcément exact ?','Non, le format ne démontre pas l’exactitude.','Oui, toujours.','Oui, si le fichier est volumineux.','Oui, après un export.'),
 ],'Le service veut perdre au maximum une heure de données et reprendre en quatre heures. Les sauvegardes ont lieu toutes les vingt-quatre heures et aucun test de restauration n’a été fait.',[
 ['Quelle incohérence sur la perte de données ?','Une sauvegarde quotidienne ne suffit pas à démontrer un objectif d’une heure ; d’autres mécanismes seraient nécessaires.'],
 ['Quelle incertitude sur le délai de reprise ?','Sans test, la capacité de restaurer un service utilisable en quatre heures n’est pas démontrée.'],
 ['Quelle action prioritaire proposer ?','Adapter la protection des données à l’objectif, puis tester et mesurer une restauration complète dans un environnement approprié.'],
 ],[S.cyber,S.privacy]),
],
};
