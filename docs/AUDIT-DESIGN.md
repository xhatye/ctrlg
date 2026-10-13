# Design SIMDCG : recommandations appliquées et limites

Références :
- https://www.ferrstudio.ch/site-web/erreurs-creation-site-internet/
- https://www.ferrstudio.ch/site-web/16-choses-que-peut-contenir-lexperience-utilisateurs/
- https://gizmo.ai/

Les deux articles Ferrstudio ont été relus. Les recommandations sont des principes de conception, pas une certification ni une garantie commerciale. Les pourcentages de conversion et de retour sur investissement évoqués dans les articles ne sont pas repris comme promesses SIMDCG.

| Principe | Application dans SIMDCG | Vérification ou limite |
| --- | --- | --- |
| Objectif et public | DCG et DSCG dès le titre, 13 et 7 UE, prix visible | Aucun contenu généraliste ajouté à la page d’accueil |
| Cohérence graphique | 20 pictogrammes de même cadre, trait, palette et dimensions | Images SVG originales et contrôlées pour toutes les UE |
| Navigation | Menu court, recherche des matières et chapitres, retour explicite | Parcours contrôlés au clavier, sur ordinateur et téléphone |
| Parcours utilisateur | Diplôme, UE, chapitre, cours, QCM, cartes, cas, progression | Le visiteur peut consulter les titres et volumes avant achat |
| Convivialité | Sélection visuelle des UE et boutons de taille confortable | L’icône accompagne toujours un intitulé compréhensible |
| Design | Accueil central, illustrations de matières, fenêtre de parcours | Inspiration de la composition Gizmo ; identité SIMDCG conservée |
| Accessibilité | Contrôles natifs, noms accessibles, focus, fermeture du sélecteur, réduction des mouvements | Pas d’audit complet avec lecteurs d’écran ni de certification WCAG |
| Vitesse de chargement | Pictogrammes vectoriels légers, dimensions réservées, chargement différé | Compilation et ressources vérifiées ; pas de mesure terrain sur tous les réseaux |
| Retour après action | Explication QCM, correction par étape, message de progression, états d’attente | États de réussite et d’échec testés |
| Personnalisation | Choix diplôme, UE, chapitre, objectif et taille de série | La progression concerne les activités de l’élève, sans score de réussite à l’examen inventé |
| Tests utilisateurs | Parcours automatisés représentatifs et inspection visuelle | Ces contrôles ne remplacent pas des entretiens ou observations de vrais élèves |
| Analyse des données | Progression et historique privés déjà disponibles | Aucun suivi marketing tiers supplémentaire installé, aucun test de conversion réalisé |
| Cartographie de l’expérience | Parcours public et parcours Pro documentés | Les zones d’incertitude et erreurs restent visibles dans l’interface |
| Prototypage | Aperçu local avec données illustratives, exclu du build production | Prototype vérifié avant publication |
| Gestion des erreurs | Réessai, conservation de la réponse écrite, corrigé accessible sans IA | Retour IA facultatif, dépendant des quotas du fournisseur |
| Flux de travail | Chapitres structurés, lecture active, séries courtes, cas guidés, quatre étapes de suivi | Une activité terminée ne certifie pas la maîtrise du programme |
| Performance | Banque numérique servie par séries bornées, effets de souris limités | Pas de garantie chiffrée de performance ou de conversion |
| Sécurité | Lecture Pro relue côté serveur, UID vérifié, écritures privées, quotas | Paiements et ressources Evidstack hors du périmètre de cette refonte |
| Qualité du contenu | 20 synthèses originales, corrections et contrôles arithmétiques | Couverture partielle du programme, relecture indépendante par un enseignant encore nécessaire |
| Contacts et support | Accès au support et adresse visible | Aucun email envoyé à des élèves dans cette intervention |

L’accueil conserve l’accès payant aux leçons et exercices. La vitrine présente les matières et le fonctionnement du parcours ; elle ne simule ni témoignages clients ni résultats personnels.
## Illustrations pédagogiques des cours

Les 205 chapitres disposent d’une carte mentale interactive et d’un tableau de repères construits à partir des notions du cours. Les dossiers argumentés présentent leur contexte et trois étapes de raisonnement. Les 60 chapitres à variantes numériques proposent trois dossiers comparables, avec données, unités, relations et résultats calculés côté serveur.

Huit chapitres possèdent une exploration graphique : équilibre fonctionnel, VAN, prorata d’amortissement, amortissement par composants, seuil de rentabilité, écarts de matière, Wilson et portefeuille de deux actifs. Un seul paramètre varie à la fois. Les hypothèses constantes, le domaine et les unités sont affichés. Les points sélectionnés sont calculés exactement ; les courbes ne servent pas à interpoler les réponses. Les valeurs négatives restent visibles.

Les courbes ont des traits distincts, des légendes et un tableau de valeurs. Les contrôles fonctionnent au clavier ; les cartes, onglets et tableaux disposent de noms accessibles. Sur téléphone, le graphique et les tableaux peuvent défiler dans leur propre zone, sans élargir la page. Les animations respectent la préférence de mouvement réduit. Ces vérifications ne constituent pas un audit exhaustif de conformité WCAG.

Aucune génération IA, aucun nouveau fournisseur ni aucun coût d’API n’est nécessaire pour ces illustrations. Les données restent dans les réponses de cours protégées ; le catalogue public ne contient pas les explications ou corrigés. La consultation des illustrations ne valide pas automatiquement une étape de progression. Les volumes de cours et d’exercices ne sont pas gonflés par ces représentations des mêmes notions.
