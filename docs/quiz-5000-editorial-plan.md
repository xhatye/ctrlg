# Nouvelle banque de 5 000 QCM

Objectif autorisé le 20 octobre 2026 : rédiger 5 000 questions utiles pour les vingt UE, réparties dans tous les chapitres actuels. La banque réparée reste active jusqu’à validation et intégration de la nouvelle banque.

La répartition exacte, 22 ou 23 questions par chapitre, figure dans `content/quiz-v2/plan.json`. Les brouillons sont des données de travail ; leur présence n’augmente aucun compteur public. Le plan conserve une empreinte du support utilisé. Un changement de source nécessite un nouveau contrôle.

## Rédaction

- Une question autonome, avec les faits utiles dans l’énoncé et quatre options de même nature.
- Une seule réponse correcte et une explication du raisonnement et de la principale confusion.
- Au moins la moitié des questions en application, calcul ou analyse d’erreur. Les exercices d’anglais et de communication respectent leurs objectifs propres.
- Chaque notion du chapitre est couverte ; les supports existants définissent le périmètre, sans prétendre couvrir intégralement un programme.
- Les taux, seuils et durées d’exercice sont explicitement fournis. Une règle juridique, fiscale ou comptable datée demande une référence primaire vérifiée ; ne pas en inventer.
- Les exercices de calcul comportent une expression contrôlable indépendamment, ses arrondis et ses hypothèses. Les variantes de nombres et permutations de choix ne comptent pas comme de nouvelles questions originales.
- Aucun choix fabriqué avec un titre du cours ou un paragraphe sans rapport. Aucun doublon ni simple paraphrase d’une question déjà présente.

## Contrôle avant activation

Les contrôles de structure, de calcul et de doublons précèdent une résolution à l’aveugle : le relecteur reçoit la question, les choix et les sources, sans la réponse ni son explication. Toute ambiguïté ou absence de fondement bloque la question. Une empreinte relie la relecture à la version exacte de la question. Une modification annule cette validation.

Une relecture par un modèle ou un agent est identifiée comme telle ; elle ne devient pas une certification indépendante par un enseignant. Les brouillons et validations restent séparés. Les anciens identifiants de révision et historiques sont conservés et les questions retirées ne sont pas réactivées.

La répartition des relectures dans `content/quiz-v2/review-plan.json` attribue chaque UE à un autre auteur. La résolution précède la consultation du corrigé ; les explications sont ensuite confrontées aux décisions indépendantes et aux supports. Toute alternative invraisemblable, objectif répété, réponse ambiguë ou règle non étayée doit être signalé, puis corrigé et relu. Aucun service externe de génération ne sera utilisé : l’utilisateur a confirmé le maintien de la rédaction dans Codex.

La publication requiert 5 000 questions effectivement rédigées et contrôlées, des compteurs calculés sur les questions actives, les tests de non-régression et une vérification du parcours en ligne sur ordinateur et mobile.
