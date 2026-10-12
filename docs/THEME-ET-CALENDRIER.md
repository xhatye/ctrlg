# Thèmes et calendrier des examens

Le site utilise un thème sombre par défaut : fond noir, surfaces gris neutre et accents dorés. Le bouton soleil/lune reste disponible sur les pages publiques, dans l’espace étudiant et dans les exercices. La préférence est enregistrée localement, synchronisée entre les onglets et appliquée avant le chargement de React pour éviter un écran blanc au démarrage. Le mode clair reste disponible. Si le stockage du navigateur est bloqué, le bouton fonctionne pendant la visite.

Les couleurs partagées de `src/design.css` définissent les surfaces, textes, bordures, liens et états de réussite/erreur dans les deux thèmes. Les anciennes vues utilisant des styles intégrés suivent les mêmes variables. Les champs de réponse et les résultats doivent rester lisibles dans les deux thèmes.

Le symbole S et étoile dorée est disponible en SVG, en favicon PNG de 32 pixels et en icône Apple de 180 pixels. Les liens d’icônes comportent un numéro de version pour renouveler le cache du navigateur.

Le compteur se trouve sur l’accueil et dans le tableau de bord. Le choix DCG/DSCG affiche uniquement un calendrier confirmé. Les premières épreuves écrites du DSCG 2026 commencent le 20 octobre 2026 à 9 h 30, heure de Paris. La date est stockée avec son décalage UTC pour fonctionner aussi chez les étudiants à l’étranger. Une session commencée ou terminée ne produit pas de compte à rebours négatif.

Sources consultées le 12 octobre 2026 :

- [SIEC — DSCG 2026](https://siec.education.fr/candidats/agenda/dscg-calendrier-des-epreuves-session-2026)
- [Bulletin officiel — calendrier 2026](https://www.enseignementsup-recherche.gouv.fr/fr/bo/2026/Hebdo1/ESRS2534334A)

Aucune date officielle DCG 2027 n’a été trouvée lors de la vérification. Le site affiche « calendrier officiel à venir ». Mettre à jour `lib/exam-calendar.mjs` après publication officielle ; ne pas extrapoler une date à partir de l’année précédente.
