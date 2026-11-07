# Rapport d'audit V2 — site public Prince EDJA

> **Date** : 06/11/2026 · **Branche auditée** : `correctifs-site` (état du dossier de travail,
> modifications non commitées comprises) · **Auteur** : agent IA, à la demande du client.
> Fait suite à `AUDIT_UX.md` (V1, 15/10/2026). Captures : `audit/v2/` (25 routes × 1440 et 390 px).

## 1. Verdict

**Pas prêt pour une mise en ligne publique.** La base technique est saine, mais deux défauts
empêchent des parcours essentiels, et plusieurs textes de travail sont encore visibles.

| | État |
|---|---|
| Technique (erreurs, réseau, build) | ✅ prêt |
| Accessibilité automatique | ⚠️ 2 pages sur 25 en défaut |
| Mobile | ⚠️ 1 débordement, cibles tactiles trop petites |
| Parcours « contacter », « télécharger un guide » | ❌ cassés |
| Contenu (textes d'atelier, photos, pages légales) | ❌ à fournir ou à nettoyer |

## 2. Méthode

- Build de production (`npm run build`) servi par `vite preview`, navigateur Chromium automatisé.
- 25 routes : `/`, `/a-propos`, `/a-propos/influence`, `/histoires`, `/xplore`, `/xplore/le-dernier`,
  `/taste-and-travel`, `/boutique`, `/boutique/akuaba`, `/journal`, `/journal/afrique-multitude-de-mondes`,
  `/presse`, `/travailler-ensemble`, `/contact`, les 5 pages légales, `/destinations/le-dernier`,
  `/archive-afrique`, les 3 pages newsletter, une adresse inexistante.
- Deux largeurs : 1440 px et 390 px. Soit 50 pages vues.
- Par page : erreurs de console, requêtes en échec, débordement horizontal, `h1`, images sans
  `alt` ou cassées, cibles interactives < 44 px, balises de référencement, **axe-core** (WCAG 2.1 A et AA),
  textes de travail, tutoiement. Fichiers liés (`.pdf`) téléchargés et typés.
- Fenêtre de newsletter observée en conditions réelles (délai, fermeture, consentement).
- Revue de code ciblée sur les 20 constats de la V1.

**Non vérifié** : envoi réel des formulaires (aucune API publique en ligne), lecteurs d'écran
réels, performance mesurée par Lighthouse, anglais (le contenu éditorial n'est pas traduit, par choix).

## 3. Ce qui va bien (mesuré)

- **0 erreur de console** et **0 requête en échec** sur les 50 pages vues.
- **0 violation axe** sur 23 routes sur 25 ; un seul `h1` par page partout ; toutes les images ont
  un `alt` ; aucune image cassée.
- Aucun débordement horizontal à 1440 px ; à 390 px, un seul (§ 5, V2-07).
- Fenêtre de newsletter correcte : apparaît une fois après ~20 s sur les pages de lecture,
  focus piégé et rendu, fermeture Échap, croix et clic extérieur, consentement exigé, verrou de 30 jours.
- Boutique paginée (mission 2) : adresse, titre et canonical par page, clavier, annonces.
- `sitemap.xml` et `robots.txt` pointent désormais vers le domaine GitHub Pages avec le préfixe
  `/site-prince-edja/` : l'alerte de `AGENTS.md` est dépassée.
- Build, types, tests (46) verts.

## 4. Suivi des constats de la V1

| V1 | Constat | État V2 |
|---|---|---|
| AUD-001 | Guides PDF = page HTML | ❌ **Toujours** : 5 liens `guides/*.pdf` → `200 text/html` |
| AUD-002 | Formulaires morts | ❌ **Aggravé** (V2-01) |
| AUD-003 | Tutoiement / vouvoiement | ⚠️ Un seul reste : « Décris ton projet » (Contact, Travailler ensemble) |
| AUD-004 | Textes d'atelier visibles | ❌ Toujours (V2-03) |
| AUD-005 | Visuels produit identiques, 0 prix | ❌ 10 fichiers sur 12 identiques (même empreinte) ; prix toujours vides |
| AUD-006 | Films de l'accueil → `/xplore` | ❌ Toujours (`FilmsList.tsx:42`) |
| AUD-007 | « À la une » de l'accueil jamais affichée | ❌ Toujours (aucun article « publié ») |
| AUD-008 | Cibles < 32 px | ⚠️ Partiel (V2-08) |
| AUD-009 | Pages légales vides, `noindex` | ❌ Contenu toujours à fournir |
| AUD-010 | Boutons fantômes | ⚠️ « Press kit · fichier à fournir » reste habillé en bouton |
| AUD-011 | Tri par prix inopérant | ✅ Utile depuis l'arrivée des livres ; « sur demande » en dernier |
| AUD-012 | Boutique / Edja Shop / Collection TRIBE | ❌ Toujours trois noms |
| AUD-013 | Deux gabarits épisode / destination | ❌ Toujours |
| AUD-014 | `text-[11px]` | ❌ `DestinationPage.tsx:139` |
| AUD-015 | `rounded-[3px]` | ❌ `DistinctionsCarousel.tsx:22`, `CarteSurvol.tsx:53` |
| AUD-016 | Newsletter en double | ❌ Sur `/journal` : bloc + pied de page + fenêtre = trois sollicitations |
| AUD-017 | Chiffres sans date | ❌ Toujours (« 600 000 abonnés », « trente pays ») |
| AUD-018 | Numéros de section | ✅ Retirés |
| AUD-019 | Admin intégré décoratif | ✅ Supprimé ; admin séparé (`admin/`) |
| AUD-020 | Loader d'intro | ⚠️ Contenu visible après **~3,4 s** sur l'accueil |

## 5. Nouveaux constats V2

| ID | Gravité | Où | Constat | Preuve |
|---|---|---|---|---|
| V2-01 | **Bloquant** | `/contact`, `/travailler-ensemble` | Les formulaires envoient vers `http://localhost:3000` : la variable `PUBLIC_API_URL` n'est pas exposée par Vite (seules les `VITE_*` le sont), l'adresse de repli est figée dans le build. Tout visiteur verra « L'envoi a échoué ». Modification **non commitée** de `src/lib/formulaire.ts` ; la version en ligne (Web3Forms sans clé) échoue aussi. | `dist/assets/Field-*.js` contient `localhost:3000/public/api/v1/contact` |
| V2-02 | **Bloquant** | fiches épisode et destination | 5 guides PDF renvoient la page du site (AUD-001). | `200 text/html` sur les 5 liens |
| V2-03 | **Majeur** | accueil, À propos, Influence, Presse, Boutique | Textes de travail visibles : « PROPOSITION à valider » (`Collaborations.tsx:50`, `Offres.tsx:17`, `AboutPage.tsx:28-39`), « template » et « texte à fournir » (Presse), quatre livres « (maquette) » dans le catalogue, « Press kit · fichier à fournir ». | rendu des pages |
| V2-04 | **Majeur** (critique axe) | `/boutique/:objet` | Deux boutons de galerie sans nom accessible (flèches seules). | axe `button-name`, classes `pr-4` / `pl-4` |
| V2-05 | **Majeur** (AA) | `/boutique` | Pastille « Tout voir » : crème sur `clay-500`, contraste 3,07 pour un texte de 13 px (4,5 exigé). | axe `color-contrast` |
| V2-06 | Mineur (AA) | `/boutique` (`ColonneMots`) | Grands numéros `text-cream-100/25` sur forêt : 2,09. Décoratifs ? Alors `aria-hidden`, sinon renforcer. | axe `color-contrast` |
| V2-07 | Mineur | `/a-propos` à 390 px | Le tableau d'audience déborde de 1 px (colonne « Validé le »). | `th`/`td` à droite 391 px |
| V2-08 | Mineur | toutes les pages, boutique, presse, carte | Cibles < 44 px : logo 24 px de haut, e-mail du pied de page 17 px, LinkedIn 21 px, « Voir la source » 17 px, « Retour à la boutique » 25 px, flèches de la sélection 36 px, flèches de galerie 36 px, zoom de la carte 30 px. | mesure DOM à 390 px |
| V2-09 | Mineur | `/a-propos/influence` | Même titre et même canonical que `/a-propos` : deux adresses pour une page. | balises |
| V2-10 | Mineur | fiches épisode, destination, objet | Descriptions courtes (49 à 68 caractères) : peu utiles dans les résultats de recherche. | `meta description` |
| V2-11 | Info | `/journal/:slug` | Les articles sont `noindex` (statut « à venir ») : rien du Journal n'est indexable aujourd'hui. | `robots` |

## 6. Parcours critiques

| Parcours | V1 | V2 |
|---|---|---|
| Une marque veut collaborer | Bloqué | **Bloqué** (V2-01) |
| Un journaliste cherche bio et portraits | Bloqué par le contenu | Inchangé |
| Un festival veut programmer un film | Fonctionnel | Fonctionnel |
| Un acheteur demande une pièce | Fonctionnel | Fonctionnel, catalogue paginé et filtrable |
| Un visiteur s'abonne | Fonctionnel mais local | Inchangé : l'inscription reste dans le navigateur tant que l'API n'est pas branchée (mission 3) |
| Télécharger un guide d'étape | Cassé | **Cassé** (V2-02) |

## 7. Ce qui dépend du client (contenu)

Photos produit réelles, prix, créateurs ; textes des pages légales ; bios et portraits presse ; PDF
des guides ; dates de validation des chiffres d'audience ; liste réelle des livres ; décision sur
le nom unique de la boutique.

## 8. Décisions à prendre

1. **Formulaires avant l'API** : garder un repli (lien `mailto:` pré-rempli) tant que l'API publique
   n'est pas en ligne, ou masquer les formulaires ?
2. **Guides PDF absents** : bouton « Guide à venir » non cliquable, ou retrait du bouton ?
3. **Livres de maquette** : les retirer du catalogue (et de la section Livres) avant la mise en ligne ?
4. **Nom de la boutique** : « Edja Shop », « Boutique » ou « Collection TRIBE » ?
5. **Textes d'atelier** : les remplacer par des mentions sobres (« à venir ») ou masquer les blocs ?

## 9. Corrections à appliquer (mission 1)

Classées par priorité. Les points marqués *(sans décision)* peuvent être faits tout de suite, sans
toucher aux données ni au design des cartes produit. Les autres attendent une réponse du § 8.

### Priorité 1 — Débloquer
- **C-01 · Formulaires** (V2-01) *(sans décision pour la partie technique)* : lire l'adresse de l'API par une
  variable `VITE_PUBLIC_API_URL` (documentée dans `.env.example`) ; sans adresse configurée, ne
  jamais appeler `localhost` en production : afficher dès l'arrivée un message clair et le repli
  choisi au § 8.1.
- **C-02 · Guides PDF** (V2-02) : selon § 8.2, bouton non cliquable « Guide à venir » ou retrait,
  tant que `public/guides/` est vide.

### Priorité 2 — Crédibilité et accessibilité
- **C-03 · Boutons de galerie nommés** (V2-04) *(sans décision)* : « Photo précédente » / « Photo suivante ».
- **C-04 · Contraste de la pastille « Tout voir »** (V2-05) *(sans décision)* : passer à `clay-600` ou `clay-700`
  (la pastille n'est pas une carte produit).
- **C-05 · Numéros de `ColonneMots`** (V2-06) *(sans décision)* : `aria-hidden` s'ils sont décoratifs.
- **C-06 · Textes d'atelier** (V2-03) : selon § 8.5 ; le libellé « Press kit · fichier à fournir »
  perd son habillage de bouton *(sans décision)*.
- **C-07 · Ton** (AUD-003) *(sans décision)* : « Décrivez votre projet ».
- **C-08 · Films de l'accueil** (AUD-006) *(sans décision)* : chaque ligne mène à la fiche de son épisode.
- **C-09 · Modale newsletter** (AUD-016) *(sans décision)* : ne pas ouvrir la fenêtre sur une page qui porte déjà
  un bloc d'inscription (`/journal`) ; garder le message honnête tant que l'inscription reste locale.

### Priorité 3 — Finition
- **C-10 · Mobile** (V2-07, V2-08) *(sans décision)* : tableau d'audience dans un cadre défilant ; cibles
  portées à 44 px (logo, e-mail et LinkedIn du pied de page, « Voir la source », « Retour à la
  boutique », flèches) ; zoom de la carte à 44 px.
- **C-11 · Échelle** (AUD-014, AUD-015) *(sans décision)* : `text-caption`, `rounded-md`.
- **C-12 · Référencement** (V2-09, V2-10) *(sans décision)* : `/a-propos/influence` avec son propre titre et
  canonical (ou redirection) ; descriptions des fiches portées à ~120 caractères à partir des textes existants.
- **C-13 · « À la une » de l'accueil** (AUD-007) *(sans décision)* : afficher le dernier film quand aucun article
  n'est publié.
- **C-14 · Nom de la boutique** (AUD-012) : selon § 8.4.
- **C-15 · Loader d'intro** (AUD-020) : à raccourcir (≈ 3,4 s avant le contenu) — décision de direction artistique.

## 10. Suivi des corrections — 06/11/2026

Corrections *sans décision* appliquées sur `correctifs-site` ; build de production contrôlé dans un
navigateur (10 routes × 1440 et 390 px) : **0 violation axe**, aucun débordement, aucune requête vers
l'API, plus aucune trace de `localhost:3000` dans `dist/`.

| Correction | État | Détail |
|---|---|---|
| C-01 Formulaires | ✅ partie technique | `PUBLIC_API_URL` exposée au navigateur (`envPrefix`, `src/env.d.ts`). Sans adresse au build : avis dès l'arrivée avec l'e-mail de contact, champs inactifs, aucun bouton d'envoi, aucun appel. Champs alignés sur le contrat § 18 : `motif` (lu dans « Votre demande », perdu jusque-là) et piège `siteWeb` (l'ancien `botcheck` n'était jamais lu). **Repli (décision § 8.1, 07/11) : lien e-mail** — champs actifs, bouton « Préparer l'e-mail » qui ouvre la messagerie avec destinataire, objet et champs remplis (`emailContact`, `emailCollaboration`), puis un message « Rien ne s'est ouvert ? Écrivez à… ». |
| C-02 Guides PDF | ✅ décision client | Les PDF sont fournis depuis l'admin. Les cinq chemins vers des fichiers absents sont retirés de `EPISODES` (noms gardés en commentaire) ; boutons et section « Télécharger nos guides » n'apparaissent qu'avec un guide livré ; test ajouté. |
| C-03 Boutons sans nom | ✅ | Ce n'étaient pas des flèches de galerie mais les boutons « − / + » de quantité : nommés, quantité annoncée. |
| C-04 « Tout voir » | ✅ | `clay-600` (4,51:1), survol `clay-700` ; couple ajouté à `npm run contraste`. |
| C-05 `ColonneMots` | ✅ | Mots inactifs à 40 % (3,39:1, texte de grande taille) ; filigrane dessiné en `::before`, sans nœud texte. |
| C-06 Textes d'atelier | ✅ choix laissé à l'agent (§ 8.5) | Règle : on montre ce qui existe, on retire les notes internes, un bloc vide s'efface et revient seul avec son contenu ; « À venir » seulement là où un sujet annoncé a sa place (projets, entrées d'archive), « En cours de rédaction » pour les pages légales (obligatoires). Détail : accueil — ruban « Collaboration » masqué sans partenaire, chiffre « Portée » masqué, plus de « À fournir » sous les chiffres ; À propos — « Étapes encore à documenter », textes « PROPOSITION à valider » des engagements et des offres, « Bio / Press kit · fichier à fournir » retirés, audience réduite aux lignes chiffrées (« — » pour une cellule vide) ; Presse — bios, éléments de marque et apparitions pilotés par des listes, affichés dès qu'ils ont un contenu, mentions « template » retirées des distinctions ; épisode — « Sections à fournir » retiré ; destination — section « Le lieu » (cadres « à fournir ») retirée ; Histoires — « À venir » au lieu de « À fournir » / « Visuel à fournir » ; Archive — « À venir », phrases sur « le développeur » et « le modèle de données » retirées ; newsletter — textes de préférences et de désinscription réécrits (le second affirmait « Demande enregistrée » alors que rien n'est enregistré). Les livres gardent « (maquette) » : titres fictifs avec prix, à remplacer par les livres de l'admin. Contrôle : aucun texte d'atelier sur 24 routes × 2 largeurs. |
| C-07 Ton | ✅ | « Décrivez votre projet » (seule occurrence restante). |
| C-08 Films de l'accueil | ✅ | Chaque ligne mène à `/xplore/:slug`. |
| C-09 Fenêtre newsletter | ✅ | Ne s'ouvre pas sur une page qui porte un bloc d'inscription plein (`data-bloc-newsletter`) ; test ajouté. |
| C-10 Mobile | ✅ | Tableau d'audience dans un cadre défilant focusable ; 44 px : logo, e-mail du pied de page, LinkedIn, « Voir la source », « Retour à la boutique », quantité, flèches de la sélection, zoom de la carte, bandeau presse, « Poser une question », e-mail « En direct ». Reste sous 44 px : le lien e-mail dans la phrase de l'avis (lien en ligne, exempté) et « Voir la source » mesuré à 43,x px sous l'effet d'une transformation de la carte. |
| C-11 Échelle | ✅ | `text-caption`, `rounded-md`. |
| C-12 Référencement | ✅ | `/a-propos/influence` redirigeait déjà vers `/a-propos#audience` (hors sitemap) ; descriptions des épisodes, destinations et pièces portées à 110–160 caractères à partir des champs existants (`src/lib/descriptions.ts`, sans promettre de guide). |
| C-13 « À la une » | ✅ déjà en place | Le bloc se replie sur le premier film quand aucun article n'est publié. |
| C-14 Nom de la boutique | ✅ décision client : **Edja Shop** | Titres, lien de retour, surtitre de fiche, navigation (« Bijoux et livres » en sous-titre), galerie, 404, descriptions. Adresses `/boutique` inchangées ; « tribe » reste un mot-clé de recherche. La description de la boutique ne dit plus « façonnés par des artisans ivoiriens » (provenance non sourcée). |
| C-15 Loader | ✅ décision client : 2,5 s | 3 mots × 400 ms (au lieu de 520), le nom 550 ms (au lieu de 750), sortie 0,5 s ; le héros démarre à 1,75 s. Mesuré : loader à l'écran 1,9 s, contenu visible entre 2,3 et 2,8 s après la navigation (était ~3,4 s). |

**Décisions du client (06/11/2026)** : § 8.2 — guides PDF fournis depuis l'admin ; § 8.3 — les livres
font partie du site (l'admin en ajoute) : la section et le catalogue les gardent, les quatre fiches
« (maquette) » seront remplacées par les livres saisis dans l'admin au branchement ; § 8.4 — **Edja Shop**.
Puis le 07/11 : § 8.1 — **lien e-mail** ; § 8.5 — choix laissé à l'agent (voir C-06) ; C-15 —
**2,5 s**. Toutes les corrections de la mission 1 sont traitées. Contrôle final sur le build de
production : 24 routes × 1440 et 390 px, 0 violation axe, 0 débordement, 0 erreur de console,
aucun texte d'atelier.
