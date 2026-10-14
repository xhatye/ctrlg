# Accueil : mouvement et illustration sartoriale

Cette évolution concerne uniquement le composant public `Marketing`. Les nouveaux styles sont tous limités par `.landing-motion`. Les pages étudiantes, les API et le contenu pédagogique ne changent pas.

- Dégradés violet et menthe, halo de la bibliothèque réagissant à la souris et deux capsules flottantes.
- Inclinaison légère des cartes sous la souris, remise à zéro en sortie et à la perte de focus de la fenêtre.
- Survol des boutons, icônes de matières, cartes de méthode et captures de cours.
- Apparitions au défilement via un seul observateur. Le contenu est visible sans prise en charge de cet effet ; un élément recevant le focus clavier est immédiatement révélé.
- Effets de souris limités aux pointeurs précis. Pas de faux curseur ni de suivi tactile.
- Les animations du hero s’arrêtent hors écran. `prefers-reduced-motion` désactive les nouvelles animations, inclinaisons et transitions, ainsi que le défilement animé du bouton de méthode.
- Illustration originale de trois adultes en tenues sartoriales : homme blanc en costume croisé noir à fines rayures blanches et cravate, femmes en blouse/jupe et cardigan/tenue crème. Le dessin est étiqueté « Visuel illustratif généré » et n’est pas présenté comme un avis étudiant.
- Asset WebP transparent, 768 × 512 px, environ 152 Kio ; aucun service IA intégré à la page, aucune dépendance ajoutée.

Vérifications locales : 10 affichages, largeurs 320/390/768/1024/1440 px, clair/sombre, sans débordement ni erreur JavaScript. Souris, retour au repos, défilement, parcours DCG/DSCG, clavier, tactile et mouvement réduit vérifiés. Les offres, la bibliothèque et le tableau de bord ne possèdent pas le périmètre `.landing-motion`.

Aperçu : http://127.0.0.1:5175/?design=landing. Publication en attente de la validation explicite demandée dans le prompt de refonte.
