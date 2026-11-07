# Module Projets — analyse et proposition de templates

> 06/11/2026 · **Validée par le client** (avec ses décisions du § 8.1 et les défauts du § 8.2, sauf l'aperçu :
> pas d'aperçu). **Admin implémenté** (D-80) contre le faux serveur ; rendu public à faire.
> À valider avant tout développement. Sources : code du site public (`src/pages`, `src/data`,
> `src/components/sections/xplore`), documents de `docs/`, admin actuel (étape E1).

---

## 1. Fonctionnement actuel des projets sur le site public

### 1.1 La page « Histoires » (`/histoires`)
- Héros sombre (photo panoramique fondue dans la nuit), titre Anton « Des histoires qui voyagent. ».
- **Projet à la une** : le premier projet qui a du contenu, en grand (image 16:10, titre, accroche, `format · année · pays`).
- **Filtres** (CDC, 7) : Documentaires, Séries, Histoire, Patrimoine, Tourisme, En production, Archives.
  Ils **mélangent trois notions** : le format (Documentaires, Séries, Archives), le **thème** (Histoire,
  Patrimoine, Tourisme) et l'état de production (En production). Le code les rapproche à la main
  (`correspond()` : « Tourisme » = thème Gastronomie ou Littoral…).
- **Grille de cartes** 4:5 : image, titre, accroche, `format · année · pays · statut`. Un projet sans
  contenu est une carte non cliquable « À fournir ».
- Bloc « Festivals, prix et diffusions » : annoncé, vide.

### 1.2 Les projets réels et leurs pages
Six projets dans `data/projets.ts`. **Chaque page de projet est codée à la main**, il n'y a pas de gabarit :

| Projet | Format | Page | Ce qui la caractérise |
|---|---|---|---|
| X'PLORE Côte d'Ivoire | Série | `/xplore` | Héros + citation ; **bandeau panoramique 21:9** avec pastille « Saison 1 · Six épisodes de 26 minutes » ; **carte** Leaflet des étapes ; **album** des épisodes en défilement horizontal ; **film à la une** ; **guides PDF** |
| Taste & Travel | Émission | `/taste-and-travel` | Héros + citation + motif ; bandeau 21:9 avec pastilles **partenaires** (« Avec … ») ; **escales** (villes, intention) ; **programme** ; « Diffusion & partenariats » |
| Archive d'Afrique | Archive | `/archive-afrique` | Héros ; **bibliothèque d'entrées** avec niveau de fiabilité et sources ; « Rigueur éditoriale » |
| Chant des Côtes, Les Nuances du Zaouli, Sur la Route du MASA | Documentaire | **aucune** | Carte « À fournir », non cliquable |

### 1.3 Les épisodes
- Fiche `/xplore/:slug` : héros sombre sur photo, fil d'Ariane, `Eyebrow` numéroté, titre, pitch,
  « Territoire » (carte du lieu), « Carnet » (guide PDF), « Ce projet » (le voir, le programmer, le
  soutenir → contact), newsletter.
- **La fiche est écrite pour X'PLORE** : libellé « Film · lieu », mention « Documentaire » en dur,
  retour vers `/xplore`. Elle ne sait pas à quel projet elle appartient.
- Les champs longs saisis dans l'admin (synopsis long, note d'intention, personnages, making of,
  presse, crédits) **ne sont affichés nulle part** sur le site aujourd'hui.
- `/destinations/:slug` répète la même fiche avec un autre squelette (constat AUD-013).

### 1.4 Grammaire visuelle récurrente (à reprendre, pas à réinventer)
- **Héros sombre** (`night-900`) : `Eyebrow` en label-caps, titre Anton majuscules avec **point
  terracotta**, **citation Fraunces italique** filetée d'or (`border-gold-400`), texte crème atténué.
- **Bandeau panoramique 21:9** en parallaxe, dégradé nuit en bas, **pastilles** en bas à gauche.
- Alternance de fonds : nuit → sable 150 → sable → nuit ; ruban de motifs à certaines jonctions.
- Révélations douces (`Reveal`, `Stagger`), parallaxe bornée, `prefers-reduced-motion` respecté.
- Composants réutilisables : `Section`, `Container`, `Eyebrow`, `ParallaxImage`, `LazyImage`,
  `Reveal`, `Stagger`, `Breadcrumb`, `Button`, `CarteParcours` (carte), `AlbumScroll`,
  `FeaturedFilm`, `GuidesGrid` / `PdfCard`, `AfricanPattern`.

## 2. Enseignements de X'PLORE

1. **Un projet se raconte d'abord par une promesse** (citation + chiffre clé : « Six routes. Six
   histoires. ») avant ses contenus : le héros est commun à tous les projets.
2. **La structure d'une série est géographique** : les épisodes sont des étapes, la carte est le
   sommaire. Ce n'est vrai que pour une série de voyage, pas pour un documentaire unitaire.
3. **L'épisode est l'unité de contenu**, la page de projet n'en est que l'organisation (album,
   film à la une, carte).
4. **Les ressources partagées** (destinations, guides PDF) vivent hors du projet et s'y branchent.
5. **Les mentions de production** (saison, nombre et durée des épisodes) structurent l'attente.
6. Aucune page n'est générée : ajouter un projet aujourd'hui demande du code. C'est le vrai besoin.

## 3. Besoins éditoriaux et graphiques identifiés

| Besoin | Où on le voit | Conséquence |
|---|---|---|
| Un héros identitaire commun (promesse, citation, bandeau) | X'PLORE, Taste & Travel, Archive | **Socle commun** à tous les templates |
| Organiser des épisodes dans l'espace (carte, étapes) | X'PLORE | Template « série de territoire » |
| Organiser une émission par escales et partenaires | Taste & Travel | Template « programme » |
| Présenter un film unique, souvent **en préparation** | 3 documentaires sans page | Template « film » avec un état « annonce » |
| Présenter une collection documentée, non filmée | Archive d'Afrique | Template « bibliothèque » |
| Classer les projets par thème | filtres Histoire / Patrimoine / Tourisme | **Catégories de projets** (§ 9) |
| Un épisode qui connaît son projet | fiche épisode figée sur X'PLORE | Contexte du projet injecté dans le template unique d'épisode (§ 7) |

## 4. Templates proposés

> **Décisions du client (06/11/2026)** : le template **Film** reprend la présentation de X'PLORE
> dès que le projet a des épisodes ; X'PLORE est un projet de catégorie **Film**. Les anciens
> « Série de territoire » (4.1) et « Film » (4.3) ne font donc plus qu'**un seul template, Film**.
> Il reste **trois templates** : Film, Programme, Bibliothèque.

Ils partagent un **socle commun** (§ 4.5) et diffèrent par leur **corps** :

### 4.1 « Film » — référence : X'PLORE (avec épisodes) et les documentaires (sans épisode)
- **Avec épisodes** (X'PLORE) : carte des étapes (épisodes reliés à une destination avec
  coordonnées ; la carte se masque si aucune n'en a) → album des épisodes (défilement) → épisode à
  la une → guides à télécharger. Mentions : saison, nombre et durée des épisodes.
- **Sans épisode** (film unitaire) : affiche et bande-annonce → synopsis → note d'intention →
  équipe et crédits → festivals et diffusions.
- La bascule est **automatique** : rattacher un premier épisode fait passer la page à la
  présentation X'PLORE, sans changer de template ni ressaisir quoi que ce soit.
- **État « annonce »** tant que l'avancement est « en préparation » : seule l'information existante
  est montrée.

### 4.2 « Programme » — référence : Taste & Travel
- **Pour** : une émission organisée par escales et portée par des partenaires.
- **Corps** : escales (villes, intention, image) → programme (texte riche) → diffusion et
  partenaires (pastilles du bandeau + bloc final).
- **Exige** : au moins une escale ; partenaires facultatifs.
- **Différence avec la série** : ni carte ni numérotation ; la ville prime sur l'épisode.

### 4.3 « Bibliothèque » — référence : Archive d'Afrique
- **Pour** : une collection d'entrées documentées, non filmées.
- **Corps** : entrées (fiabilité, sources) avec recherche ou filtre → « Rigueur éditoriale ».
- **Exige** : des entrées publiées ; une entrée sans source n'est pas publiable (règle existante).

### 4.4 Socle commun à tous les templates
Héros (eyebrow, titre, citation, texte), bandeau panoramique avec pastilles, catégorie et
étiquettes, appel final « Le voir, le programmer, le soutenir » (déjà sur la fiche épisode).
**Un seul composant par bloc** : les templates assemblent des blocs, ils ne les dupliquent pas.

| Bloc | Film avec épisodes | Film sans épisode | Programme | Bibliothèque |
|---|:-:|:-:|:-:|:-:|
| Héros + citation + bandeau | ● | ● | ● | ● |
| Carte des étapes | ● | | | |
| Album d'épisodes | ● | | | |
| Épisode à la une / bande-annonce | ● | ● | | |
| Escales | | | ● | |
| Programme (texte riche) | | | ● | |
| Synopsis, intention, crédits | ○ | ● | | |
| Festivals et diffusions | ○ | ● | ○ | |
| Entrées documentées | | | | ● |
| Guides PDF | ● | | ○ | |
| Partenaires | ○ | ○ | ● | |

● : affiché par défaut · ○ : facultatif, activable. Les deux colonnes « Film » sont **un seul
template** : la présence d'épisodes choisit la colonne.

## 5. Choix et configuration dans l'administration

1. **Créer un projet** : depuis le hub, une carte par template, avec un **schéma visuel** de la
   page (blocs dans l'ordre, aux couleurs du site), sa phrase d'usage et un projet de référence
   (« comme X'PLORE »). Le format reste demandé et **propose** le template correspondant.
2. **Formulaire organisé par blocs du template** : le socle d'abord, puis les blocs propres ;
   chaque bloc dit ce qu'il exige (« Au moins un épisode », « Destinations avec coordonnées »).
   La liste « Il manque » existante reprend ces exigences.
3. **Blocs facultatifs** : un interrupteur « Afficher sur le site » par bloc ○. L'ordre des blocs
   est fixé par le template : c'est ce qui garantit la cohérence visuelle.
4. **Épisodes** : bloc « Épisodes du projet » (existant) — liste ordonnée par numéro, création
   préremplie, rattachement d'un épisode existant.
5. **Changer de template sans rien perdre** : les données ne sont jamais effacées. Avant
   d'appliquer, une fenêtre compare « ce qui apparaîtra / ce qui ne s'affichera plus / ce qui
   manque ». Les données non utilisées restent stockées et réapparaissent si l'on revient au
   template précédent. L'historique des versions existant permet le retour.
6. **Aperçu** : une maquette fidèle dans l'admin (blocs, vrais textes et images) tout de suite ;
   l'aperçu réel du site viendra avec le branchement de l'API (lien d'aperçu d'un brouillon).
7. **Évolution** : chaque template porte une **version**. Une évolution de mise en page n'oblige
   pas à modifier les projets ; un bloc retiré d'un template est ignoré, pas supprimé.

**Données** : le projet gagne `template` (identifiant stable, ex. `serie-territoire`) et
`blocsMasques` (liste des blocs ○ désactivés). Le contenu des blocs vient des entités existantes
(épisodes, destinations, villes, partenaires, entrées d'archive, médias) : **aucune copie**.
Quelques champs manquent au schéma actuel et doivent être validés avant d'être ajoutés (§ 8).

## 6. Rendu public

Le site lit `template` et assemble les blocs dans l'ordre du template. X'PLORE, Taste & Travel et
Archive deviennent trois projets ordinaires : leurs pages actuelles servent de **référence de
rendu** (même apparence, même ordre). Les adresses publiées ne changent pas (`/xplore`,
`/taste-and-travel`, `/archive-afrique` restent, via le champ « lien personnalisé » existant).

## 7. Les épisodes dans ce système

- **Un seul template d'épisode** (décision validée), quel que soit le projet.
- Il reçoit le **contexte de son projet** : titre et lien de retour du projet, format, libellé
  de numérotation (« Saison 1 · Épisode 3 »), fil d'Ariane. C'est ce qui manque aujourd'hui
  (fiche figée sur X'PLORE).
- Il affiche **les champs déjà saisis** et aujourd'hui invisibles (synopsis long, note d'intention,
  personnages, making of, presse, crédits), chacun masqué s'il est vide.
- Le template du projet décide seulement **comment la liste des épisodes est présentée** sur la page
  du projet (carte et album pour une série, liste de parties pour un film), jamais la fiche épisode.
- La fiche destination devient une donnée (carte, guide) plutôt qu'une seconde page d'épisode.

## 8. Décisions

### 8.1 Tranchées par le client (06/11/2026)
- Template **Film** = présentation X'PLORE quand le projet a des épisodes ; présentation « film
  unitaire » sinon. Trois templates : Film, Programme, Bibliothèque.
- Catégories des projets existants : **X'PLORE → Film**, **Taste & Travel → Tourisme**,
  **Archive d'Afrique → Patrimoine**.
- **Les catégories affichées sur le site public sont celles que l'admin crée** ; les filtres
  publics sont construits à partir d'elles. Même règle pour les catégories de bijoux et de livres
  d'EDJA Shop.

### 8.2 Encore ouvertes (défaut proposé entre parenthèses)
1. **Template choisi ou déduit du format ?** Les documents validés disent « déduit du format »
   (SCHEMAS § 5.1, D12). *(Défaut : choisi par l'admin, proposé selon le format.)*
2. **Nouveaux champs** (absents de SCHEMAS) : citation du héros, image panoramique, saison et
   durée des épisodes, programme, partenaires d'un projet, festivals et diffusions. *(Défaut :
   les ajouter, facultatifs.)*
3. **Catégorie des trois documentaires** (Chant des Côtes, Les Nuances du Zaouli, Sur la Route du
   MASA). *(Défaut : Film.)*
4. **Aperçu**. *(Défaut : maquette dans l'admin maintenant, aperçu réel au branchement de l'API.)*
5. **Qui masque les blocs facultatifs**. *(Défaut : l'admin et l'éditeur, comme le reste du
   contenu ; la publication reste à l'admin.)*
6. **Fiche destination** (AUD-013). *(Défaut : la fondre dans la fiche épisode.)*

## 9. Catégories (projets, articles, produits)

### 9.1 La règle
Une seule source : **les catégories créées dans l'admin** (Boutique › Catégories, trois sections).
Le site public n'en code aucune en dur. Il affiche une catégorie seulement si elle est visible et
porte au moins un contenu publié (RG-31), et **construit ses filtres à partir de cette liste**,
dans l'ordre réglé dans l'admin. Une catégorie créée dans l'admin apparaît donc dans le filtre
public dès qu'un contenu publié la porte ; une catégorie masquée ou vide disparaît.

### 9.2 Ce que ça change, page par page

| Page publique | Aujourd'hui | Avec la règle |
|---|---|---|
| `/histoires` (projets) | 7 filtres écrits en dur, rapprochés à la main (`correspond()`) | filtres = catégories de projets de l'admin ; format et avancement restent des filtres à part |
| `/journal` (articles) | liste `CATEGORIES_JOURNAL` en dur | filtres = catégories d'articles de l'admin |
| `/boutique` (bijoux et livres) | liste `CATEGORIES_SHOP` en dur, filtrée aux non vides | filtres = catégories de produits de l'admin, avec effectifs (déjà la forme de `obtenirProduits`) |

Les listes en dur deviennent les **données de départ** de l'admin (amorçage), puis ne servent plus
que de secours en développement (`PUBLIC_DATA_SOURCE=mock`, LIAISON § C.2).

### 9.3 Départ proposé
- **Articles** : les 8 du CDC, déjà semées dans l'admin.
- **Produits** : les 8 du CDC, déjà semées.
- **Projets** : **Film, Tourisme, Patrimoine** (vos trois décisions). D'autres, comme « Histoire »
  (présente dans les filtres actuels), seront créées par l'admin si besoin : rien n'est ajouté sans lui.

### 9.4 Déjà fait / reste à faire
- **Fait (admin, faux serveur)** : trois familles, écran en trois sections, catégorie dans les
  formulaires d'article, de projet, de bijou et de livre, filtres dans les listes, règles
  « bonne famille » et « catégorie utilisée non supprimable ».
- **Fait (admin, faux serveur)** : Film, Tourisme, Patrimoine semées ; projet d'exemple rattaché à Film.
- **Fait (site, 06/11/2026, données locales)** : `src/data/categories.ts` (les catégories de départ,
  par famille) et `src/lib/categories.ts` (`categoriesAffichees` : visibles, non vides, ordre de
  l'admin). `/histoires`, `/journal` et `/boutique` construisent leurs filtres avec cette fonction.
  Les six projets portent `categorie` et `template`. Au branchement (mission 3), seul le contenu de
  `src/data/categories.ts` sera remplacé par `GET /public/api/v1/categories?famille=`.
- **Écart avec le § 9.2** : `/histoires` n'a plus de filtre de format ni d'avancement (Documentaires,
  Séries, Archives, En production). Le format et l'avancement restent écrits sur chaque carte. Une
  seconde rangée de filtres pourra être ajoutée si le client la demande.
- **Reporté au branchement** : un rendu générique par template pour les nouveaux projets, et le
  contexte du projet sur la page d'épisode (aujourd'hui écrite pour X'PLORE). Les pages X'PLORE,
  Taste & Travel et Archive restent les rendus de référence et n'ont pas été modifiées.
- **Back end** : D1 (famille de catégorie, unicité par famille, route publique).
