# Admin Prince EDJA — version simplifiée : entrées, rôle de chaque élément, expérience utilisateur

Ce document remplace la liste de 33 entrées de la première version par **9 entrées**. Il sert de base au prompt de simplification pour l'IA de développement (admin et back end).

## 1. Principes

1. **Une entrée = une tâche que le client fait vraiment.** Ce qui change une ou deux fois par an reste dans le code, modifié par le développeur.
2. **Un vocabulaire de tous les jours.** « Brouillon », « En relecture », « Publié », « Programmé ». Pas de « slug », « tag », « gabarit », « à fournir » : on dit « adresse de la page », « étiquette », « modèle », « à compléter ».
3. **On voit ce qui reste à faire.** Chaque écran dit ce qui manque avant de pouvoir publier, sans que l'utilisateur ait à deviner.
4. **Rien ne se perd.** Enregistrement automatique des brouillons, avertissement avant de quitter, possibilité de revenir à une version précédente.
5. **Un seul chemin par action.** On ne change pas une photo à deux endroits.

## 2. Les 9 entrées

### 2.1 Tableau de bord
**À quoi ça sert** : savoir en dix secondes ce qui demande une action.
**Éléments**
- **À relire** : les contenus en relecture, avec un bouton « Ouvrir » (visible par l'administrateur).
- **Mes brouillons** : mes contenus non terminés.
- **Messages non lus** et **nouvelles demandes de pièces** : compteurs, un clic mène à la boîte de réception.
- **État du site** : date de la dernière mise en ligne, et un bouton « Mettre le site à jour » s'il y a des changements en attente.
- **Dernières modifications** : les cinq derniers contenus touchés, par qui, quand.
- **Raccourcis** : « Écrire un article », « Ajouter un bijou », « Envoyer une photo ».
**Rôles** : tous. L'éditeur ne voit que ses propres compteurs.

### 2.2 Journal
**À quoi ça sert** : écrire et publier les articles.
**Éléments**
- **Liste des articles** : recherche instantanée, trois filtres seulement (statut, catégorie, langue), colonnes titre / statut / date / auteur.
- **Formulaire d'article**
  - Sélecteur **Français / Anglais** unique, en haut du formulaire (pas un par champ).
  - Titre, résumé, texte (éditeur de texte avec titres, citations, images, vidéos, cartes).
  - **Image principale** choisie dans la médiathèque, avec son texte alternatif.
  - **Catégorie** et **étiquettes** : liste filtrée sur ce qui concerne le Journal.
  - **Articles liés** : proposés automatiquement selon les étiquettes communes.
  - **Avancé** (replié) : adresse de la page (générée depuis le titre), titre et description pour les moteurs de recherche.
- **Boutons d'état** : « Enregistrer », « Envoyer en relecture », « Publier », « Programmer » (date et heure), « Retirer de la publication ».
- **Aperçu** : voir l'article comme sur le site avant de publier.
**Règles** : publier demande un titre, un résumé, une image avec texte alternatif pour chaque langue active, et une étiquette de format.
**Rôles** : l'éditeur écrit et envoie en relecture, l'administrateur publie.

### 2.3 Projets (votre schéma)
**À quoi ça sert** : gérer les films et histoires : X'PLORE, documentaires, émissions, archives.
**Éléments (en onglets)**
- **Projets**
  - **Format** à choisir à la création : Série X'PLORE, Documentaire, Émission, Archive. Ce choix détermine la mise en page de la page publique ; le formulaire n'affiche que les champs utiles à ce format.
  - Contenu : titre, synopsis, note d'intention, affiche, bande-annonce, crédits, presse.
  - **Épisodes du projet** : liste ordonnable, avec bouton « Créer un épisode ».
  - **Aperçu** de la page publique selon le format.
- **Épisodes**
  - Un seul modèle : affiche, synopsis, vidéo, destination, durée, date de diffusion.
  - Choix de la **destination** dans les données partagées.
- **Destinations**
  - Nom, texte, coordonnées, photo, épisode lié.
  - **Guide PDF** : un fichier de la médiathèque rattaché à la destination (champ déjà présent dans le back end).
- **Villes** (Taste & Travel)
  - Nom, intention, image, ordre. Les villes du projet Taste & Travel sont une liste distincte des destinations X'PLORE : elles restent un onglet à part.
**Archive d'Afrique** : un projet au format « Archive ». Chaque entrée sans source n'est pas publiable (règle du cahier des charges).
**Rôles** : l'éditeur écrit, l'administrateur publie.

### 2.4 Boutique
**À quoi ça sert** : gérer les bijoux et leurs créateurs.
**Éléments (en onglets)**
- **Bijoux**
  - Numéro dans la collection, nom, histoire derrière l'objet, culture d'origine du symbole, matières.
  - Galerie de 5 à 8 photos, réordonnable.
  - **Variantes** (taille, finition) : prix et stock n'apparaissent que si la boutique en ligne est activée.
  - Créateur, catégorie, étiquettes filtrées sur la boutique.
- **Catégories** : liste ordonnable (nom, description, ordre). Une catégorie vide est masquée sur le site.
- **Créateurs**
  - Fiche d'un créateur : nom, présentation, photo, pays.
  - Toujours visible : chaque bijou est rattaché à un créateur (Prince ou un artisan invité).
  - Les comptes de connexion par créateur n'existent que si le mode multi-vendeurs est activé.
**Rôles** : l'administrateur gère tout. Un vendeur (plus tard) ne voit que ses propres bijoux.

### 2.5 Médiathèque
**À quoi ça sert** : un seul endroit pour toutes les images et tous les fichiers, et pour décider quelle photo va à quel endroit du site.
**Onglet « Tous les fichiers »**
- Envoyer des fichiers (glisser-déposer, plusieurs à la fois).
- Pour chaque fichier : texte alternatif en français et en anglais, crédit, où il est utilisé.
- Filtres simples : images, vidéos, PDF, « sans texte alternatif », « non utilisés ».
- Suppression refusée si le fichier est utilisé, avec la liste des endroits qui l'utilisent.
**Onglet « Sur le site »**
- **Galerie de l'accueil** : photos réordonnables par glisser-déposer. Chaque photo : image, légende, page vers laquelle elle mène.
- **Emplacements fixes** : photo principale de l'accueil, portrait et photos de la page « Mon histoire », portraits de la page Presse, photo de la page Collaborations, image de partage sur les réseaux, images de remplacement.
- Chaque emplacement indique son nom clair, le format conseillé et un aperçu. On le remplace en choisissant un fichier existant ou en en envoyant un nouveau.
**Rôles** : éditeur et administrateur.

### 2.6 Preuves et presse
**À quoi ça sert** : les contenus de crédibilité de Prince, repris sur l'accueil, « À propos » et Presse.
**Éléments (en onglets)**
- **Audience** : chiffres clés (communauté, pays parcourus, années d'expérience, portée). Chaque chiffre a sa valeur, son libellé et **sa date de validation**, exigée par le cahier des charges.
- **Distinctions** : titre, organisme, année, visuel.
- **Presse** : les trois bios (50 mots, 150 mots, longue), le dossier de presse (PDF daté), les portraits HD, les logos, les articles de presse.
- **Partenaires** : nom et logo des marques avec lesquelles Prince a travaillé, ordre d'affichage.
**Rôles** : administrateur.

### 2.7 Boîte de réception
**À quoi ça sert** : tout ce qui vient des visiteurs, au même endroit.
**Éléments (en onglets)**
- **Messages** : formulaire de contact. Statuts nouveau / lu / traité, réponse par e-mail depuis la fiche, suppression automatique après la durée de conservation fixée (24 mois par défaut).
- **Demandes** : demandes de pièces de la boutique, avec le bijou et la variante demandés. Une demande ne réserve aucun stock. Statuts nouvelle / en cours / terminée.
- **Abonnés** : liste de la newsletter. Actif après confirmation de l'e-mail. On voit la date et le texte du consentement. Export de la liste.
**Rôles** : administrateur.

### 2.8 Réglages
**À quoi ça sert** : ce que l'on règle rarement.
**Éléments (en onglets)**
- **Identité et paramètres** : nom du site, e-mail de contact, réseaux sociaux, localisation. Les interrupteurs `boutiqueEnLigne` et `multiVendeurs` ne sont visibles et modifiables que par le super-admin.
- **Étiquettes** : les listes de format, pays, thème et projet utilisées pour classer les contenus (écran existant conservé, réservé à l'administrateur).
- **Pages légales** : texte des mentions légales, de la confidentialité, des cookies, des CGV et des retours, en français et en anglais, avec date de dernière mise à jour.
**Rôles** : administrateur (le super-admin pour les interrupteurs).

### 2.9 Technique
**À quoi ça sert** : maintenance. Visible par l'administrateur et le super-admin seulement.
**Éléments (en onglets)**
- **Publication** : état de la dernière mise en ligne, historique, bouton « Mettre le site à jour ».
- **Journal d'activité** : qui a fait quoi et quand, filtrable par personne et par type de contenu.
- **Comptes** : créer, inviter par e-mail, désactiver un utilisateur, lui donner un rôle (éditeur, administrateur, vendeur). Le dernier super-admin ne peut pas être supprimé.

## 3. Ce qui sort de l'admin

| Retiré | Où cela vit désormais |
|---|---|
| Navigation | Fichier de navigation du site |
| Textes d'interface | Dictionnaire FR/EN du site |
| Motifs de contact | Liste dans le code du formulaire |
| Univers (six cartes de l'accueil) | Code de la page d'accueil |
| Jalons (chronologie) | Données de la page « Mon histoire » |
| Offres de collaboration | Données de la page « Collaborer » |
| Études de cas | Données de la page « Collaborer » |
| Pages du site | Code des pages |
| Page de démonstration des composants | Supprimée |

Conséquence : pour modifier ces textes, le client passe par vous.

## 4. Expérience utilisateur à améliorer

Constats faits sur la version actuelle, avec la correction attendue.

| # | Constat | Correction |
|---|---|---|
| U1 | Menu de 33 entrées à plat : il faut faire défiler pour atteindre la boutique ou les messages. | 9 entrées, une icône chacune, groupées en quatre blocs : Contenus, Boutique, Public, Réglages. |
| U2 | Sélecteur Français / Anglais répété sur chaque champ. | Un seul sélecteur en haut du formulaire. Un badge indique les langues incomplètes. |
| U3 | L'adresse de la page (slug) est affichée à côté du titre. | Générée automatiquement, rangée dans « Avancé ». |
| U4 | Les listes demandent de cliquer sur « Chercher ». Six filtres, dont des termes techniques. | Recherche instantanée dès la frappe. Trois filtres au plus. |
| U5 | Vocabulaire technique : « À fournir · 3 », « Traduction », « usages », « tags ». | « À compléter », « Langues », « utilisé à 3 endroits », « étiquettes ». |
| U6 | Un seul bouton « Enregistrer le brouillon », sans retour clair. | Enregistrement automatique toutes les 30 secondes, message « Enregistré à 14 h 32 », avertissement si on quitte avec des changements. |
| U7 | L'état de publication n'indique pas ce qui manque. | Liste des éléments manquants avant publication (« Il manque : image principale, texte alternatif »), avec lien vers le champ concerné. |
| U8 | Étiquettes de tous types proposées partout (« Article » sur un bijou). | Chaque formulaire ne propose que les étiquettes qui le concernent. |
| U9 | Médiathèque : grille minimaliste, problème de texte alternatif repéré seulement par un petit signe. | Vignettes plus grandes, ajout du texte alternatif directement dans la grille, envoi par glisser-déposer. |
| U10 | Tableau de bord limité à des compteurs. | Cartes à actions (« 3 contenus à relire — Ouvrir »), raccourcis de création, état du site. |
| U11 | Mobile : le menu est un long tiroir de 33 lignes. | Barre inférieure à quatre raccourcis (Journal, Boutique, Boîte de réception, Plus) et menu complet réduit à 9 lignes. |
| U12 | Premier lancement sans aide. | Message d'accueil de trois étapes à la première connexion, et un texte d'aide court sous chaque champ non évident. |
| U13 | Confirmations et erreurs peu explicites. | Messages clairs et en français : ce qui s'est passé et quoi faire ensuite. |
| U14 | Actions destructrices sans filet. | Confirmation avec le nom de l'élément, et suppression « douce » récupérable pendant 30 jours. |

## 5. Impact sur le back end

Le back end existant couvre déjà l'essentiel. Constats faits sur le code livré :

- Le champ `format` du projet existe déjà, avec les quatre valeurs : Documentaire, Série, Émission, Archive.
- La destination et l'épisode ont déjà un champ `guideMediaId` (un PDF de la médiathèque) : pas de table « guides » à créer.
- La galerie existe (`galerie_image`, avec un emplacement `accueil` ou `boutique`).
- À ajouter : une table d'emplacements fixes de photos (`emplacement_photo`), le stockage Cloudinary à la place de R2, et le retrait des routes d'écriture des entités sorties de l'admin.
- Les tables des entités sorties de l'admin (univers, jalons, offres, études de cas, pages, navigation, textes d'interface, motifs de contact) ne sont pas supprimées dans cette passe.

## 6. Points à valider

1. Archive d'Afrique devient bien un format de projet.
2. Univers, Jalons, Offres et Études de cas sortent de l'admin : le client devra passer par le développeur pour les modifier.
3. Durée de conservation des messages : 24 mois par défaut.
4. Suppression « douce » de 30 jours pour les contenus.
