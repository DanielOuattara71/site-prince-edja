# Rapport de compatibilité — décisions de l'admin et exigences du back end

> **Document historique.** Il décrit l'état du 30/10/2026 **avant** les arbitrages. Depuis : l'analyse
> conceptuelle et le plan de développement ont été retrouvés hors du dépôt
> (`docs/SOURCES-DE-REFERENCE.md`), et les points soulevés ici sont tranchés par
> `docs/CONTRAT-API.md` v1.0.0 et `admin/docs/DECISIONS.md` (D-13 à D-32).

> Prince EDJA · audit du 30/10/2026 · lecture seule (aucun code, aucune décision, aucun prompt modifié).
>
> Conventions de traçabilité :
> - **[Fait]** : constaté dans un document ou dans le code, avec sa référence (`fichier:ligne`).
> - **[Déduction]** : conséquence logique de faits cités, non écrite telle quelle.
> - **[Reco]** : recommandation de l'auditeur.
>
> Abréviations : **PB** = `docs/PROMPT-BACKEND-PRINCE-EDJA.md` · **PA** = `docs/PROMPT-ADMIN-PRINCE-EDJA.md` ·
> **DEC** = `admin/docs/DECISIONS.md`.

---

## 1. Résumé exécutif

**Verdict : GO SOUS CONDITIONS.**

Les douze décisions prises pour l'admin (D-01 à D-12) sont **saines et, pour la plupart, sans incidence sur le back end**. Ce sont des choix d'outillage, de structure et de garde-fous. Aucune ne contredit frontalement PB. Une décision doit pourtant être **modifiée** (D-06), et cinq être **complétées** (D-01, D-02, D-07, D-08, D-09).

Le vrai risque n'est pas dans les décisions prises. Il est dans celles qui **manquent**, et surtout dans une absence structurelle :

1. **Le `CONTRAT-API` n'existe pas.** [Fait] PB en fait la référence suprême (PB:15, PB:41, PB:49, PB:592) ; PA le place parmi les livrables documentaires de l'admin (PA:551) ; aucun fichier de ce nom n'existe sur le disque. Les deux projets s'appuient donc chacun sur leur prompt, et **ces deux prompts se contredisent** sur des points structurants (§ 5).
2. **L'analyse conceptuelle et le plan de développement (décisions D-A à D-I) sont absents.** [Fait] PB y renvoie pour le diagramme des transitions (PB:636), les règles et le modèle (PB:43-45). Plusieurs questions ne peuvent donc pas être tranchées : elles sont marquées **À CONFIRMER**.
3. **Huit contradictions PA ↔ PB** touchent la forme même des données échangées. Les deux plus graves : le modèle de prix d'un bijou (PA:232-238 contre PB:400-425) et l'exigence de texte alternatif et de crédit **à l'envoi** d'un média (PA:403, PA:434 contre PB:766-768).

Le développement de l'admin peut continuer **sur ce qui ne dépend pas du contrat** : coque, composants transverses, design system. L'étape 1 (couche `api/`, schémas Zod, mocks) **ne doit pas démarrer** avant que le `CONTRAT-API` soit rédigé et que les contradictions critiques C-01 à C-04 soient tranchées. Sinon les mocks figeront une forme de données que le back end refusera.

---

## 2. Documents examinés

| Document | Emplacement réel | État |
|---|---|---|
| Prompt back end | `docs/PROMPT-BACKEND-PRINCE-EDJA.md` (1 135 lignes) | **Lu en entier** |
| Prompt admin | `docs/PROMPT-ADMIN-PRINCE-EDJA.md` (555 lignes) | **Lu en entier** |
| Décisions de l'admin | `admin/docs/DECISIONS.md` (D-01 à D-12) | **Lu en entier** |
| README de l'admin | `admin/README.md` | Lu |
| Code de l'admin (étape 0) | `admin/` : `package.json`, configs, `scripts/verifier-dist.mjs`, `src/` | Lu |
| Types et données du site public | `src/types/index.ts`, `src/data/*.ts` | Consultés ponctuellement (SiteInfo, audience, archive) |
| CI du site public | `.github/workflows/deploy.yml` | Lu |
| Consignes du dépôt | `AGENTS.md` | Lu |
| **`CONTRAT-API`** | — | **ABSENT.** Recherche sur tout le système de fichiers WSL : aucun fichier. PA:551 prévoit `docs/CONTRAT-API.md` comme livrable de l'admin, non encore produit. |
| **Analyse conceptuelle** (RG, dictionnaire, modèle, diagrammes d'états) | — | **ABSENTE.** Seuls les extraits repris dans PB et PA sont disponibles. |
| **Plan de développement** (G1-G5, D-A à D-I) | — | **ABSENT.** Cité par PB:45 et PB:1045 (D-H). |
| `docs/QUESTIONS.md` du back end | — | **ABSENT** : le back end n'a pas commencé. |

**Conséquence [Déduction].** Faute de contrat, l'ordre de référence demandé (contrat › analyse › PB › PA › décisions) se réduit en pratique à **PB › PA › décisions**. Là où PB renvoie à l'analyse, la vérification est impossible et le point est marqué À CONFIRMER.

---

## 3. Tableau de conformité des décisions

| ID | Décision | Compatibilité back end | Risque | Verdict |
|---|---|---|---|---|
| D-01 | Projet autonome dans `admin/` | Conforme à PB:119 (l'API, seul accès). Aucun mécanisme de partage des types prévu, alors que PB:78 parle de « types partagés par le contrat » | Moyen : deux définitions du contrat qui divergent | **COMPATIBLE SOUS CONDITION** |
| D-02 | Versions figées, publiées depuis 14 jours ou plus ; Vite 8.2.4 | Sans incidence, sauf Zod : l'admin est en 4.6.7, et PB:80 fait de Zod la source du contrat et d'OpenAPI | Moyen si le back end prend une autre version majeure de Zod et que les schémas sont partagés | **COMPATIBLE SOUS CONDITION** |
| D-03 | oxlint, `@dnd-kit/react`, `axe-core` | Outillage interne. PB:91 impose ESLint au **back end** seulement. `PATCH /{ressource}/ordre` (PB:634) reste consommable | Faible | **NON CONCERNÉ** |
| D-04 | Node 24 en CI, 22.12 ou plus requis | PB:78 : « Node.js LTS active » pour le back end, indépendant | Nul | **NON CONCERNÉ** |
| D-05 | Jetons copiés et contrôlés | Design uniquement | Nul | **NON CONCERNÉ** |
| D-06 | Routes de la section 9 de PA | Routes **d'interface**, pas d'API. Mais elle fusionne `galerie` (ressource éditoriale, PB:195, PB:616) dans la médiathèque `medias`, et garde `/audience-chiffres`, qui n'a **aucune** ressource d'API (PB:614-622) | **Élevé** : confusion de deux entités, et un écran sans support serveur | **À MODIFIER** (voir § 8) |
| D-07 | Seule `VITE_API_URL` ; base réglée par `ADMIN_BASE` | Compatible avec PB:540 et PB:1019. Mais la valeur par défaut relative (`/admin/api/v1`) suppose un même domaine, alors que PB recommande `admin.` et `api.` sur des sous-domaines distincts : CORS avec identifiants, `ALLOWED_ORIGINS` | **Élevé** : la session et le CSRF échouent si la topologie n'est pas fixée | **COMPATIBLE SOUS CONDITION** |
| D-08 | Worker MSW dans `public-dev/` ; `verifier-dist` | Conforme à PB:1109 (pas de démonstration en production). Les mocks ne prouvent pas la compatibilité (PB:974) | Moyen : fausse assurance | **COMPATIBLE SOUS CONDITION** |
| D-09 | `localStorage` et `sessionStorage` interdits par le lint | Conforme à PB:540 (« rien n'est stocké dans `localStorage` ») | Faible | **COMPATIBLE**, à compléter (mémoire du jeton CSRF) |
| D-10 | `admin/**` exclu du lint du site public | Outillage | Nul | **NON CONCERNÉ** |
| D-11 | Suppression d'`admin-custom/` | Va dans le sens de PB:9 et PB:119 (fin du faux admin) | Nul | **COMPATIBLE** |
| D-12 | 7 entrées d'archive réelles contre 8 annoncées | La migration du back end lit les données réelles du site (PB:950, PB:966) | Faible | **COMPATIBLE** |

---

## 4. Analyse détaillée

### D-01 · Projet autonome dans `admin/` — COMPATIBLE SOUS CONDITION
- **[Fait]** PB:119 : l'API est « le seul accès à la base de données et aux fichiers ». D-01 ne crée aucun accès direct ; le code de l'admin (étape 0) ne contient aucun client de base ni de stockage.
- **[Fait]** PB:78 justifie TypeScript par des « types partagés par le contrat ». PB:606 : les schémas Zod sont « la source unique », et OpenAPI est généré à partir d'eux (PB:92).
- **[Fait]** PA:177 demande à l'admin d'écrire **ses propres** schémas Zod dans `api/schemas/`.
- **[Déduction]** Deux sources de schémas existeront, l'une dans l'admin et l'autre dans le back end, sans mécanisme qui les tienne alignées. C'est le premier risque de divergence silencieuse.
- **Condition** : voir la décision manquante **D-14** (source unique du contrat et tests de contrat).

### D-02 · Versions — COMPATIBLE SOUS CONDITION
- **[Fait]** Admin : `zod 4.6.7` (`admin/package.json`). Back end : « dernières versions stables au moment de l'installation » (PB:94), sans numéro imposé.
- **[Déduction]** Si les schémas Zod sont un jour partagés (paquet commun ou copie générée), les deux projets doivent utiliser la **même version majeure** de Zod. Rien ne l'impose aujourd'hui.
- **[Fait]** Le passage à Vite 8.2.4 ne concerne que l'outillage du front. Sans incidence sur le back end.
- **Condition** : ajouter à D-02 « Zod : même version majeure que le back end, vérifiée à l'étape 1 ».

### D-03 · Écarts d'outillage — NON CONCERNÉ
- **[Fait]** PB:91 impose ESLint **au back end**. L'admin est un projet distinct (D-01) : son outil de lint n'a aucune incidence sur l'API.
- **[Fait]** `@dnd-kit/react` ne fait que produire une liste d'identifiants, envoyée par `PATCH /{ressource}/ordre` avec `{ ids }` (PB:634). Compatible.
- **Point d'attention [Déduction]** : `PATCH /ordre` ne porte pas de `version` (PB:634). Deux personnes qui réordonnent en même temps : la dernière écriture gagne. À signaler dans `QUESTIONS.md` côté back end ; sans effet sur D-03.

### D-04, D-05, D-10 — NON CONCERNÉ
Ce sont des choix d'outillage, de design et de configuration du lint local, sans lien avec l'API.

### D-06 · Routes de l'interface — À MODIFIER
- **[Fait]** D-06 porte sur les adresses **des écrans** (« Retenu (section 9) »). Les noms des ressources d'API ne sont pas touchés : `articles`, `bijoux`, `categories`, `villes` existent bien dans PB:616-617.
- **[Fait] Problème 1, la galerie.** D-06 : « `/galerie` → intégrée à `/medias` ». Or `galerie` est une **ressource éditoriale à part entière** :
  - côté API (PB:616), elle a CRUD et transitions ;
  - côté modèle (PB:195), c'est la table `galerie_image` ;
  - elle est distincte de `medias` (PB:620, tables `media*`).

  [Déduction] Les fusionner à l'écran amènerait à manipuler une image de galerie (contenu avec statut, ordre et traductions) comme un simple fichier, et donc à appeler la mauvaise ressource.

  La source de l'ambiguïté est dans PA lui-même : PA:160 liste `/galerie` comme contenu, et PA:373 intitule l'écran médias « Galerie et médias ».
- **[Fait] Problème 2, `/audience-chiffres`.** D-06 la conserve « nécessaire aux chiffres datés ». Mais :
  - aucune ressource `audience` n'existe dans PB:614-622 ;
  - aucune table d'audience n'existe dans PB:189-201 ;
  - dans le site public, les chiffres vivent en deux endroits : `SITE.stats` (`src/types/index.ts:20`) et `src/data/audience.ts`.

  [Déduction] Soit ces chiffres relèvent d'`identite`, soit une ressource manque au contrat. Aucune des deux options n'est documentée. L'écran n'a aujourd'hui aucun support serveur.
- **[Fait] Problème 3, les paramètres.** D-06 réunit `/identite` et `/parametres-techniques` dans un seul écran `/parametres` à onglets. PB:619 garde **deux ressources d'API distinctes**, `identite` et `parametres`. C'est compatible **si** chaque onglet appelle sa propre ressource : ce point doit être écrit dans D-06.
- **[Fait] Problème 4, la restauration.** `/restauration` devient l'onglet « Historique » et `/publication`. Côté API, `GET /versions/:ressource/:id` et `POST /restauration` existent (PB:621). Compatible.
- **Résolution** : voir § 8, M-01.

### D-07 · Variables et chemin de base — COMPATIBLE SOUS CONDITION
- **[Fait]** PB:540 et PB:1019 : admin, API et site sur un **même domaine principal**, mais sur des **sous-domaines différents** (`admin.`, `api.`). Cookie `SameSite=Lax` (PB:548). CORS limité à `ALLOWED_ORIGINS`, **avec identifiants** pour la face d'administration (PB:661).
- **[Fait]** `admin/.env.example` : `VITE_API_URL=/admin/api/v1`, un chemin **relatif**, donc la même origine.
- **[Déduction]** Une valeur relative ne fonctionne que si un proxy sert l'admin et l'API sur la même origine. Avec la topologie de PB (deux sous-domaines), il faut à la fois :
  - une URL absolue (`https://api.…/admin/api/v1`) ;
  - `credentials: 'include'` (déjà exigé par PA:493) ;
  - l'origine de l'admin dans `ALLOWED_ORIGINS` ;
  - une politique de sécurité du contenu de l'admin qui autorise l'API dans `connect-src`.

  Rien de cela n'est décidé.
- **[Fait]** `SameSite=Lax` fonctionne entre `admin.x` et `api.x`, qui sont du même site. Il échouerait si l'admin était hébergé sur un domaine tiers (par exemple `*.pages.dev`) pendant la recette.
- **Condition** : décision manquante **D-15** (topologie, CORS, hébergement de l'admin).

### D-08 · MSW hors production — COMPATIBLE SOUS CONDITION
- **[Fait]** PB:1109 : pas de route de démonstration en production. `verifier-dist` l'empêche côté admin, et le test négatif a été exécuté (compte rendu de l'étape 0).
- **[Fait]** PB:974 : « Un test qui passe sur une base simulée ne prouve rien. »
- **[Fait]** PA:311 demande que les mocks **appliquent les règles de gestion**.
- **[Déduction]** Les règles RG seront donc réécrites dans les gestionnaires MSW. C'est une duplication assumée, tolérable en développement, mais **sans valeur de preuve** : une règle mal recopiée dans un mock donnera un écran qui passe ses tests et échoue contre la vraie API.
- **Condition** : décision manquante **D-14** (tests de contrat et parcours contre l'API réelle en préproduction).

### D-09 · Interdiction du stockage navigateur — COMPATIBLE
- **[Fait]** PB:540 et PA:73 disent la même chose ; le lint l'outille.
- **À compléter [Reco]** : le jeton CSRF renvoyé par `GET /auth/moi` (PB:552) doit vivre **en mémoire seulement**, et être redemandé après un rechargement de page. Voir D-16.

### D-11 et D-12 — COMPATIBLE
- **D-11 [Fait]** : retirer le faux admin rejoint l'objectif de PB:9.
- **D-12 [Fait]** : PB:950-966 migre les données **réelles** du site et compare les nombres. Aligner les jeux d'exemple sur 7 entrées évite de faire croire à une huitième.

---

## 5. Contradictions identifiées

Les contradictions ci-dessous sont **entre PA et PB**. Les décisions de l'admin n'en sont pas la cause, mais elles empêchent d'écrire un contrat cohérent. Aucune ne doit être tranchée arbitrairement : la résolution proposée est à valider avec le client, puis à inscrire dans `CONTRAT-API`.

### C-01 · Modèle de prix et de matière d'un bijou — **CRITIQUE**
- **PA:229-242** : `Bijou.commerce` porte `prix`, `prixConfirme`, `ancienPrix`, `matieres[]`, `tailles[]`, `edition`, `atelier`, `village`, `poids`, `disponible`, et un objet `createur` **embarqué** (nom, pays, ville, bio). Les variantes sont facultatives et n'existent que si `boutiqueEnLigne` est vrai.
- **PB:400-425** :
  - `bijou` ne porte que `prix_confirme` ; le **prix, la matière, la taille et le stock sont sur `variante`** (RG-10) ;
  - le créateur est une **référence** (`createur_id`), pas un objet ;
  - `ancien_prix`, `edition`, `atelier`, `village`, `poids` n'apparaissent pas.
- **PB:679 (RG-10)** : en mode « sur demande », un bijou **sans variante** est accepté.
- **Contradiction [Déduction]** : en mode « sur demande » (le mode actuel), un bijou sans variante n'a **aucun endroit où stocker un prix**. Pourtant le prix doit s'afficher dès que `prix_confirme` est vrai (PB:708). PA, de son côté, stocke le prix sur le bijou. Les deux formes sont incompatibles. Le site public utilise la forme de PA (`commerce.prix`, `ancienPrix`, `src/data/shop.ts`).
- **Conséquences** : écrans, mocks et migration bâtis sur des formes différentes ; refus `422` à la première écriture (PB:608, champs inconnus refusés).
- **Résolution recommandée [Reco]**, à trancher dans le contrat :
  - **Option A** : une variante « unique » implicite par bijou, même en mode « sur demande » (prix et matière sur la variante, partout).
  - **Option B** : prix et matières sur le bijou tant que `boutiqueEnLigne` est faux, puis bascule sur les variantes.

  L'option A évite une migration de données le jour où la boutique passe en ligne. Elle résout aussi C-07. Le créateur doit rester une référence (`createurId`), conformément à PB:402 et RG-20.

### C-02 · Texte alternatif et crédit à l'envoi d'un média — **CRITIQUE**
- **PA:434 (RG-08)** : « Champs obligatoires à l'envoi ». **PA:403** : `SelecteurMedia` « refuse de valider un média sans texte alternatif ».
- **PB:766** : « L'envoi accepte un média sans texte alternatif […] Mais il est non publiable ». **PB:768** : le crédit « reste vide quand il est inconnu, il n'est jamais inventé ». **PB:309** : `decoratif = vrai` autorise un texte alternatif vide.
- **Conséquences [Déduction]** : exiger le crédit à l'envoi **pousse l'utilisateur à inventer un crédit**, ce qui contredit la règle de non-invention (PB:27, PA:41). Refuser un média décoratif sans texte alternatif contredit PB:309.
- **Résolution recommandée [Reco]** : aligner l'admin sur PB. L'envoi est possible sans texte alternatif ni crédit ; le média reçoit l'étiquette « à fournir » ; le blocage intervient **à la publication** du contenu qui l'utilise (RG-03), sauf si le média est décoratif.

### C-03 · Transitions de statut : l'admin peut-il publier un brouillon ? — **CRITIQUE**
- **PB:636** : `brouillon → en_relecture` (éditeur ou admin) ; `en_relecture → publie` (**admin seulement**) ; `publie → archive` et `publie → brouillon` (admin) ; refus `en_relecture → brouillon` **avec un `motif`**. Toute autre combinaison renvoie `422 TRANSITION_INTERDITE`.
- **PA:344** : « Un éditeur voit "Soumettre à relecture" là où un admin voit "Publier" ». Cela implique qu'un admin publie **directement** depuis `brouillon`, ce que PB interdit.
- **PA:292** : corps de transition `{ vers, programmeLe? }`, **sans `motif`**. PB:633 attend `{ vers, programmeLe?, motif? }`, avec le motif obligatoire pour un refus.
- **Autres trous [Fait]** :
  - aucune transition ne sort de `archive` (PB:636) ;
  - rien ne dit si un éditeur peut modifier un contenu **déjà publié**, ni s'il repasse alors en relecture (c'est défini pour le vendeur seulement, PB:863).
- **Résolution recommandée** : **À CONFIRMER** avec le diagramme d'états de l'analyse conceptuelle (absente). En attendant [Reco] :
  - l'admin n'affiche que les transitions de PB:636 et gère le `motif` ;
  - pour un admin face à un brouillon, l'interface enchaîne « soumettre » puis « publier » en deux appels, ou le contrat ajoute explicitement `brouillon → publie` pour l'admin. **Ne pas l'inventer côté admin.**

### C-04 · Absence du `CONTRAT-API` et propriété du contrat — **CRITIQUE**
- **PB:15** : l'API respecte `CONTRAT-API` « sans en changer une virgule ». **PB:592** : la face d'administration « est celle de `CONTRAT-API` ».
- **PA:551** : `docs/CONTRAT-API.md` est un livrable **documentaire** de l'admin, rédigé « récapitulant chaque route simulée ». Dans le plan de PA (PA:537-549), il arrive avec la documentation, c'est-à-dire **après** les mocks.
- **Contradiction [Déduction]** : le document que le back end doit respecter « sans en changer une virgule » sera écrit **a posteriori**, à partir des mocks de l'admin, et sur la base de PA, qui contredit PB sur C-01 à C-03.
- **Résolution recommandée [Reco]** : rédiger `CONTRAT-API` **avant** l'étape 1 de l'admin, comme un livrable commun validé par les deux parties, en partant de PA:175-315 corrigé par les résolutions de ce rapport. Voir **D-13**.

### C-05 · Format d'erreur et code CSRF — **ÉLEVÉE**
- **PB:602** : `{ status, code, message, champ?, details?, requeteId }` et en-tête `X-Request-Id`. **PA:185** : la même forme, **sans `requeteId`**.
- **PB:552** : un jeton CSRF absent ou périmé produit **`403 CSRF_INVALIDE`**. **PA:185** et **PA:345** : un `403` affiche « Accès refusé » et recharge `GET /auth/moi`.
- **Conséquence [Déduction]** : un jeton CSRF périmé, par exemple après un redémarrage du serveur, s'afficherait comme un refus de droits.
- **Résolution [Reco]** : distinguer `403 CSRF_INVALIDE` (on redemande le jeton puis on rejoue **une seule fois** la requête) d'un `403` de règle (`RG-xx`, écran ou message de refus). Afficher le `requeteId` dans tout message d'erreur inattendue. Voir D-16 et D-17.

### C-06 · États dérivés présentés comme des statuts — **ÉLEVÉE**
- **PB:181** : « "Programmé" n'est pas un statut ». **PB:183** : « "À fournir" n'est pas un statut non plus », renvoyé dans `champsAFournir: string[]`.
- **PA:104-112** : `a_fournir` est l'une des **cinq pastilles de statut**. **PA:431** : « statut "programmé" visible ». **PA:195-203** : `ContenuBase` ne porte pas `champsAFournir`.
- **Résolution [Reco]** : garder les pastilles à l'écran, mais comme **états dérivés** :
  - « programmé » = `statut === 'publie' && publieLe > maintenant` ;
  - « à fournir » = `champsAFournir.length > 0`.

  Ces valeurs ne sont jamais envoyées comme statut. Ajouter `champsAFournir` aux types du contrat. Voir D-18.

### C-07 · Demandes : « collaboration » et notes internes sans support — **ÉLEVÉE**
- **PA:377** : « Demandes sur mesure **et de collaboration**, statuts et **notes internes** ».
- **PB:427-435** : `demande_piece` porte sur une **variante** de bijou ; elle n'a **aucune colonne de note**. Ses statuts sont `nouvelle`, `en_cours`, `conclue`, `annulee`. La face publique n'a aucun formulaire de collaboration (B2B) : elle compte seulement `contact`, `newsletter` et `demandes`, PB:653-657.
- **Contradiction interne à PB [Déduction]** : une demande « cite une variante » (RG-11, PB:429) alors qu'en mode « sur demande » un bijou peut n'avoir **aucune variante** (RG-10, PB:679). La demande d'une telle pièce est impossible. C-01, option A, résout ce point.
- **Résolution [Reco]** :
  - les demandes de collaboration passent par `messages` (contact, avec un sujet), ou bien une ressource est ajoutée au contrat. **À CONFIRMER** ;
  - pas de champ « notes internes » tant que le contrat ne l'a pas ;
  - les statuts affichés sont ceux de PB.

### C-08 · Messages : états et réponse par e-mail — **MOYENNE**
- **PA:376** : « non lu, traité, archivé ; réponse par e-mail ».
- **PB:461** : `message_contact` n'a qu'un booléen `traite`. Il n'y a ni état « lu » ni « archivé », et **aucune route d'envoi de réponse** : PB:619 ne liste que des lectures et des modifications.
- **Résolution [Reco]** : soit le contrat ajoute `lu` et `archive` (et une route de réponse, qui ferait de l'API un client de messagerie sortant, avec les e-mails de PB:804-812 à compléter), soit l'admin se limite à « traité / non traité » et à un lien `mailto:`. **À CONFIRMER.**

### Autres écarts mineurs (à inscrire dans le contrat)

| Réf. | PA | PB | Résolution proposée |
|---|---|---|---|
| C-09 | RG-12 : statut abonné « en attente ou **confirmé** » (PA:438) | `en_attente`, `actif`, `desabonne` (PB:179) | Libellés de l'interface librement choisis, mais valeurs de PB |
| C-10 | `Media` sans `createurId` (PA:244-250) | `media.createur_id` obligatoire (PB:302) | Ajouter `createurId` au type `Media` du contrat |
| C-11 | Médiathèque : « envoi multiple », « recadrage » (PA:373) | Un fichier par appel (PB:744) ; aucune route de recadrage | Envoi multiple = N appels successifs ; recadrage **reporté** tant qu'aucune route n'existe |
| C-12 | Journal : « lecture et export » pour le super-admin (PA:338) | Export mentionné (PB:889), **aucune route nommée** | Route d'export à définir dans le contrat ; **ne pas l'inventer** |
| C-13 | Comptes : « réinitialisation » par le super-admin, jauge de robustesse « à la création » (PA:382, PA:444) | Aucun mot de passe par défaut ; définition par lien e-mail (PB:554-558) ; e-mail « Invitation » prévu pour éditeur et admin (PB:811) mais routes d'invitation **verrouillées** derrière `multiVendeurs` (PB:859) | **À CONFIRMER** : création d'un compte par lien e-mail, sans mot de passe saisi par le super-admin, recommandée |
| C-14 | Routes d'accès : `/connexion`, `/mot-de-passe-oublie`, `/changer-mot-de-passe` (PA:155) | Lien de réinitialisation à usage unique (PB:558) et lien d'amorçage (PB:556) : **aucune route pour consommer le jeton** dans PB:622 | Ajouter au contrat la route de définition du mot de passe par jeton, et l'écran qui l'accueille |
| C-15 | Signature et manifeste éditables dans `/pages` (PA:375) | Confirmation `confirmeModificationHero: true` dans la requête (PB:704) ; ressource porteuse non précisée. Dans le site, ces champs sont dans `SiteInfo` (`src/types/index.ts:5-7`) | Rattacher au contrat la ressource porteuse (vraisemblablement `identite`) et le nom du champ de confirmation |
| C-16 | Changement de rôle « à double saisie » (PA:442) ; activation de `multiVendeurs` sans double saisie dans PA | E-mail retapé dans la requête (PB:581) ; double saisie aussi pour `multiVendeurs` (PB:871) | Nommer le champ dans le contrat ; appliquer la double saisie aux deux cas |
| C-17 | Profil : « langue de l'interface » (PA:385) | Aucune colonne de préférence sur `compte_admin` (PB:254-265) | Préférence d'affichage locale (autorisée par PA:73), ou colonne à ajouter. **À CONFIRMER** |
| C-18 | Aucun écran de gestion des **tags** dans PA:361-390 | `tags` : ressource CRUD complète (PB:616) | Décider qui crée les tags (écran dédié ou création à la volée dans `SelecteurTags`). Voir D-25 |
| C-19 | Reconstruction du site : hébergeur non précisé dans PA | Webhook **Cloudflare Pages** (PB:88) ; [Fait] le site est aujourd'hui déployé sur **GitHub Pages** (`.github/workflows/deploy.yml:58`) | Hors admin, mais bloquant pour `/publication` : décision de projet à prendre avant l'étape 9 de l'admin |

---

## 6. Décisions manquantes

La numérotation reprend à la suite de D-12. Chaque rédaction est directement réutilisable dans `admin/docs/DECISIONS.md` **après validation** : ce rapport ne modifie pas ce fichier.

### D-13 · Le `CONTRAT-API` est rédigé avant l'étape 1 et partagé — **Critique**
- **Pourquoi** : PB:15, PB:592 et C-04.
- **Rédaction proposée** :
  > `CONTRAT-API.md` est rédigé **avant** la couche `api/` de l'admin, à partir de PA § 7 corrigé des contradictions C-01 à C-19, puis validé par le responsable de l'admin et celui du back end. Il devient la référence des deux projets. Toute modification ultérieure passe par une entrée datée dans `QUESTIONS.md` (back end) et `DECISIONS.md` (admin). L'admin n'invente aucune route ni aucun champ absent du contrat : un besoin non couvert est consigné et l'écran concerné reste désactivé.

### D-14 · Source unique du contrat et preuves de compatibilité — **Critique**
- **Pourquoi** : D-01, D-08, PB:606, PB:974, PB:980.
- **Rédaction proposée** :
  > Les schémas Zod du contrat ont une seule source. **Cible** : l'OpenAPI généré par le back end (PB:92) ; l'admin en vérifie la conformité en CI. **Transition**, tant que le back end n'existe pas : les schémas de `admin/src/api/schemas/` font foi et sont publiés tels quels au back end. Chaque jeu d'exemple MSW est validé par ces schémas dans un test (une fixture invalide fait échouer la CI). Les tests MSW ne valent pas preuve d'intégration : un lot de parcours Playwright tourne contre l'API réelle en préproduction avant chaque recette. Même version majeure de Zod dans les deux projets.

### D-15 · Topologie de déploiement, CORS et en-têtes — **Critique**
- **Pourquoi** : D-07, PB:540, PB:548, PB:661, PB:1019, PA:498.
- **Rédaction proposée** :
  > L'admin est servi sur `admin.<domaine>` et l'API sur `api.<domaine>`, du même site, pour que le cookie `SameSite=Lax` circule. `VITE_API_URL` vaut l'URL absolue de l'API en préproduction et en production. Toutes les requêtes partent avec `credentials: 'include'`. L'origine de l'admin figure dans `ALLOWED_ORIGINS`. L'hébergement de l'admin pose `X-Robots-Tag: noindex`, une politique de sécurité du contenu (`connect-src` limité à l'API, aucun script tiers) et HSTS. Aucune recette sur un domaine tiers (`*.pages.dev`) : le cookie n'y circulerait pas. L'hébergeur de l'admin est choisi et noté ici avant l'étape 9.

### D-16 · Session, CSRF et expiration — **Critique**
- **Pourquoi** : PB:546-552, PA:182, PA:497, C-05.
- **Rédaction proposée** :
  > Le jeton CSRF renvoyé par `GET /auth/moi` est gardé **en mémoire** uniquement ; un rechargement le redemande. Il est joint à toute requête `POST`, `PATCH` ou `DELETE`. Sur un `403 CSRF_INVALIDE`, le client redemande `GET /auth/moi` et rejoue **une seule fois** la requête ; un second échec s'affiche comme une erreur. Sur un `401`, l'écran se verrouille sans perdre le formulaire en cours, et la reconnexion reprend l'écran. L'avertissement d'inactivité (PA:497) se cale sur la durée glissante du serveur (8 h par défaut, paramétrable). Le contrat doit donc exposer l'échéance de session dans `GET /auth/moi` : **à ajouter au contrat**, ne pas coder une durée en dur. Le brouillon automatique toutes les 30 s ne doit pas prolonger indéfiniment une session inactive : le serveur décide, et le client ne compte que les actions de l'utilisateur.

### D-17 · Traitement des erreurs de l'API — **Élevée**
- **Pourquoi** : PB:570-577, PB:602, C-05.
- **Rédaction proposée** :
  > Un seul module (`api/client.ts`) traduit les réponses de l'API :
  > - `401` : verrouillage (D-16) ;
  > - `403 CSRF_INVALIDE` : nouvel essai unique ;
  > - `403` avec un code de règle : message de refus nommant la règle, puis rechargement de `GET /auth/moi` ;
  > - `404` : page introuvable, y compris pour un objet d'un autre créateur (RG-22) ;
  > - `409 VERSION_PERIMEE` : proposition de recharger, sans perte de saisie ;
  > - `422` : erreur rattachée au champ par `champ`, sinon au résumé ;
  > - `422 TRANSITION_INTERDITE` : rechargement du statut ;
  > - `429` : délai d'attente affiché ;
  > - `5xx` : message générique.
  >
  > Toute erreur inattendue affiche le `requeteId` (en-tête `X-Request-Id`) pour que l'équipe retrouve la trace côté serveur.

### D-18 · Statuts réels et états dérivés — **Élevée**
- **Pourquoi** : C-06, PB:179-183.
- **Rédaction proposée** :
  > Les seules valeurs de statut envoyées ou reçues sont `brouillon`, `en_relecture`, `publie` et `archive`. « Programmé » et « À fournir » sont des **états dérivés** affichés par des pastilles : programmé = `publie` avec `publieLe` dans le futur ; à fournir = `champsAFournir` non vide (renvoyé par l'API). Aucun des deux n'est envoyé comme statut.

### D-19 · Transitions et motif de refus — **Critique**
- **Pourquoi** : C-03, PB:633-636.
- **Rédaction proposée** :
  > L'admin ne propose que les transitions autorisées par le diagramme d'états du contrat (PB:636). Corps : `{ vers, programmeLe?, motif? }`. Le refus (`en_relecture` vers `brouillon`) exige un motif saisi. La réponse d'une transition qui publie ou dépublie fournit l'identifiant de la publication créée (PB:734), suivi par D-23. Si le contrat n'autorise pas `brouillon` vers `publie` pour un admin, le bouton « Publier » d'un brouillon enchaîne explicitement « Soumettre » puis « Publier », et le journal porte deux actions. Décision suspendue au diagramme de l'analyse conceptuelle.

### D-20 · Médias : envoi, description, suppression — **Critique**
- **Pourquoi** : C-02, C-10, C-11, PB:744-776.
- **Rédaction proposée** :
  > - Un fichier par requête `multipart` ; l'envoi multiple enchaîne des requêtes successives, avec une progression par fichier.
  > - Le contrôle côté client (type, taille) n'est qu'une **aide** : les limites (10 Mo pour une image, 25 Mo pour un PDF par défaut) sont paramétrables côté serveur, et le refus du serveur (`422`) fait foi.
  > - Un média peut être envoyé **sans texte alternatif ni crédit** ; il est alors marqué « à fournir » et bloque la publication des contenus qui l'utilisent, sauf s'il est décoratif.
  > - Le crédit n'est jamais exigé à l'envoi.
  > - Chaque média porte `createurId` (le créateur principal par défaut).
  > - La suppression d'un média utilisé affiche la liste des usages renvoyée par le `422 RG-08` ; une suppression acceptée prévient que les fichiers disparaissent après 24 h.
  > - Pas de recadrage tant que le contrat n'a pas de route dédiée.

### D-21 · Contenu riche : liste blanche partagée — **Élevée**
- **Pourquoi** : PB:897, PA:402, PB:770 (usages d'un média dans le corps d'un article).
- **Rédaction proposée** :
  > La configuration de Tiptap n'active que les nœuds et marques admis par la liste blanche du contrat (titres 2 à 4, gras, italique, listes, citation, lien, image). Toute extension que `StarterKit` active par défaut et qui n'est pas dans la liste est désactivée explicitement. Un lien `javascript:` est refusé dès la saisie. Le nœud image porte l'**identifiant du média** (pas seulement son URL), pour que `GET /medias/:id/usages` le retrouve dans le corps. La liste blanche est écrite une seule fois dans le contrat et testée des deux côtés.
- **[Déduction] à vérifier en étape 3** : `@tiptap/starter-kit` 3.x embarque, sauf erreur, sa propre extension de lien. Si c'est le cas, l'ajout séparé de `@tiptap/extension-link` (D-02) produirait un doublon d'extension.

### D-22 · Écritures : seulement les champs du contrat — **Élevée**
- **Pourquoi** : PB:598 (`pageSize` plafonné à 100), PB:608 (champ inconnu = `422`), PB:631.
- **Rédaction proposée** :
  > Chaque écriture est construite par un schéma d'entrée **strict**, distinct du schéma de lecture. Les champs en lecture seule (`id`, `creeLe`, `modifieLe`, `usages`, `champsAFournir`, `declinaisons`) ne sont jamais renvoyés. Tout `PATCH` porte la `version` lue. Aucune liste ne demande plus de 100 éléments par page ; les sélecteurs (tags, créateurs, catégories) paginent ou cherchent côté serveur.

### D-23 · Suivi de la publication du site — **Élevée**
- **Pourquoi** : PB:712-738, PA:445 (RG-19).
- **Rédaction proposée** :
  > L'interface distingue cinq moments :
  > 1. modification enregistrée ;
  > 2. contenu publié (en base) ;
  > 3. reconstruction demandée (`en_attente`) ;
  > 4. reconstruction en cours (`en_cours`) ;
  > 5. terminée (`reussie`) ou en `echec`, y compris `DELAI_DEPASSE` après 15 min.
  >
  > Après une transition, le bandeau suit l'identifiant de publication renvoyé, par interrogation de `GET /site/etat-reconstruction` à intervalle croissant, en s'arrêtant à l'état final. Un échec n'annule jamais la publication en base : le message dit que « le site n'est pas encore à jour » et propose `POST /site/reconstruire` à qui en a le droit. Plusieurs publications regroupées dans un même build sont présentées comme telles. La route de l'historique filtré par état est à nommer dans le contrat.

### D-24 · Écrans sans support serveur : désactivés, jamais simulés en production — **Élevée**
- **Pourquoi** : C-07, C-08, C-11 à C-14, C-17, D-06.
- **Rédaction proposée** :
  > Une fonction prévue par PA sans route dans le contrat n'est ni inventée ni simulée en production. Sont concernés à ce jour :
  > - les chiffres d'audience (`/audience-chiffres`) ;
  > - le recadrage ;
  > - la réponse par e-mail et les états lu / archivé des messages ;
  > - les notes internes et les demandes de collaboration ;
  > - l'export du journal ;
  > - la définition du mot de passe par jeton ;
  > - la création de compte par lien ;
  > - la langue du profil.
  >
  > Chacun figure dans `QUESTIONS.md` du back end. En attendant, l'écran ou le bouton est absent ; l'écran peut exister en développement derrière MSW, marqué « en attente du contrat ».

### D-25 · Gestion des tags — **Moyenne**
- **Pourquoi** : C-18, PB:616, PB:960.
- **Rédaction proposée** :
  > Les tags sont une ressource du contrat (`/tags`). La création se fait **uniquement par un écran dédié réservé aux administrateurs**, et non à la volée dans `SelecteurTags`, pour éviter les doublons de libellé. Un tag utilisé ne se supprime pas (`RESTRICT`, PB:177) ; `PanneauUsages` l'explique.

### D-26 · Les règles côté client sont une aide, pas une seconde implémentation — **Moyenne**
- **Pourquoi** : PB:29 (« le serveur fait foi »), PA:423, et le risque de duplication de logique métier.
- **Rédaction proposée** :
  > Les contrôles de l'interface (RG-03, RG-04, RG-06, RG-08…) servent à prévenir l'erreur, pas à décider. Ils sont écrits comme des fonctions pures nommées d'après la règle, et testés. Quand l'interface et le serveur divergent, c'est le refus du serveur qui s'affiche, et l'écart est consigné comme anomalie. Aucune règle n'est vérifiée **uniquement** côté client.

---

## 7. Risques d'intégration

| Priorité | Risque | Origine | Atténuation |
|---|---|---|---|
| **Critique** | Mocks et écrans construits sur une forme de bijou que le back end refusera | C-01 | Trancher C-01 dans le contrat avant l'étape 1 (D-13) |
| **Critique** | Le contrat est écrit après coup à partir des mocks, et le back end doit s'y plier « sans une virgule » | C-04 | D-13, D-14 |
| **Critique** | Session inopérante entre `admin.` et `api.` (cookie, CORS, CSRF) | D-07 | D-15, D-16 ; essai de bout en bout en préproduction dès l'étape 2 |
| **Critique** | Bouton « Publier » qui renvoie systématiquement `TRANSITION_INTERDITE` | C-03 | D-19 ; diagramme d'états à récupérer |
| **Élevé** | Crédits inventés pour franchir un champ obligatoire | C-02 | D-20 |
| **Élevé** | Confusion galerie / médiathèque : appels à la mauvaise ressource | D-06 | M-01 |
| **Élevé** | `422` systématiques dus à des champs en trop ou en lecture seule | PB:608 | D-22 |
| **Élevé** | Écrans livrés sans route (messages, demandes, audience, export) | C-07, C-08, C-12 | D-24 |
| **Élevé** | Jeton CSRF périmé affiché comme un refus de droits | C-05 | D-16, D-17 |
| **Élevé** | Contenu riche refusé par la liste blanche du serveur ; usages d'images non détectés | PB:897, PB:770 | D-21 |
| **Moyen** | Divergence silencieuse des schémas Zod entre les deux projets | D-01, D-02 | D-14 ; même version majeure de Zod |
| **Moyen** | Fausse assurance des tests MSW | D-08 | D-14 : parcours contre l'API réelle |
| **Moyen** | Chaîne de reconstruction pensée pour Cloudflare Pages, site déployé sur GitHub Pages | C-19 | Décision de projet avant l'étape 9 |
| **Moyen** | Réordonnancement concurrent sans `version` | PB:634 | Consigner dans `QUESTIONS.md` du back end |
| **Faible** | Doublon d'extension de lien dans Tiptap | D-02 | Vérification en étape 3 (D-21) |

---

## 8. Modifications recommandées

| Décision | Action | Contenu |
|---|---|---|
| D-01 | **Compléter** | Renvoyer à D-14 pour la source unique du contrat |
| D-02 | **Compléter** | « Zod : même version majeure que le back end, vérifiée à l'étape 1 » ; vérifier le doublon `extension-link` / `starter-kit` |
| D-03 | Conserver | — |
| D-04 | Conserver | — |
| D-05 | Conserver | — |
| **D-06** | **Modifier** (M-01) | (a) Rétablir `/galerie` comme écran **distinct** de `/medias` : la galerie est un contenu éditorial (ressource `galerie`), la médiathèque gère des fichiers (ressource `medias`). (b) Retirer `/audience-chiffres` de la liste des écrans retenus jusqu'à ce que le contrat dise où vivent les chiffres (D-24). (c) Préciser que `/parametres` appelle **deux** ressources, `identite` et `parametres`, une par onglet. |
| D-07 | **Compléter** | Valeur absolue de `VITE_API_URL` hors développement, `credentials: 'include'`, renvoi à D-15 |
| D-08 | **Compléter** | « MSW ne prouve pas la compatibilité » et renvoi à D-14 |
| D-09 | **Compléter** | Jeton CSRF gardé en mémoire uniquement (D-16) |
| D-10 | Conserver | — |
| D-11 | Conserver | — |
| D-12 | Conserver | — |
| D-13 à D-26 | **Ajouter** | Rédactions du § 6, après validation |

Aucune décision n'est à **supprimer**.

---

## 9. Checklist avant lancement

**Avant l'étape 1 de l'admin (bloquant) :**

- [ ] `CONTRAT-API.md` rédigé et validé par l'admin et le back end (D-13).
- [ ] C-01 tranché : où vivent prix, matières et tailles d'un bijou en mode « sur demande ».
- [ ] C-02 tranché : texte alternatif et crédit facultatifs à l'envoi, exigés à la publication.
- [ ] C-03 tranché : diagramme d'états récupéré dans l'analyse conceptuelle ; `brouillon → publie` pour l'admin, oui ou non ; `motif` présent dans le corps.
- [ ] Format d'erreur avec `requeteId` et codes `CSRF_INVALIDE`, `VERSION_PERIMEE`, `TRANSITION_INTERDITE`, `NON_TROUVE` dans le contrat.
- [ ] `champsAFournir` ajouté aux types du contrat ; `createurId` ajouté à `Media`.
- [ ] Liste blanche du contenu riche, et forme du nœud image (avec identifiant de média), écrites dans le contrat.
- [ ] Analyse conceptuelle et plan de développement (D-A à D-I) retrouvés et versés dans `docs/`, ou leur absence actée.

**Avant l'étape 2 (connexion) :**

- [ ] Topologie `admin.` / `api.`, CORS et `ALLOWED_ORIGINS` décidés (D-15).
- [ ] Échéance de session exposée par `GET /auth/moi` (D-16).
- [ ] Route de définition du mot de passe par jeton (réinitialisation et amorçage) dans le contrat (C-14).
- [ ] Création de compte : par lien e-mail ou par mot de passe saisi (C-13).

**Avant les étapes 5 à 9 :**

- [ ] Galerie séparée de la médiathèque (M-01).
- [ ] Ressource des chiffres d'audience décidée (D-24).
- [ ] Messages : états et réponse (C-08) ; demandes : collaboration et notes (C-07).
- [ ] Route d'export du journal (C-12) ; route de l'historique des publications filtré par état (D-23).
- [ ] Hébergeur du site public et mécanisme de reconstruction confirmés (C-19).

**Avant la recette :**

- [ ] Parcours Playwright exécutés contre l'API réelle de préproduction (D-14).
- [ ] Fixtures MSW validées par les schémas du contrat en CI (D-14).
- [ ] Aucun écran de D-24 visible en production sans route réelle.

---

## 10. Verdict final

**GO SOUS CONDITIONS.**

- **Ce qui peut continuer dès maintenant.** Les décisions D-01 à D-12 ne créent aucune incompatibilité bloquante avec le back end. Les étapes de l'admin qui ne dépendent pas de la forme des données peuvent avancer : coque, navigation par rôle, design system, composants transverses (étapes 2 et 3, hors appels réels).
- **Ce qui doit attendre.** L'étape 1 (couche `api/`, schémas, mocks) fige la forme des échanges. Elle ne doit pas commencer tant que le `CONTRAT-API` n'existe pas et que C-01 à C-04 ne sont pas tranchées. Sans cela, les mocks inscriraient dans le code une forme de bijou, une règle d'envoi des médias et des transitions que PB refuse explicitement, et la réconciliation coûterait une réécriture des schémas, des mocks et des formulaires.
- **Pourquoi pas NO-GO.** Aucune contradiction ne remet en cause l'architecture : séparation front/API, session par cookie, absence de stockage navigateur, `peut()` côté serveur, préparation du multi-vendeurs. Toutes se résolvent par une décision écrite dans le contrat, sans changer de pile.
- **Pourquoi pas GO.** Quatre points critiques (C-01 à C-04) et trois décisions manquantes critiques (D-13, D-15, D-16), plus D-19 et D-20, conditionnent la compatibilité réelle. Les engager sur la base des seuls mocks produirait une admin qui passe ses tests et échoue contre l'API.
