# SIMDCG — spécification de la refonte

Version préparée le 12 octobre 2026, pour React + Vite, Firebase, Stripe et Groq.

## 1. Vision générale

SIMDCG doit rendre les révisions moins dispersées : une matière, une prochaine action, des résultats compréhensibles. L’application accompagne un étudiant français de DCG/DSCG, avec un registre calme et motivant. Le message principal est « Moins de flou. Plus de déclics. » La promesse porte sur les outils et la clarté du parcours, sans garantir la réussite à l’examen.

La refonte livrée inclut l’accueil, la présentation des outils, les pages DCG/DSCG, les ressources et le support, les tarifs, la connexion, le tableau de bord, le catalogue, les pages de matière, le tuteur, la progression et le compte. Les écrans existants de QCM, flashcards, fiches, planning, cas pratiques, entretien, historique, résultats et pages légales partagent la nouvelle palette et les composants communs.

## 2. Marque et direction visuelle

L’énergie de Gizmo est réinterprétée par les cartes souples, les objectifs courts, les séries et les interactions de révision. La structure SaaS de StudyFetch inspire la navigation, les familles d’outils et la hiérarchie. Aucun logo, mascotte ou asset de ces plateformes n’est repris.

Le monogramme S avec une petite étoile dorée et le nom SIMDCG donnent une identité originale. La signature est « Un peu chaque jour. Un pas plus loin. » La dimension universitaire est exprimée par les libellés de matière et de diplôme, plutôt que par un décor d’administration scolaire.

## 3. Palette

| Rôle             | Valeur    | Utilisation                                                         |
| ---------------- | --------- | ------------------------------------------------------------------- |
| Bleu principal   | `#182D52` | Actions principales, titres, navigation, bloc de prochaine révision |
| Bleu profond     | `#142544` | Variations de fond de marque                                        |
| Or               | `#E2C97E` | Accent de marque sur fond bleu, CTA secondaires de conversion       |
| Or texte         | `#87672A` | Texte doré lisible sur surface claire                               |
| Encre            | `#18233E` | Texte principal                                                     |
| Texte secondaire | `#66738A` | Descriptions et informations complémentaires                        |
| Fond produit     | `#F7F8FC` | Espace étudiant                                                     |
| Surface          | `#FFFFFF` | Cartes et formulaires                                               |
| Bordure          | `#E4E9F2` | Séparation discrète                                                 |
| Succès           | `#227957` | Accès actif, validation et bons résultats                           |

Les matières gardent des accents bleus, violets, verts et dorés. L’accent guide le repérage ; il ne doit pas devenir le seul moyen d’indiquer une réponse correcte ou un accès verrouillé.

## 4. Typographie

Une famille sans serif, Inter si disponible, puis Segoe UI et les polices système, remplace la police monospace de l’ancien site. Aucun chargement externe de police n’est nécessaire au fonctionnement. Les grands titres marketing peuvent atteindre 72 px sur ordinateur ; les titres produit sont autour de 31 px. Les lectures pédagogiques restent entre 13 et 16 px avec un interligne généreux. Les petits labels servent de repères courts ; ils ne portent pas une instruction essentielle.

Les nombres utilisent une présentation stable. Les paragraphes de cours et les échanges IA gardent de la place et des lignes limitées en largeur.

## 5. Plan du site

| Zone                | Pages disponibles                                                                                                                 |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Découvrir           | `/`, `/fonctionnalites`, `/dcg`, `/dscg`, `/tarifs`                                                                               |
| Se renseigner       | `/ressources`, `/contact`, `/avis`, `/cgu`, `/confidentialite`                                                                    |
| S’identifier        | `/connexion`, `/inscription`, `/mot-de-passe-oublie`                                                                              |
| Réviser             | `/interface`, `/matieres`, `/matiere?ue=UE9`, `/qcm?ue=UE9`, `/flashcards?ue=UE9`, `/resume-cours?ue=UE9`, `/cas-pratique?ue=UE9` |
| Organiser et suivre | `/planning`, `/progression`, `/historique`                                                                                        |
| Dialoguer           | `/tuteur`, `/entretien/config`, `/entretien/simulation`                                                                           |
| Résultats et accès  | `/resultats/*`, `/compte`, `/pro`                                                                                                 |

Le catalogue publie la couverture réelle : 8 matières DCG et 5 DSCG. Il n’annonce pas les unités absentes comme déjà disponibles.

## 6. Navigation

La navigation publique reste courte : méthode, DCG, DSCG, tarifs et connexion. L’espace étudiant utilise une barre latérale : Mon espace, Mes matières, Mon planning, Tuteur IA, Ma progression, Historique et Mon compte. La matière constitue le point d’entrée aux QCM, fiches, flashcards et cas pratiques : l’étudiant garde le contexte de son unité d’enseignement.

Sur mobile, une barre inférieure expose les quatre actions quotidiennes. Le menu donne accès au compte et à la progression. La sélection de matière est conservée dans l’URL ; un lien incomplet renvoie au catalogue plutôt qu’à un écran vide.

## 7. Recommandations par page

| Page                 | Objectif et structure                                                                               | Actions et justification                                                                                                                  |
| -------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Accueil              | Message court, aperçu produit illustratif, outils, méthode en trois étapes, matières, offres et FAQ | Créer un espace ou voir la méthode. La présence d’un aperçu explique le produit avant l’achat.                                            |
| Fonctionnalités      | Quatre cartes : comprendre, retenir, pratiquer, poser une question                                  | Comprendre l’utilité de chaque outil sans jargon IA inutile.                                                                              |
| DCG/DSCG             | Cartes par matière et description des thèmes                                                        | Voir ce qui est effectivement couvert et créer son compte.                                                                                |
| Tarifs               | Deux cartes : 15 €/mois et 29 €/90 jours                                                            | Choisir l’offre, comprendre le renouvellement, retrouver un paiement existant. Aucun prix barré invérifiable.                             |
| Ressources           | Conseils courts de méthode                                                                          | Compléter les cours à jour. La page ne fait pas croire qu’un blog ou des annales officielles existent déjà.                               |
| Avis                 | Retours stockés dans Firestore, ou état vide                                                        | Éviter les témoignages et notes inventés. Une modération des témoignages est recommandée avant publication à grande échelle.              |
| Contact              | Adresse du support et informations utiles en cas de paiement                                        | Donner une issue concrète au problème d’accès.                                                                                            |
| Connexion            | Bloc de marque et formulaire clair ; connexion Google et récupération du mot de passe               | Revenir rapidement dans son espace. Un achat commence après identification.                                                               |
| Tableau de bord      | Prochaine matière, petit cap du jour, indicateurs et catalogue                                      | Savoir quoi faire ensuite, sans inventer un programme personnalisé qui n’a pas été calculé.                                               |
| Matière              | Présentation courte et quatre outils ordonnés                                                       | Comprendre, pratiquer, retenir, se tester. Le verrou Pro ouvre une explication d’offre.                                                   |
| Planning             | Génération du plan existant et semaines structurées                                                 | Choisir ses matières et son horizon de révision. La version actuelle n’envoie pas de rappels.                                             |
| Historique/résultats | Sessions enregistrées et retours pédagogiques                                                       | Revoir ses réponses et lancer la suite. Les erreurs de génération ne deviennent pas des notes factices.                                   |
| Compte               | Profil, accès actif, récupération de paiement et arrêt du renouvellement                            | Rendre les droits et le support visibles. La récupération attend le contrôle serveur, sans activer le compte sur la seule page de retour. |

## 8. Tableau de bord

Le premier bloc met en avant la dernière matière travaillée, ou une matière proposée si l’historique est vide. Le texte dit « Reprendre ma matière », sans prétendre reprendre une question sauvegardée au milieu d’une session.

Les indicateurs montrent des données observées : sessions terminées, moyenne des QCM enregistrés, temps dans les QCM terminés et matières travaillées. Les cartes matière affichent le meilleur QCM et le nombre de sessions. « Votre premier QCM vous attend » remplace un pourcentage fictif pour un nouveau compte.

La série quotidienne est un encouragement discret. Le bloc « Votre cap du jour » propose une méthode, pas une liste de tâches déjà validées. Il permet d’ouvrir le planning.

## 9. QCM

L’écran conserve le contexte de matière, le temps, la progression et une sortie visible. La question et ses réponses ont leurs propres surfaces ; les boutons restent grands sur mobile. Après sélection, la bonne réponse et l’explication sont visibles, puis l’action suivante prend le relais. Le résultat porte sur les réponses données, jamais sur une probabilité de réussite à l’examen.

Les retours IA sont contrôlés avant rendu : question textuelle, réponses présentes et index de réponse valide. Une génération invalide ouvre l’état d’erreur. À terme, ajouter des modes par chapitre et chronométrés demande des données de chapitre et une logique distincte ; ces modes ne sont pas présentés comme déjà implémentés.

## 10. Flashcards

Chaque carte donne une seule tâche : réfléchir puis retourner la carte. Le retournement est utilisable au clic, avec Entrée ou Espace. La carte laisse de la hauteur au texte et permet de parcourir la réponse. La fin de session propose de reprendre les cartes difficiles.

La version livrée conserve le mécanisme de cartes difficiles de l’ancien produit. Elle n’affirme pas implémenter un algorithme complet de répétition espacée entre plusieurs jours. Une évolution « Encore / Difficile / Bien / Facile » devra stocker les réponses et les prochaines dates de révision avant de promettre des cartes « dues aujourd’hui ».

## 11. Cas pratiques et examens blancs

Le cas pratique existant devient la porte d’entrée à la mise en situation : sujet, questions, zone de réponse et correction. Les notions évaluées doivent rester visibles. L’interface différencie correction IA et correction officielle.

Un examen blanc complet, avec barème stable et plusieurs dossiers, est une extension à concevoir. Il requiert un chronomètre configurable, une remise du dossier, un récapitulatif et un retour par compétence. Les « annales corrigées » et « examens blancs officiels » ne sont pas revendiqués dans la version livrée.

## 12. Tuteur IA

Le tuteur est intégré à l’espace étudiant. Le choix de matière est visible ; changer de matière commence une nouvelle discussion pour éviter de mélanger les contextes. Trois entrées proposées aident à démarrer : expliquer une notion, donner un exemple concret, vérifier la compréhension.

L’état de réponse en cours et l’erreur sont explicités. Les limites d’usage sont renvoyées par le serveur. L’interface précise que l’historique actuel reste dans la session : une sauvegarde durable des discussions et des notes devra être implémentée avant d’annoncer cette fonction.

## 13. Progression

La page compare les résultats des dernières sessions et les meilleurs scores par matière. Les graphes restent lisibles en quelques secondes et accompagnés de chiffres. Les scores représentent les exercices effectués, pas un diagnostic académique certifié.

Les indicateurs de temps sont limités aux activités qui enregistrent réellement une durée. Le nombre de cartes maîtrisées et le temps total de travail ne doivent être ajoutés qu’après instrumentation réelle. Une estimation de préparation à l’examen devra indiquer sa méthode, son incertitude et les matières non couvertes.

## 14. Bibliothèque de composants

- `Brand` : monogramme S, nom, signature. Interactif seulement quand une destination existe.
- `Button` : primaire bleu, secondaire contour, attente désactivée. Une action claire par libellé.
- `Title` : repère de zone, titre, explication et action secondaire éventuelle.
- `UECard` : code matière, description, résultat observé, lien sur toute la carte.
- `ProductShell` : barre latérale, en-tête, menu mobile et accès rapides.
- `Panel` / cartes : surface blanche, bordure discrète et espace régulier.
- Tabs, recherche, badges d’offre, progression, alertes et états vides : variantes cohérentes et accessibles au clavier.
- FAQ native en accordéon : permet de parcourir les informations sans charger de bibliothèque supplémentaire.

## 15. Système de design

Les variables CSS sont la source des couleurs. Les rayons principaux sont de 12 px pour les actions, 16–20 px pour les cartes et 24 px pour les sections marketing. Les espacements suivent une progression régulière de 4, 8, 12, 16, 20, 24, 32 et 48 px.

Les ombres restent discrètes ; la densité vient de la hiérarchie, pas d’une bordure lourde sur chaque élément. Les icônes SVG utilisent un contour homogène. Les états corrects, incorrects et verrouillés ajoutent un texte ou une icône à la couleur.

Les animations sont légères. Le mode `prefers-reduced-motion` supprime les animations et transitions. Les anciens fonds canvas permanents sont retirés pour alléger le travail graphique et améliorer la lisibilité.

## 16. Mobile

Les seuils principaux sont 1100, 800 et 560 px. Sur petits écrans, l’accueil devient une colonne, les cartes de prix se superposent, les catalogues deviennent une liste et la navigation produit expose quatre accès rapides. Les fiches et réponses de flashcards peuvent défiler plutôt que couper le texte.

La mise en page a été contrôlée à 390 px de largeur. Aucun débordement horizontal n’a été détecté après correction. Les captures de design restent des aperçus illustratifs ; une vérification sur les appareils et avec les comptes réels reste nécessaire lors de la mise en ligne.

## 17. Conversion et confiance

La création de compte est gratuite et sans carte. Les fonctionnalités payantes sont clairement distinguées du compte de découverte. Les prix mentionnent les périodes et le renouvellement. Le parcours impose un compte avant Checkout pour éviter qu’un achat n’ait aucun destinataire identifié.

L’action « J’ai déjà payé » figure dans les tarifs et le compte. Le support a une adresse réelle conservée du projet. Aucun compteur d’étudiants, taux de réussite ou témoignage inventé ne soutient la conversion. Les matières absentes ne sont pas dissimulées.

Exemples de textes : « Créer mon espace », « Reprendre ma matière », « Votre premier résultat commence ici », « Aucun accès Pro actif retrouvé. Contactez le support si vous avez payé. » L’interface vouvoie l’étudiant.

## 18. Résultat et suite

La version livrée remet le parcours d’étude au centre, remplace l’esthétique terminal par des surfaces lisibles et crée une cohérence entre site public, abonnement et outils pédagogiques. Le volet paiement apporte un lien explicite entre client et compte, des droits suivis en direct et un chemin de récupération visible.

Les extensions suivantes restent à développer si elles sont retenues : chapitrage complet, sauvegarde de notes et discussions, répétition espacée sur plusieurs jours, calendrier avec rappels consentis, badges persistants, annales sous licence et examens blancs complets. Elles ne sont ni affichées comme déjà opérationnelles, ni utilisées pour justifier l’achat actuel.

Références d’inspiration : [Gizmo](https://gizmo.ai/), [StudyFetch](https://www.studyfetch.com/). Réinterprétation adaptée à SIMDCG, sans reprise de leurs assets de marque.
