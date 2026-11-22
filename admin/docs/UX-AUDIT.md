# Audit UX/UI — administration Prince Edja

> Grille de travail du chantier « lisibilité, espacements et simplicité » (demande du
> client, 12/11/2026). Constat visuel sur neuf écrans principaux (Playwright, résolution
> 1440×1100, données de développement réelles). Ce fichier documente le constat et les
> conventions retenues ; la mise en œuvre est progressive : rien n'est supprimé,
> seule la présentation change.

## 1. Constats (écrans examinés)

| Écran | Ce qui se voit | Ce qui gêne |
|---|---|---|
| **Tableau de bord** (`/`) | Compteurs « à faire », dernière publication, programmé, activité récente | Bannière d'accueil dense (trois phrases) ; liste d'activité récente très répétitive (10 lignes identiques) ; colonne droite inoccupée |
| **Articles** (`/articles`) | Onglets + fil d'Ariane + h1 + bouton « Nouvel article » + filtres + grille de cartes | Deux niveaux d'intitulé concurrents (onglet actif « Articles » et h1 « ARTICLES ») ; cartes denses (trois lignes de texte avant les actions) |
| **Projets** (`/projets/liste`) | Filtres + grille de cartes projets | Même double phrase titre/onglet, cartes « Affiche manquante » très visuelles mais sans distinction hiérarchique entre infos |
| **Médiathèque** (`/medias`) | Grille de 40 médias, recherche + filtres, envoi | **Écran le plus chargé** : chaque carte répète « Sans texte alternatif » ×2, le libellé « Texte alternatif (FR) », pastille « À compléter », usages et emplacement — information atomique mais empilée verticalement |
| **Catégories / Projets** (`/projets/categories`, `/articles/categories`) | Liste de lignes avec re-order | Descriptif inutile (« Facultative. », glissez-déposer) plutôt fourni sous chaque section |
| **Hub Projets** (`/projets`) | Deux cartes de création + Moteur de rendu | Bien. Sous-titre explicatif sous le h1 redondant avec les cartes |
| **Épisodes d'un projet** | Grille de cartes épisodes | Bon état depuis la refonte (12/11) ; la carte affiche le nombre d'épisodes et les actions de façon explicite |
| **Boîte de réception** | Liste de messages | Fil d'Ariane + h1 + descriptions corrects ; rien de lourd |
| **Réglages** (`/reglages`) | Formulaire de paramètres globaux | Beaucoup de titres de sections, descriptions denses (« Langues, conservation des messages, destinataires et règles de publication du site. » acceptable mais à resserrer) |

## 2. Conventions retenues (appliquées dès cette livraison)

1. **Un titre, une action.** Le fil d'Ariane et l'onglet actif disent déjà où l'on est ;
   l'en-tête n'a qu'un `h1`. La description est facultative et fait **une ligne** ;
   elle ne répète jamais le titre.
2. **Descriptions ≤ 100 caractères**, tournure d'action, jamais de « cette section vous
   permet de… ».
3. **Rythme vertical unique** : `space-y-6` entre sections d'une page, `space-y-2`
   titre→contenu, fil d'Ariane→`h1` 8 px, `gap-4` entre cartes, `p-5` à l'intérieur des
   cartes de contenu, `p-4` dans les cadres de filtres. Aucun écran ne crée un niveau
   propre.
4. **Hiérarchie typographique** figée : `font-display` majuscules (SORTO) pour les
   titres de page et de section, `label-caps` pour les marqueurs, `text-body` pour le
   texte, `text-caption` pour l'information secondaire — aucune taille hors échelle.
5. **Carte = information + action** : le titre, une ligne de statut, une ligne de contexte,
   les actions en bas. Toute information strictement utilitaire (badge d'état) tient sur
   une ligne ou un chip, jamais empilée.
6. **Microcopy** : verbes à l'impératif ou nominal direct, pas de politesse d'interface
   (« veuillez », « vous pouvez »…), erreurs courtes : ce qui s'est passé + quoi faire.
7. **Aucun changement de couleurs, de typographie ou d'identité** (consigne client).
8. **Aucune fonctionnalité supprimée** ; chaque réécriture préserve la clé de libellé
   et couvre un test.

## 3. Mises en œuvre de cette livraison (12/11/2026)

- Bannière d'accueil du tableau de bord : trois consignes réduites à l'essentiel.
- Descriptions de section (projets, tags, articles, catégories, guides, motifs,
  paramètres, textos d'interface, navigation, sur le site, audience, variante) :
  resserrées à une ligne, tournure d'action.
- `hub.sousTitre`, `projet.supprimerTexte`, `categorie.supprimerTexte`,
  `conflit.texte`, `definir.succes`, `projet.formatAide` et `erreurs 403/500`
  réécrits dans la même logique.
- **Activité récente** du tableau de bord : une ligne par entrée (titre tronqué à
  56 caractères, pastille, date, auteur), au lieu de deux lignes empilées.
- Médiathèque : carte resserrée (libellé « Texte alternatif » court, la ligne
  usages + emplacement passe de deux à une ligne, capsules de largeur retirée).
- Rythme vertical unifié sur toutes les pages : `space-y-6` partout (plusieurs
  écrans utilisaient `space-y-10` ou `space-y-8` sans raison).
- Espace de travail `docs/UX-AUDIT.md` créé ; test de régression
  `src/i18n/microcopie.test.ts` ajouté (8 cas : aucun texte vide, motifs verbose
  interdits — « Veuillez », « vous pouvez »…, plafond de 175 caractères par
  libellé, borne de 115 caractères pour les libellés réécrits).
- Vérifications : typecheck OK, lint `--deny-warnings` OK, **293/293** tests,
  build OK (verifier-dist : 108 fichiers contrôlés). Revue visuelle en direct
  (avant/après) sur tableau de bord et médiathèque ; captures conservées dans
  `/tmp/ux-*.png` pendant la session — à archiver si besoin avant le prochain
  commit, si le dépôt doit garder des visuels de conception.

## 4. Ce qui reste (dit honnêtement, pour arbitrer)

1. **Grille des cartes projets** : hiérarchie interne des badges (Publié · Nombre
   d'épisodes · créés le) à compacter en chips.
2. **Médiathèque** : repenser la carte sur deux colonnes d'information plutôt qu'une
   pile verticale ; réduire le bouton « Enregistrer » (icône seule ou
   « Enregistrer » au lieu de deux éléments visuels).
3. **Niveau mobile (≤ 640 px)** : les en-têtes flex-wrap poussent parfois le bouton
   principal sous le titre ; à valider écran par écran sur téléphone réel.
4. **Fiche projet** : l'en-tête projet sur écran < 640 px doit être testée sur
   téléphone réel.
5. **Barre inférieure fixe (mobile)** : recouvre naturellement le contenu sous le pli
   (comportement attendu) ; le `pb-24` du contenu le compense en bas de page.
   À arbitrer si besoin : `pb-28` pour plus de confort.
6. **Labels de formulaires** : certains libellés longs (« Texte alternatif (FR) » en
   fiche) restent verboses dans d'autres écrans (FicheMédia, formulaire article…) ;
   même convention à appliquer écran par écran.
7. **Danger** : les actions destructives (« Supprimer ») sont discrètes — à vérifier
   sur chaque carte/confirmation.
8. Les **captures de réception** (avant/après) restent à archiver dans
   `admin/docs/ux/` une fois la refonte complète appliquée.
9. **Règles finales** : aucun écran n'a perdu de fonctionnalité ni d'axe d'information
   métier ; la règle complète (« aucun changement de couleurs ou de typographie »)
   tient — aucun token de la palette n'a été modifié.
