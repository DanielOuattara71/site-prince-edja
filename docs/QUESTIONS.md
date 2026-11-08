# QUESTIONS — Prince EDJA

Document créé à l'étape **C0 — État des lieux (05/11/2026)** par l'agent IA (aucune réponse métier n'y a été apportée : à trancher par Yann).

> Le back end possède déjà son propre `docs/QUESTIONS.md` (non modifié dans cette étape).

## 1. État du dépôt avant cette mission

- **Branche `simplification-admin`** créée dans les deux dépôts (site+admin, back end) depuis l'état actuel, sans commit préalable.
- **Tag `avant-simplification`** posé sur l'état courant des deux dépôts.
  - Site+admin : tag annoté `avant-simplification` sur `8874a8d` (`recent_11`).
  - Back end : tag **léger** (aucun committer n'étant configuré dans ce dépôt, le tag annoté a été refusé ; aucune identité n'a été inventée). Sur `f8492a7` (`main`).
- **Les deux dépôts portent un volume important de travail non commité** (admin : ~24 fichiers modifiés + ~44 non suivis — tout le lot 4 ; back end : ~31 fichiers modifiés, ~1 353 insertions, dont `src/http/serveur.ts`, `src/db/schema/*`, `package.json`). **Aucune de ces modifications n'est couverte par le tag.** Avant toute étape (C1 en particulier, qui part de migrations), il faut commiter ou au minimum créer une sauvegarde.

## 2. Table « attendu / réel » — écarts majeurs (détail dans la réponse C0)

| Point | Attendu (docs) | Réel (code) |
|---|---|---|
| Catégorie d'article | Table `categorie` avec `famille` (§3, NOUVEAU) ; `article.categorie_id` | **Texte libre** `article.categorie: text().notNull()` ; aucune `categorie_id` |
| Catégorie de projet | `projet.categorie_id` (NOUVEAU) | **Absente** |
| Lien épisode → projet | `episode.projet_id` (NOUVEAU) | **Absente** |
| Entité livre | `livre`, `livre_traduction`, `livre_media`, `livre_tag` (NOUVEAU) | **Absente** |
| Pagination boutique publique | `GET /public/api/v1/boutique/produits` paginé (§12.2, NOUVEAU) | **Absente** |
| Catégories publiques | `GET /public/api/v1/categories?famille=...` (NOUVEAU) | **Absente** |
| Vues catalogue | `produit_catalogue` (NOUVEAU) | **Absente** |
| Photos fixes | `emplacement_photo` (NOUVEAU) + routes | **Absentes** |
| `projet_traduction.contenu` | NOUVEAU | **Absente** |
| `variante.livre_id`, `variante.libelle` | NOUVEAU | **Absents** (`variante.bijouId` est NOT NULL aujourd'hui) |

## 3. Admin en avance sur le back end (routes MSW seulement, aucune équivalence réelle)

Neuf écrans de l'admin n'ont **aucune route correspondante** dans le back end :
`/galerie`, `/etudes-cas`, `/partenaires`, `/pages-legales`, `/parametres`, `/navigation`, `/textes-interface`, `/audience`, `/motifs-contact`.
Ils fonctionnent contre le faux serveur MSW ; aucun ne fonctionnera contre la vraie API sans travail back end (équivalence **E2** / **D1–D4**).
Les 28 routes publiques existantes (`/contact`, `/collaboration`, `/newsletter`, confirmation/désinscription, `/demandes` POST, 11 familles `GET /contenus/<type>` + `/:slug`) n'ouvrent **ni les articles, ni les bijoux, ni les catégories, ni les paramètres, ni une boutique**. Un site construit depuis l'API aujourd'hui serait vide hors contenus éditoriaux.

## 4. R2 et migration vers Cloudinary (à trancher avant C1)

- Variables R2 **réelles** présentes dans le `.env` local du back end (noms : `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_BASE_URL` ; `.env.example` : valeurs factices).
- Code : `StockageR2` en production, disque local en développement, mémoire en test ; `aws4fetch` présent.
- Documentation « production non exécutée » : rien ne prouve qu'un bucket de production existe, ni qu'un fichier y a été déposé.
- **Décision à prendre** (questions Yann ci-dessous) : s'il n'existe aucun fichier, la migration de fichiers n'aura pas lieu (le prompt prévoit de ne pas écrire `cli/migrer-stockage.ts` dans ce cas).

## 5. Risques

1. **Travail non commité partout** : toute casse ou mauvaise fusion fragilise la « bonne version ». Aucune suppression, aucun rebase avant confirmation.
2. **MSW seul garantit l'admin** : sans back end correspondant, le build de l'admin reste « valide » mais les écrans ne sont pas livrables en production.
3. **Double dépôt sans commit** : les deux `docs/` portent les mêmes fichiers (copies multiples `(1)`/`(2)`) ; une divergence silencieuse entre jeux de copies fera diverger les IA.
4. **Porte `prettier --check docs` admin rouge** à cause de 11 documents de référence non suivis (déposés avant la session) : si l'on fusionne sans les traiter, le canal reste rouge.
5. **Fichiers étrangers au chantier** : `admin/src/probe.ts`, `src.zip` modifié, `admin/src.zip`, 31 fichiers `docs/*.md` dupliqués entre les dépôts.
6. **`/tags`** : le menu livre l'action `creer` (éditeur exclu, test aligné). Si l'intention est « éditeur lit les tags », décision produit à prendre, pas de migration.
7. **`docs/QUESTIONS.md` d'origine absente** dans le site+admin (créé maintenant) ; le back end en possède une, non relue dans cette étape.
8. **Liquide de la mission** : les étapes C1→C9 partent de migrations et de suppression en fin de parcours ; tout travail non commité doit être protégé avant leur exécution.

## 6. Questions à trancher (12 questions §14 du prompt + 3 de cette étape)

1. Fichiers déjà présents dans R2 : à migrer ou non ?
2. Offre Cloudinary choisie : limites de poids, quota, livraison des PDF ?
3. Liste exacte des emplacements fixes de photos (à confirmer avec le site public) ?
4. L'éditeur peut-il changer les photos fixes, ou seulement l'administrateur ?
5. Lettre d'information : option 1 ou option 2 ?
6. Suppression douce de 30 jours : souhaitée ?
7. Les tests ignorés pour les ressources retirées : conserver ou supprimer en C9 ?
8. Domaine personnalisé pour les médias (`MEDIA_PUBLIC_BASE_URL`) : oui ou non ?
9. Catégories de projets : lesquelles (SCHEMAS Q1) ?
10. Champs d'un livre et variantes multiples (SCHEMAS Q2, Q3) ?
11. Puces Villes et Archive dans « Données partagées » du hub (ECRANS E1) ?
12. Les « Guides » de la boutique : produits vendus ou guides PDF (SCHEMAS Q5) ?
13. **Les 24 fichiers non commités de l'admin (lot 4) et les ~31 du back end doivent-ils être commités avant C1 ?** (recommandé, avant toute migration).
14. **`/tags` : l'action `creer` (éditeur exclu) ou `lire` (éditeur lit) ?**
15. Les 11 documents de référence non suivis qui cassent `prettier --check docs` doivent-ils être reformatés, déplacés, ou sortis du contrôle ?
16. Le tag `avant-simplification` back end est léger, faute d'identité git ; voulons-nous une identité (nom/e-mail) configurée pour la suite des tags et branches ?

## 7. Commandes réellement exécutées et leurs résultats

Admin : `prettier --check src e2e README.md` (OK), `tsc -b` (0 erreur), `oxlint --deny-warnings` (OK), `npm test` (211/211, 27 fichiers), `npm run build` (OK, `verifier-dist` propre).
Back end : `npm run typecheck` (OK), `npm run lint` (OK), `npm test` (49/49), `npm run db:demarrer` (container prince-edja-api-postgres-1 « healthy », port 5433), `npm run test:integration` (**114/114**), `npm run build` (OK).

## 8. Étape C1 (Cloudinary) — décisions et résultat, 05/11/2026

- Livrable C1 exécuté côté back end : `StockageCloudinary` (remplace `StockageR2`), `urlPublique` unique, configuration production-only pour les 3 variables Cloudinary, `.env.example`, `docs/DEPLOIEMENT.md`, `docs/ARCHITECTURE.md`, `docs/COUTS.md`, `docs/MEDIAS.md` mis à jour ; `aws4fetch` retirée ; `docs/DECISIONS.md` du back end (B-56).
- **Aucun fichier n'a été migré** : pas de migration de fichiers écrite (`cli/migrer-stockage.ts` non créé) — aucune preuve de fichiers R2 existants ; production non exécutée. Confirmation nécessaire de Yann (Q1 ci-dessus).
- `MEDIA_POIDS_MAX_PDF_MO` reste à 25 par défaut : aucune offre Cloudinary choisie ; le prompt demande de l'aligner sur la limite réelle de l'offre (Q2). À confirmer par Yann.
- Résultats : formatage OK, `tsc --noEmit` OK, `eslint` OK, 57/57 unitaires, **114/114 intégration**, build OK, `/sante` 200 en développement, fichiers locaux de dev inchangés (`/medias-dev`).
- La base de développement n'a pas été touchée ; seulement `prince_edja_test` pour l'intégration. Conteneur `prince-edja-api-postgres-1` toujours démarré (port 5433).

## 9. C0 — reprise du 06/11/2026 (dépôt site + admin, piste ADMIN)

Relecture de C0 avant les étapes admin (C2 à C5, E1, C7). Aucun code modifié.

**Constats nouveaux**
- `docs/RAPPORT-AUDIT-V2-PRINCE-EDJA.md` est **introuvable** dans le dépôt : la mission « site public » (section 9 du rapport) ne peut pas commencer sans lui.
- `docs/prompts/` n'existe pas : le prompt de mission est à la racine de `docs/`. Trois copies coexistent ; la plus récente (05/11 07:54, 33 566 octets) est `PROMPT-CORRECTION-PRINCE-EDJA (2).md`. De même, `ADMIN-SIMPLIFIE (1)` et `DOCUMENTATION-GUIDE-IA (1)` sont plus récents que les fichiers sans suffixe. Lus : les versions les plus récentes.
- Branche `simplification-admin` et tag `avant-simplification` (sur `8874a8d`) déjà en place : non recréés. Le tag ne couvre toujours pas les 23 fichiers modifiés et ~40 non suivis de l'admin (lot 4).
- `prettier --check` échoue sur `admin/src/auth/permissions.ts` (modification non commitée, ressource `livres` ajoutée). Non corrigé en C0.
- Admin : 0 écran `livres`, pas de hub Projets, pas de `GroupeEcrans`, menu de 33 entrées sur 6 groupes ; catégories d'article = énumération figée de 8 valeurs dans `api/schemas/articles.ts` (pas de famille) ; pagination à 20 fixes (« Page X / Y »), sans choix 20/50/100 ni « 21–40 sur 132 ».

**Questions ajoutées**
17. Fournir `RAPPORT-AUDIT-V2-PRINCE-EDJA.md` (ou confirmer que la mission site public attend).
18. Quelle copie des documents fait foi : les fichiers suffixés `(1)`/`(2)` (plus récents) ? Proposition : les renommer et archiver les anciennes copies dans `docs/prompts/archives/` (sur confirmation).
19. Commiter le travail en cours (lot 4) avant C2, pour que le retour arrière soit possible (recommandé).

## 10. Étapes admin C2 à C7 et E1 — 06/11/2026 (faux serveur)

Fait : C2, C3, C4, C5, E1, C6 (partie admin), C7. **Non fait** : C8 (suppression douce, sur
confirmation), C9 (nettoyage, sur confirmation écrite), toutes les étapes du back end (autre dépôt),
missions du site public (rapport d'audit V2 absent ; branche `correctifs-site` non créée).

Solution prudente appliquée en attendant une réponse, pour chaque point :

20. **Contrat 1.5.0 proposé** (`docs/CONTRAT-API.md` § 22) : l'admin l'utilise contre le faux serveur
    seulement. Le back end doit le valider avant D1 à D4 et C6. Contre la vraie API, les nouveaux
    champs (`categorieId`, `projetId`, livres, photos fixes) seraient refusés.
21. **Variantes d'un livre** : tableau entier dans le livre (simple) ou routes dédiées comme les
    bijoux (cohérent avec § 10.3) ? Par défaut : tableau entier.
22. **Prix confirmé d'un livre** : pour un bijou, seul l'admin le confirme (`confirmer_prix`). Le
    formulaire déclaratif des livres ne sait pas encore réserver l'interrupteur à l'admin ; le serveur
    doit refuser la confirmation par un éditeur. À reporter côté back end.
23. **Catégorie d'un article** : le nom reste écrit (texte historique attendu par le back end) avec
    `categorieId`. Le filtre de liste se fait par nom. À basculer sur l'identifiant après D1.
24. **Étiquettes par formulaire** : SCHEMAS ne fixe la liste que pour les articles. Pour épisodes,
    projets, destinations, villes, archive : types historiques (format, pays, thème, projet) ; bijoux
    et livres : sans format. À confirmer.
25. **Photos fixes** : liste de départ d'ECRANS § 5.2 (huit clés), **formats conseillés vides**
    (« à préciser ») : à fournir par le site public (E3). Modification réservée à l'admin (E4).
26. **Guides PDF** : un média n'a pas de « nom de fichier » dans le contrat ; la liste affiche la
    légende ou le texte alternatif. Ajouter `nomFichier` au média ?
27. **Tableau de bord** : ECRANS § 1 liste quatre blocs ; le bloc « Administration » (liens Comptes,
    Activité) existait et est conservé. Le retirer en C9 ?
28. **Réglages pour l'éditeur** : l'entrée Réglages est réservée à l'admin (ADMIN-SIMPLIFIE § 2.8),
    alors que les droits laissaient l'éditeur modifier une page légale. L'adresse `/pages-legales`
    reste accessible à l'éditeur ; seul le menu change.
29. **Preuves et presse pour l'éditeur** : visibles (distinctions, presse, partenaires), sans Audience.
    ADMIN-SIMPLIFIE dit « administrateur » : restreindre ?
30. **Vendeur** : ECRANS § 0.5 limite le vendeur à Boutique et Médiathèque ; ses droits sur
    `demandes` existent toujours (`peut()`), seul le menu les masque. La copie `droits/peut.ts` du back
    end doit recevoir `emplacements-photos` (seul ajout fait à `peut()`).
31. **Suppression d'un projet qui a des épisodes** (RG-32, `on delete restrict`) : le faux serveur ne
    le refuse pas encore ; le back end doit le faire.
32. **Format conseillé, libellés Template** : repris tels quels d'ECRANS (« X'PLORE » avec apostrophe
    droite, comme dans le document).

## 11. Site public — mission 2 : pagination d'EDJA Shop — 06/11/2026 (branche `correctifs-site`)

Fait : `obtenirProduits` (`src/lib/catalogue.ts`, même forme que l'API), `usePagination` /
`useCorrigerPage` (`src/hooks/usePagination.ts`), composant `Pagination`, catalogue réécrit
(`FiltresCatalogue`), titre et canonical par page (`useSeo` accepte `requete`). Mission 1 : **bloquée**
(rapport d'audit V2 absent). Mission 3 (branchement API) : pas faite, attend votre ordre.

33. **Tri « nouveautés »** : les données locales n'ont pas de date de publication ; l'ordre des
    données fait foi (bijoux puis livres) jusqu'au branchement sur l'API (`publie_le` décroissant).
34. **Filtre créateur** : aucun produit n'a de créateur renseigné ; le filtre n'apparaît qu'à partir
    d'un créateur (une liste vide ne filtrerait rien). Il apparaîtra seul avec les données.
35. **Livres dans le catalogue** : les quatre livres de maquette (« (maquette) ») apparaissent avec la
    carte existante de la section Livres, sans lien (ils n'ont pas de fiche). Les retirer du
    catalogue paginé tant que la vraie liste manque ?
36. **Recherche texte** : gardée (elle existait), dans l'adresse (`?q=`), en remplacement d'historique.
37. **Canonical** : `?page=N` seulement (les combinaisons de filtres ne sont pas canoniques).
38. **Tests de la racine** : `vitest.config.ts` ne lance plus que `src/**` ; il ramassait aussi les
    tests de l'admin, qui échouaient faute de leurs alias (déjà le cas avant cette mission).

## 12. Audit V2 — 06/11/2026

Question 17 résolue : à la demande du client, l'agent a rédigé lui-même
`docs/RAPPORT-AUDIT-V2-PRINCE-EDJA.md` (verdict : pas prêt ; 2 bloquants : formulaires figés sur
`localhost:3000` dans le build, guides PDF absents). Les décisions à prendre sont au § 8 du rapport ;
la section 9 liste les corrections de la mission 1.

## 13. Site public — filtres tirés des catégories — 06/11/2026 (branche `correctifs-site`)

Règle du client : les filtres publics sont les catégories créées dans l'admin. Détail et écarts :
`docs/PROPOSITION-TEMPLATES-PROJETS.md` § 9.4.

- `/histoires` : Tous les projets · Film · Tourisme · Patrimoine (remplace les 7 filtres en dur).
- `/journal` : les catégories d'articles qui ont au moins un article (« Voyage », vide, n'apparaît pas).
- `/boutique` : les catégories de produits non vides, avec effectifs.
- Vérifications : `typecheck` propre, 51 tests du site verts, build de production, contrôle dans un
  navigateur à 1440 et 390 px (aucun débordement).

**Question 18** : faut-il garder, à côté des catégories, un filtre par format ou avancement sur
`/histoires` (Documentaires, Séries, Archives, En production) ? Il a été retiré avec les filtres en dur.

## 14. Corrections de l'audit V2 sans décision — 06/11/2026

Suivi détaillé : `docs/RAPPORT-AUDIT-V2-PRINCE-EDJA.md` § 10.
Tranchées par le client le 06/11 : § 8.2 (guides PDF fournis depuis l'admin), § 8.3 (les livres font
partie du site), § 8.4 (**Edja Shop**). Le 07/11 : § 8.1 (**lien e-mail**), § 8.5 (choix laissé à
l'agent, règle décrite en C-06), C-15 (**loader à 2,5 s**). Plus aucune décision ouverte sur l'audit V2.
Déploiement : le workflow GitHub Pages ne définit pas `PUBLIC_API_URL` ; tant qu'il ne le fait pas,
les formulaires du site en ligne préparent un e-mail au lieu d'envoyer en ligne.

## 15. Site public — S0 et S1 du plan de lancement — 07/11/2026 (branche `correctifs-site`)

- **S0** : `npm audit fix` (sans `--force`) : Vite 8.2.2 → 8.3.6 dans la plage déclarée (`^8.2.2`,
  `package.json` inchangé), 2 failles hautes du serveur de développement corrigées, `npm audit` à 0.
- **S1, porte G1 atteinte** : `src/acces/` (six modules : `site`, `journal`, `projets`, `boutique`,
  `categories`, `preuves`) est le seul lecteur de `src/data/*` ; 60 fichiers basculés, aucun
  changement de rendu (contrôle navigateur sur 12 routes, carte comprise, 0 erreur de console).
  Règle oxlint `no-restricted-imports` : un `@/data/*` hors de la couche fait échouer le lint.
  Modules synchrones plutôt que hooks : LIAISON § C.2 charge l'API à la construction.
- Vérifié : types, lint (5 avertissements antérieurs), 64 tests, build.

**Question 33** (pour le back end et le responsable du contrat) : le contrat (§ 18) ne décrit pas la
forme des réponses de `GET /public/api/v1/contenus/{type}` : images en identifiants ou en objets
`{ url, alt, largeur, hauteur, declinaisons }` (LIAISON § C.4), traductions entières ou résolues dans
la langue demandée, champs de cycle de vie exposés ou non. Sans cette forme, les adaptateurs « contrat
→ site » de S2 ne peuvent pas être écrits sans inventer. Seules `boutique/produits` (SCHEMAS § 12.2,
proposition 1.5.0) et `categories` (1.4.0) sont décrites.

**Question 34** : `scripts/charger-donnees.ts`, `zod` dans le `package.json` du site et le script
`npm run charger` viennent d'une session antérieure et ne sont pas commités : `zod` n'est justifié
dans aucun `docs/DEPENDANCES.md`, et le script appelle `/reglages` et `/photos-fixes`, absentes du
contrat 1.4.0. À reprendre en S2, une fois la question 33 tranchée.

## 16. Back end, intégration admin et contrat 1.5.0 — 07/11/2026

Autorisation du client (« tu es autorisé ») : l'agent travaille aussi dans `prince-edja-api`.
Détail : `prince-edja-api/docs/DECISIONS.md` B-61 à B-65 et `admin/docs/DECISIONS.md` D-81.

- C6 côté back end (photos fixes administrables), écritures de l'admin acceptées (projets et
  templates, épisodes, livres), fin du lot 3 et réglages du lot 4, vue publique et Journal en public.
  Migrations additives 0009 à 0011 ; correctif de la descente de 0005.
- **Contrat 1.5.0 arrêté** (§ 18.1, § 22.9) ; copies identiques dans les deux dépôts.
- Test de contrat de l'admin contre l'API réelle : 39 sur 39. Back end : 57 tests unitaires,
  153 d'intégration, build OK.

Questions tranchées : **20** (contrat 1.5.0 validé par le back end), **21** (variantes d'un livre :
tableau entier accepté, routes conservées), **31** (projet avec épisodes : suppression refusée,
`422 RG-32`), **33** (forme des réponses publiques : § 18.1 du contrat). **34** reste ouverte :
`scripts/charger-donnees.ts` et `zod` du site, à reprendre en S2 selon le § 18.1.

## 17. Site public — S2, première moitié : données lues dans l'API — 08/11/2026

Détail : `admin/docs/DECISIONS.md` D-83 et `prince-edja-api/docs/DECISIONS.md` B-66.

- **Chargeur** (`npm run charger`, `scripts/charger-donnees.ts`) réécrit sur le § 18.1 : toutes les
  pages de neuf familles de contenus, catégories des trois familles, catalogue d'Edja Shop et fiche
  de chaque produit ; chaque réponse validée par Zod (`docs/DEPENDANCES.md`), écrite dans
  `src/data/generated/` (ignoré par Git) avec un manifeste. `/reglages` et `/photos-fixes` ne sont
  plus appelées.
- **Couche d'accès** : `PUBLIC_DATA_SOURCE=api` bascule journal, projets, épisodes, destinations,
  presse, distinctions, jalons, partenaires, offres, catégories, bijoux et livres sur ces fichiers,
  par des adaptateurs purs (`src/acces/adaptateurs.ts`, 9 tests). Sans la variable, rien ne change :
  la CI construit toujours avec les données de départ. En mode API, `vite.config.ts` refuse de
  construire si les fichiers manquent.
- Vérifié : types, lint (5 avertissements antérieurs), 73 tests, trois constructions (par défaut sans
  donnée de l'API, mode API sans fichiers → échec, mode API → 0 maquette dans `dist`), navigateur sur
  19 routes en mode API avec un exemple publié de chaque famille : 0 erreur de console.
- Corrigés au passage : la fiche d'un **livre** répondait « Objet introuvable » (aussi avec les
  maquettes) ; Histoires annonçait « Aucun projet dans ce filtre » sans filtre quand le seul projet
  est à la une.

**Reste pour fermer S2 (porte G4)** : le **prérendu**. Le site reste une application rendue dans le
navigateur : la source HTML d'une page ne contient pas encore son contenu.

Question **34** tranchée (chargeur et `zod` repris sur le § 18.1, dépendance justifiée).

**Question 35** (contrat) : les listes publiques ne donnent les étiquettes qu'en identifiants
(`tagIds`). Le site ne peut donc pas remplir `pays` ni `theme` (recherche, filtres, carte des
projets) : ils restent vides en mode API. Proposition pour 1.6.0 : résoudre les étiquettes comme les
images, `etiquettes: [{ type, code, libelle }]` dans la langue demandée.

**Question 36** (contrat) : un produit public n'a pas d'identifiant ; une `CibleInterne` vers un
bijou ne peut pas être résolue par le site (le projet qui la porte retombe sur la page de son
template). Ajouter `id` aux produits publics, ou résoudre les cibles côté API (`cible.chemin`) ?

**Question 37** (textes) : plusieurs textes d'interface comptent les contenus en dur (« Six routes.
Six histoires. », « Six étapes, une saison »). Justes pour la saison 1 ; faux dès qu'un épisode est
ajouté ou retiré dans l'admin. À rendre administrables (textes d'interface) ou à reformuler sans
nombre ?
