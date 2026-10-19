# Annales et accueil SIMDCG

## Catalogue vérifié

139 sujets PDF, 1 545 pages, provenant des liens publics publiés sur https://www.sujets-dcg.com/ (site indépendant du ministère). Contrôle du 19 octobre 2026 : téléchargement de chaque fichier, signature PDF, empreinte SHA-256, lecture de la première page, durée et nombre de pages. Les 139 durées imprimées correspondent aux métadonnées.

- DCG : UE1 à UE12 et UE14 facultative, sessions 2020–2026 ; Nouvelle-Calédonie 2024 lorsqu’un PDF est publié.
- DSCG : UE1 à UE5 et UE8 facultative, sessions 2020–2025.
- DCG UE13, DSCG UE6 et UE7 : formats oraux présentés séparément. Aucun sujet écrit commun inventé.
- Durées : arrêté du 13 février 2019, BO n°26 : https://www.enseignementsup-recherche.gouv.fr/fr/bo/19/Hebdo26/ESRS1900135A.htm. Les consignes du sujet et de sa session font foi.

Les intitulés des anciens sujets restent ceux de leurs sessions. La durée n’est pas une adaptation rétroactive au nouveau programme 2027. Les règles fiscales, juridiques et comptables historiques peuvent avoir évolué.

## Documents et sources

Aucun PDF d’annale n’est ajouté au dépôt ou au dossier public. Les copies utilisées pour la vérification restent dans les sorties de recherche locales, hors checkout. Le lecteur récupère le document public original depuis le diffuseur via une route limitée aux identifiants du catalogue. La source et le PDF original sont visibles. Les crédits, consignes et contenu du document restent intacts.

Le référencement de ce diffuseur ne constitue ni un partenariat, ni une certification, ni une affirmation de licence ouverte. Ne pas importer les corrigés réservés aux enseignants ou les fichiers CRCF sous licence non commerciale dans l’offre payante. Les liens de publication CRCF restent externes.

Pour une nouvelle source ou une redistribution persistante, vérifier ses conditions de réutilisation avant import. Une demande de retrait se traite en retirant les identifiants concernés et en purgeant les caches.

## Lecteur et données

PDF.js est chargé à la demande, avec son worker local. Texte sélectionnable, pages, zoom, plein écran selon le navigateur. La route publique `/api/annal-file?id=...` accepte seulement un identifiant connu ; aucune URL arbitraire, aucun cookie externe, aucune redirection. Timeout 20 s, limite 8 Mo et contrôle du format PDF. Les documents publics seuls peuvent être mis en cache CDN.

Le catalogue est consultable dans l’espace connecté. Le lecteur SIMDCG nécessite Pro ; les liens vers les PDF publics chez le diffuseur restent accessibles. Les documents publics ne sont pas présentés comme un contenu exclusif de SIMDCG.

Le mode examen utilise une échéance absolue, sans pause. Le mode libre permet une pause. Une fermeture ou un onglet en arrière-plan n’accorde pas de temps supplémentaire. Le chronomètre démarre explicitement, après chargement du PDF. Une fin de tentative conserve le brouillon, sans note inventée.

Session, page et brouillon sont enregistrés dans localStorage, avec version et clé par compte et sujet. Aucun brouillon n’est envoyé au serveur. La sauvegarde n’est pas synchronisée entre appareils. Export texte proposé ; erreur de stockage affichée. Une nouvelle tentative conserve le brouillon. Un PDF personnel est lu localement, jamais envoyé ; il faut le sélectionner à nouveau après rechargement.

## Actualisation

`scripts/sync-annals.mjs` est une opération manuelle, jamais exécutée pendant un build Vercel. Il contrôle les liens publics et conserve les nombres de pages uniquement si l’empreinte du PDF est inchangée. Tout nouveau document ou nouvelle version exige une vérification avant mise à jour du catalogue. Les sessions futures ou non publiées ne sont pas inventées.

## Accueil

Navigation capsule fixe au défilement, composition centrée, images originales SIMDCG existantes et animations CSS avec prise en compte du mouvement réduit. Les avis proviennent exclusivement de l’API des retours publiés avec consentement. Aucun témoignage, note moyenne ou compteur d’étudiants n’est fabriqué. Trois avis minimum activent le défilement, avec pause ; zéro avis produit une invitation honnête à partager son expérience.

Les annales générées par IA restent exclues de cette livraison.
