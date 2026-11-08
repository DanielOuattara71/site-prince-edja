# Écrans de l'admin — Prince EDJA

Spécification écran par écran. **L'IA ne crée aucun écran, champ, bouton ou texte absent de ce document.** Si un besoin n'est pas couvert, elle l'écrit dans `docs/QUESTIONS.md` et ne l'invente pas. Les champs renvoient aux schémas de `SCHEMAS-ENTITES-PRINCE-EDJA.md`.

## 0. Règles communes à tous les écrans

### 0.1 Structure d'une page
Barre latérale (menu, 9 entrées) · en-tête de page (titre, sous-titre d'une ligne, bouton principal à droite) · barre d'onglets si l'entrée en a · contenu.

### 0.2 Écran « Liste » (modèle unique)
| Zone | Contenu |
|---|---|
| En-tête | titre, compteur (« 132 éléments »), bouton **Créer** |
| Barre de filtres | recherche texte, filtres propres à l'écran, bouton « Effacer les filtres » ; tout est **conservé dans l'adresse** |
| Tableau | cases à cocher, colonnes propres à l'écran, pastille de statut, menu « … » par ligne |
| Actions groupées | apparaissent à la sélection : Publier, Dépublier, Archiver (selon droits) |
| Pagination | « 21–40 sur 132 », Précédent / Suivant, taille 20 / 50 / 100 |
| État vide | illustration simple, phrase d'explication, bouton **Créer** |
| Chargement | lignes grises animées (squelette), jamais d'écran blanc |
| Erreur | bandeau rouge « Impossible de charger la liste » + bouton **Réessayer** |

### 0.3 Écran « Édition » (modèle unique)
| Zone | Contenu |
|---|---|
| Barre haute collante | flèche retour, titre, pastille de statut, indicateur d'enregistrement (« Enregistré à 14:32 » / « Modifications non enregistrées »), boutons **Enregistrer le brouillon**, **Prévisualiser**, **Publier** (ou **Envoyer en relecture** pour un éditeur) |
| Sélecteur de langue | onglets FR / EN ; pastille « à compléter » sur la langue qui a des champs requis vides |
| Colonne principale | champs du contenu |
| Colonne droite | statut, date de publication (programmation), catégorie, étiquettes, image principale |
| Bas de page | liste des champs « à compléter » avant publication, cliquable |
| Quitter avec modifications | confirmation « Quitter sans enregistrer ? » |
| Conflit de version | fenêtre « Quelqu'un a modifié ce contenu » avec **Recharger** et **Copier mon texte** |
| Brouillon | enregistrement automatique toutes les 30 s |

Publier est **toujours** une action explicite. Après publication : message « Publié. Le site sera mis à jour dans quelques minutes » et lien vers Technique → Publication.

### 0.4 Textes types
Succès : « Enregistré ». Erreur de saisie : message sous le champ, en français, sans code. Suppression : fenêtre « Supprimer définitivement ? Cette action est irréversible » ; si le contenu est utilisé : « Utilisé par N éléments, retirez-le d'abord ».

### 0.5 Rôles
`editeur` crée et propose ; `admin` publie ; `super_admin` (Yann) voit tout, dont Comptes et Technique ; `vendeur` (seulement si multi-vendeurs) ne voit que **Boutique** (ses propres pièces) et **Médiathèque**. Une entrée de menu absente des droits n'est pas affichée.

---

## 1. Tableau de bord

Page unique, lecture seule. Quatre blocs :
1. **À faire** : cartes cliquables avec compteur — « N brouillons en relecture », « N messages non lus », « N demandes de pièces nouvelles », « N contenus à compléter ».
2. **Dernière publication** : date, statut (réussie, en cours, échouée), lien vers Publication.
3. **Programmé** : les 5 prochains contenus programmés (titre, date).
4. **Activité récente** : les 10 dernières actions (qui, quoi, quand).
Pas de graphique d'audience. État vide : « Rien à signaler ».

---

## 2. Journal (articles)

**Menu** : Journal → un seul écran de liste, pas d'onglets.

### 2.1 Liste des articles
Colonnes : miniature · titre · **catégorie** · format · statut · date de publication · modifié le. Filtres : recherche, statut, **catégorie**, langue à compléter, étiquette. Tri par défaut : modifié le décroissant.

### 2.2 Édition d'un article
Colonne principale : **Titre** (obligatoire) · **Adresse** (générée du titre, modifiable tant que jamais publiée, puis verrouillée) · **Extrait** (240 car. max, compteur) · **Corps** (éditeur riche : titres H2/H3, gras, italique, lien, liste, citation, image, séparateur ; pas de tableau ni d'iframe) · **SEO** repliable (titre 60 car., description 160 car., aperçu Google).
Colonne droite : Statut · Publication (maintenant / programmer) · **Catégorie** (liste déroulante, obligatoire pour publier) · **Étiquettes** (format obligatoire, pays, ville, thème, année, projet) · **Image principale** (sélecteur de la médiathèque, texte alternatif obligatoire) · « À la une » (interrupteur) · Durée de lecture (calculée, modifiable).
Aperçu : bouton **Prévisualiser** ouvre la page telle qu'elle sera sur le site.
Articles liés : encadré en lecture seule « Articles liés calculés » (jamais saisis).

---

## 3. Projets (conforme à la photo)

**Menu** : Projets → pas de barre d'onglets ; l'entrée ouvre le **hub**. Les listes sont atteintes par les cartes du hub et par un fil d'Ariane.

### 3.1 Hub « Projets »

Titre : **Projets**. Sous-titre : « Créez et organisez vos projets, épisodes et leur affichage public. »

Deux grandes cartes en haut, côte à côte (une colonne sur mobile) :

| Carte | Titre | Sous-titre exact | Action |
|---|---|---|---|
| Gauche | **Créer un projet** | « Contenu, affiche, format, template » | ouvre l'édition d'un nouveau projet |
| Droite | **Créer un épisode** | « Affiche, synopsis, vidéo, destination » | ouvre l'édition d'un nouvel épisode |

Sous les cartes, bloc **Moteur de rendu public**, légende : « Chaque projet choisit un template selon son format ; tous les épisodes partagent un template unique. »
Quatre cartes de template, cliquables, chacune avec le **nombre de projets** du format :

| Carte | Étiquette |
|---|---|
| **Template Série** | X'PLORE |
| **Template Documentaire** | Production indépendante |
| **Template Émission** | Programme |
| **Template Archive** | Patrimoine audiovisuel |

Une cinquième carte, pleine largeur : **Épisode** — « Template unique d'épisode » · « Utilisé par tous les projets » · nombre d'épisodes.
Clic sur une carte de template : ouvre la **liste des projets de ce format** (3.2) ; clic sur la carte Épisode : ouvre la **liste des épisodes** (3.4). Les templates ne sont **pas éditables** dans l'admin : un petit texte le dit (« Les mises en page sont gérées dans le code du site »).

Sous les templates, bloc **Données partagées**, légende : « Ressources réutilisées par plusieurs projets et épisodes. » Deux puces cliquables :
- **Destinations** → liste des destinations (3.5)
- **Guides PDF** → liste des guides (3.6)

> Puces **Villes** (Taste & Travel) et **Archive** : **non présentes sur la photo**. Par défaut, elles sont **ajoutées** dans « Données partagées », sinon ces contenus n'auraient pas d'accès. À valider par Yann (voir §14, question E1). Si refusé, Villes passe sous Destinations (onglet) et Archive devient un format de projet.

Chaque carte et puce porte un compteur discret. Aucune autre zone.

### 3.2 Liste des projets (d'un format ou tous)
Fil d'Ariane : Projets › Template Série. Colonnes : affiche · titre · format · **catégorie** · avancement · nombre d'épisodes · statut · modifié le. Filtres : recherche, format, **catégorie**, avancement, statut. Bouton **Créer un projet** (le format est pré-rempli si on vient d'une carte de template).

### 3.3 Édition d'un projet
Colonne principale : **Titre** · **Adresse** · **Accroche** · **Présentation** (éditeur riche, optionnel) · **Épisodes du projet** (liste ordonnée par numéro, lien **Créer un épisode dans ce projet**, lien vers chaque épisode).
Colonne droite : Statut · Publication · **Format** (Documentaire, Série, Émission, Archive ; obligatoire ; libellé sous le champ : « Template : Template Série ») · **Avancement** (Disponible, En production, En préparation) · **Année** · **Catégorie de projet** (optionnelle) · **Étiquettes** · **Affiche** (obligatoire) · **Lien personnalisé** (repliable, avancé).
Changer le format affiche une alerte : « Le modèle d'affichage va changer sur le site ».

### 3.4 Liste et édition des épisodes
Liste : miniature · numéro · titre · **projet** · destination · statut · modifié le. Filtres : projet, destination, statut.
Édition : colonne principale **Titre** · **Adresse** · **Numéro** (E01…) · **Lieu** · **Pitch** · **Synopsis long** · **Note d'intention** · **Personnages** · **Making of** · **Presse** · **Crédits** (textes riches pour les longs champs).
Colonne droite : Statut · Publication · **Projet** (liste ; vide autorisé) · **Destination** (liste) · **Affiche** (obligatoire) · **Vidéo / bande-annonce** (lien) · **Durée** · **Guide PDF** (sélecteur filtré sur les PDF) · **Étiquettes**.

### 3.5 Destinations
Liste : image · nom · pays/ville · coordonnées (✓ ou « manquantes ») · guide (✓ ou —) · statut. Édition : **Nom**, **Adresse**, **Texte**, **Latitude**, **Longitude** (avec petite carte de contrôle), **Épisode lié**, **Guide PDF**, **Image**. Si coordonnées hors Côte d'Ivoire pour une destination ivoirienne : message « Coordonnées en dehors du pays ».

### 3.6 Guides PDF
Liste en lecture et dépôt : nom du fichier · poids · **utilisé par** (destination ou épisode) · date. Bouton **Déposer un guide** (PDF uniquement, taille max affichée). Pas d'édition de contenu. Suppression refusée si utilisé.

### 3.7 Villes (Taste & Travel) — si validé
Liste ordonnable par glisser-déposer. Édition : **Nom**, **Intention** (texte court), **Image**, **Ordre**.

### 3.8 Archive — si validé
Liste : titre · fiabilité · sources · statut. Édition : **Titre**, **Texte**, **Fiabilité** (Documentée, Mémoire orale, Interprétation), **Sources** (au moins une pour publier ; type + référence).

---

## 4. Boutique

**Menu** : Boutique → onglets **Bijoux · Livres · Catégories · Créateurs**. (Créateurs masqué pour un vendeur.)

### 4.1 Bijoux — liste
Colonnes : photo · numéro · nom · **catégorie** · créateur · prix min. · stock · statut · visible. Filtres : recherche, **catégorie**, créateur, statut, disponibilité. Pagination standard (§0.2).

### 4.2 Bijou — édition
Colonne principale : **Nom** · **Adresse** · **Culture** (origine du symbole) · **Histoire** · **Galerie** (5 à 8 photos, réordonnables par glisser-déposer, texte alternatif par photo) · **Variantes** (tableau : libellé, matière, taille, référence, prix, ancien prix, stock, disponible ; bouton **Ajouter une variante** ; au moins une).
Colonne droite : Statut · Publication · **Catégorie de produit** (obligatoire) · **Créateur** (obligatoire ; figé pour un vendeur) · **Numéro** · **Édition** (numéro / total) · **Atelier** · **Village** · **Poids (g)** · **Prix confirmé** (interrupteur ; explication : « Sinon le site affiche “sur demande” ») · **Visible** · **Image principale** · **Étiquettes**.
Le prix et le stock sont toujours saisissables ; un bandeau précise qu'ils ne s'affichent sur le site que si la boutique en ligne est activée (Réglages).

### 4.3 Livres — liste et édition
Liste : couverture · référence · titre · auteur · **catégorie** · prix min. · statut · visible.
Édition : colonne principale **Titre** · **Adresse** · **Résumé** · **Galerie** (couverture, 4ᵉ de couverture, pages intérieures) · **Variantes** (libellé « Broché », « Relié »…, référence/ISBN, prix, ancien prix, stock, disponible).
Colonne droite : Statut · Publication · **Catégorie de produit** · **Créateur** · **Référence** · **Auteur** · **Éditeur** · **ISBN** · **Année** · **Pages** · **Prix confirmé** · **Visible** · **Couverture** · **Étiquettes**.

### 4.4 Catégories
Un seul écran avec **trois sections empilées** : *Articles*, *Projets*, *Produits*. Pour chaque : liste ordonnable (glisser-déposer) avec nom FR/EN, nombre d'éléments, interrupteur **Visible**, bouton **Ajouter**, menu « … » (Modifier, Supprimer). Suppression bloquée si utilisée (« Utilisée par N éléments »). Les 8 catégories de départ sont modifiables mais l'IA ne les supprime jamais.
> La section « Articles » de cet écran est aussi accessible depuis Journal (lien « Gérer les catégories ») pour ne pas la cacher.

### 4.5 Créateurs
Liste : photo · nom · pays · rôle (Principal / Invité) · nombre de pièces · actif. Édition : **Nom**, **Adresse**, **Pays**, **Ville**, **Photo**, **Bio**, **Accroche**, **Créateur principal** (un seul), **Actif**, **Commission** (visible super_admin seulement ; vide = non défini).
Si multi-vendeurs : encadré **Comptes liés** (voir Comptes).

---

## 5. Médiathèque

**Menu** : Médiathèque → onglets **Tous les fichiers · Sur le site**.

### 5.1 Tous les fichiers
Grille de vignettes (vue liste en option). Filtres : recherche, type (image, PDF), « sans texte alternatif », « utilisés / inutilisés ». Bouton **Déposer** (glisser-déposer, plusieurs fichiers, barre de progression par fichier). Sélection d'un fichier → panneau latéral : aperçu, nom, poids, dimensions, **texte alternatif** (FR/EN), **légende**, **crédit**, case « décorative », **Utilisé dans** (liste de liens), bouton **Remplacer le fichier**, bouton **Supprimer** (refusé si utilisé). Pagination (grille de 40).

### 5.2 Sur le site
Trois blocs :
1. **Photos fixes** : liste des emplacements (clé, libellé, format conseillé, photo actuelle, date de mise à jour). Bouton **Changer** ouvre le sélecteur de médiathèque. Les emplacements ne se créent pas ici. Liste de départ (à confirmer par le site public, voir E3) : accueil — héros ; accueil — portrait ; à propos — portrait ; à propos — bandeau ; boutique — bandeau ; journal — bandeau ; contact — bandeau ; image de partage (réseaux).
2. **Galerie de l'accueil** : photos ordonnables (glisser-déposer) ; par photo : légende, titre, étiquette, lien interne ou externe, ratio, parallaxe.
3. **Galerie de la boutique** : même fonctionnement.

---

## 6. Preuves et presse

**Menu** : onglets **Audience · Distinctions · Presse · Partenaires**.
- **Audience** : tableau éditable de lignes (plateforme, taille, portée, **date de validation obligatoire**, source) ; ordre par glisser-déposer ; message « Les chiffres sans date ne sont pas publiés ».
- **Distinctions** : liste (année, titre, organisme, nature) ; édition : **Titre**, **Description**, **Nature** (Distinction / Fonction officielle), **Année** (obligatoire), **Organisme**, **Lien**, **Image**.
- **Presse** : liste (source, titre, date, à la une) ; édition : **Titre**, **Résumé**, **Citation**, **Source**, **Date**, **Lien**, **Logo/avatar**, **À la une** (une seule).
- **Partenaires** : liste ordonnable de logos ; édition : **Nom**, **Logo**, **Lien**.

---

## 7. Boîte de réception

**Menu** : onglets **Messages · Demandes · Abonnés** ; pastilles de compteur sur chaque onglet.
- **Messages** : liste (nom, motif, type contact/collaboration, date, statut) ; filtres statut et type. Détail en panneau : tous les champs reçus (dont, pour une collaboration : entreprise, pays, type, calendrier, budget), **Statut** (Non lu, Lu, Traité, Archivé), **Note interne**, bouton **Répondre** (ouvre le client de messagerie, aucun envoi depuis l'admin). Ouvrir un message le passe en « Lu ».
- **Demandes** (pièces) : liste (nom, nombre de pièces, date, statut) ; détail : lignes (photo, produit, variante, prix si confirmé), message, e-mail, langue, **Statut** (Nouvelle, En cours, Conclue), **Note interne**. Avertissement fixe : « Une demande ne réserve aucun stock ».
- **Abonnés** : liste (e-mail, prénom, pays, langue, statut, date). Filtres statut, langue. Détail : historique de consentement (date, texte accepté, source). Boutons **Exporter (CSV)** (liste filtrée) et **Supprimer cet abonné** (droit à l'effacement, confirmation). Aucun bouton d'envoi de lettre (décision newsletter en attente).

---

## 8. Réglages

**Menu** : onglets **Identité et paramètres · Pages légales · Étiquettes**.
- **Identité et paramètres** : sections **Identité** (nom du site, description, logo, image de partage, e-mail de contact, réseaux sociaux), **Langues** (langues actives), **Boutique** (interrupteur « Boutique en ligne » avec explication), **Conservation** (durée de conservation des messages et des abonnés non confirmés), **Multi-vendeurs** (interrupteur, super_admin seul). Un seul bouton **Enregistrer** par section.
- **Pages légales** : liste fixe de 5 pages (mentions, confidentialité, cookies, CGV, retours) ; édition : titre, résumé, corps riche, par langue ; mention « Dernière mise à jour ».
- **Étiquettes** : liste groupée par type (pays, ville, thème, année, format, projet) ; ajout, renommage FR/EN, suppression refusée si utilisée.

---

## 9. Technique (super_admin et admin selon droits)

**Menu** : onglets **Publication · Activité · Comptes**.
- **Publication** : bouton **Publier le site maintenant** (confirmation) ; tableau des publications (date, déclencheur, statut, durée, nombre de contenus, message d'erreur) ; la dernière en haut ; bandeau « Publication en cours » avec rafraîchissement automatique ; bouton **Réessayer** sur une échec.
- **Activité** : journal d'audit en lecture seule (date, personne, action, élément, détail) ; filtres personne, type d'action, période ; pagination ; aucune édition.
- **Comptes** (super_admin) : liste (nom, e-mail, rôle, créateur lié, actif, dernière connexion) ; création : **Nom**, **E-mail**, **Rôle**, **Créateur lié** (obligatoire si vendeur ; vendeur proposé seulement si multi-vendeurs actif), invitation par e-mail ; actions **Désactiver**, **Réinitialiser le mot de passe**. Un super_admin ne peut pas se désactiver lui-même.

---

## 10. Écrans transverses

| Écran | Contenu |
|---|---|
| Connexion | e-mail, mot de passe, lien « Mot de passe oublié », message d'erreur générique |
| Mot de passe oublié / Réinitialisation | saisie de l'e-mail ; page de nouveau mot de passe avec règles affichées |
| Mon profil | nom, e-mail, mot de passe, langue de l'interface, session active |
| Sélecteur de média (fenêtre) | grille de la médiathèque, recherche, dépôt direct, sélection simple ou multiple ; affiche un avertissement si le texte alternatif est vide |
| Page 403 / 404 / erreur | phrase claire + bouton retour au tableau de bord |
| Session expirée | fenêtre « Reconnectez-vous » **sans perdre** le brouillon en cours |

---

## 11. Correspondance menu ↔ routes existantes

| Entrée | Routes conservées | Changement |
|---|---|---|
| Journal | `/articles` | + catégorie |
| Projets | `/projets`, `/episodes`, `/destinations`, `/villes`, `/archive` | hub à la racine `/projets` ; les listes passent sous le fil d'Ariane |
| Boutique | `/bijoux`, `/categories`, `/createurs` | + `/livres` ; catégories à trois sections |
| Médiathèque | `/medias`, `/galerie` | + onglet « Sur le site » |
| Preuves et presse | `/audience`, `/distinctions`, `/presse`, `/partenaires` | regroupement |
| Boîte de réception | `/messages`, `/demandes`, `/abonnes` | regroupement |
| Réglages | `/reglages`, `/pages-legales`, `/tags` | regroupement |
| Technique | `/publication`, `/journal` → `/activite`, `/comptes` | renommage + redirection |

## 12. Textes de l'interface
Tout en français. Boutons à l'infinitif (« Créer », « Enregistrer »). Pas de jargon (« adresse » et non « slug », « étiquette » et non « tag », « modèle » et non « template » — sauf le mot **Template** qui figure sur la photo du hub et doit rester tel quel).

## 13. États obligatoires sur chaque écran
Chargement (squelette) · vide · erreur réseau (Réessayer) · erreur de validation (sous le champ) · droit refusé (403) · conflit de version · succès (toast de 4 s). Un écran sans ces états n'est pas terminé.

## 14. Questions à valider avant de construire
| # | Question | Par défaut |
|---|---|---|
| E1 | Ajouter les puces **Villes** et **Archive** dans « Données partagées » (absentes de la photo) ? | oui, ajoutées |
| E2 | Catégories de projets : lesquelles ? | liste vide, facultative |
| E3 | Liste exacte des photos fixes du site public | liste du §5.2, ajustée au code du site |
| E4 | Un éditeur peut-il changer une photo fixe ? | non, admin seulement |
| E5 | Champs d'un livre (auteur, éditeur, ISBN, année, pages) | comme en 4.3 |
