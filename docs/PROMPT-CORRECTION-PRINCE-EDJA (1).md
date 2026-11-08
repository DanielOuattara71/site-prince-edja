# PROMPT DE CORRECTION — Admin et back end de Prince EDJA

> **Mode d'emploi (pour Yann, ne fait pas partie du prompt).**
> 1. Donne à l'IA, dans cet ordre : ce fichier, puis `DOCUMENTATION-GUIDE-IA-PRINCE-EDJA.md`, puis le dossier du projet (admin et back end).
> 2. Elle doit répondre **uniquement par l'étape C0** (état des lieux). Lis sa réponse, puis dis « continue » pour chaque étape suivante.
> 3. À chaque étape, les tests doivent être verts avant de passer à la suivante.
> 4. Rien n'est supprimé avant l'étape C9, et seulement si tu le confirmes.

---

## 1. Ton rôle et la règle d'or

Tu es l'ingénieur qui **corrige** l'administration et le back end de Prince EDJA. Le développement a déjà bien avancé. Cette mission **ne repart pas de zéro** : elle simplifie ce qui est trop chargé, améliore l'expérience utilisateur, remplace le stockage R2 par Cloudinary, et ajoute ce qui manque.

**Règle d'or : on ne casse rien et on ne supprime rien sans avoir prouvé que c'est inutile.**

- Avant la moindre modification : crée une branche `simplification-admin` et pose un tag `avant-simplification` sur l'état actuel.
- Chaque étape se termine par : lint, vérification de types, tests, build. Si l'un échoue, tu répares avant de continuer.
- **Aucune table de la base n'est supprimée dans cette mission.** Aucune migration existante n'est modifiée : tu ajoutes de nouvelles migrations (montée et descente).
- **Aucun fichier de code n'est supprimé avant l'étape C9.** Avant, on retire du menu et des routes ; le code reste en place.
- Le contrat d'API existant (documents de l'admin et du back end) **reste valable**. Tout changement de contrat est listé en section 8 et nulle part ailleurs.
- Quand une information manque, tu ne l'inventes pas : tu la notes dans `docs/QUESTIONS.md` et tu continues avec la solution la plus prudente.

## 2. Contexte : ce qui existe aujourd'hui

**Site public** : React, TypeScript, Vite, Tailwind 4. Trois lots : Prince EDJA, EDJA Shop, Projets et Histoires. Il n'est pas modifié par cette mission.

**Admin** (application séparée) : React, TypeScript, Vite, Tailwind 4, React Router, TanStack Query, react-hook-form et zod, TipTap pour l'éditeur de texte, dnd-kit pour le glisser-déposer, MSW pour le faux serveur de développement. Elle contient 18 familles d'écrans dans `src/features/` et un menu de 33 entrées (`src/components/layout/navigation.ts`).

**Back end** : Node, TypeScript, Fastify, Zod, PostgreSQL avec Drizzle, pg-boss pour les tâches, sharp pour les images, Brevo pour les e-mails. 16 modules dans `src/modules/`. Les médias passent par l'interface `Stockage` (`src/stockage/stockage.ts`) qui a trois réalisations : R2 en production, disque local en développement, mémoire en test.

**Rôles** : `editeur`, `admin`, `super_admin`, `vendeur`. Le super-admin est le développeur ; le client est `admin`.

**Multi-vendeurs** : toujours d'actualité. Il reste verrouillé derrière le réglage `multiVendeurs` (faux par défaut, modifiable par le super-admin seulement). Les phases vendeur (paiement, reversements) restent préparées et non activées.

## 3. Ce qui ne change pas (à protéger)

Tu ne modifies ni la logique ni les tests de :

1. **Authentification** : sessions par cookie, jeton CSRF, mots de passe hachés, invitation, réinitialisation, verrouillage par inactivité.
2. **Permissions** : la fonction `peut(ressource, action)` côté admin et `droits/peut.ts` côté back end. Un menu ne teste jamais un rôle en dur.
3. **Cloisonnement** : les trois barrières (interface, service, règles de sécurité PostgreSQL par ligne). Un vendeur qui demande l'objet d'un autre reçoit 404.
4. **Cycle de vie des contenus** : brouillon, en relecture, publié, programmé ; validation par l'administrateur seul ; concurrence par `version` (409 `VERSION_PERIMEE`) ; versions et restauration.
5. **Publication** : le déclenchement de la reconstruction du site, les rappels `/internal/api/v1/publication/demarrage|termine` protégés par `X-Build-Secret`, le regroupement des reconstructions.
6. **Journal d'audit**, tâches planifiées (purges de conservation, messages 24 mois, abonnés non confirmés), courriels Brevo.
7. **Traitement des images** par sharp : validation, retrait des métadonnées, déclinaisons WebP, dimensions maximales.
8. **Règles de gestion RG-01 à RG-28** et leurs tests.
9. **Jetons de design** de l'admin (copie des jetons du site public, contrôlée par `src/test/jetons.test.ts`).
10. **Faux serveur MSW** et ses données d'essai : ils continuent de servir au développement.

## 4. Vue d'ensemble des changements

| # | Changement | Où |
|---|---|---|
| 1 | Menu de 33 entrées → 9 entrées, avec écrans regroupés en onglets | Admin |
| 2 | Expérience utilisateur : 14 améliorations (section 6) | Admin |
| 3 | Stockage R2 → Cloudinary (images et PDF) | Back end (et configuration) |
| 4 | Nouveau : emplacements fixes de photos du site, et onglet « Sur le site » | Back end et admin |
| 5 | Retrait de l'admin : Navigation, Textes d'interface, Motifs de contact, Univers, Jalons, Offres, Études de cas, Pages du site, page de démonstration | Admin (menu et routes), back end (routes d'écriture) |
| 6 | Conservation : Audience, Partenaires, Pages légales, Identité et paramètres, Créateurs, Étiquettes | Admin |
| 7 | Renommage : « Journal » (articles) et « Activité » (ancien « Journal » d'audit) | Admin |
| 8 | Décision en attente : lettre d'information (voir section 9) | — |

## 5. Admin — nouvelle organisation

### 5.1 Le principe des groupes d'écrans

**Ne change pas les adresses des écrans existants.** Ajoute un composant `GroupeEcrans` (barre d'onglets) affiché au-dessus de chaque écran d'un même groupe. Une entrée de menu pointe vers le premier onglet du groupe et reste surlignée quand on est dans n'importe lequel des onglets. Ainsi, un formulaire comme `/episodes/:id` continue d'exister et fonctionne.

Le menu reste déclaré à **un seul endroit** (`navigation.ts`), avec une structure `MENU: EntreeMenu[]` où chaque entrée a : `libelle`, `icone`, `chemin` (premier onglet), `onglets: { libelle, chemin, ressource, action }[]`, et la ressource/action qui la rendent visible via `peut()`. Un onglet invisible pour le rôle n'est pas affiché ; une entrée sans onglet visible n'est pas affichée non plus.

### 5.2 Les 9 entrées

| Entrée | Onglets (route existante) | Notes |
|---|---|---|
| **Tableau de bord** | — (`/`) | Voir 6, U10. |
| **Journal** | Articles (`/articles`) | Ancien « Journal » d'audit renommé en « Activité ». |
| **Projets** | Projets (`/projets`), Épisodes (`/episodes`), Destinations (`/destinations`), Villes (`/villes`), Archive (`/archive`) | Le champ « guide PDF » est déjà sur la destination et sur l'épisode. Archive d'Afrique : voir 5.4. |
| **Boutique** | Bijoux (`/bijoux`), Catégories (`/categories`), Créateurs (`/createurs`) | Les créateurs sont **toujours visibles**. Les comptes vendeur restent conditionnés à `multiVendeurs`. |
| **Médiathèque** | Tous les fichiers (`/medias`), Sur le site (`/galerie`, voir 5.3) | Un seul endroit pour les photos. |
| **Preuves et presse** | Audience (`/audience`), Distinctions (`/distinctions`), Presse (`/presse`), Partenaires (`/partenaires`) | Alimente la section « Preuves » de l'accueil. |
| **Boîte de réception** | Messages (`/messages`), Demandes (`/demandes`), Abonnés (`/abonnes`) | L'onglet Abonnés ne change pas (voir 9). |
| **Réglages** | Identité et paramètres (`/parametres`), Pages légales (`/pages-legales`), Étiquettes (`/tags`) | Les interrupteurs `boutiqueEnLigne` et `multiVendeurs` restent réservés au super-admin. |
| **Technique** | Publication (`/publication`), Activité (`/activite`), Comptes (`/comptes`) | Visible pour `admin` et `super_admin`. |

### 5.3 « Sur le site » (onglet de la Médiathèque)

Deux zones sur un même écran :

1. **Galeries** : galerie de l'accueil et galerie de la boutique (table `galerie_image` existante, champ `emplacement`). Liste réordonnable par glisser-déposer, ajout par choix dans la médiathèque, légende, lien. Réutilise les composants existants (`ListeOrdonnable`, sélecteur d'image).
2. **Emplacements fixes** (nouveau, voir 7.3) : une carte par emplacement avec son nom clair, le format conseillé, un aperçu et un bouton « Changer la photo ». On ne peut ni créer ni supprimer d'emplacement.

Règles : un texte alternatif est exigé pour chaque langue active avant d'assigner un média ; un média assigné ne peut pas être supprimé (déjà garanti par `restrict`).

### 5.4 Archive d'Afrique

L'entité `archive_entree` (avec ses sources) **reste en place**. Dans l'admin, elle devient un onglet **« Archive »** du groupe Projets. On n'ajoute pas d'entrée de menu. Ne fusionne pas `archive_entree` dans `projet`. Le format « Archive » du projet existe déjà (enum `format_projet`) et décrit la mise en page publique d'un projet, pas ses entrées.

### 5.5 Ce qui sort du menu et des routes

Retire du menu et des routes de l'admin (les écrans répondent « Introuvable ») :

`/navigation`, `/textes-interface`, `/motifs-contact`, `/univers`, `/jalons`, `/offres`, `/etudes-cas`, `/pages`, `/demo`, et `/journal` (ancienne adresse de l'audit, qui devient `/activite`, avec une redirection de l'ancienne adresse).

**Ne supprime pas les fichiers** dans cette étape. Les éléments retirés du menu sont recensés dans `docs/ELEMENTS-RETIRES.md` (nom, fichiers concernés, routes, tables, tests liés) pour la décision de l'étape C9.

## 6. Admin — améliorations de l'expérience utilisateur

Chaque point est livré avec un test (composant ou parcours) qui prouve le comportement.

| # | À faire | Critère d'acceptation |
|---|---|---|
| U1 | Menu à 9 entrées, une icône chacune, en quatre blocs : Contenus (Journal, Projets), Boutique, Public (Médiathèque, Preuves et presse, Boîte de réception), Réglages (Réglages, Technique). | Le menu tient dans une fenêtre de 900 px de haut sans défilement. |
| U2 | **Un seul** sélecteur Français / Anglais en haut des formulaires bilingues. Un badge indique la langue incomplète. Le contenu de l'autre langue est conservé en changeant. | Un formulaire d'article n'a qu'un jeu d'onglets de langue. |
| U3 | Le slug est **généré à partir du titre** et rangé dans une section repliée « Avancé » (avec les champs SEO). Il reste modifiable. | À la création, l'utilisateur ne voit pas le slug sauf en dépliant « Avancé ». |
| U4 | Recherche **instantanée** dans les listes (délai de 300 ms), sans bouton « Chercher ». Trois filtres au maximum : statut, catégorie ou type, langue. Les autres filtres passent dans un menu « Plus de filtres ». | Taper dans la recherche filtre la liste sans clic. |
| U5 | Vocabulaire : « À fournir » → « À compléter » ; « Traduction » → « Langues » ; « usage(s) » → « utilisé à N endroit(s) » ; « tags » → « étiquettes » ; « slug » → « adresse de la page ». Tous les textes passent par `i18n/fr.ts`. | Aucun de ces mots ne subsiste dans l'interface (test sur le dictionnaire). |
| U6 | **Enregistrement automatique** des brouillons toutes les 30 secondes après une modification, message « Enregistré à 14 h 32 », avertissement avant de quitter avec des changements. L'enregistrement automatique n'écrit **que** des brouillons : jamais une publication. | Test : modifier, attendre, vérifier l'appel et le message ; quitter déclenche l'avertissement. |
| U7 | **Liste de ce qui manque** avant publication (« Il manque : image principale, texte alternatif en anglais »), avec un lien qui place le curseur sur le champ. Le bouton « Publier » reste actif mais explique le blocage au lieu d'échouer. | Le message reprend exactement les règles RG-03. |
| U8 | Chaque formulaire n'affiche que **les étiquettes qui le concernent**. Ex. : un bijou ne propose pas l'étiquette de format « Article ». | Test sur le formulaire bijou. Si le back end ne sait pas filtrer, ajouter un paramètre `contexte` à la lecture des étiquettes (section 8). |
| U9 | Médiathèque : vignettes plus grandes, texte alternatif **saisi directement dans la grille**, envoi par glisser-déposer de plusieurs fichiers, suppression refusée avec la liste des endroits qui utilisent le fichier. | Envoi de 3 fichiers d'un coup, texte alternatif modifié sans ouvrir la fiche. |
| U10 | Tableau de bord orienté action : cartes « 3 contenus à relire — Ouvrir », « Mes brouillons », messages et demandes non lus, état du site avec bouton « Mettre le site à jour », raccourcis « Écrire un article », « Ajouter un bijou », « Envoyer une photo ». Ce que l'éditeur voit se limite à ses permissions. | Chaque carte mène à la liste déjà filtrée. |
| U11 | Mobile : barre inférieure de quatre raccourcis (Journal, Boutique, Boîte de réception, Plus) ; « Plus » ouvre le menu complet de 9 lignes. Cibles tactiles de 44 px minimum. | Test à 390 px de large : aucun défilement horizontal. |
| U12 | Première connexion : message d'accueil en trois étapes que l'on peut fermer, et texte d'aide court sous chaque champ non évident. | L'accueil n'apparaît qu'une fois par compte. |
| U13 | Messages d'état et d'erreur clairs, en français : ce qui s'est passé, puis quoi faire. Plus de codes techniques affichés. | Chaque code d'erreur de l'API a un message dans `i18n/fr.ts` (test de couverture). |
| U14 | Actions destructrices : confirmation avec le **nom** de l'élément. Suppression « douce » récupérable : étape optionnelle C8, voir 7.5. | La boîte de confirmation cite l'élément. |

Les composants existants (`BoiteDialogue`, `Onglets`, `Alerte`, `Etats`…) sont réutilisés. N'en crée un nouveau que si aucun ne convient.

## 7. Back end — changements

### 7.1 Cloudinary à la place de R2

**Ce qui reste** : l'interface `Stockage` (`deposer`, `supprimer`), le disque local en développement, la mémoire en test, la colonne `cle_stockage`, le traitement sharp et le contrat d'API des médias (`url`, `declinaisons`).

**Ce qui change**

1. **`stockage/stockage.ts`** : remplace la classe `StockageR2` par `StockageCloudinary`. Pas de nouvelle dépendance : appels HTTP signés avec `fetch` et le module `node:crypto`.
   - **Dépôt** : `POST https://api.cloudinary.com/v1_1/<CLOUDINARY_CLOUD_NAME>/<type>/upload` avec `multipart/form-data` : `file`, `api_key`, `timestamp`, `public_id`, `overwrite=false`, `signature`.
   - **Signature** : SHA-1 de la chaîne des paramètres signés triés par nom (`overwrite`, `public_id`, `timestamp`, hors `file` et `api_key`), au format `nom=valeur&nom=valeur`, suivie du secret `CLOUDINARY_API_SECRET`. Un test vérifie la signature sur un exemple fixe.
   - **Type de ressource** : `image` pour les images, `raw` pour les PDF (déduit du type MIME au dépôt, de l'extension de la clé à la suppression).
   - **Identifiant public** : `<CLOUDINARY_DOSSIER>/<clé sans extension>` pour les images ; `<CLOUDINARY_DOSSIER>/<clé avec extension>` pour les PDF (exigence de Cloudinary pour le type `raw`).
   - **Suppression** : `POST .../<type>/destroy` avec `public_id`, `timestamp`, `signature`, `invalidate=true`. Une ressource déjà absente (« not found ») compte comme réussie.
   - Délai maximal de 30 secondes par appel (`AbortSignal.timeout`), comme aujourd'hui. Une réponse non réussie lève une erreur qui ne contient **jamais** le secret ni la signature.
2. **URL publique** : crée une fonction unique `urlPublique(cle, config)` dans le module de stockage, et remplace l'usage de `R2_PUBLIC_BASE_URL` dans `modules/medias/service.ts` (ligne de `const url = …`) et dans `http/serveur.ts` (route de développement `/medias-dev`).
   - Production : `<MEDIA_PUBLIC_BASE_URL>/<image|raw>/upload/<dossier>/<clé>`, avec par défaut `MEDIA_PUBLIC_BASE_URL = https://res.cloudinary.com/<CLOUDINARY_CLOUD_NAME>`.
   - Développement : comportement actuel (fichiers servis par l'API).
3. **Configuration** (`config/configuration.ts`) : supprime `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_BASE_URL` ; ajoute `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_DOSSIER` (défaut `prince-edja`), `MEDIA_PUBLIC_BASE_URL` (facultatif). Les variables Cloudinary sont **obligatoires en production seulement** ; aujourd'hui les variables R2 sont exigées dans tous les environnements, ce qui oblige à des valeurs factices en développement : corrige-le.
4. **Dépendances** : retire `aws4fetch` s'il n'est plus utilisé ailleurs (vérifie d'abord).
5. **`.env.exemple`, README et `docs/DEPLOIEMENT.md`** : remplace les variables R2 et explique la création du compte Cloudinary (section 3 de la documentation guide).
6. **Migration des fichiers existants** : s'il existe déjà des fichiers dans R2 (à confirmer à l'étape C0), écris `cli/migrer-stockage.ts` qui lit chaque `cle_stockage` en base, télécharge depuis R2 et dépose dans Cloudinary, sans toucher à la base (les clés ne changent pas). Sinon, ne l'écris pas.
7. **Sécurité** : les envois restent **uniquement côté serveur** (aucun préréglage d'envoi non signé, aucun envoi direct depuis le navigateur). Le secret n'apparaît ni dans les journaux, ni dans les erreurs, ni dans le code de l'admin.

**Limites à vérifier dans le compte Cloudinary** (à consigner dans `docs/QUESTIONS.md` si tu ne peux pas les vérifier) :
- La livraison des **PDF** peut être restreinte par défaut sur un compte récent : elle s'active dans les paramètres de sécurité du compte (« PDF and ZIP files delivery »).
- Les **poids maximaux** des fichiers dépendent de l'offre. Sur l'offre gratuite, la limite est de l'ordre de 10 Mo pour une image et pour un fichier `raw`. La variable `MEDIA_POIDS_MAX_PDF_MO` vaut 25 par défaut : ramène-la à la limite réelle de l'offre choisie.
- Le **quota** de l'offre (crédits mensuels de stockage et de bande passante) : chaque image est stockée en plusieurs largeurs, ce qui multiplie le stockage. Si le quota devient un problème, une étape ultérieure remplacera les déclinaisons par des transformations d'URL (`w_800,f_auto,q_auto`), sans changer le contrat d'API. **Ne le fais pas dans cette mission.**

### 7.2 Tests Cloudinary

- Test unitaire de la signature (exemple fixe).
- Test de `StockageCloudinary` avec un `fetch` simulé : dépôt d'une image, dépôt d'un PDF (type `raw`), suppression, suppression d'une ressource absente, erreur réseau, délai dépassé.
- Test de `urlPublique` pour une image, un PDF et le développement.
- Les tests existants de la médiathèque (envoi, panne simulée, purge à 24 h) restent verts **sans modification**.

### 7.3 Emplacements fixes de photos du site (nouveau)

**Migration** `NNNN_emplacement_photo` (montée et descente) : table `emplacement_photo`

| Colonne | Type | Notes |
|---|---|---|
| `cle` | texte, clé primaire | ex. `accueil.heros` |
| `libelle` | texte | nom clair affiché dans l'admin |
| `format_conseille` | texte | ex. « 2000 × 1200, paysage » |
| `media_id` | uuid, nul | référence `media(id)`, `on delete restrict` |
| `mis_a_jour_le` | horodatage | |
| `mis_a_jour_par` | uuid, nul | référence au compte |

Colonnes de contenu habituelles non nécessaires : cette table n'a ni statut ni traduction ; le texte alternatif vient du média.

**Emplacements semés** (script d'amorçage, idempotent). La liste ci-dessous vient du site public ; **vérifie-la en lisant le dossier `images/` et `src/data/site.ts` du site** et corrige-la (note les écarts dans `docs/QUESTIONS.md`) :

`accueil.heros`, `apropos.portrait`, `apropos.photo-1` … (autant que le site en utilise), `presse.portrait-hd`, `collaborations.photo`, `partage.og` (image de partage sur les réseaux), `remplacement.paysage`, `remplacement.foret`, `remplacement.fleuve`, `remplacement.carre`, `mascotte.visuel`.

**API admin** (`/admin/api/v1/emplacements-photos`), dans le style des modules existants :
- `GET` : liste des emplacements avec le média assigné (URL, texte alternatif, déclinaisons).
- `PUT /:cle` : corps `{ mediaId: uuid | null }`. Règles : le média existe et est une image ; il a un texte alternatif pour **chaque langue active** (RG-08), sinon 422 avec le code d'erreur de validation habituel ; l'action est écrite au journal d'audit ; elle déclenche une reconstruction du site (RG-19).
- Permissions : ressource `emplacements-photos` ; lecture pour `editeur`, `admin`, `super_admin` ; modification pour `admin` et `super_admin` (et `editeur` si le client le décide : note-le dans `docs/QUESTIONS.md`).

**API publique** : ajoute les emplacements à la lecture publique utilisée à la construction du site (`/public/api/v1/site/photos`), avec URL et textes alternatifs par langue. Le site public continue de fonctionner avec ses images actuelles tant qu'il n'est pas branché : **le branchement du site public est hors périmètre** (voir section 11).

**Faux serveur MSW de l'admin** : ajoute les mêmes routes et des données d'essai.

### 7.4 Retrait des écritures pour les entités sorties de l'admin

Pour `univers`, `jalons`, `offres`, `etudes-cas`, `pages`, `navigation`, `textes-interface`, `motifs-contact` :
- **Ne supprime pas** les tables, les schémas, les données d'amorçage ni les lectures publiques.
- Désenregistre les routes d'**administration** (écriture et lecture) de ces ressources, ou protège-les derrière un réglage interne désactivé par défaut. Choisis la solution qui casse le moins de tests, et explique ton choix dans `docs/ELEMENTS-RETIRES.md`.
- Les tests qui portent sur ces routes sont marqués `skip` avec la raison, **pas supprimés**.
- Conserve la lecture publique : le site de production lit peut-être encore ces données.

### 7.5 Suppression douce (étape optionnelle C8)

À ne faire que si toutes les autres étapes sont vertes **et** que Yann l'a confirmé. Ajoute `supprime_le` (horodatage nul) aux contenus principaux (articles, épisodes, projets, destinations, bijoux). Une suppression marque la ligne ; les lectures ordinaires l'ignorent ; une tâche planifiée purge après 30 jours ; l'admin propose « Restaurer » dans l'onglet de l'élément. Les médias ont déjà une suppression différée de 24 h : ne la change pas.

### 7.6 Étiquettes filtrées par contexte (U8)

Si la lecture des étiquettes ne sait pas filtrer, ajoute un paramètre optionnel `contexte` (`article`, `episode`, `projet`, `destination`, `bijou`, `ville`) qui renvoie uniquement les types d'étiquettes pertinents. Sans ce paramètre, le comportement actuel est inchangé.

## 8. Changements de contrat d'API (liste exhaustive)

| Changement | Nature |
|---|---|
| `GET/PUT /admin/api/v1/emplacements-photos` | Ajout |
| `GET /public/api/v1/site/photos` | Ajout |
| Paramètre `contexte` de la lecture des étiquettes | Ajout facultatif |
| Routes admin de univers, jalons, offres, etudes-cas, pages, navigation, textes-interface, motifs-contact | Retrait (écriture et lecture admin) |
| Adresse admin de l'audit : `/admin/api/v1/journal` devient `/admin/api/v1/activite` | Renommage ; l'ancienne adresse répond 308 pendant une version |
| Champs `url` des médias | **Même forme**, nouvelle origine (Cloudinary) |

Tout autre changement de contrat est interdit dans cette mission. Mets à jour le fichier OpenAPI généré et le contrat documenté.

## 9. Décision en attente : lettre d'information

Yann n'a pas encore choisi entre :
- **Option 1** : l'envoi de la lettre se fait dans Brevo (aucun développement) ;
- **Option 2** : un onglet « Lettre » dans la Boîte de réception pour écrire, prévisualiser, tester et envoyer via l'API Brevo.

**Dans cette mission, ne développe ni l'une ni l'autre.** L'onglet Abonnés reste tel quel (liste, statuts, consentement, export, synchronisation Brevo). Prévois seulement que l'ajout d'un onglet à la Boîte de réception ne demande qu'une ligne dans `navigation.ts`.

## 10. Multi-vendeurs : ce qu'il faut préserver

- Les créateurs sont visibles dans la Boutique en tout temps. Les comptes `vendeur` ne peuvent être créés que si `multiVendeurs` est vrai (le back end le refuse déjà avec `multiVendeursInactif` : ne touche pas à cette règle).
- Le cloisonnement par créateur (service et règles de sécurité par ligne) est inchangé. **Ajoute un test** qui vérifie, pour les nouveaux emplacements de photos et pour la Médiathèque, qu'un vendeur n'a **pas** accès à l'écran des emplacements fixes et ne voit que ses propres médias.
- Les menus de l'espace vendeur (prompt vendeur existant) se calent sur la même structure `MENU` à onglets : mêmes composants, entrées filtrées par `peut()`.

## 11. Hors périmètre (ne pas faire)

- Le **branchement du site public** sur l'API (lecture à la construction, photos du site, lecture des emplacements). Il fait l'objet d'une mission séparée.
- Les corrections du site public (modale de newsletter, titre de l'accueil, etc.) : elles ont leur propre fichier.
- Le paiement, les reversements et les phases vendeur 7 et 8.
- La lettre d'information (section 9).
- La suppression définitive de code ou de tables (étape C9, sur confirmation).

## 12. Étapes d'exécution

À chaque étape : liste des fichiers modifiés, commandes lancées avec leur résultat, et ce qui reste à faire. **Tu t'arrêtes à la fin de chaque étape** et tu attends « continue ».

**C0 — État des lieux (première réponse, rien d'autre)**
- Crée la branche et le tag (section 1).
- Lance lint, types, tests et build de l'admin et du back end ; donne les résultats.
- Dresse la liste réelle des écrans et des routes de l'admin, des tables et des routes du back end ; compare avec les sections 5 et 7 et signale tout écart.
- Vérifie s'il existe des fichiers dans R2 (variables d'environnement, scripts, documentation) pour décider de la migration de fichiers.
- Liste les risques et les questions dans `docs/QUESTIONS.md`.
- Ne modifie aucun code.

**C1 — Cloudinary** : sections 7.1 et 7.2. Livrable : tests verts, `.env.exemple` à jour, mise en ligne simulée en développement.

**C2 — Menu et groupes d'écrans** : sections 5.1, 5.2, 5.5 (retrait du menu et des routes, pas des fichiers) et 4 (renommage « Journal » / « Activité »). Livrable : 9 entrées, onglets, redirection de `/journal` vers `/activite`, test de navigation par rôle (éditeur, admin, super-admin, vendeur).

**C3 — Formulaires** : U2, U3, U5. Livrable : un seul sélecteur de langue, slug replié, vocabulaire corrigé.

**C4 — Listes et filtres** : U4, U8 (et 7.6 si nécessaire). Livrable : recherche instantanée, trois filtres, étiquettes filtrées.

**C5 — Sécurité du travail** : U6, U7, U13. Livrable : enregistrement automatique, liste de ce qui manque, messages d'erreur clairs.

**C6 — Médiathèque et photos du site** : 5.3, 7.3, U9. Livrable : migration, API, faux serveur, onglet « Sur le site », tests de permissions et de cloisonnement (section 10).

**C7 — Tableau de bord, mobile, accueil** : U10, U11, U12 et 5.4 (onglet Archive).

**C8 — Suppression douce (optionnelle)** : 7.5, sur confirmation seulement.

**C9 — Nettoyage (sur confirmation écrite de Yann)** : à partir de `docs/ELEMENTS-RETIRES.md`, supprime le code et les tests devenus inutiles, **un élément à la fois**, avec tests verts entre chaque. Les tables ne sont jamais supprimées sans une migration de descente testée.

## 13. Interdits

- Supprimer une table, une migration existante, un test, ou du code avant C9.
- Modifier les règles d'authentification, de permissions, de cloisonnement ou de cycle de vie.
- Écrire un secret (clé Cloudinary, secrets de session, secret de rappel) dans le code, un test, un journal ou un message d'erreur.
- Introduire un envoi de fichiers direct depuis le navigateur vers Cloudinary.
- Ajouter une dépendance sans la justifier dans `docs/DEPENDANCES.md` (nom, rôle, alternative écartée).
- Inventer une donnée de contenu : tout texte manquant reste « À compléter » côté admin.
- Changer le contrat d'API en dehors de la section 8.
- Dire « terminé » sans avoir lancé les commandes de vérification et donné leur résultat.

## 14. Incertitudes à consigner dans `docs/QUESTIONS.md`

1. Fichiers déjà présents dans R2 : à migrer ou non ?
2. Offre Cloudinary choisie : limites de poids, quota, livraison des PDF.
3. Liste exacte des emplacements fixes de photos (à confirmer avec le site public).
4. L'éditeur peut-il changer les photos fixes, ou seulement l'administrateur ?
5. Lettre d'information : option 1 ou option 2 ?
6. Suppression douce de 30 jours : souhaitée ?
7. Les tests ignorés pour les ressources retirées : conserver ou supprimer en C9 ?
8. Domaine personnalisé pour les médias (`MEDIA_PUBLIC_BASE_URL`) : oui ou non ?

## 15. Première réponse attendue

Réponds **uniquement** par l'étape **C0** : branche et tag créés, résultats des vérifications, tableau « attendu / réel » des écrans et des routes, présence ou non de fichiers dans R2, risques et questions. N'écris aucun code.
