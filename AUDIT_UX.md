# AUDIT UX & CONFORMITÉ — Prince Edja

> Audit indépendant, en lecture seule. Aucun fichier du projet n'a été modifié.
> Seuls `AUDIT_UX.md` (ce rapport) et `audit/` (captures) ont été ajoutés.

---

## 0. AVERTISSEMENT DE MÉTHODE — à lire avant tout

**Les deux sources de vérification exigées n'existent pas dans le projet :**

- **Le CDC (PDF) est absent.** Aucun fichier `*cdc*` ni `*.pdf` à la racine, dans `src/`, `admin/` ou ailleurs.
- **`CDC_TACHES_PRINCE_EDJA.md` est absent.**

Par conséquent :
- La section « conformité tâche par tâche » ne peut **pas** être remplie contre la source. Elle est remplacée par la liste des **15 identifiants T-xxx encore cités dans le code** (`T-120`, `T-121`, `T-122`, `T-123`, `T-152`, `T-213`, `T-214`, `T-215`, `T-216`, `T-217`, `T-301`, `T-304`, `T-331`, `T-340`, `T-343`), avec ce que le code en fait. Ces identifiants sont des **traces**, pas le cahier des charges : leur exigence réelle est inconnue.
- Les critères V1 à V7 ont été évalués **par déduction** depuis l'interface observée et `A-FOURNIR.md`, pas depuis un énoncé officiel.
- Les écarts « CDC vs code » signalés en section 10 proviennent de mentions partielles dans `AGENTS.md` et les commentaires du code, pas du document lui-même.

**Tout constat ci-dessous est marqué** : `OBSERVÉ` (vu dans le navigateur), `DÉDUIT` (lu dans le code), ou `NON VÉRIFIÉ`.

---

## 1. Résumé exécutif

**Verdict global : solide et ambitieux, mais pas livrable en l'état.** L'ossature UX tient (hiérarchie claire, parcours courts, carte fonctionnelle), mais trois choses empêchent la mise en ligne : les **guides PDF renvoient une page HTML déguisée en 200**, les **formulaires de contact et B2B échouent faute de clé**, et **les photos produit sont un placeholder unique répété dix fois**.

**5 forces**
1. Parcours très courts : le CTA « Travailler avec Prince » est à 1 clic sur toutes les pages.
2. Le système de tokens est réellement tenu : **0 couleur hors palette** sur les 40 valeurs utilisées, 3 rayons, 8 tailles (1 seule entorse).
3. La carte X'PLORE est vraie, cadrée sur le pays entier, tracé OSRM avec repli en ligne droite.
4. `prefers-reduced-motion`, lien d'évitement, hiérarchie des titres et focus visible sont conformes partout (vérifié au clavier).
5. L'honnêteté des données manquantes : rien n'est inventé, tout est signalé « À fournir ».

**5 risques majeurs**
1. **Guides PDF = page HTML en statut 200** : le visiteur télécharge un fichier `.pdf` de 1,6 Ko qui est en réalité la page du site (`OBSERVÉ`, `curl`).
2. **Formulaires morts** : pas de `.env`, donc `envoyerFormulaire()` retourne `false` et affiche « L'envoi a échoué » (`DÉDUIT`, `src/lib/formulaire.ts:11`). Parcours (a) bloqué.
3. **Le Shop n'est pas démontrable** : les 10 pièces partagent le même md5, 7 vignettes de porté en 404, tous les prix à `null` donc le tri par prix est inopérant.
4. **Ton incohérent** : « Décris **ton** projet » (tutoiement) contre « **Votre** nom / écrivez-**nous** » (vouvoiement) ailleurs.
5. **Textes d'atelier en production** : « PROPOSITION à valider », « modèle », « template » visibles sur Accueil, À propos, Presse.

---

## 2. Méthode et périmètre

**Testé**
- Site lancé en local (`npm run dev`, port 5199). **54 captures** plein écran : 18 routes × 375 / 768 / 1280 px (`audit/`).
- Parcours au clavier seul sur l'accueil ; vérification de l'anneau de focus.
- Mesures DOM : nombre de titres, liens, images sans `alt`, cibles tactiles par route.
- Requêtes réseau : ressources en échec au chargement, fichiers liés (`.pdf`), débordement horizontal.
- `prefers-reduced-motion: reduce` sur Accueil et Presse.
- Cohérence : recherche exhaustive des couleurs, tailles, rayons et polices dans `src/`.

**Non testé / non vérifiable**
- Le CDC et `CDC_TACHES_PRINCE_EDJA.md` (absents) → **aucune conformité tâche par tâche n'est affirmée**.
- Envoi réel des formulaires (nécessite une clé Web3Forms).
- Sous-titres vidéo : **aucune vidéo n'est présente sur le site** (trailers à fournir) → hors périmètre observé.
- Le back-office admin (routes `/admin/*` non auditées).
- Accessibilité approfondie (lecteurs d'écran, audit axe/WAVE) : seuls les fondamentaux sont vérifiés.

---

## 3. Verdict sur les 7 critères

| # | Critère | Verdict | Preuve |
|---|---|---|---|
| V1 | En 30 s, une marque comprend qui est Prince Edja et comment travailler avec lui | **Partiel** | Dès le premier écran : nom, signature, manifeste et CTA « Travailler avec Prince » visible sans scroll (`OBSERVÉ`). Mais le « comment » repose sur un CTA seul : les 6 piliers sous lui sont des squelettes sans texte et les 8 offres affichent « PROPOSITION à valider » (`DÉDUIT`). |
| V2 | Passage naturel d'une histoire à un film, une destination ou un produit | **Partiel** | La nav le permet. Mais les 6 lignes de films de l'accueil pointent **toutes vers `/xplore`**, pas vers leur fiche (`DÉDUIT`, `FilmsList.tsx`). Aucun pont film → boutique sur la fiche épisode (`OBSERVÉ`). |
| V3 | Le Shop reste commercial sans casser l'univers premium | **Partiel** | Le registre est luxe (lookbook, édition numérotée, vente sur demande). Mais **0 prix affiché** (tous `null`), tri inopérant, 10 visuels identiques, 7 portés en 404 (`OBSERVÉ`/`DÉDUIT`). |
| V4 | Lisible et rapide sur mobile | **Partiel** | Aucun débordement horizontal à 375 px (`OBSERVÉ`). Mais 5 cibles < 32 px sur l'accueil dont le logo à 24 px et le lien LinkedIn à 18 px (`OBSERVÉ`), et la page fait ~16 écrans. |
| V5 | L'équipe peut publier sans développeur | **Non atteint** | L'admin intégré est décoratif : `AdminGuard` lit `sessionStorage`, identifiants `admin`/`admin` par défaut (`DÉDUIT`, AGENTS.md §Trois surfaces). La décision « CMS réel ou admin local » est non tranchée (`A-FOURNIR.md` §12-4). |
| V6 | Design distinctif, culturel, international, sans clichés visuels africains | **Atteint sur la direction** | Palette ivoire/encre/or + terracotta unique, trame de tissage abstraite sans symbole nommé, géométrie vectorielle de la Côte d'Ivoire (`OBSERVÉ`). Réserve : la boutique ne peut pas le prouver tant que les visuels sont des placeholders. |
| V7 | Données d'audience, distinctions et fonctions administrables et datées | **Partiel** | Les écrans d'admin existent (articles, épisodes, distinctions, site, médias) mais **toutes les données sont vides et sans date** (`DÉDUIT`, `lib/adminStore.ts`). A-FOURNIR confirme que rien n'est fourni. |

---

## 4. Règle des 2 à 3 clics

| Information stratégique | Chemin | Clics | Verdict |
|---|---|---|---|
| Travailler avec Prince | CTA du header, présent sur toutes les pages | **1** | Conforme |
| Bio / Mon histoire | Menu « Prince Edja » → Mon histoire | **2** | Conforme |
| Un film | Accueil → galerie → film, ou X'PLORE → liste | **2–3** | Conforme |
| Une destination X'PLORE | X'PLORE → carte/liste des étapes → fiche | **3** | Conforme (limite) |
| Un produit | Edja Shop → pièce | **2** | Conforme |
| Newsletter | Pied de page → formulaire (scroll nécessaire) | **1 + scroll** | Acceptable |
| Recherche | Bouton ou ⌘K, disponible partout | **1** | Conforme |
| Media kit | À propos → bouton « Press kit » | **2** | **à vérifier** : bouton habillé en contrôle mais sans cible (`NON VÉRIFIÉ`) |
| Guide d'étape (PDF) | X'PLORE → fiche → « Télécharger le guide » | **3** | **Cassé** (AUD-001) |

---

## 5. Conformité tâche par tâche

**Impossible contre la source** (CDC absent). Les 15 identifiants retrouvés dans le code :

| ID | Ce que le code en dit | Fichier | État apparent |
|---|---|---|---|
| T-120 | Écran « Audience » | `sections/about/Audience.tsx` | Présent, données vides |
| T-121 | Timeline / parcours | `AboutPage.tsx` | Présent |
| T-122 | Modèle d'étude de cas | `sections/about/EtudesCas.tsx` | Présent, squelette |
| T-123 | Media kit | `sections/about/EtudesCas.tsx` | Bouton présent, cible non vérifiée |
| T-152 | Segmentation newsletter | `pages/NewsletterPage.tsx` | Préparée en données, non exposée |
| T-213 | Créateur de la pièce | `ObjetPage.tsx:169` | Bloc présent, vide |
| T-214 | Fiche technique | `ObjetPage.tsx:190` | Présent, « À fournir » |
| T-215 | Livraison | `ObjetPage.tsx:204` | Présent, « À fournir » |
| T-216 | Réassurance | `ObjetPage.tsx:204` | Fusionné avec T-215 |
| T-217 | Cross-sell | `ObjetPage.tsx:226` | Présent |
| T-301 | (non documenté) | — | Inconnu |
| T-304 | (non documenté) | — | Inconnu |
| T-331 | Étapes de la saison | `data/destinations.ts` | Présent, 6 étapes |
| T-340 | (non documenté) | — | Inconnu |
| T-343 | (non documenté) | — | Inconnu |

Les exigences associées ne sont pas connues : **aucun statut Conforme/Partiel/Absent n'est affirmé ici**.

---

## 6. Parcours critiques

| Parcours | Résultat | Blocage |
|---|---|---|
| (a) Une marque veut collaborer | **Bloqué** | CTA → page Travailler ensemble → formulaire B2B. **Pas de clé Web3Forms** → « L'envoi a échoué » (`DÉDUIT`). |
| (b) Un journaliste cherche bio et portraits | **Bloqué par le contenu** | Page Presse présente, mais bios 50/150 mots, portraits HD et logos sont « À transmettre » (`A-FOURNIR.md` §3.4, §5). |
| (c) Un festival veut programmer un film | **Fonctionnel** | X'PLORE → épisode → « Être informé de la projection » → `mailto` pré-rempli avec le titre du film (`OBSERVÉ`). |
| (d) Un acheteur veut demander une pièce | **Fonctionnel** | Boutique → « Ajouter » → bouton flottant → panneau → `mailto` avec la sélection (`OBSERVÉ`). |
| (e) Un visiteur s'abonne | **Fonctionnel mais trompeur** | Inscription enregistrée en local ; le message annonce honnêtement qu'aucune confirmation n'est envoyée (`OBSERVÉ`). Réserve : la case de consentement porte « (texte à fournir) ». |
| (f) Explorer une destination et trouver des produits liés | **Partiel** | La fiche destination a une passerelle boutique (`DÉDUIT`), mais sans prix ni photo réelle. |


---

## 7. Cohérence

### 7.1 Design system — globalement conforme
- **Couleurs** : les 40 valeurs `(text|bg|border)-*` utilisées existent toutes dans `@theme`. **Aucune couleur hors tokens.** Les seuls hex écrits en dur sont ceux de la carte Leaflet, documentés comme obligatoires (attributs SVG) (`OBSERVÉ`).
- **Typographie** : 3 familles, aux rôles nets — Anton (display), Fraunces (citation), Manrope (corps). `OBSERVÉ`.
- **Rayons** : 2 entorses seulement, `rounded-[3px]` dans `DistinctionsCarousel.tsx`.
- **Tailles** : **une seule** entorse, `text-[11px]` à `DestinationPage.tsx:139`.
- **Espacements** : padding de héros unique, `section-y`, deux largeurs de conteneur — tenus.
- **États** : survol, focus, `aria-pressed`, désactivation explicite (`disabled:opacity-50`) sont cohérents.

### 7.2 Écarts avec le CDC — non tranchables sans le document
Deux mentions trouvées dans `AGENTS.md` méritent une décision (voir §10) : typographie (3 familles, titres en sans condensée Anton, contre « deux familles max, serif pour les titres ») et palette (vert `forest`/`leaf`/`sage` en plus des 5 couleurs de base).

### 7.3 Composants — 4 incohérences relevées
1. **Trois formes de carte produit** : carte de galerie (image seule + lien), carte du catalogue (image + prix + bouton), cross-sell (image + étiquette). Comportements de survol différents (`zoomOnHover` sur l'une, silence sur l'autre).
2. **Deux gabarits de fiche pour un même épisode** : `/xplore/:slug` et `/destinations/:slug` affichent la même image, le même lieu et le même pitch, avec deux squelettes distincts (`OBSERVÉ`).
3. **Trois styles de titre de section** : `Eyebrow num` (standard), `Eyebrow` seul, titre nu sans marqueur.
4. **Boutons fantômes** : des éléments habillés en bouton (bordure, 44 px) ne sont pas cliquables — « Press kit » (`AboutPage.tsx:91-96`), facettes de l'archive (`ArchivePage.tsx:51-57`).

### 7.4 Éditorial — 5 constats
1. **Incohérence de ton (majeur)** : « Décris **ton** projet » (tutoiement, `TravaillerEnsemblePage.tsx:33-34`) contre « **Votre** nom », « Parlons de **votre** projet », « écrivez-**nous** » (vouvoiement, `ContactPage.tsx:73`, `AboutPage.tsx:240`, `ShopPage.tsx:246`).
2. **Textes d'atelier en production** : « PROPOSITION à valider… » (`Collaborations.tsx:31`), « modèle » / « template » (`DistinctionsCarousel.tsx`), « (texte à fournir) » (`BlocNewsletter.tsx:161`).
3. **Vocabulaire Boutique/Shop** : le menu dit « Edja Shop », le fil d'Ariane dit « Boutique », la page dit « Collection TRIBE ».
4. **Casse des titres** : les `h2` de section et les `h3` de contenu sont tous deux en majuscules Anton, ce qui aplatit la hiérarchie.
5. **Ponctuation** : le point final en terracotta est bien traité partout (`aria-hidden`), sans incohérence relevée.

### 7.5 Données — 4 constats
1. **10 visuels produit identiques** (md5 commun, 23 919 o) : le lookbook affiche la même image 10 fois (`OBSERVÉ`, `public/images/boutique/*.jpg`).
2. **La une du Journal est inaccessible** : `ALaUne.tsx:21` cherche `statut === 'publié'`, or les 7 articles sont « à venir » → la branche ne s'affiche jamais, et la même photo d'épisode apparaît trois fois sur l'accueil (`DÉDUIT`).
3. **Chiffres sans date** : « 600K+ », « 30+ », « 4 », « 11 ans » et « À fournir » (Portée) affichés sans date de validation, contrairement à ce que `A-FOURNIR.md` §1 demande.
4. **Textes imposés non repris** : `SITE.mission` est reformulé en citation, ce qui est défendable, mais la signature du hero (« Griot 2.0 · Storyteller · Explorer ») et le manifeste doivent être vérifiés contre le CDC (`NON VÉRIFIÉ`).

### 7.6 Motion — conforme dans l'ensemble
- 3 durées, 2 easings, `prefers-reduced-motion` vérifié sur Accueil et Presse (aucune animation active).
- Réserve : le marquee et `FloatingPreview` sont cumulés avec parallaxes et loader d'intro — la home additionne beaucoup de matière. Le loader d'intro retarde l'affichage du contenu de plusieurs secondes (à mesurer comme un coût, pas un défaut).

### 7.7 Navigation vs architecture — 1 constat
- **Les 6 lignes de films de l'accueil mènent toutes à `/xplore`** (`FilmsList.tsx`), jamais à la fiche de l'épisode qu'elles annoncent. C'est le principal écart entre ce que la navigation promet et ce qu'elle livre.

---

## 8. Catalogue des constats

| ID | Axe | Gravité | Où | Observation | Preuve | Reco |
|---|---|---|---|---|---|---|
| AUD-001 | UX | **Bloquant** | `/xplore/*`, `/destinations/*` | Les 5 guides « Télécharger le guide » renvoient **200 + text/html** : la page du site, pas un PDF. `public/guides/` n'existe pas. | `curl` → `200 text/html 1588o` | Fournir les PDF ou retirer le bouton |
| AUD-002 | UX | **Bloquant** | `/contact`, `/a-propos` | Pas de `.env` → `envoyerFormulaire()` retourne `false` → « L'envoi a échoué ». Parcours marque mort. | `formulaire.ts:11`, `.env` absent | Configurer `VITE_WEB3FORMS_ACCESS_KEY` |
| AUD-003 | Cohérence | **Majeur** | tout le site | Ton incohérent : tutoiement vs vouvoiement | `TravaillerEnsemblePage.tsx:33` vs `ContactPage.tsx:73` | Trancher une fois pour tout le site |
| AUD-004 | Cohérence | **Majeur** | accueil, presse | Textes d'atelier visibles (« PROPOSITION à valider », « template ») | `Collaborations.tsx:31`, `DistinctionsCarousel.tsx` | Masquer les mentions internes |
| AUD-005 | Cohérence | **Majeur** | `/boutique` | 10 visuels identiques, 7 portés en 404, 0 prix | `public/images/boutique/*.jpg` | Fournir les photos et les prix |
| AUD-006 | UX | **Majeur** | accueil | Les 6 lignes de films pointent vers `/xplore`, pas vers leur fiche | `FilmsList.tsx:43` | Lier chaque ligne à son épisode |
| AUD-007 | UX | **Majeur** | accueil | La une du journal ne peut jamais s'afficher (0 article publié) | `ALaUne.tsx:21` | Afficher le dernier film par défaut |
| AUD-008 | Cohérence | **Majeur** | accueil | Cibles < 32 px : logo 24 px, lien LinkedIn 18 px, cartouche presse 24 px, champ footer 16 px | Mesure DOM à 375 px | Porter à 44 px |
| AUD-009 | Cohérence | **Majeur** | `/mentions-legales` et sœurs | Pages légales en `noindex` et sans contenu | `LegalPage.tsx` | Attendre les textes (déjà prévu) |
| AUD-010 | Cohérence | Mineur | accueil, presse | Boutons fantômes (Press kit, facettes archive) | `AboutPage.tsx:91`, `ArchivePage.tsx:51` | Lier ou retirer l'habillage bouton |
| AUD-011 | Cohérence | Mineur | `/boutique` | Tri par prix inopérant (tous `null`) | `shop.ts:14` | Masquer le tri tant qu'il est vide |
| AUD-012 | Cohérence | Mineur | plusieurs | Vocabulaire Boutique / Edja Shop / Collection TRIBE | menu vs `navigation.ts` | Un seul nom |
| AUD-013 | Cohérence | Mineur | fiche épisode | Deux gabarits pour un même contenu | `EpisodeDetailPage` vs `DestinationPage` | Fusionner ou rediriger |
| AUD-014 | Cohérence | Détail | `/destinations/*` | `text-[11px]` hors échelle | `DestinationPage.tsx:139` | `text-caption` |
| AUD-015 | Cohérence | Détail | presse | `rounded-[3px]` hors échelle | `DistinctionsCarousel.tsx:21` | `rounded-md` |
| AUD-016 | UX | Mineur | `/journal`, `/a-propos` | Newsletter en double (section + pied de page) | `JournalPage.tsx:94` | Ne garder qu'une occurrence |
| AUD-017 | Cohérence | Mineur | accueil | Chiffres sans date de validation | `site.ts` stats | Ajouter la date ou retirer |
| AUD-018 | UX | Détail | toutes | Marqueur de section `num` non monotone | `Eyebrow` | Reséquencer |
| AUD-019 | Cohérence | Mineur | `/admin` | Auth décorative, identifiants par défaut | AGENTS.md §Trois surfaces | À traiter avant exposition réelle |
| AUD-020 | UX | Détail | toutes | Loader d'intro retarde le contenu | `LoaderIntro` | Mesurer et réduire |

---

## 9. Plan de correction priorisé

### Priorité 1 — Débloquer (impact élevé, effort faible)
- **T-401 · Fournir ou retirer les guides PDF** (AUD-001). Si les PDF ne sont pas prêts : transformer le bouton en « Carnet à venir » plutôt qu'en lien mort.
- **T-402 · Configurer Web3Forms** (AUD-002). Ajouter `.env` et documenter la variable. Tant que la clé est absente, afficher dès l'arrivée sur la page contact un message explicite au lieu de laisser remplir le formulaire.
- **T-403 · Trancher le ton** (AUD-003). Une passe unique ; le site s'adresse à des marques et des festivals, donc le vouvoiement est recommandé.

### Priorité 2 — Crédibilité (impact élevé, effort moyen)
- **T-404 · Purger les textes d'atelier** (AUD-004). Trois fichiers, termes à remplacer par des mentions « à venir » sobres.
- **T-405 · Corriger les liens des films** (AUD-006) et **la une du journal** (AUD-007).
- **T-406 · Porter les cibles tactiles à 44 px** (AUD-008) : logo, lien LinkedIn, cartouche presse, champ newsletter compact.

### Priorité 3 — Finition (impact moyen, effort faible)
- **T-407 · Ramener la boutique dans l'échelle** : `text-[11px]`, `rounded-[3px]`, tri prix masqué, nom unique (AUD-011, 012, 014, 015).
- **T-408 · Fusionner les gabarits épisode/destination** (AUD-013) ou rediriger l'un vers l'autre.
- **T-409 · Boutons fantômes** (AUD-010) : les lier ou leur retirer l'apparence de bouton.
- **T-410 · Newsletter en double** (AUD-016) et **dates sur les chiffres** (AUD-017).
- **T-411 · Sécuriser ou masquer l'admin** (AUD-019) avant toute exposition publique.

---

## 10. Décisions qui vous reviennent

| # | Question | Pourquoi ça bloque |
|---|---|---|
| 1 | **Où est le CDC ?** | Sans lui, aucun contrôle de conformité n'est possible. Les 15 T-xxx du code sont des traces sans énoncé. |
| 2 | **Typographie** : 3 familles (Anton/Fraunces/Manrope), titres en sans condensée. Le CDC mentionnerait « deux familles max, serif pour les titres ». | Change toute la direction artistique. Le style actuel fonctionne ; il faut juste confirmer. |
| 3 | **Palette** : verts `forest`/`leaf`/`sage` en plus d'ivoire/noir/chocolat/or/terracotta. | Même enjeu. |
| 4 | **Motion** : `MagneticButton`, marquee, loader d'intro, aperçu flottant — « gadget » ou « sobres » ? | Le CDC parlerait d'« aucune animation gadget ». |
| 5 | **Textures papier/grain** : le grain existe (utilitaire `grain`), mais est-ce la texture papier attendue ? | Vérification visuelle impossible sans référence. |
| 6 | **Nom de la boutique** : Edja Shop, Boutique, Collection TRIBE ? | Un seul nom, partout. |
| 7 | **Guides PDF** : les fournir ou masquer les boutons ? | Débloque 5 liens actuellement cassés. |
| 8 | **CMS** : garder l'admin local ou en choisir un vrai ? | Condition du critère V5. |

---

## 11. Annexe

**Routes parcourues (18)** : `/` · `/a-propos` · `/histoires` · `/xplore` · `/xplore/le-dernier` · `/taste-and-travel` · `/boutique` · `/boutique/akuaba` · `/journal` · `/journal/afrique-multitude-de-mondes` · `/presse` · `/travailler-ensemble` · `/contact` · `/destinations/le-dernier` · `/archive-afrique` · `/newsletter/confirmation` · `/mentions-legales` · route inexistante (404).

**Tailles d'écran** : 375×667, 768×1 024, 1280×800.

**Captures** : 54 fichiers dans `audit/`, nommés `{taille}-{route}.png`.

**Outils** : navigateur automatisé Chromium (hors dépendances du projet), mesures DOM et réseau, `curl`. Aucun paquet npm n'a été ajouté au projet.

---

## Ce que je n'ai pas pu vérifier, et pourquoi

1. **La conformité au CDC** : le document est absent du projet.
2. **L'envoi des formulaires** : il faut une clé Web3Forms active.
3. **Les sous-titres vidéo et les trailers** : aucune vidéo n'est publiée sur le site.
4. **Le back-office** : routes `/admin/*` non auditées (hors périmètre annoncé).
5. **L'accessibilité réelle aux lecteurs d'écran** : seuls le focus visible, le lien d'évitement, la hiérarchie des titres et les `alt` sont vérifiés mécaniquement.
6. **Le comportement du marquee sous `prefers-reduced-motion`** : l'élément n'était pas monté sur les pages testées au moment de la mesure.
7. **Le media kit / press kit** : bouton présent, cible introuvable sans clic (`NON VÉRIFIÉ`).
8. **La performance réelle** (LCP, poids) : non mesurée faute d'outil dédié hors projet.
