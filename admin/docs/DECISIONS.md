# Décisions — admin Prince Edja

Chaque choix pris en cas d'incertitude ou d'écart au prompt (`docs/PROMPT-ADMIN-PRINCE-EDJA.md`
à la racine du dépôt). Une décision = contexte, choix, conséquence, statut.

**Préséance** : `docs/CONTRAT-API.md` › analyse conceptuelle › actions de l'administrateur et
workflow › `docs/PROMPT-BACKEND-PRINCE-EDJA.md` › `docs/PROMPT-ADMIN-PRINCE-EDJA.md` › ce fichier.
Une décision ne contredit jamais silencieusement un document de rang supérieur. Inventaire des
sources : `docs/SOURCES-DE-REFERENCE.md`.

**Statuts** :

- **Arrêtée** : en vigueur.
- **Métier à valider** : appliquée avec une valeur par défaut sûre, en attente d'une confirmation du
  client (`docs/CONTRAT-API.md` § 20). La changer ne demande pas de réécriture.

## Étape 0 — 30/10/2026

### D-01 · Projet autonome dans `admin/` — Arrêtée

- Projet npm indépendant (`admin/package.json`, son propre `package-lock.json`), sans workspace
  partagé avec le site public.
- Les deux applications évoluent et se déploient séparément. Le seul lien volontaire est le contrôle
  des jetons (D-05).
- L'admin n'accède qu'à l'API : ni base de données, ni stockage de fichiers. La forme des échanges
  est fixée par `docs/CONTRAT-API.md` (D-13).

### D-02 · Versions alignées, figées, publiées depuis 14 jours ou plus — Arrêtée

- **Socle** : versions installées sur le site public (relevées par `npm ls`, pas devinées).
- **Ajouts** : dernière version stable publiée depuis au moins 14 jours (garde contre un paquet
  compromis retiré dans les jours qui suivent sa publication). Toutes figées (`save-exact`, fichier de
  verrouillage).
- **Exception Vite** : le site public est en 8.2.2, touchée par des failles de sévérité haute du
  serveur de développement (GHSA-9jrq-w75r-8gcw, GHSA-rq7h-c2jc-7f22, GHSA-vfpm-58rq-9qcg et
  `launch-editor`). L'admin prend **8.2.4**, même version mineure, corrigée. → Recommandation : monter
  aussi le site public en 8.2.4.
- **Zod** : 4.x. Le back end utilise la même version majeure ; c'est vérifié au démarrage du lot 0
  (`docs/CONTRAT-API.md` § 19).
- **Tiptap** : `@tiptap/starter-kit` 3.32.0 inclut déjà `@tiptap/extension-link` (vérifié dans son
  `package.json`). La dépendance directe `@tiptap/extension-link` est redondante : elle sera retirée
  à l'étape 3, et le lien sera configuré par StarterKit (D-21).

### D-03 · Trois écarts d'outillage à la pile par défaut du prompt — Arrêtée

| Prompt                                | Remplacé par                                                                   | Raison                                                                                                                                                                                                                                    |
| ------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ESLint + `eslint-plugin-jsx-a11y`     | **oxlint** (plugins `react`, `typescript`, `jsx-a11y`, `import`)               | `eslint-plugin-jsx-a11y` n'est plus publié depuis oct. 2024 et ne supporte pas ESLint 10. oxlint embarque les règles jsx-a11y, est maintenu et c'est l'outil du site public.                                                              |
| `@dnd-kit/core` + `@dnd-kit/sortable` | **`@dnd-kit/react` + `@dnd-kit/helpers` 0.5.1**                                | `core` et `sortable` n'ont plus de version depuis déc. 2024 ; la nouvelle ligne est la seule maintenue. Elle est en 0.x : version figée, et les boutons « monter / descendre » au clavier rendent l'ordre indépendant du glisser-déposer. |
| `vitest-axe`                          | **`axe-core`** appelé directement (`src/test/axe.ts`) + `@axe-core/playwright` | `vitest-axe` est abandonné depuis 2022.                                                                                                                                                                                                   |

### D-04 · Node 24 en CI, 22.12 ou plus requis — Arrêtée

MSW 3 exige Node 22.12 ou plus. La CI de l'admin tourne en Node 24 (version locale, LTS). La CI du
site public (Node 20) n'est pas modifiée.

### D-05 · Jetons copiés à l'identique, et contrôlés — Arrêtée

Le bloc `@theme` et la couche `:root` du site public sont copiés tels quels dans
`src/styles/globals.css`. `src/test/jetons.test.ts` échoue si la copie diverge. La CI se déclenche
aussi quand `src/styles/globals.css` du site public change. Ce fichier est exclu de Prettier pour
que le formatage ne rompe pas la comparaison. Les ajouts propres à l'admin (base, focus, mouvement
réduit, `label-caps`) viennent **après** le bloc copié.

### D-06 · Adresses des écrans — Arrêtée

Les adresses des **écrans** suivent la section 9 du prompt. Elles ne nomment pas les **ressources
d'API**, qui suivent le contrat.

| Section 6 du prompt                   | Écran retenu                                              | Ressource(s) d'API                             |
| ------------------------------------- | --------------------------------------------------------- | ---------------------------------------------- |
| `/recits`                             | `/articles`                                               | `articles`                                     |
| `/boutique/pieces`                    | `/bijoux`                                                 | `bijoux` et ses variantes                      |
| `/boutique/categories`                | `/categories`                                             | `categories`                                   |
| `/taste-travel`                       | `/villes`                                                 | `villes`                                       |
| `/identite`, `/parametres-techniques` | `/parametres`, onglets « Identité » et « Technique »      | `identite` **et** `parametres`, une par onglet |
| `/restauration`                       | onglet « Historique » de chaque formulaire                | `versions/:ressource/:id`, `restauration`      |
| — (section 9)                         | `/publication`                                            | `site/*`                                       |
| `/galerie`                            | **`/galerie`, écran distinct** de `/medias`               | `galerie` (contenu) ; `medias` (fichiers)      |
| `/audience-chiffres`                  | `/audience`                                               | `audience` (lignes par plateforme)             |
| — (absent du prompt)                  | `/tags`, `/etudes-cas`, `/partenaires`, `/motifs-contact` | ressources du même nom (contrat, écart E-12)   |

La galerie est un contenu éditorial (statut, ordre, traductions), pas un fichier : elle a son propre
écran. Les cinq chiffres clés de l'accueil se modifient dans l'onglet « Identité » (`identite.stats`) ;
les chiffres par plateforme, dans `/audience`.

### D-07 · Chemin de base et variables d'environnement — Arrêtée

- Seule variable client : `VITE_API_URL`. Le chemin de base se règle au build par `ADMIN_BASE`, lu
  côté Node dans `vite.config.ts`, jamais exposé au bundle.
- `scripts/verifier-dist.mjs` (lancé par `npm run build`) refuse toute autre `VITE_*`, dans `src`
  comme dans `dist`.
- La valeur relative de `.env.example` (`/admin/api/v1`) ne vaut qu'en développement (même origine,
  MSW). En préproduction et en production, `VITE_API_URL` est l'URL **absolue** de l'API, et toutes
  les requêtes partent avec `credentials: 'include'` (D-15).

### D-08 · Le service worker MSW n'existe qu'en développement — Arrêtée (révisée à l'étape 1)

- Le worker est servi par le plugin Vite de MSW (`msw/vite`, mode `worker-only`), chargé **seulement**
  pour `vite serve`. Vérifié dans le code du plugin : en mode `worker-only`, il émettrait aussi le
  worker dans le build. D'où le chargement conditionnel. Le dossier `public-dev/` prévu à l'étape 0
  devient inutile.
- Le faux serveur démarre par un import dynamique gardé par `import.meta.env.DEV` (`main.tsx`).
  Au build, la branche disparaît : le bundle garde la même taille qu'à l'étape 0.
- `verifier-dist` échoue si `dist` contient le worker, `setupWorker`, `__PE_EXEMPLE__` ou un compte
  `@exemple.test`.
- Les mocks servent au développement ; ils ne prouvent pas la compatibilité avec l'API réelle (D-14).

### D-09 · `localStorage` et `sessionStorage` interdits par le lint — Arrêtée

Règle oxlint `no-restricted-globals` en erreur dans `src`. Le jeton CSRF vit en mémoire seulement
(D-16). Les seules préférences d'affichage autorisées passeront par un module unique (étape 3), seul
point d'exception.

### D-10 · Lint du site public — Arrêtée

`admin/**` est ajouté aux `ignorePatterns` du `.oxlintrc.json` racine : sans cela, `npm run lint` du
site public balayait l'admin avec sa propre configuration.

### D-11 · Nettoyage — Arrêtée

Le dossier `admin-custom/` ne contenait plus que son `node_modules` (fichiers suivis déjà supprimés
dans la copie de travail) : retiré.

### D-12 · Données réelles du site public — Arrêtée

Le prompt annonce 8 entrées d'archive ; `src/data/archive.ts` en contient 7. Les jeux d'exemple
suivent les données réelles.

## Arbitrages avant l'étape 1 — 30/10/2026

Arrêtés par le responsable technique sur mandat du client. Le rapport d'origine est
`docs/RAPPORT-COMPATIBILITE-ADMIN-BACKEND.md` ; la discussion des options, dans
`docs/PROPOSITION-RESOLUTION-ADMIN-BACKEND.md`.

### D-13 · Gouvernance du contrat API (A-01) — Arrêtée

- **Contexte** : le back end doit respecter `CONTRAT-API` « sans en changer une virgule » (PB:15),
  alors que le prompt admin en faisait un livrable de fin de parcours (PA:551). Le workflow de bout en
  bout (§ 8) prévoit que l'admin produit le contrat et que le back end en part.
- **Choix** : `docs/CONTRAT-API.md` est rédigé **maintenant**, avant la couche `api/`. Il est tenu par
  le responsable technique et validé par les responsables de l'admin et du back end. Il est versionné
  (version sémantique), avec un journal des versions ; le back end référence une version étiquetée.
- **Conséquence** : l'admin n'invente aucune route ni aucun champ absent du contrat. Un besoin nouveau
  passe par une nouvelle version du contrat, avant tout code.

### D-14 · Source unique des schémas et preuves de compatibilité — Arrêtée

- Les schémas Zod de `admin/src/api/schemas/` sont écrits **depuis le contrat**, champ par champ.
- Chaque jeu d'exemple MSW est validé par ces schémas dans un test : une fixture invalide fait
  échouer la CI.
- Dès que le back end publie son OpenAPI, l'admin vérifie en CI que ses schémas y sont conformes.
- Avant chaque recette, les parcours Playwright tournent aussi contre l'API réelle de préproduction :
  les tests sur MSW ne valent pas preuve d'intégration.

### D-15 · Topologie, CORS et en-têtes — Arrêtée (hébergeurs : métier à valider, M-06)

Admin sur `admin.<domaine>`, API sur `api.<domaine>`, même site : le cookie `SameSite=Lax` circule.
L'origine de l'admin figure dans `ALLOWED_ORIGINS`. L'hébergement de l'admin pose
`X-Robots-Tag: noindex`, une politique de sécurité du contenu (`connect-src` limité à l'API, aucun
script tiers) et HSTS. Pas de recette sur un domaine tiers (`*.pages.dev`), où le cookie ne
circulerait pas. Le choix des hébergeurs et du domaine attend le client ; il ne bloque pas avant le
lot 5.

### D-16 · Session et CSRF — Arrêtée

- Jeton CSRF de `GET /auth/moi` gardé en mémoire ; joint à `POST`, `PATCH` et `DELETE`.
- `403 CSRF_INVALIDE` : redemander `GET /auth/moi`, puis rejouer **une seule fois** la requête.
- `401` : écran verrouillé sans perte du formulaire en cours ; reprise après reconnexion.
- `403 MOT_DE_PASSE_A_CHANGER` : redirection vers `/changer-mot-de-passe`.
- L'avertissement d'inactivité (2 minutes avant) se cale sur `Moi.session.expireLe`. Aucune durée
  n'est codée en dur. Le brouillon automatique ne compte pas comme une activité de l'utilisateur.

### D-17 · Traitement des erreurs — Arrêtée

Un seul module (`api/client.ts`) traduit les réponses selon `docs/CONTRAT-API.md` § 4 : 401, 403
(règle, `CSRF_INVALIDE`, `MOT_DE_PASSE_A_CHANGER`), 404 (y compris l'objet d'un autre créateur), 409
`VERSION_PERIMEE` (recharger sans perdre la saisie), 422 (rattaché au `champ`, liste des manquants pour
`RG-03`, usages pour `RG-08`), 429 (`Retry-After`), 5xx. Toute erreur inattendue affiche le
`requeteId`.

### D-18 · Statuts réels et états dérivés — Arrêtée

Statuts échangés : `brouillon`, `en_relecture`, `publie`, `archive`. « Programmé » (= `publie` avec
`publieLe` futur) et « À fournir » (= `champsAFournir` non vide) sont des pastilles **dérivées**,
jamais envoyées comme statut. `PastilleStatut` garde ses cinq présentations.

### D-19 · Circuit de publication (A-03) — Arrêtée

- **Contexte** : le prompt admin montre « Publier » sur un brouillon (PA:344). L'analyse conceptuelle
  (§ 9), le workflow (§ 3) et le prompt back end (PB:636) imposent le passage par la relecture.
- **Choix** : on suit le diagramme de l'analyse.
  - `brouillon → en_relecture` : éditeur, admin, super-admin.
  - `en_relecture → publie` : admin et super-admin.
  - Refus `en_relecture → brouillon` : admin, avec un **motif obligatoire**.
  - `publie → brouillon` (dépublication) et `publie → archive` : admin.
  - **`archive → brouillon` ajouté** (admin) : sans lui, un contenu archivé ne pourrait plus jamais
    être corrigé.
- **Pour l'admin qui publie son propre brouillon** : le bouton « Publier » enchaîne deux appels
  (soumettre, puis publier). Le journal en garde deux actions. Si le second appel échoue, le contenu
  reste `en_relecture` et l'erreur s'affiche.
- **Écriture selon le statut** : un éditeur ne modifie qu'un brouillon ; un admin modifie aussi un
  contenu en relecture ou publié (reconstruction). Un contenu archivé se désarchive avant toute
  modification. Suppression : seulement un brouillon ou un archivé non utilisé.
- **Pourquoi** : c'est le diagramme du document de rang le plus élevé, et il garde une trace de
  relecture sans bloquer une équipe d'une personne (l'admin peut relire son propre contenu, M-07).
- **Limite de la version 1** : pas de révision en brouillon d'un contenu publié.

### D-20 · Médias — Arrêtée

- Un fichier par requête ; l'envoi multiple enchaîne des requêtes successives, avec une progression
  par fichier.
- Les contrôles de type et de taille côté client sont une aide ; le refus du serveur
  (`FICHIER_REFUSE`) fait foi.
- Un média s'envoie **sans** texte alternatif ni crédit ; l'écran d'envoi propose ces champs, sans
  les rendre obligatoires. Le média est alors « à fournir » et bloque la publication des contenus qui
  l'utilisent, sauf s'il est décoratif. Le crédit n'est jamais exigé à l'envoi (non-invention).
- Chaque média porte `createurId` (le créateur principal par défaut).
- Supprimer un média utilisé affiche la liste des usages renvoyée par le `422 RG-08`.
- Pas de recadrage dans cette version (M-05).

### D-21 · Contenu riche — Arrêtée

Tiptap n'active que la liste blanche du contrat (§ 9.1) : titres 2 à 4, gras, italique, listes,
citation, lien, image, saut de ligne. Les extensions de StarterKit hors liste (souligné, barré, code,
bloc de code, filet horizontal) sont **désactivées explicitement**. Le nœud `image` porte
`{ mediaId }`, et seulement lui. Un lien n'accepte que `https:`, `http:`, `mailto:` ou une adresse
relative.

### D-22 · Écritures strictes — Arrêtée

Un schéma d'entrée strict, distinct du schéma de lecture, par ressource. Aucun champ en lecture seule
n'est envoyé. Tout `PATCH` porte la `version` lue. `pageSize` ne dépasse jamais 100 ; les sélecteurs
(tags, créateurs, catégories, médias) cherchent côté serveur.

### D-23 · Suivi de publication — Arrêtée

Cinq moments affichés : enregistré, publié, reconstruction en attente, en cours, terminée (`reussie`,
`echec`, dont `DELAI_DEPASSE`). Après une transition, le bandeau suit `publicationId` par
`GET /site/publications/:id`, à intervalle croissant, et s'arrête à l'état final. Un échec n'annule
jamais la publication : le message dit que le site n'est pas encore à jour, et propose
`POST /site/reconstruire` à qui en a le droit.

### D-24 · Pas d'écran sans route — Arrêtée

Une fonction du prompt admin sans route au contrat n'est ni inventée ni simulée en production. Sont
exclus de la version 1, faute de route : le recadrage d'image, l'envoi d'une réponse depuis l'admin
(remplacé par un lien `mailto:`), l'envoi de lettres par segment, la langue de l'interface du profil,
le mode « voir comme ». Ils reviendront par une version du contrat.

### D-25 · Gestion des tags (A-12) — Arrêtée

Écran `/tags` réservé aux admins. Les éditeurs choisissent dans `SelecteurTags`, sans créer à la volée :
on évite les doublons de libellé. Un tag utilisé ne se supprime pas (`422 RG-08`, `PanneauUsages`).

### D-26 · Règles côté client — Arrêtée

Les contrôles de l'interface préviennent l'erreur, ils ne décident pas. Ce sont des fonctions pures
nommées d'après la règle, et testées. Quand l'interface et le serveur divergent, le refus du serveur
s'affiche, et l'écart est consigné comme anomalie.

### D-27 · Modèle commercial des bijoux (A-02) — Arrêtée

- **Contexte** : le prompt admin et le site mettent prix, matières et tailles sur le bijou (PA:232,
  `CommerceBijou`). Le prompt back end les met sur la variante, mais admet un bijou sans variante en
  mode « sur demande » (PB:679) : il n'y a alors aucun endroit où stocker un prix, ni aucune variante
  à demander (RG-11).
- **Choix** : on suit l'analyse conceptuelle (RG-10 : « un bijou a au moins une variante » ; MCD :
  bijou 1,n variante ; une demande porte sur une variante).
  - **Bijou (la pièce)** : récit, catégorie, créateur, images, `prixConfirme`, `edition`, `atelier`,
    `village`, `poids`, `visible`.
  - **Variante (l'unité demandée ou vendue)** : `reference`, `matiere`, `taille`, `prix`,
    `ancienPrix`, `stock`, `disponible`, `ordre`.
  - Tout bijou a au moins une variante. À la création, une variante par défaut, sans valeur, est créée
    si aucune n'est fournie.
  - `matieres` et `tailles` du bijou sont **déduites** des variantes (lecture seule).
  - Prix affiché si et seulement si `prixConfirme` (admin seulement) **et** `prix` renseigné ; sinon
    « sur demande ». Avec plusieurs prix, « à partir de ».
  - Une demande de pièce cite **une ou plusieurs** variantes, ce que fait déjà la sélection du site.
- **Pourquoi** : une seule forme, quel que soit le mode. Le passage à la vente en ligne rend
  seulement `prix` et `stock` obligatoires, sans migration. Une pièce unique reste simple : une seule
  variante.
- **Conséquences** :
  - le back end s'écarte de PB:679 (écart E-01 du contrat) ;
  - l'admin présente la variante unique comme des champs de la fiche, et le tableau des variantes
    seulement à partir de deux ;
  - le site lira `variantes` au lieu de `commerce` ;
  - la migration crée une variante par pièce (prix vide, stock vide, disponible).

### D-28 · Modèle créateur : `slug` et `actif` (X-05) — Arrêtée

- **`slug`** : conservé, obligatoire, unique, non traduit. Il sert l'adresse de la page publique du
  créateur, que le cahier des charges demande (« page dédiée ») et que l'analyse prévoit
  (`/createurs/:slug`). Généré depuis le nom ; **figé dès la première publication** (`SLUG_FIGE`), pour
  ne jamais casser une adresse publiée.
- **`actif`** : conservé et **distinct** du `statut`. Le `statut` dit si la page publique existe ;
  `actif` dit si le créateur peut porter des produits. Désactiver dépublie ses bijoux et révoque ses
  comptes vendeurs (RG-27). Le principal reste actif (RG-21). Tant que `multiVendeurs` est faux, tout
  autre créateur reste inactif (`MULTI_VENDEURS_INACTIF`).
- **Conséquences** : écran `/createurs` avec l'interrupteur « Actif » distinct de la `BarreStatut` ; le
  `SelecteurCreateur` ne propose que les créateurs actifs.

### D-29 · Messages, demandes, collaboration et abonnés — Arrêtée

- **Messages** : un seul fil, typé `contact` ou `collaboration` (formulaire B2B : entreprise, pays,
  type, calendrier, budget). Statut de traitement : `non_lu`, `lu`, `traite`, `archive`. Note interne.
  La réponse passe par la messagerie de l'équipe (lien `mailto:`).
- **Demandes** : statut `nouvelle → en_cours → conclue`, ou `annulee` ; note interne ; pas de
  suppression.
- **Abonnés** : `prenom` et `pays` ajoutés, demandés par le cahier des charges et déjà saisis par le
  formulaire du site.
- **Pourquoi** : le plan de développement (phase 4) et les actions de l'administrateur (§ 8) prévoient
  ces quatre entrées ; aucune ne doit se perdre.

### D-30 · Comptes (A-06) — Arrêtée

Un compte est créé **sans mot de passe**. Le serveur envoie un lien de définition à usage unique,
valable 72 h, consommé par `POST /auth/definir-mot-de-passe` (la même route que la réinitialisation et
l'amorçage). L'écran de création ne demande donc aucun mot de passe. La jauge de robustesse est
affichée là où le mot de passe se choisit : définition, changement. Un admin gère les comptes
**éditeur** ; seul un super-admin gère les admins et les super-admins (analyse RG-16). Pas de
suppression : désactivation.

### D-31 · Langues actives — Métier à valider (M-01)

`parametres.languesActives` vaut `["fr"]` par défaut : le contenu éditorial n'existe aujourd'hui
qu'en français. `ChampTraduit` garde ses deux onglets ; l'anglais n'est exigé à la publication
qu'une fois activé.

### D-32 · Fonctions reportées — Arrêtée

Recadrage d'image, réponse aux messages depuis l'admin, langue de l'interface du profil, envoi des
lettres par segment, mode « voir comme », espace vendeur, vente en ligne. Le contrat les liste
(§ 17, § 20). Aucun écran ne les simule.

## Étape 2 — 30/10/2026

### D-33 · Écrans à venir : visibles et honnêtes — Arrêtée

Le menu liste dès maintenant tous les écrans de la section 9, filtrés par `peut()`. Un écran pas
encore livré affiche « Cet écran sera livré à l'étape N », sans donnée ni action simulée. Les droits
s'appliquent déjà : un éditeur sur `/comptes` voit « Accès refusé ».

### D-34 · Tiroir de navigation : `<dialog>` natif — Arrêtée

Sur mobile, le menu s'ouvre dans un `<dialog>` modal natif : piège de focus, fermeture sur Échap et
fond inerte fournis par le navigateur, sans code maison. Le focus revient au bouton du menu à la
fermeture. Le composant `BoiteDialogue` de l'étape 3 suivra le même principe.

### D-35 · Déconnexion : le cache est vidé sauf la session — Arrêtée

`queryClient.clear()` retirait aussi la requête de session à laquelle l'interface est abonnée : l'écran
restait connecté. La déconnexion retire toutes les autres données, puis met la session à `null`.
Couvert par le test « la déconnexion ramène à la connexion ».

### D-36 · Formulaires : `useWatch` plutôt que `watch` — Arrêtée

Le lint (React Compiler) signale `watch()` de React Hook Form comme incompatible ; `useWatch` le
remplace pour la jauge de robustesse.

### D-37 · Reporté à l'étape 3 — Arrêtée

L'écran verrouillé sans perte du brouillon sur un `401`, et l'avertissement d'inactivité 2 minutes
avant l'échéance (D-16), demandent les formulaires de contenu : ils arrivent avec les composants
transverses (`AvertissementSortie`, `BoiteDialogue`). En attendant, un `401` ramène à la connexion
en mémorisant la page. **Levée à l'étape 3 (D-38).**

## Étape 3 — composants transverses — 30/10/2026

### D-38 · Session tombée : l'écran se verrouille, la page reste montée — Arrêtée

- Un `401` reçu **alors qu'une session était connue** pose `CLE_VERROU` dans le cache des
  requêtes au lieu d'effacer la session. `RouteProtegee` ne redirige donc pas : la page et son
  formulaire restent montés sous une boîte non fermable (`VerrouSession`). Le mot de passe suffit
  pour reprendre (l'adresse est celle du compte) ; l'action interrompue est à relancer. Un `401`
  sans session connue ramène toujours à la connexion.
- L'avertissement d'inactivité (`AvertissementInactivite`) se cale sur `Moi.session.expireLe`,
  deux minutes avant. « Rester connecté » relit `GET /auth/moi`, ce qui repousse l'échéance
  glissante (§ 3.1). À l'échéance, l'écran se verrouille comme après un `401`.
- Limite assumée : toute requête repousse l'échéance côté serveur, mais l'admin ne relit
  `expireLe` qu'avec `GET /auth/moi`. L'avertissement peut donc venir **trop tôt**, jamais trop
  tard. Le faux serveur applique désormais la durée glissante à chaque requête authentifiée.
- Le verrou vit dans le cache : la déconnexion l'efface avec les autres données (D-35).

### D-39 · Préférences d'affichage : un module, deux usages — Arrêtée

`src/lib/preferences.ts` est le seul fichier exempté de la règle `no-restricted-globals` (D-09).
Il ne stocke que des réglages d'affichage, préfixés `pe-admin:` et validés à la lecture : colonnes
masquées d'un tableau, largeur de l'aperçu. Jamais un contenu, un brouillon ni un jeton. Un
stockage refusé (navigation privée) rend la valeur par défaut, sans erreur.

### D-40 · Éditeur riche — Arrêtée

- Le nœud `image` est écrit pour l'admin : il ne porte que `mediaId`, s'affiche en relisant la
  médiathèque, et une `<img>` collée sans `data-media-id` est écartée. `@tiptap/extension-image`
  et `@tiptap/extension-link` (déjà fourni par StarterKit) sont désinstallés.
- `normaliserCorps` retire les attributs de présentation que Tiptap ajoute (`target`, `rel`,
  `class` des liens, `start: 1` des listes), puis revalide par `corpsRicheSchema` : la sortie est
  exactement le JSON du contrat. Un document sans contenu vaut `null`, pas un paragraphe vide.
- Le collage est nettoyé avant analyse (`script`, `style`, `iframe`, commentaires de Word) ; le
  schéma de l'éditeur écarte ensuite ce qui sort de la liste blanche. Un test le vérifie sur du
  HTML hostile (`javascript:`, souligné, code, titre 1, image extérieure).
- L'éditeur est non contrôlé après le montage : pour charger un autre contenu, changer sa `key`.

### D-41 · Composants des lots à venir : construits sur le contrat — Arrêtée

`HistoriqueVersions` (lot 5) et `SelecteurCreateur` / `FiltreCreateur` (lot 2) suivent le
contrat (§ 14.2, § 10.2). Le faux serveur les sert au plus juste : instantanés pris à chaque
écriture journalisée, restauration des **articles** seulement, créateurs en lecture (le
principal, et un créateur d'exemple **inactif**, comme l'exige le contrat tant que
`multiVendeurs` est faux). `magasin.multiVendeurs` permet d'essayer le mode multi-vendeurs.

### D-42 · Vitrine `/composants` : développement seulement — Arrêtée

La route n'est déclarée que si `import.meta.env.DEV` ; au build, la branche et l'import
disparaissent (contrôlé : `verifier-dist` passe, aucun module de l'éditeur ni de dnd-kit dans
`dist`). Ses textes de démonstration restent dans le fichier, hors du dictionnaire : ce ne sont
pas des libellés de l'interface livrée. Un test la rend et l'audite avec axe.

### D-43 · Pastille « programmé » — Arrêtée

La section 5 prévoit cinq pastilles ; RG-05 demande que le statut programmé soit **visible**. Une
sixième pastille, `programme` (horloge, contour forêt), est dérivée d'un `publie` à date future
(`etatAffiche`). Comme « à fournir », elle n'existe pas au serveur (D-18).

### D-44 · Formulaires : l'`id` d'un champ est son chemin dans le contrat — Arrêtée

`traductions.fr.titre`, `tagIds`, `createurId`… Le résumé d'erreurs (`ResumeErreurs`) mène au
champ par cet `id`, et `rattacherErreursServeur` pose les erreurs d'un `422` (`VALIDATION`,
`RG-03`, champ unique) sur les champs React Hook Form du même nom. Ce qui ne vise aucun champ du
formulaire revient en bandeau.

### D-45 · Barre de statut : l'écran fait les appels — Arrêtée

`BarreStatut` n'appelle pas l'API : elle affiche le statut, la date programmée (fuseau
d'Abidjan), l'état de l'enregistrement et les boutons que `peut()` autorise, puis émet l'action.
Pour un admin, « Publier » depuis un brouillon est proposé : l'écran enchaîne soumettre puis
publier, comme le contrat l'admet (§ 7.3).

### D-46 · Tests : une zone d'alerte permanente, une attente de 5 s — Arrêtée

Les notifications posent deux régions vivantes **dès le départ** (une région créée avec son
contenu n'est pas annoncée). Il y a donc toujours un `role="alert"` vide dans la page : les tests
cherchent l'alerte qui porte le message. Sous la charge de la suite complète, le premier
chargement d'une page paresseuse dépasse parfois une seconde : l'attente de Testing Library passe
à 5 s (`src/test/setup.ts`), et la durée maximale d'un test à 20 s (`vitest.config.ts`). Les
dépassements observés touchaient des tests différents à chaque passage, jamais une assertion :
c'est la charge (douze fichiers jsdom en parallèle), pas un défaut du code.

## Point d'intégration I-0 — 30/10/2026

### D-47 · Mode `api` et parcours de bout en bout contre la vraie API — Arrêtée

- `npm run dev:api` lance l'admin **sans faux serveur** et relaie `/admin/api/v1` vers l'API
  locale (`prince-edja-api`, port 3000). Aucun réglage nouveau côté client : c'est le _mode_ de
  Vite qui décide (`import.meta.env.MODE`), et `VITE_API_URL` reste la seule variable `VITE_*`.
- `npm run test:e2e` (Playwright, Chromium, bureau et mobile) se connecte à l'API réelle,
  relit la session au rechargement, vérifie que rien n'est stocké dans le navigateur, se
  déconnecte, et audite la page de connexion avec axe **contraste compris** (mesurable dans un
  vrai navigateur, pas dans jsdom). Les identifiants viennent de `E2E_EMAIL` et
  `E2E_MOT_DE_PASSE`, jamais du dépôt ; sans eux, les tests sont ignorés.
- Résultat au 30/10 : 6 tests sur 6. Le dossier `e2e/` est exempté de la règle sur le stockage
  navigateur : il le lit pour prouver qu'il reste vide.

## Étape 4 — gabarits et articles — 01/11/2026

### D-48 · Gabarit de liste : l'état vit dans l'adresse — Arrêtée

`ListePage` (`features/gabarits/`) porte recherche, filtres (statut, traduction, tag, « à
fournir »), tri et pagination **côté serveur** dans les paramètres de l'adresse : une liste
filtrée se partage par un lien et survit au retour arrière. Les actions groupées sont filtrées par
`peut()` et passent par une confirmation qui dit combien d'éléments sont touchés ; elles
s'exécutent une à une, et chaque refus (version, RG-08, statut) est signalé par son objet.

### D-49 · Gabarit de formulaire : cycle de vie commun — Arrêtée

`useCycleContenu` (`features/gabarits/cycle.ts`) orchestre les transitions pour toute famille :
enregistrement préalable des modifications (on publie ce qu'on voit), « Publier » depuis un
brouillon qui enchaîne soumettre puis publier, liste cliquable des manques d'un `422 RG-03`,
suivi de la reconstruction (`SuiviPublication`, RG-19), refus avec motif (`DialogueRefus`). La
barre de statut est collée **en haut**, sous l'en-tête (section 9).

### D-50 · Une traduction écrite est complète — Arrêtée

Le formulaire envoie toujours tous les champs d'une langue saisie (contrat § 8, B-22 du back
end) ; une langue vidée qui existait part en `null`. Le faux serveur suit désormais la même
règle (il fusionnait champ par champ). Le slug suit le titre tant qu'il n'a pas été modifié à la
main ; un doublon (RG-04) propose la variante renvoyée par le serveur.

### D-51 · Brouillon automatique — Arrêtée

Toutes les 30 s, un **brouillon** modifié, valide et modifiable par l'utilisateur est enregistré
sans notification ; l'indicateur de la barre de statut l'affiche. Un contenu en relecture ou
publié n'est jamais enregistré automatiquement : il ne change que par une action explicite.

### D-52 · Un article créé garde son éditeur — Arrêtée

Après le premier enregistrement, l'adresse passe de `/articles/nouveau` à `/articles/:id` **sans
remonter l'éditeur**. Le remontage faisait atterrir une action lancée juste après
l'enregistrement sur un composant démonté (la liste des manques se perdait). La navigation part
d'un effet, après le rendu où le formulaire est redevenu propre : sinon l'avertissement de sortie
la bloquait.

### D-53 · Crédit saisissable dans le sélecteur de médias — Arrêtée

Le serveur exige un crédit sur tout média d'un contenu publié (RG-03, RG-08). Le sélecteur le
propose donc à côté du texte alternatif, **facultatif** : saisi s'il est connu, jamais inventé ;
vide, l'image reste « à fournir ». Sans cela, un éditeur ne pouvait pas mener un article jusqu'à
la publication sans passer par la médiathèque.

### D-54 · Critère G2 vérifié contre l'API réelle — Arrêtée

`e2e/g2-article.spec.ts` (Playwright, bureau) : un éditeur crée un brouillon, envoie et décrit une
image, choisit un tag de format, soumet ; un admin publie ; le journal porte `creation`,
`transition:en_relecture` et `transition:publie` ; la reconstruction est suivie jusqu'à son
résultat. Réussi le 01/11/2026 contre `prince-edja-api` (étapes 3 à 5 et 9). Les comptes sont
fournis par l'environnement (`E2E_EDITEUR_*`, `E2E_ADMIN_*`).

## Étape 5 — médiathèque — 01/11/2026

### D-55 · Médiathèque : grille, envoi multiple, fiche — Arrêtée

- `/medias` : grille, recherche, filtres dans l'adresse (type, « à fournir », non utilisés,
  créateur en multi-vendeurs). L'envoi multiple enchaîne un appel par fichier (contrat § 11.2)
  et rend compte fichier par fichier ; un média envoyé sans description reste « à fournir ».
- `/medias/:id` : texte alternatif et légende en FR et EN, crédit, image décorative,
  déclinaisons, usages. Supprimer un média utilisé est refusé (RG-08) et la liste des usages
  explique pourquoi ; sinon il disparaît tout de suite et ses fichiers partent après 24 h (B-31).
- **Pas de recadrage** : le contrat ne le prévoit pas dans cette version (§ 11.3).

### D-56 · Tests : limites de jsdom et charge de la suite — Arrêtée

- jsdom ne sait pas transmettre un `FormData` (fichier compris) au `fetch` de Node : le test de
  l'envoi multiple simule l'appel et vérifie l'écran ; l'envoi réel est vérifié en navigateur
  contre l'API (e2e G2, D-54). Le faux serveur reconnaît un fichier à sa forme, plus par
  `instanceof File` (deux environnements, deux classes `File`).
- Le premier chargement de l'éditeur riche dépasse plusieurs secondes sous la charge de la suite :
  attente de Testing Library à 10 s, et 40 s pour le parcours de rédaction complet.
- Un test du faux serveur attendait l'état exact « en attente » juste après une publication ; le
  faux serveur passe « en cours » après une seconde réelle. Il vérifie désormais « pas encore
  terminée ».

## Étape 6 — boutique (créateurs, bijoux, catégories) — 01/11/2026

### D-57 · Gabarit de formulaire extrait des articles — Arrêtée

Le formulaire d'article portait tout le gabarit (enregistrement manuel et automatique, refus du
serveur rattachés aux champs, cycle de vie, aperçu, historique, avertissement de sortie). Il est
extrait en trois pièces, sans changement de comportement (les 9 tests des articles passent tels
quels) :

- `useEditeurContenu` (`features/gabarits/useEditeurContenu.ts`) : le contrôleur ;
- `GabaritFormulaire` et `ActionsLaterales` (`features/gabarits/editeur.tsx`) : la mise en page ;
- `PageFormulaire` : la lecture de `:id` et la conservation de l'éditeur après création (D-52).

Chaque famille ne fournit que ses champs, ses conversions (`valeurs.ts`) et son aperçu. Une
écriture annexe qui ne change pas la version du contenu (variante d'un bijou) passe par
`rafraichir`, qui met la fiche à jour **sans** effacer une saisie en cours.
`ListePage` accepte des filtres propres (`filtres`, `filtreCreateur`) et peut masquer le filtre
par tag.

### D-58 · Variantes visibles dans tous les modes — Arrêtée

Le prompt (section 9) ne montrait le bloc des variantes qu'en vente en ligne. Le contrat (A-02,
§ 10.3), qui prime, fait de la variante l'unité demandée **dans tous les modes** : elle porte la
référence, la matière, la taille et la disponibilité, même « sur demande ». Le bloc est donc
toujours là ; seul le **stock** n'apparaît qu'avec `boutiqueEnLigne`. Le prix se saisit sur la
variante, mais le site l'affiche seulement une fois confirmé par un admin (`prixConfirme`) :
l'aperçu affiche « sur demande » jusque-là, « à partir de » le plus bas s'il y en a plusieurs.
Les montants se saisissent en entiers (FCFA) ; vide = non communiqué.

### D-59 · Créateurs et catégories : écrans d'admin — Arrêtée

- Les deux entrées du menu exigent `modifier` (section 9 : « Créateurs, admin et super-admin ») ;
  un éditeur lit les créateurs et les catégories par les sélecteurs, sans accéder aux écrans.
- Le principal porte « Plateforme » ; son interrupteur `actif` est verrouillé et aucun bouton de
  suppression n'est proposé (RG-21). Un créateur qui a des produits propose **Désactiver**, avec
  la conséquence écrite (ses produits sont dépubliés, RG-27) ; sinon **Supprimer**.
- L'adresse d'un créateur est figée dès sa première publication (`SLUG_FIGE`). Le contrat
  n'expose pas cette date : l'écran verrouille le champ dès que le créateur n'est plus un
  brouillon jamais publié, et le serveur reste juge (`422 SLUG_FIGE` rattaché au champ).
- La commission n'apparaît qu'en multi-vendeurs, jamais préremplie.
- Les catégories : une liste ordonnable (glisser-déposer et clavier), un dialogue de saisie, le
  compteur de bijoux publiés et la mention « masquée sur le site » (RG-09).

### D-60 · Accessibilité et formulaires : deux pièges trouvés en e2e — Arrêtée

- **Pas de formulaire imbriqué.** Le dialogue d'une variante, rendu dans le `<form>` du bijou,
  déclenchait l'envoi natif du formulaire parent : la page se rechargeait et la variante n'était
  jamais écrite. jsdom ne le montrait pas ; le navigateur, si. Le bloc des variantes est rendu
  hors du `<form>` du bijou, et sa soumission arrête la propagation.
- **Nom accessible d'un bouton** : un complément `sr-only` précédé d'une espace (« Modifier » +
  « 01-1 ») donnait « Modifier01-1 ». Les boutons répétés par ligne portent un `aria-label`
  complet.
- `ListeOrdonnable` : la prop de rendu s'appelle `renderLigne` (une prop `render…` est une
  fonction de rendu, pas un composant défini pendant le rendu, pour `no-unstable-nested-components`).

### D-61 · Boutique simulée — Arrêtée

Le faux serveur reprend les règles du back end (B-39 à B-45) : variante vide par défaut, référence
« {numéro}-{rang} », RG-09, RG-10, RG-11, RG-20, RG-21, RG-27, `SLUG_FIGE`,
`MULTI_VENDEURS_INACTIF`, vente en ligne. Les demandes de pièce n'existent qu'au lot 4 :
`magasin.variantesCitees` simule une variante citée (RG-11) en attendant. Le cycle de vie simulé
est commun (`mocks/cycle.ts`) ; celui des articles, déjà couvert, reste en place. L'e2e
`boutique.spec.ts` rejoue le parcours contre l'API réelle.

## Étape 6, fin — épisodes, projets, villes, destinations — 01/11/2026

### D-62 · Formulaires déclaratifs — Arrêtée

Onze familles restent après la boutique (lots 2 et 3), presque toutes faites de textes traduits,
d'une image, de tags et de quelques champs propres. Plutôt qu'un formulaire écrit à la main par
famille, chacune **décrit** ses champs (`SpecRessource`, `features/gabarits/declaratif.ts`) :

- types de champ : texte, nombre, choix, image, PDF, tags, adresse `https`, date partielle,
  relation (épisode, destination), lien interne (`CibleInterne`) ;
- les valeurs du formulaire, la validation avant envoi (messages en français, chemins = ids), les
  conversions vers le contrat, la mise en page, l'aperçu et la liste en découlent
  (`EcransDeclaratifs.tsx`, `champs.tsx`) ;
- conversions communes : un texte de crédibilité vide part à `null`, un nombre vide à `null`
  (jamais `0`), une langue vidée qui existait à `null`.

Les familles au comportement riche (articles, bijoux, créateurs, médias) gardent leur écran sur le
même gabarit (D-57). Les épisodes, projets, villes et destinations ne sont que leur description
(`features/editorial/specs.ts`).

### D-63 · Ressources simulées par une fabrique — Arrêtée

`mocks/ressource-simulee.ts` produit, pour une description, les routes du gabarit (§ 8) : liste
filtrée et triée, lecture, création, modification, suppression, transitions (`mocks/cycle.ts`),
ordre. RG-03, RG-04, versions et journal y sont écrits une fois ; chaque famille n'ajoute que ses
exigences, ses champs de crédibilité et ses règles propres (numéro d'épisode unique, PDF exigé
pour un guide, cible publiée, coordonnées).

### D-64 · Destinations : coordonnées vides en brouillon, contrôle du pays — Arrêtée (contrat 1.2.0)

- Le contrat type `latitude` et `longitude` en `number` et les marque **P**. L'admin les lit
  `number | null` : une destination se crée en brouillon avant d'avoir ses coordonnées, qui se
  saisissent et ne se devinent jamais. À aligner dans le contrat et le back end (lot 2 éditorial).
- `COORDONNEES_HORS_PAYS` se déclenche quand un tag `pays` de code `cote-d-ivoire` est posé. Ce
  code est une hypothèse de l'admin : le back end doit retenir le même dans ses données de départ.
- L'aide du champ rappelle que la longitude est **négative à l'ouest** (erreur passée sur Adiaké).

### D-65 · Ordre d'affichage et charge des tests — Arrêtée

- Les familles ordonnables (projets, villes) ont un panneau « Changer l'ordre d'affichage » sur
  leur liste : liste complète lue avec `tri=ordre`, réglée au glisser-déposer ou au clavier, envoyée
  entière (`PATCH /{r}/ordre`). `tri=ordre` n'est pas écrit au contrat pour ces ressources : à
  ajouter avec le lot 2 éditorial du back end.
- La suite dépasse 170 tests jsdom : quatre fichiers au plus en parallèle (`maxWorkers`), attente de
  Testing Library à 20 s, 45 s par test. Au-delà, la machine saturait et des attentes expiraient au
  hasard ; trois exécutions de suite passent ensuite à l'identique.

### D-66 · Contrat 1.2.0 et e2e du lot 2 éditorial — Arrêtée

Les trois écarts relevés en D-64 et D-65 sont entrés au contrat (1.2.0, § 9.3 à 9.5, § 21) et
sont servis par le back end (B-46, B-47). `e2e/recits.spec.ts` crée un épisode et une destination
par les formulaires déclaratifs contre l'API réelle.

## Étape 7 — distinctions, presse, archive, univers, jalons, offres, pages — 01/11/2026

### D-67 · Trois types de champ de plus, et les ensembles fermés — Arrêtée

Le gabarit déclaratif (D-62) gagne :

- `booleen` : interrupteur (parution à la une) ;
- `sources` : liste structurée (libellé, adresse facultative, type) pour l'archive. Le bloc est
  **mis en évidence** (bordure terracotta) et dit, tant qu'il est vide, que l'entrée ne pourra pas
  être publiée ;
- `blocs` : textes d'une page fixe par clé de bloc. Ils vivent dans chaque traduction
  (`traductions[l].blocs`, § 9.15) ; le formulaire les tient à part puis les y replace à l'envoi.
  Les clés sont **celles que le serveur renvoie** : l'écran n'en ajoute ni n'en retire aucune
  (une clé inconnue → `422`).

Une description peut être un **ensemble fermé** (`fermee`, pages) : ni bouton de création, ni
suppression groupée, ni route `nouveau`. `colonneIdentifiant` remplace `colonneNumero` : numéro,
clé de page, période, ou média de la parution.

### D-68 · Règles visibles de l'étape 7 — Arrêtée

- **Archive** : une entrée sans source n'est pas publiable (règle du CDC) — refus `RG-03` sur
  `sources`. Une source orale peut n'avoir aucune adresse ; une autre sans adresse est « à fournir ».
- **Presse** : source, date et lien exigés à la publication ; une seule parution à la une (en
  passer une à la une retire les autres, côté serveur).
- **Distinctions** : la date est exigée à la publication (« source et date obligatoires ») ;
  organisme et lien sont de crédibilité.
- **Univers** : un lien interne est exigé, vers un contenu publié.
- **Offres** : aucun tarif n'est stocké ; l'aide du texte le rappelle.
- **Pages** : onze pages, une par clé, créées par les données de départ.
- Le manifeste et la signature du héros (« confirmation explicite ») relèvent de l'étape 8 avec
  l'identité du site : ici, ce ne sont que des blocs de texte de la page d'accueil.

### D-69 · Lot 3 branché sur l'API réelle (contrat 1.3.0) — Arrêtée

Le back end sert les sept familles de l'étape 7 (B-48). `e2e/recits.spec.ts` crée une entrée
d'archive avec sa source et lit les onze pages contre l'API. Les pages réelles n'ont aucune clé de
bloc tant que l'inventaire manque (Q-45 du back end) : l'écran l'affiche (« aucun texte
modulable ») ; le faux serveur en simule trois pour tester l'édition.

## Étape 9 — 03/11/2026

### D-70 · Comptes, journal, publication, profil et tableau de bord — Arrêtée

- **Comptes (E-11 du contrat, RG-16)** : l’admin gère les comptes **éditeur**, le super-admin gère les admins et super-admins ; le rôle `vendeur` reste indisponible tant que `multiVendeurs` est faux. L’écran ne propose pas ce que `peut()` refuse et le faux serveur répète les mêmes garde-fous (dernier super-admin, double saisie de l’e-mail pour changer un rôle).
- **Pas de mot de passe à la création** : `POST /comptes` crée le compte et déclenche un lien de définition (72 h) ; la réinitialisation en déclenche un autre (1 h).
- **Comptes non supprimés** : la suppression n’existe pas ; un compte se désactive.
- **Journal** : lecture pour les admins, export CSV réservé au super-admin ; la connexion des tests écrit une entrée, les tests la remettent à zéro avant de vérifier l’état vide.
- **Profil** : l’interface est en français ; l’anglais est affiché comme indisponible jusqu’à l’activation des libellés. Le lien depuis l’en-tête pointe vers `/profil`.
- **Tableau de bord** : affiche les dix dernières modifications renvoyées par `GET /tableau-de-bord`, en liens vers les fiches qui existent ; les familles sans écran ne deviennent pas des liens morts. L’espace « Administration » n’apparaît que si `peut()` autorise la ressource.
- **Faux serveur** : les mêmes exigences sont appliquées par MSW ; elles sont aussi vérifiées par `faux-serveur.test.ts`. Rien de tout cela ne se rend dans `dist` (`verifier-dist`).

## Étape 10 — 05/11/2026

### D-71 · Neuf écrans du lot 4 (§ 9.9, § 9.13 à 9.16, § 13.2 à 13.6) — Arrêtée

L’étape 10 exigeait encore neuf écrans sans livraison : galerie, études de cas, partenaires, pages légales (§ 9) et chiffres d’audience, paramètres, navigation, textes d’interface et motifs de contact (§ 13). Ils sont livrés côté admin ; le back end ne sert encore que l’étape 10 (B-49 à B-52).

- **Deux familles déclaratives de plus, pas de nouveau gabarit** : `SPEC_GALERIE`, `SPEC_ETUDES_CAS`, `SPEC_PARTENAIRES`, `SPEC_PAGES_LEGALES` sur le cadre de D-62, avec trois nouveautés du `SpecRessource` :
  - un champ `corps` : texte long par langue écrit dans la traduction (comme les `blocs` de D-67), porté par les pages légales (§ 9.16) dont le corps est un HTML Tiptap validé par liste blanche (D-26) ;
  - un champ `galerie` : galerie d’images propre à l’écran, réutilisant `PanneauGalerie` (§ 9.13), en reprise des études de cas ;
  - un champ `relation` sur `offres` (§ 9.12) pour l’offre d’une étude de cas, et `titreFacultatif` / `groupeOrdre` pour la galerie (l’ordre se déclare par `emplacement`, un panneau d’ordre par groupe).
- **Ensembles fermés** : les pages légales (§ 9.16) sont `fermee` comme les pages fixes (§ 9.15) — ni bouton de création, ni suppression, ni route « nouveau ».
- **Chiffres d’audience (§ 13.2)** et **motifs de contact (§ 13.6)** : listes ordonnables sans cycle de vie, dialogue de saisie, dialogue de confirmation de suppression ; chiffres laissés `null` tant que la maison ne les fournit pas (vide ≠ zéro). Les deux écrans sont réservés aux admins, lecture incluse (RESSOURCES_ADMIN).
- **Paramètres (§ 13.3)** : langues actives, destinataires (contact, collaboration, demandes), durées, vente en ligne — **toujours refusée**, et interrupteurs `multiVendeurs` / `boutiqueEnLigne` / `regroupementPublicationSecondes` réservés au super-admin, confirmés par l’e-mail retapé (RG-16). Un champ super-admin glissé dans une écriture admin se voit refuser tout avant validation (403 DROIT_INSUFFISANT, côté faux serveur).
- **Navigation (§ 13.4)** : le document (menu, sous-entrées, CTA, pied de page, règle d’erreur du corps) est remplacé en entier à chaque enregistrement ; un seul niveau d’enfants. Le faux serveur écrit une version entière, jamais un patch partiel.
- **Textes d’interface (§ 13.5)** : le dictionnaire appartient au site ; seules les clés connues sont modifiables, et chaque écriture passe la version de lecture.
- **Faux serveur** : toute écriture journalise ; les réglages ouvrent en plus une publication `reglage`. Les jeux d’exemple (`IDS_LOT4.fXX`) couvrent les nouvelles familles, et `scripts/verifier-dist.mjs` les refuse dans le build.
- **Tests** : quatre fichiers (`lot4.test.tsx`, `reglages.test.tsx`, `chiffres.test.tsx`, `motifs.test.tsx`). 211 tests au total (les écrans singletons sont aussi rendus en test avec axe) ; lint, typecheck, `verifier-dist` verts.

## Mission de simplification (PROMPT-CORRECTION) — 06/11/2026

### D-72 · C2 — Menu à neuf entrées, onglets, retraits — Arrêtée

- `components/layout/navigation.ts` déclare **neuf entrées** (quatre blocs : Contenus, Boutique,
  Public, Réglages), chacune avec ses onglets `{ libelle, chemin, ressource, action }`. Les routes sont
  **générées depuis les onglets** : une adresse absente du menu n'a plus de route (« Page introuvable »).
- Visibilité par `peut()` seulement. `visibilite` d'entrée : Projets (`projets`), Boîte de réception
  (`messages`, ce qui la retire de l'espace vendeur, ECRANS § 0.5), Réglages (`parametres`, admin
  d'après ADMIN-SIMPLIFIE § 2.8). Créateurs : action `creer` (masqué pour l'éditeur et le vendeur).
- `GroupeEcrans` : barre d'onglets (liens, `aria-current`) au-dessus des écrans d'une entrée qui a au
  moins deux onglets visibles. Journal et le hub Projets n'en ont pas.
- Retraits (code conservé, tests en `skip`) : `docs/ELEMENTS-RETIRES.md`. `/journal` → `/activite`.

### D-73 · C3 — Un seul sélecteur de langue, adresse dans « Avancé », vocabulaire — Arrêtée

- `FournisseurLangue` (dans `GabaritFormulaire`) : un jeu « Français / Anglais » en haut ; pastille
  « À compléter » ou « Erreur » par langue. `ChampTraduit` et `ParLangue` suivent la langue choisie ;
  sans fournisseur, ils gardent leurs onglets (fiche média, démo).
- Le résumé d'erreurs et la liste « Il manque » affichent la langue du champ puis ouvrent la section
  repliée avant de donner le focus (`aller-au-champ.ts`).
- U5 : dictionnaire nettoyé, test `i18n/vocabulaire.test.ts` qui échoue si « slug », « tag »,
  « à fournir », « Traduction » ou « usage » reviennent.

### D-74 · C4 — Listes — Arrêtée

Recherche à la frappe (300 ms), trois filtres en vue (statut, catégorie ou type, langue), le reste
sous « Plus de filtres » ; « Effacer les filtres » ; taille 20 / 50 / 100 (`?taille=`), la page 1
n'est pas écrite dans l'adresse ; tout changement de filtre revient à la page 1. Étiquettes par
formulaire : `lib/etiquettes.ts` (un bijou ou un livre ne propose pas le format).

### D-75 · C5 — Sécurité du travail — Arrêtée

« Enregistré à HH:MM » (heure d'Abidjan) ; fenêtre de conflit de version (« Recharger », « Copier
mon texte ») à la place d'une notification ; liste « Il manque » cliquable ; un message par code
d'erreur (`erreur.code.*`), jamais de code affiché (le suffixe « (RG-xx) » est retiré).

### D-76 · E1 — Hub Projets, catégories à trois familles, Livres — Arrêtée (contrat 1.5.0 proposé)

- Hub à `/projets` (libellés de la photo, « Template » inclus), liste à `/projets/liste?format=`,
  création préremplie (`?format=`, `?projetId=`). Le template se **déduit du format**
  (`lib/templates.ts`) : aucun champ « template ».
- Formulaires déclaratifs étendus : `categorie`, `createur`, `variantes`, relation `projets`, aide et
  alerte selon la valeur d'un choix, `complement` (épisodes d'un projet), colonnes, filtres par
  catégorie et par relation, `principalApres`.
- Article : la catégorie vient de la famille `article` ; on écrit `categorieId` **et** le nom
  (`categorie`), que le back end actuel attend encore. Filtre de liste par nom.
- Livres sur le gabarit déclaratif ; variantes en tableau dans le livre (proposition § 22.3).

### D-77 · C6 — Médiathèque — Arrêtée (contrat 1.5.0 proposé)

`/galerie` devient « Sur le site » : photos fixes (`/emplacements-photos`, ressource
`emplacements-photos`, modification admin par défaut — E4), galeries de l'accueil et de la boutique
ordonnables. Médiathèque : 40 par page, vignettes plus grandes, texte alternatif saisi dans la grille.
Le faux serveur refuse de supprimer un média assigné à une photo fixe.

### D-78 · C7 — Tableau de bord, mobile, accueil — Arrêtée

Quatre blocs d'ECRANS § 1 (cartes « À faire » vers la liste filtrée, dernière publication,
programmé, activité récente). Le bloc « Administration » existant est **conservé** (question ouverte).
Barre inférieure mobile (Journal, Boutique, Boîte de réception, Plus). Message d'accueil en trois
étapes, une fois par compte et par poste (préférence d'affichage, D-09).

### D-79 · Interrupteur — correctif — Arrêtée

Le curseur de l'interrupteur n'avait pas d'ancre `left` et sortait de sa piste de 22 px quand il était
activé : `left-0` ajouté. Prop `libelleCourt` pour les lignes de liste.

### D-80 · Templates de projet — Arrêtée (proposition validée par le client le 06/11/2026)

- Trois templates, décrits **une seule fois** dans `lib/templates.ts` (blocs, blocs facultatifs,
  projet de référence) : **Film** (X'PLORE avec épisodes, film unitaire sinon — la bascule suit les
  épisodes), **Programme** (Taste & Travel), **Bibliothèque** (Archive d'Afrique). Un template unique
  pour tous les épisodes.
- L'admin **choisit** le template (cartes) ; le format le **propose** (« Utiliser »). Un projet sans
  template prend celui de son format : rien ne change pour les projets existants.
- Les champs propres à un template ne s'affichent que pour lui (`visibleSi`) ; masqués, ils gardent
  leur valeur. Changer de template affiche ce qui apparaît et ce qui ne s'affichera plus : aucune
  donnée n'est effacée. Blocs facultatifs : interrupteur « Afficher sur le site » (`blocsMasques`).
- Pas d'aperçu des templates (décision du client).
- Catégories de projets de départ : Film, Tourisme, Patrimoine. Les catégories affichées sur le site
  et ses filtres viennent de celles créées dans l'admin (projets, articles, produits).
- Hub : « Moteur de rendu public » montre les trois templates (compteur, lien vers la liste filtrée
  `?template=`) et le template d'épisode ; « Nouveau projet » garde le template choisi.

## Branchement sur le vrai back end — 07/11/2026

### D-81 · Contrat 1.5.0 arrêté, l'admin vérifié contre l'API réelle — Arrêtée

- Le back end a implémenté la proposition 1.5.0 (B-61 à B-65 du dépôt `prince-edja-api`) ; le contrat
  est **arrêté**, amendé au § 22.9 (qui fait foi). Les écarts qui touchent l'admin :
  - la catégorie d'un **livre** est obligatoire dès l'enregistrement : le champ `categorie` des
    formulaires déclaratifs accepte `obligatoire`, coché pour les livres ; le faux serveur refuse
    désormais un livre sans catégorie, comme l'API ;
  - un résumé de livre ou un libellé de variante non saisi arrive `null` : lu comme vide ;
  - variantes d'un livre en tableau entier : acceptées par l'API (Q21 tranchée, le formulaire ne change
    pas) ;
  - résumé de projet sans `categorie` (nom) ni `nombreEpisodes` : les colonnes affichent « — ».
- **Test de contrat** `src/api/contrat-reel.test.ts` : le client de l'admin, avec ses schémas, contre
  l'API de développement (ignoré sans `API_REELLE=1` ; identifiants lus dans l'environnement, jamais
  écrits). Lectures de toutes les ressources et écritures projet, épisode rattaché, livre et variantes,
  article catégorisé, puis suppression de ce qui a été créé. Résultat : **39 sur 39**.
- Reste pour passer l'admin du faux serveur à l'API en développement : désactiver MSW et pointer
  `VITE_API_URL` vers l'API (étape 10 de LIAISON), puis rejouer les parcours Playwright contre elle.

### D-82 · L'admin tourne sur l'API réelle (LIAISON, étape 10) — Arrêtée

- Mode `api` (`npm run dev:api`, D-47) : aucun faux serveur, `/admin/api/v1` relayé vers l'API locale.
  Les parcours Playwright (`npm run test:e2e`) tournent contre elle, comptes de développement fournis
  par l'environnement (`E2E_EDITEUR_*`, `E2E_ADMIN_*`), jamais par le dépôt.
- `e2e/simplification.spec.ts` (nouveau) : menu à neuf entrées, catégories des trois familles, photos
  fixes, partenaires, pages légales, audience, réglages et livres servis par l'API ; un projet
  Programme créé depuis le hub avec sa catégorie, relu après rechargement, puis supprimé.
- `e2e/recits.spec.ts` : la vérification de l'écran « Pages du site », retiré du menu et des routes en
  C2, passe dans un test ignoré (décision en C9), comme son test unitaire.
- Résultat au 08/11/2026 : **12 parcours sur 12** (bureau et mobile ; 8 ignorés : saisies vérifiées sur
  bureau seulement, et l'écran retiré). Note : le parcours G2 publie un article d'essai à chaque
  passage dans la base de développement.

### D-83 · Site public : les données viennent de l'API à la construction (S2, LIAISON § C.2) — Arrêtée

- Chargement **à la construction**, jamais à l'affichage : `PUBLIC_API_URL=… npm run charger` écrit
  `src/data/generated/*.json` (ignorés par Git), puis `PUBLIC_DATA_SOURCE=api npm run build`. Un appel
  en échec, une réponse hors du § 18.1 ou un fichier absent arrêtent la construction.
- Les pages ne changent pas : seule la couche `src/acces/` choisit la source (`source.ts`) et adapte
  la forme publique à celle du site (`adaptateurs.ts`). Sans `PUBLIC_DATA_SOURCE=api`, données de
  départ : la CI et GitHub Pages ne sont pas touchés tant que le domaine de l'API n'est pas fixé.
- Un champ absent de l'API reste vide (étiquettes `pays`/`theme`, édition, atelier, village, poids
  d'un bijou) ; une destination sans coordonnées n'est pas posée sur la carte.
- **Lien d'un projet** : la `CibleInterne` posée dans l'admin ; sans elle, la page du site qui sert
  son template — film → `/xplore`, programme → `/taste-and-travel`, bibliothèque → `/archive-afrique`
  (ce que faisaient déjà les données de départ pour X'PLORE et Taste & Travel).
- Restent sur les données de départ (non chargées) : identité, navigation, lettre d'information,
  univers, motifs de contact, audience, villes et programme Taste & Travel, archive, galeries.
- Reste pour la porte G4 : le prérendu.

### D-84 · Fichiers parasites de docs/ — Arrêtée (choix du client délégué à l'agent le 11/11/2026)

Constat (A5 du PROMPT-SUITE) : `*:Zone.Identifier` (métadonnées Windows de zone) et des doublons
« (1) »/« (2) » de documents de référence dans les deux dépôts.

- **Zone.Identifier** : supprimés du disque dans les deux dépôts (27 côté site — 3 à la racine,
  13 dans `docs/`, 11 dans `admin/docs/`… inventaire exact : 27 fichiers non suivis supprimés,
  y compris `cauri-africain.svg:Zone.Identifier`, `motifs_africains_svg.zip:Zone.Identifier` et
  `Contemplation sur la vallée*.png:Zone.Identifier` ; 11 supprimés dans le back end, `docs/`).
  `*Zone.Identifier` ajouté aux deux `.gitignore`. Les 27 copies suivies par git (noms en U+F03A,
  conversion macOS du « : ») apparaissent comme supprimées dans l'arbre ; la suppression sera
  effective au prochain commit (A6, sur ordre).
- **Doublons « documents de référence »** : les copies numérotées — plus récentes, décrivant
  l'état livré (hub Projets, module Livres, catégories par famille) — promues en nom canonique :
  `ADMIN-SIMPLIFIE-PRINCE-EDJA`, `DOCUMENTATION-GUIDE-IA-PRINCE-EDJA`, `PROMPT-CORRECTION-PRINCE-EDJA`
  (la (2)), dans `docs/` **et** dans `admin/docs/`. Aucun contenu perdu : elles reprennent tout le
  corps des bases, plus les mises à jour ; les bases restent dans l'historique git. Les
  `PROMPT-CORRECTION-PRINCE-EDJA (1).md`, identiques octet pour octet à la base, supprimés.
- **Même règle dans le back end** (`docs/` non suivi par git) : les copies numérotées y sont
  identiques aux versions livrées à l'admin (diffs de formatage uniquement — tableaux alignés) ;
  promues en nom canonique, le `PROMPT-CORRECTION (1).md` (identique à la base) supprimé. Les
  anciennes bases du back end n'étaient pas suivies, mais reprennent le contenu des anciennes
  versions, conservées dans l'historique git du site.
- **Photos `ressources/photos_retouchees/ChatGPT Image 3 sept. 2026, 13_40_23 (1).png` et `(2).png`** :
  conservées (photos réelles, hors documents de référence).
- **Vérification « à jour »** : `git fetch` impossible depuis la machine (github.com injoignable) —
  positions basées sur le dernier état connu. Toutes les branches locales suivies sont alignées
  (site : `correctifs-site`, `new`, `recent`, `recent_11`, `recent_2`, `simplification-admin`, `unuse`,
  `version_1..3` ; back end : `main`) ; `main` du site était 1 commit en retard, rattrapé par
  avancement du ref vers `origin/main` (722365a), sans toucher l'arbre ni le réseau. La branche
  `simplification-admin` du back end n'a **aucun upstream** : rien n'est jamais parti vers un remote.

### D-85 · Lettre d'information : double confirmation branchée (B3) — Arrêtée

- `corpsNewsletter` / `envoyerNewsletter` (`src/lib/formulaire.ts`) câblent **tous** les points de
  collecte (`BlocNewsletter` plein et compact, `FenetreNewsletter`) : `POST /public/api/v1/newsletter`
  (contrat § 18, consentement { texte, version, source }, `siteWeb` piège), always-`202`, écrit par la
  maison ; l'accusé d'inscription est envoyé par l'API (dev : non envoyé, logué ; envoi réel = Brevo, C3).
  Sans `PUBLIC_API_URL`, le repli local documenté est conservé (flou). Avec l'API, l'échec est annoncé
  (`newsletter.inscriptionEchoue`, déjà dans le dictionnaire) — aucun succès simulé.
- Les pages `/newsletter/confirmation` et `/newsletter/desinscription` appelaient un texte statique :
  désormais GET à l'arrivée avec le `jeton` de l'URL (idempotent), états FR/EN ajoutés au dictionnaire
  (`newsletter.verification`, `confirmationOk`, `desinscriptionOk`, `lienInvalide`,
  `lienConfirmationRequis`, `lienDesinscriptionRequis`). La fausse saisie d'e-mail de la
  désinscription (formulaire qui n'enregistrait rien) est retirée : le lien vit au bas de chaque e-mail.
- Vérifié le 11/11/2026 (API dev, base de dev, navigateur Playwright chromium-1248, Vite
  `localhost:5173`) : `POST /newsletter` ×4 → 202 ; pages affichées « Votre adresse est confirmée »
  puis « Vous êtes désinscrit » ; jeton bidon → 422. Les abonnés `b3-2`/`b3-3`/`b3-4@example.com`
  sont des entrées de TEST (jetons consommés) ; deux messages TEST B3 et une demande de collab sont en
  base de dev. Le CORS n'autorise que `localhost:5173` (dev) ; la prévisualisation `4173` est refusée —
  l'origine de production s'ajoute à `ALLOWED_ORIGINS` (déploiement, question 21).
- **Demande de pièces non branchée** (restée en repli e-mail) : `POST /demandes` exige des UUID de
  variante introuvables en § 18.1 — question 38 (à valider côté contrat, avec la question 36). B3 :
  contact ✓, collaboration ✓, lettre ✓, demande ✗ (repli).

### D-86 · CI de déploiement (deploy.yml) : barrière de qualité et reconstruction branchée — Arrêtée

- `deploy.yml` : Job `verifier` (Node 24, `npm ci`, lint, types, tests) avant le build ; build sur
  Node 24 ; `npm install` → `npm ci` (verrou). Le déploiement GitHub Pages reste inchangé dans son
  périmètre ; le niveau devient : lint + types + tests verts avant toute mise en production.
- `npm run charger` ne tourne que si `vars.PUBLIC_API_URL` est définie (variable publique du dépôt,
  pas un secret) ; le build reste par défaut tant qu'elle est absente — le site déployé aujourd'hui
  n'est pas touché par cette règle. Préparé, **pas actif** : à poser avec l'API en ligne (question 21).
- `workflow_dispatch` accepte `buildId` (exemple : `prince-edja-api/docs/PUBLICATION.md`) ; le build
  envoie `demarrage` si le secret `BUILD_CALLBACK_SECRET` est là, et un job `finalise` (if always())
  envoie toujours `termine` avec l'état réel — même si le build échoue. Sans buildId : rien de
  changé pour un push normal sur `recent`.
- À noter : ce fichier n'a d'effet qu'au prochain push sur `recent` (client, par demande explicite).

### D-87 · Prérendu par route (B1, porte G4) — Arrêtée

- `npm run build` enchaîne : contraste + build client, build SSR (`vite build --ssr src/entry-server.tsx`), prérendu (`scripts/prerender.mjs`) : **48 pages** écrites dans `dist/<route>/index.html` — `<title>`, `description`, `og:*`, canonical, contenu — **sans nouvelle dépendance** (`react-dom/server`, `react-dom/static`).
- `main.tsx` hydrate si le conteneur porte du HTML, sinon crée la racine (404 en navigation directe) ; `App.tsx` accepte `routeurStatique` : **`StaticRouter` avec `basename`** — même préfixe que le client, sans quoi chaque lien mismatch (#418 partout). Balises SEO déposées au rendu serveur, injectées dans `<head>` (og:url/canonical sous `PUBLIC_SITE_ORIGIN`, sinon la canonique actuelle du dépôt) ; `dist/404.html` (coquille vide) pour le 404 stylé.
- Pièges levés en vérifiant pour de vrai : `MemoryRouter` sans base (tout mismatch), `window` à l'import de Leaflet (chargement différé dans l'effet), `window` à l'import de `Breadcrumb` (repli SSR), horloge/année/langue/media-queries au rendu (état initial serveur identique au client, ajusté en effet). Lint final : les 5 avertissements historiques tolérés, pas un de plus.
- Vérifié le 11/11/2026 (build de production, `scripts/servir-dist.mjs` qui reproduit GitHub Pages ; `vite preview` sert la coquille partout, faux pour la recette) : **48/48 routes hydratées sans #418/#422/#423/#425**, navigation client SPA fluide (retour arrière inclus), `curl` de pages : titre/description/og:*/contenu présents. LoaderIntro toujours affiché à l'hydratation puis retiré en effet ; horloge du pied de page affichée à la première frame.
- Reste connu : en mode API, la page `/newsletter/confirmation?jeton=…` n'est pas prérendue (volontairement) ; OSRM (tracé du parcours) peut être injoignable — chaque segment retombe en ligne droite (`src/lib/routage.ts`) et la carte reste dessinée au cadrage pays.
