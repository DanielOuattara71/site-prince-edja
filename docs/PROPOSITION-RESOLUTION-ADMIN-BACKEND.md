# Proposition de résolution — admin ↔ back end

> **STATUT : REMPLACÉ.** Ce document a servi à préparer les arbitrages. Les décisions arrêtées
> vivent dans `docs/CONTRAT-API.md` v1.0.0 et `admin/docs/DECISIONS.md` (D-13 à D-32). Quand ce
> document les contredit, ce sont eux qui font foi. Les numéros D-xx proposés ici ne correspondent
> pas tous aux numéros arrêtés.
>
> Prince EDJA · 30/10/2026 · suite du rapport `docs/RAPPORT-COMPATIBILITE-ADMIN-BACKEND.md`.
>
> Fichiers **non modifiés** : `admin/docs/DECISIONS.md`, les deux prompts, le code.
> `docs/CONTRAT-API.md` **n'est pas créé** : son contenu proposé figure en partie 5.

**Abréviations.** PB = `docs/PROMPT-BACKEND-PRINCE-EDJA.md` · PA = `docs/PROMPT-ADMIN-PRINCE-EDJA.md` ·
RAP = le rapport de compatibilité · Cxx / Dxx = numéros du rapport · **A-xx** = arbitrage humain demandé
dans ce document.

**Règle de préséance appliquée** (fixée dans la mission d'audit et dans PB:49) :
`CONTRAT-API` › analyse conceptuelle › PB › PA › décisions de l'admin. Le contrat et l'analyse sont
absents : **PB l'emporte sur PA** quand les deux se contredisent et que PB est explicite. Quand PB est
muet ou se contredit lui-même, un arbitrage humain est nécessaire.

**Fait nouveau vérifié pour ce document.** `admin/node_modules/@tiptap/starter-kit/package.json`
(version 3.32.0) déclare `@tiptap/extension-link`, `-underline`, `-code`, `-code-block`,
`-horizontal-rule` et `-strike` parmi ses dépendances. La déduction du RAP sur D-21 devient un **fait** :
StarterKit apporte déjà le lien, et active des nœuds hors de la liste de PA:402.

---

## Sommaire

1. Classement des points du rapport
2. Ce qui se déduit des documents existants
3. Arbitrages humains nécessaires (A-01 à A-17)
4. Proposition de `admin/docs/DECISIONS.md` corrigé
5. Proposition de structure et de contenu de `docs/CONTRAT-API.md`
6. Contradictions non résolubles sans validation humaine
7. Checklist d'autorisation du développement

---

## 1. Classement des points du rapport

**Nature** :
- **T** (technique) : se décide entre développeurs, sans incidence visible pour le client ;
- **M** (métier) : change ce que l'équipe du client peut faire ou voir ;
- **G** (gouvernance) : qui décide, quand, et quel document fait foi ;
- **P** (projet) : hébergement, domaines, prestataires.

**Résolution** :
- **Déductible** : un document existant tranche, il suffit de l'appliquer ;
- **Partiel** : le principe se déduit, mais un nom ou une valeur manque ;
- **Arbitrage** : une décision humaine est nécessaire.

### 1.1 Contradictions C-01 à C-19

| Réf. | Sujet | Nature | Résolution | Source qui tranche, ou arbitrage |
|---|---|---|---|---|
| C-01 | Prix, matière et variantes d'un bijou | M + T | **Arbitrage** | A-02. PB se contredit lui-même : prix sur la variante (PB:417-425), bijou sans variante admis (PB:679) |
| C-02 | Texte alternatif et crédit à l'envoi | T | **Déductible** | PB:766-768 l'emporte sur PA:403 et PA:434 ; renforcé par la non-invention (PB:27, PA:41) |
| C-03 | Transitions, publication d'un brouillon par l'admin | M | **Arbitrage** | A-03. PB:636 est explicite mais renvoie à un diagramme absent ; l'écart avec PA:344 change le travail quotidien |
| C-04 | Absence et propriété du contrat | G | **Arbitrage** | A-01 |
| C-05 | Format d'erreur, `requeteId`, `CSRF_INVALIDE` | T | **Déductible** | PB:552, PB:602 |
| C-06 | « Programmé » et « À fournir » ne sont pas des statuts | T | **Déductible** | PB:181, PB:183 |
| C-07 | Demandes de collaboration, notes internes | M | **Arbitrage** | A-04. PB n'a ni ressource ni colonne ; le formulaire B2B du site envoie aujourd'hui à un service tiers (`src/lib/formulaire.ts:13`, Web3Forms) |
| C-08 | Messages : lu, archivé, réponse | M | **Partiel** | Par préséance, PB:461 (`traite` seulement) ; mais renoncer au « lu / archivé » et à la réponse est un choix métier : A-05 |
| C-09 | Valeurs du statut d'un abonné | T | **Déductible** | PB:179 (`en_attente`, `actif`, `desabonne`) |
| C-10 | `createurId` sur un média | T | **Déductible** | PB:302 |
| C-11 | Envoi multiple, recadrage | T + M | **Partiel** | Un fichier par appel : PB:744 (déductible). Recadrage : aucune route, A-14 |
| C-12 | Export du journal | T | **Partiel** | L'export existe (PB:889), la route n'est pas nommée : A-09 |
| C-13 | Création de compte, mot de passe initial | M + T | **Arbitrage** | A-06. PB se contredit : e-mail d'invitation pour éditeur et admin (PB:811), mais invitations verrouillées derrière `multiVendeurs` (PB:859) |
| C-14 | Route qui consomme le jeton de mot de passe | T | **Partiel** | Le besoin se déduit (PB:556, PB:558) ; le nom de route manque : A-10 |
| C-15 | Ressource porteuse de la signature et du manifeste | T | **Partiel** | Les champs sont dans `SiteInfo` (`src/types/index.ts:5-7`), et PA:381 met `SiteInfo` dans l'écran de paramètres et d'identité. Ressource `identite` déduite ; nom du champ de confirmation donné par PB:704. Reste l'écran : A-08 |
| C-16 | Double saisie (rôle, `multiVendeurs`) | T | **Partiel** | Principe : PB:581, PB:871 (déductible). Nom du champ : A-10 |
| C-17 | Langue de l'interface du profil | M | **Arbitrage** | A-13 |
| C-18 | Qui crée les tags | M | **Arbitrage** | A-12 |
| C-19 | Hébergeur du site, mécanisme de reconstruction | P | **Arbitrage** | A-11. Site sur GitHub Pages (`.github/workflows/deploy.yml:58`), PB prévoit Cloudflare Pages (PB:88) |

### 1.2 Décisions manquantes D-13 à D-26

| Réf. | Sujet | Nature | Résolution | Commentaire |
|---|---|---|---|---|
| D-13 | Contrat rédigé avant l'étape 1 | G | **Arbitrage** | A-01 |
| D-14 | Source unique du contrat, tests de contrat | T | **Partiel** | Cible déductible (OpenAPI généré par le back end, PB:92, PB:606) ; propriétaire pendant la transition : A-01 |
| D-15 | Topologie, CORS, en-têtes | T + P | **Partiel** | Topologie recommandée par PB:1019 ; hébergeurs et domaines : A-11 |
| D-16 | Session, CSRF, expiration | T | **Partiel** | CSRF : déductible (PB:552). Exposer l'échéance de session dans `GET /auth/moi` : champ absent, A-10 |
| D-17 | Traitement des erreurs | T | **Déductible** | PB:570-577, PB:602 |
| D-18 | Statuts réels, états dérivés | T | **Déductible** | PB:179-183 |
| D-19 | Transitions et motif | M | **Arbitrage** | A-03 ; la présence du `motif` est déductible (PB:633) |
| D-20 | Médias | T | **Déductible**, sauf le recadrage (A-14) | PB:744-776 |
| D-21 | Contenu riche, liste blanche | T | **Partiel** | Liste : PA:402. Rejet de `javascript:` : PB:897. Attribut du média dans le nœud image : à nommer, A-10 |
| D-22 | Écritures strictes, `pageSize` ≤ 100 | T | **Déductible** | PB:598, PB:608 |
| D-23 | Suivi de publication | T | **Partiel** | États : PB:495. Route de l'historique : A-09 |
| D-24 | Écrans sans support serveur | T | **Déductible** (comme principe) | Les arbitrages A-04 à A-07, A-13 et A-14 décident ensuite écran par écran |
| D-25 | Gestion des tags | M | **Arbitrage** | A-12 |
| D-26 | Règles côté client = aide | T | **Déductible** | PB:29 |

### 1.3 Points du rapport hors C et D

| Point | Nature | Résolution |
|---|---|---|
| D-06 (a), galerie séparée de la médiathèque | T | **Déductible** : deux ressources distinctes, `galerie` et `medias` (PB:616, PB:620) |
| D-06 (b), `/audience-chiffres` | M | **Arbitrage** : A-07 |
| D-06 (c), deux ressources derrière `/parametres` | T | **Déductible** : PB:619 |
| D-02, même version majeure de Zod | T | **Déductible** : PB:80, PB:606 |
| D-02, doublon `extension-link` | T | **Déductible** (fait vérifié ci-dessus) |
| Réordonnancement sans `version` (PB:634) | T | **Arbitrage** côté back end : A-16 |

---

## 2. Ce qui se déduit des documents existants

Ces points ne demandent **pas** d'arbitrage. Un document de rang supérieur les tranche. Il reste néanmoins à les **valider** : une déduction n'est pas une décision.

| # | Déduction | Source |
|---|---|---|
| 1 | Un média peut être envoyé sans texte alternatif ni crédit ; la publication d'un contenu qui l'utilise est bloquée tant que le texte alternatif manque dans une langue active, sauf média décoratif ; le crédit n'est jamais exigé à l'envoi | PB:309, PB:766-768 |
| 2 | Un fichier par requête `multipart` ; formats JPEG, PNG, WebP, AVIF, GIF, SVG nettoyé, PDF ; limites paramétrables côté serveur (10 Mo par défaut pour une image, 25 Mo pour un PDF) ; déclinaisons 480, 960, 1600, 2400 en WebP | PB:744-754 |
| 3 | Chaque média porte un créateur ; filtre `?createur=` | PB:302, PB:774 |
| 4 | Erreur : `{ status, code, message, champ?, details?, requeteId }` + en-tête `X-Request-Id` | PB:602, PB:604 |
| 5 | Codes techniques connus : `VERSION_PERIMEE`, `CSRF_INVALIDE`, `NON_TROUVE`, `TRANSITION_INTERDITE` ; motif de publication `DELAI_DEPASSE` | PB:602, PB:636, PB:728 |
| 6 | 401 sans session ; 403 avec code de règle ; 404 pour l'objet d'un autre créateur ; 422 avec `champ` ; 409 `VERSION_PERIMEE` ; 429 | PB:570-577 |
| 7 | Statuts envoyés et reçus : `brouillon`, `en_relecture`, `publie`, `archive`. « Programmé » = `publie` avec `publieLe` futur. « À fournir » = `champsAFournir: string[]` renvoyé par l'API | PB:179-183 |
| 8 | Corps de transition : `{ vers, programmeLe?, motif? }` | PB:633 |
| 9 | Champ en trop dans un corps = `422` ; `pageSize` plafonné à 100 | PB:598, PB:608 |
| 10 | Langue absente = absente ; jamais de copie du français vers l'anglais | PB:610 |
| 11 | Jeton CSRF obtenu par `GET /auth/moi`, envoyé dans `X-CSRF-Token` sur `POST`, `PATCH` et `DELETE` | PB:552 |
| 12 | Cookie `HttpOnly`, `Secure`, `SameSite=Lax` ; durée glissante de 8 h et maximale de 7 jours par défaut, paramétrables | PB:548 |
| 13 | Statuts d'abonné : `en_attente`, `actif`, `desabonne` ; de demande : `nouvelle`, `en_cours`, `conclue`, `annulee` ; de publication : `en_attente`, `en_cours`, `reussie`, `echec` | PB:179, PB:495 |
| 14 | `galerie` et `medias` sont deux ressources distinctes ; `identite` et `parametres` aussi | PB:616-620 |
| 15 | La signature et le manifeste du héros sont des champs de `SiteInfo`, donc de l'identité ; leur modification exige `confirmeModificationHero: true` | `src/types/index.ts:5-7`, PA:381, PB:704 |
| 16 | La réponse d'une transition qui publie ou dépublie contient l'identifiant de la publication créée ; un échec de reconstruction n'annule pas la publication | PB:734 |
| 17 | Le corps riche est un JSON Tiptap validé par liste blanche ; liens `javascript:` refusés | PB:897 |
| 18 | `GET /medias/:id/usages` doit trouver un média utilisé **dans le corps** d'un article | PB:770 |
| 19 | Les champs exacts d'une ressource viennent des types du site public | PB:47, PA:263 |
| 20 | Avec `multiVendeurs` faux : un seul créateur actif ; routes vendeur et invitations en `404` | PB:579, PB:841, PB:859 |
| 21 | StarterKit 3.32 inclut déjà le lien, et aussi souligné, code, bloc de code, filet horizontal et barré, hors de la liste de PA:402 | Fait vérifié (en-tête) |

**Conséquence du point 19 sur C-01.** Les champs `ancienPrix`, `edition`, `atelier`, `village`, `poids`, `disponible`, `reference` et `categorie` **existent** dans le type public `CommerceBijou` (`src/types/index.ts:102-123`). Leur **existence** est donc déductible. Seul leur **emplacement** (le bijou ou la variante) demande l'arbitrage A-02.

---

## 3. Arbitrages humains nécessaires

**Qui tranche** :
- **Client** : Prince EDJA ou son représentant ;
- **Resp. admin** : responsable du front d'administration ;
- **Resp. back end** : responsable de l'API ;
- **Projet** : responsable technique global.

Chaque arbitrage propose des options. La **recommandation** n'est qu'un avis.

### A-01 · Gouvernance du contrat — **bloquant étape 1** · Projet + Resp. admin + Resp. back end
- **Question.** Qui rédige `CONTRAT-API.md`, qui le valide, et quand ? Pendant la transition, quelle source des schémas fait foi ?
- **Faits.** PB:15 et PB:592 : le back end s'y conforme « sans en changer une virgule ». PA:551 : l'admin le livre, en fin de parcours (PA:537-549).
- **Options.**
  - (1) Le contrat est rédigé avant l'étape 1 et cosigné ; les schémas de l'admin font foi jusqu'à ce que l'OpenAPI du back end existe.
  - (2) Le back end rédige le contrat d'abord.
  - (3) Le statu quo : contrat tiré des mocks à la fin.
- **Recommandation.** (1). L'option (3) fait porter au back end des choix pris sans lui.

### A-02 · Modèle commercial du bijou — **bloquant étape 1** · Client + Resp. back end
- **Question.** En mode « sur demande », où vivent le prix, l'ancien prix, les matières, les tailles, l'édition, l'atelier, le village, le poids, la disponibilité et la référence ?
- **Faits.**
  - PB : prix, matière, taille et stock sont sur `variante` (PB:417-425) ; un bijou sans variante est admis en mode « sur demande » (PB:679) ; une demande cite une variante (PB:429).
  - PA et le site : tout est sur le bijou (`CommerceBijou`).
- **Options.**
  - (A) Toujours au moins une variante, même en mode « sur demande » : prix, matière et taille sur la variante ; les champs de pièce (édition, atelier, village, poids) sur le bijou.
  - (B) Tout sur le bijou tant que `boutiqueEnLigne` est faux, puis bascule.
- **Recommandation.** (A). Une seule forme pour toujours, et la demande de pièce (RG-11) reste possible.
- **Sous-question métier.** `tailles` et `matieres` sont des listes dans le site, mais une valeur unique par variante dans PB. Une pièce existe-t-elle en plusieurs matières ou tailles, chacune avec son prix ?
- **Reste ouvert même avec (A).** La place de `ancienPrix`, `edition`, `atelier`, `village`, `poids` et `disponible` doit être écrite dans le contrat.

### A-03 · Circuit de publication — **bloquant étape 1** · Client (avec l'analyse conceptuelle)
- **Questions.**
  1. Un admin peut-il publier directement un brouillon ? PB:636 dit non, PA:344 laisse entendre oui.
  2. Un éditeur peut-il modifier un contenu déjà publié ? Si oui, le contenu repasse-t-il en relecture ?
  3. Un contenu archivé peut-il revenir ? Aucune transition ne sort de `archive` (PB:636).
- **Options pour (1).**
  - (a) Non : l'admin soumet puis publie, deux actions journalisées.
  - (b) Oui : le contrat ajoute `brouillon → publie` pour l'admin.
- **Recommandation.** Récupérer d'abord le diagramme d'états de l'analyse conceptuelle. À défaut, (a) est conforme à PB.

### A-04 · Demandes de collaboration et formulaire B2B · Client
- **Question.** Où arrivent les demandes de collaboration ? Le formulaire B2B du site (entreprise, pays, type, calendrier, budget, message) envoie aujourd'hui à Web3Forms (`src/lib/formulaire.ts:13`). PB n'a qu'un formulaire de contact (nom, e-mail, sujet, message, PB:782).
- **Options.**
  - (a) Dans `messages`, les champs B2B étant résumés dans le message : perte de structure.
  - (b) Une nouvelle ressource dans le contrat et le modèle.
  - (c) Les champs B2B ajoutés au message de contact.
- **Notes internes** sur les demandes : les veut-on ? Si oui, il faut une colonne et un champ de contrat.
- **Recommandation.** Arbitrage métier. (a) est le seul choix qui n'ajoute rien au back end.

### A-05 · Traitement des messages · Client
- **Question.** Faut-il les états « lu » et « archivé », et une réponse envoyée depuis l'admin ?
- **Faits.** PB:461 : un seul booléen `traite`, aucune route de réponse.
- **Options.**
  - (a) « Traité / à traiter » et un lien `mailto:` (conforme à PB) ;
  - (b) De nouveaux états et une route de réponse : ajout au contrat, au modèle et aux modèles d'e-mails (PB:804-812).
- **Recommandation.** (a) pour la première livraison.

### A-06 · Création des comptes · Client + Resp. back end (sécurité)
- **Question.** Comment un nouvel éditeur ou admin obtient-il son mot de passe ?
- **Faits.**
  - Aucun mot de passe par défaut (PB:554) ; premier super-admin par lien (PB:556).
  - Il existe un e-mail « Invitation » pour éditeur et admin (PB:811), mais les routes d'invitation sont verrouillées derrière `multiVendeurs` (PB:859).
  - PA:444 prévoit une jauge de robustesse « à la création ».
- **Options.**
  - (a) `POST /comptes` envoie un lien de définition du mot de passe (même mécanisme que l'amorçage) ;
  - (b) le super-admin saisit un mot de passe initial, à changer à la première connexion ;
  - (c) les invitations sont ouvertes aux éditeurs et admins indépendamment de `multiVendeurs`.
- **Recommandation.** (a). Aucun mot de passe ne transite entre deux personnes.

### A-07 · Chiffres d'audience · Client + Resp. back end
- **Question.** Où vivent les chiffres d'audience datés ?
- **Faits.** Le site les tient en deux endroits : `SITE.stats` et `src/data/audience.ts`, par plateforme, avec taille, portée et date. Aucune ressource dans PB:614-622.
- **Options.**
  - (a) Dans `identite` ;
  - (b) une ressource dédiée à ajouter au contrat et au modèle.
- **Recommandation.** Arbitrage. La règle « administrables et datées » du cahier des charges, et la structure par plateforme, plaident pour (b).

### A-08 · Écran d'édition de la signature et du manifeste · Resp. admin
- **Question.** Dans quel écran se modifient ces champs ? PA:375 dit « Pages du site ». La ressource déduite est `identite`, éditée dans `/parametres` (PA:381).
- **Recommandation.** Écran `/parametres`, onglet « Identité ». Accès possible depuis `/pages` par un lien.

### A-09 · Routes à nommer : export du journal, historique des publications · Resp. back end
- **Faits.** Les deux fonctions sont exigées (PB:889, PB:732), sans route nommée.
- **Rappel.** Ce document ne propose aucun nom : le back end les nomme dans le contrat.

### A-10 · Champs et routes à nommer pour l'accès et le contenu · Resp. back end + Resp. admin
- Route qui consomme un jeton de mot de passe : réinitialisation et amorçage (PB:556, PB:558).
- Échéance de session dans `GET /auth/moi`, si on veut l'avertissement d'inactivité de PA:497 sans coder une durée en dur.
- Nom du champ de double saisie : changement de rôle (PB:581) et `multiVendeurs` (PB:871).
- Nom de l'attribut qui porte l'identifiant du média dans le nœud image du corps riche (PB:770).

### A-11 · Hébergement et domaines · Projet + Client
- **Questions.**
  - Domaine principal, sous-domaines `admin.` et `api.`, hébergeur de l'admin (PB:1019) ?
  - Le site public reste-t-il sur GitHub Pages ou passe-t-il sur Cloudflare Pages (PB:88) ?
- **Conséquence.** La chaîne de reconstruction (PB:712-738) en dépend, donc l'écran `/publication` aussi.

### A-12 · Création des tags · Client
- **Options.**
  - (a) Un écran dédié, réservé aux administrateurs ;
  - (b) une création à la volée dans le sélecteur ;
  - (c) des tags figés par la migration.
- **Recommandation.** (a). On évite les doublons de libellé, et un tag utilisé reste protégé (PB:177).

### A-13 · Langue de l'interface du profil · Client · faible
- **Options.**
  - (a) Préférence locale d'affichage (PA:73 l'autorise) ;
  - (b) colonne sur le compte.
- **Recommandation.** (a), ou retrait de la fonction tant que l'admin n'existe qu'en français (PA:486).

### A-14 · Recadrage des images · Client · faible
- **Faits.** PA:373 le demande ; PB n'a aucune route.
- **Options.**
  - (a) Reporté ;
  - (b) une route côté back end (dans le traitement `sharp`) ;
  - (c) un recadrage côté navigateur avant l'envoi, sans route nouvelle.
- **Recommandation.** (c) ou (a). (c) n'ajoute rien au contrat.

### A-15 · « À fournir » sur un projet · Resp. back end + Resp. admin
- **Faits.** PA:263 liste « à fournir » parmi les champs d'un projet, et le site a `Projet.aFournir` (`src/data/projets.ts`). PB:183 dit que « à fournir » n'est pas stocké, mais calculé.
- **Question.** Est-ce un indicateur saisi (le projet est annoncé sans contenu) ou un état calculé ?
- **Recommandation.** Calculé par `champsAFournir`, sauf si le client veut annoncer un projet sans contenu : ce serait alors un champ distinct, avec un autre nom.

### A-16 · Réordonnancement concurrent · Resp. back end · faible
`PATCH /{ressource}/ordre` ne porte pas de `version` (PB:634). Accepter « la dernière écriture gagne », ou ajouter un contrôle ?

### A-17 · Documents de référence manquants · Projet — **bloquant étape 1**
L'analyse conceptuelle (diagrammes d'états, dictionnaire, modèle) et le plan de développement (D-A à D-I) sont-ils disponibles ? Sinon, leur absence est actée, et PB devient la référence des règles.

---

## 4. Proposition de `admin/docs/DECISIONS.md` corrigé

> Texte complet proposé. **Non appliqué.** Légende des statuts :
> - **Validée** : en vigueur depuis l'étape 0 ;
> - **Proposé** : complément ou nouvelle décision soumis à validation ;
> - **Suspendue (A-xx)** : ne peut être validée qu'après l'arbitrage cité.
>
> Les ajouts aux décisions existantes sont signalés par **[Complément proposé]**.

```markdown
# Décisions — admin Prince Edja

Chaque choix pris en cas d'incertitude ou d'écart au prompt (`docs/PROMPT-ADMIN-PRINCE-EDJA.md`
à la racine du dépôt). Une décision = contexte, choix, conséquence, statut.

Préséance : `docs/CONTRAT-API.md` › analyse conceptuelle › `docs/PROMPT-BACKEND-PRINCE-EDJA.md`
› `docs/PROMPT-ADMIN-PRINCE-EDJA.md` › ce fichier. Une décision ne contredit jamais
silencieusement un document de rang supérieur.

## Étape 0 — 30/10/2026

### D-01 · Projet autonome dans `admin/` — Validée
- Projet npm indépendant (`admin/package.json`, son propre verrou), sans workspace partagé.
- Les deux applications évoluent et se déploient séparément ; le seul lien volontaire est le
  contrôle des jetons (D-05).
- **[Complément proposé]** L'admin n'accède qu'à l'API : ni base, ni stockage de fichiers.
  La source unique des schémas du contrat est fixée par D-14.

### D-02 · Versions alignées, figées, publiées depuis 14 jours ou plus — Validée
- Socle : versions installées du site public. Ajouts : dernière version stable publiée depuis
  14 jours ou plus. Toutes figées.
- Exception Vite : 8.2.4 (8.2.2 touchée par des failles hautes du serveur de développement).
  Recommandation : monter le site public en 8.2.4.
- **[Complément proposé]** Zod : même version majeure que le back end, vérifiée avant l'étape 1.
- **[Complément proposé]** `@tiptap/starter-kit` 3.32.0 inclut déjà `extension-link` (vérifié
  dans son `package.json`) : la dépendance directe `@tiptap/extension-link` est redondante et
  sera retirée à l'étape 3, la configuration du lien passant par StarterKit (voir D-21).

### D-03 · Trois écarts d'outillage au prompt — Validée
oxlint (react, typescript, jsx-a11y, import) au lieu d'ESLint + jsx-a11y ; `@dnd-kit/react` +
`@dnd-kit/helpers` 0.5.1 au lieu de `@dnd-kit/core` ; `axe-core` direct au lieu de `vitest-axe`.
Raisons inchangées. Sans incidence sur le back end.

### D-04 · Node 24 en CI, 22.12 ou plus requis — Validée

### D-05 · Jetons copiés à l'identique et contrôlés — Validée

### D-06 · Adresses des écrans — Validée, **[modification proposée]**
Les adresses des **écrans** suivent la section 9 du prompt. Elles ne changent pas les noms des
**ressources d'API**, qui suivent le contrat.

| Section 6 du prompt | Écran retenu | Ressource(s) d'API appelée(s) |
|---|---|---|
| `/recits` | `/articles` | `articles` |
| `/boutique/pieces` | `/bijoux` | `bijoux` |
| `/boutique/categories` | `/categories` | `categories` |
| `/taste-travel` | `/villes` | `villes` |
| `/identite`, `/parametres-techniques` | `/parametres`, deux onglets | `identite` **et** `parametres`, une par onglet |
| `/restauration` | onglet « Historique » + `/publication` | `versions/:ressource/:id`, `restauration`, `site/*` |
| `/galerie` | **`/galerie`, écran distinct** de `/medias` | `galerie` (contenu) ; `medias` (fichiers) |
| `/audience-chiffres` | **Suspendu (A-07)** | Aucune ressource tant que A-07 n'est pas tranché |

[Modification proposée] La galerie redevient un écran distinct : c'est un contenu éditorial
(statut, ordre, traductions), pas un fichier. `/audience-chiffres` est retiré tant que le
contrat ne dit pas où vivent ces chiffres.

### D-07 · Chemin de base et variables d'environnement — Validée
- Seule variable client : `VITE_API_URL`. Chemin de base par `ADMIN_BASE` (build, côté Node).
- `verifier-dist` refuse toute autre `VITE_*`.
- **[Complément proposé]** La valeur relative de `.env.example` ne vaut qu'en développement
  (même origine via MSW). En préproduction et en production, `VITE_API_URL` est l'URL
  **absolue** de l'API, et toutes les requêtes partent avec `credentials: 'include'`. Topologie :
  D-15.

### D-08 · Le service worker MSW vit dans `public-dev/` — Validée
- **[Complément proposé]** Les mocks servent au développement ; ils ne prouvent pas la
  compatibilité avec l'API réelle (voir D-14).

### D-09 · `localStorage` et `sessionStorage` interdits par le lint — Validée
- **[Complément proposé]** Le jeton CSRF vit en mémoire seulement (voir D-16).

### D-10 · `admin/**` exclu du lint du site public — Validée

### D-11 · Suppression d'`admin-custom/` — Validée

### D-12 · Données réelles du site public — Validée
7 entrées d'archive, et non 8 comme annoncé : les jeux d'exemple suivent les données réelles.

## Préparation de l'étape 1 — à valider

### D-13 · Le contrat API précède la couche `api/` — Suspendue (A-01, A-17)
`docs/CONTRAT-API.md` est rédigé avant la couche `api/`, à partir de la section 7 du prompt
admin corrigée selon la préséance, puis validé par les responsables de l'admin et du back end.
L'admin n'invente aucune route ni aucun champ absent du contrat ; un besoin non couvert est
consigné et l'écran concerné reste absent (D-24).

### D-14 · Source unique des schémas et preuves de compatibilité — Proposé (propriétaire : A-01)
- Cible : l'OpenAPI généré par le back end depuis ses schémas Zod. L'admin vérifie en CI que
  ses schémas y sont conformes.
- Transition : les schémas de `admin/src/api/schemas/` font foi et sont transmis au back end.
- Chaque jeu d'exemple MSW est validé par ces schémas dans un test.
- Les tests sur MSW ne valent pas preuve d'intégration : des parcours Playwright tournent contre
  l'API réelle de préproduction avant chaque recette.

### D-15 · Topologie, CORS et en-têtes — Proposé (hébergeurs et domaines : A-11)
Admin sur `admin.<domaine>`, API sur `api.<domaine>`, même site, cookie `SameSite=Lax`.
Origine de l'admin dans `ALLOWED_ORIGINS`. L'hébergement de l'admin pose `X-Robots-Tag: noindex`,
une politique de sécurité du contenu (`connect-src` limité à l'API, aucun script tiers) et HSTS.
Pas de recette sur un domaine tiers.

### D-16 · Session et CSRF — Proposé (échéance de session : A-10)
- Jeton CSRF de `GET /auth/moi` gardé en mémoire ; joint à `POST`, `PATCH`, `DELETE`.
- `403 CSRF_INVALIDE` : redemander `GET /auth/moi`, rejouer une seule fois.
- `401` : écran verrouillé sans perte du formulaire ; reprise après reconnexion.
- Avertissement d'inactivité : seulement si le contrat expose l'échéance de session ; aucune
  durée codée en dur.

### D-17 · Traitement des erreurs — Proposé
Un seul module (`api/client.ts`) traduit les réponses selon le tableau de la section 7 du
prompt back end : 401, 403 (règle ou `CSRF_INVALIDE`), 404 (y compris l'objet d'un autre
créateur), 409 `VERSION_PERIMEE`, 422 (rattaché au `champ`, ou `TRANSITION_INTERDITE`), 429,
5xx. Toute erreur inattendue affiche le `requeteId`.

### D-18 · Statuts réels et états dérivés — Proposé
Statuts échangés : `brouillon`, `en_relecture`, `publie`, `archive`. « Programmé » (= `publie`
avec `publieLe` futur) et « À fournir » (= `champsAFournir` non vide) sont des pastilles
dérivées, jamais envoyées comme statut.

### D-19 · Transitions — Suspendue (A-03)
Corps `{ vers, programmeLe?, motif? }` ; motif obligatoire pour un refus. L'admin ne propose
que les transitions du diagramme du contrat. La possibilité pour un admin de publier un
brouillon en une action dépend de A-03.

### D-20 · Médias — Proposé (recadrage : A-14)
- Un fichier par requête ; envoi multiple = requêtes successives, progression par fichier.
- Contrôles de type et de taille côté client = aide ; le refus du serveur fait foi.
- Envoi possible sans texte alternatif ni crédit : le média est « à fournir » et bloque la
  publication des contenus qui l'utilisent, sauf s'il est décoratif. Le crédit n'est jamais
  exigé à l'envoi.
- Chaque média porte `createurId` (le créateur principal par défaut).
- Suppression d'un média utilisé : liste des usages du `422 RG-08`.

### D-21 · Contenu riche — Proposé (attribut du média : A-10)
Tiptap n'active que : titres 2 à 4, gras, italique, listes, citation, lien, image. Les
extensions de StarterKit hors liste (souligné, barré, code, bloc de code, filet horizontal)
sont désactivées explicitement. Un lien `javascript:` est refusé à la saisie. Le nœud image
porte l'identifiant du média. La liste blanche est celle du contrat.

### D-22 · Écritures strictes — Proposé
Schéma d'entrée strict, distinct du schéma de lecture ; aucun champ en lecture seule envoyé ;
`version` sur tout `PATCH` ; `pageSize` jamais au-delà de 100.

### D-23 · Suivi de publication — Proposé (route d'historique : A-09)
Cinq moments affichés : modifié, publié, reconstruction en attente, en cours, terminée
(`reussie` / `echec`, dont `DELAI_DEPASSE`). Suivi de l'identifiant de publication renvoyé
par la transition. Un échec n'annule jamais la publication.

### D-24 · Pas d'écran sans route — Proposé
Une fonction du prompt admin sans route au contrat n'est ni inventée ni simulée en production.
Liste tenue à jour selon les arbitrages A-04, A-05, A-06, A-07, A-13, A-14.

### D-25 · Tags — Suspendue (A-12)

### D-26 · Règles côté client — Proposé
Les contrôles de l'interface préviennent l'erreur, ils ne décident pas. Fonctions pures
nommées d'après la règle, testées. Le refus du serveur fait foi ; un écart est une anomalie.
```

---

## 5. Proposition de structure et de contenu de `docs/CONTRAT-API.md`

> **Règle de rédaction.** Chaque élément cite sa source. Un élément sans source dans PB, dans PA
> ou dans les types du site **n'est pas écrit** : il apparaît comme `⛔ MANQUANT — A-xx`.
> Ce document ne propose aucun nom de route ni de champ qui n'existe pas déjà dans une source.

### Structure proposée

```text
docs/CONTRAT-API.md
  0. Statut, version du contrat, signataires, procédure de modification   (A-01)
  1. Conventions générales
  2. Session, authentification, CSRF
  3. Erreurs et codes
  4. Rôles, droits et réponses 401 / 403 / 404
  5. Types communs
  6. Cycle de vie d'un contenu : statuts, états dérivés, transitions       (A-03)
  7. Ressources éditoriales (une sous-section par ressource)
  8. Boutique et créateurs                                                 (A-02)
  9. Médias
 10. Audience : messages, demandes, abonnés                               (A-04, A-05)
 11. Réglages : identité, paramètres, navigation, textes, pages légales
 12. Publication du site, versions et restauration                       (A-09)
 13. Comptes et journal d'audit                                          (A-06, A-09)
 14. Tableau de bord
 15. Fonctions préparées et verrouillées (multiVendeurs, boutiqueEnLigne)
 16. Hors contrat : face publique, routes internes de build
 17. Points ouverts (renvoi aux arbitrages)
 18. Historique des versions du contrat
```

### Contenu proposé, section par section

#### 0. Statut
- Version `0.1-proposition`. Signataires : resp. admin, resp. back end. Procédure de modification : **A-01**.
- Préséance : contrat › analyse › PB › PA (PB:49).

#### 1. Conventions générales
| Règle | Valeur | Source |
|---|---|---|
| Préfixe | `/admin/api/v1` | PA:181, PB:589 |
| Format | JSON UTF-8 ; dates ISO 8601 avec fuseau ; identifiants `uuid` | PB:596 |
| Pagination | `?page=1&pageSize=20&q=&statut=&langue=&tri=-modifieLe` → `{ items, page, pageSize, total }` ; `pageSize` ≤ 100 | PA:183, PB:598 |
| Concurrence | `version` sur chaque contenu ; écriture périmée → `409 VERSION_PERIMEE` | PB:175, PB:600 |
| Champs inconnus | `422` | PB:608 |
| Langues | `traductions: { fr?, en? }` ; langue absente = absente | PB:610, PA:193 |
| Traçabilité | En-tête `X-Request-Id` sur chaque réponse | PB:604 |
| Filtre créateur | `?createur=` sur `bijoux` et `medias` | PA:306, PB:774 |

#### 2. Session, authentification, CSRF
| Route | Usage | Source |
|---|---|---|
| `POST /auth/connexion` | E-mail, mot de passe ; réponse identique que le compte existe ou non ; `429` après échecs | PA:288, PB:546, PB:560, PB:901 |
| `POST /auth/deconnexion` | Révoque la session en base | PA:288, PB:550 |
| `GET /auth/moi` | Compte, rôle, jeton CSRF | PA:171, PA:182, PB:552 |
| `POST /auth/changer-mot-de-passe` | Première connexion (`doitChangerMotDePasse`) ; révoque les autres sessions | PA:289, PB:550, PB:554 |
| `POST /auth/mot-de-passe-oublie` | Réponse toujours identique ; lien à usage unique, 1 h | PA:289, PB:558 |
| ⛔ MANQUANT | Consommer le jeton de réinitialisation ou d'amorçage | **A-10** |
| ⛔ MANQUANT | Échéance de session dans `GET /auth/moi` (facultatif) | **A-10** |

- Cookie `HttpOnly`, `Secure`, `SameSite=Lax` ; 8 h glissantes, 7 jours au maximum, paramétrables (PB:548).
- `X-CSRF-Token` sur `POST`, `PATCH`, `DELETE` ; absent ou faux → `403 CSRF_INVALIDE` ; origine contrôlée (PB:552).
- Mot de passe : 12 caractères au minimum, refus des mots de passe courants (PB:554).

#### 3. Erreurs et codes
- **Forme** : `{ status, code, message, champ?, details?, requeteId }` ; message en français, sans trace technique (PB:602).
- **Codes techniques** : `VERSION_PERIMEE`, `CSRF_INVALIDE`, `NON_TROUVE`, `TRANSITION_INTERDITE` (PB:602, PB:636).
- **Codes de règle visibles par l'admin** : RG-01 à RG-23 et RG-27 (PB:667-695). RG-24 à RG-26 et RG-28 sont hors périmètre (PA:466).

| Statut | Cas | Source |
|---|---|---|
| 401 | Pas de session valide | PB:572 |
| 403 | Action interdite, avec le code de la règle ; ou `CSRF_INVALIDE` | PB:573, PB:552 |
| 404 | Objet absent, ou objet d'un autre créateur pour un vendeur | PB:574 |
| 409 | `VERSION_PERIMEE` | PB:576 |
| 422 | Données invalides (avec `champ`), règle violée, transition interdite | PB:575, PB:633 |
| 429 | Trop de requêtes, avec délai | PB:577 |

#### 4. Rôles et droits
- **Rôles** : `editeur`, `admin`, `super_admin`, `vendeur` (PB:250, PA:279). Le rôle `vendeur` n'existe que si `multiVendeurs` est vrai (PB:579).
- **Tableau de droits** : repris tel quel de PA:321-339 (une seule source ; PB:568 y renvoie).
- **Garde-fous RG-16** : pas d'auto-suppression ni d'auto-rétrogradation ; dernier super-admin intouchable ; double saisie de l'e-mail pour changer un rôle (PB:581). Nom du champ : ⛔ **A-10**.

#### 5. Types communs (sources : PA:190-280, PB:163-201)
```ts
type Langue = 'fr' | 'en'                                        // PA:190, PB:179
type Role = 'editeur' | 'admin' | 'super_admin' | 'vendeur'      // PA:279, PB:250
type StatutContenu = 'brouillon' | 'en_relecture' | 'publie' | 'archive'  // PB:179
type Traductions<T> = Partial<Record<Langue, T>>                 // PA:193

interface ContenuBase {                                          // PA:195-203
  id: string; statut: StatutContenu; publieLe: string | null
  creeLe: string; modifieLe: string; auteurId: string; version: number
  champsAFournir: string[]                                       // PB:183 (lecture seule)
}

interface Tag {                                                  // PA:252-255, PB:331-346
  id: string; type: 'pays' | 'ville' | 'theme' | 'annee' | 'format' | 'projet'
  code: string; traductions: Traductions<{ libelle: string }>
}

interface Compte {                                               // PA:257-260, PA:278
  id: string; email: string; nom: string; role: Role; actif: boolean
  derniereConnexion: string | null; doitChangerMotDePasse: boolean
  createurId?: string                                            // obligatoire si role === 'vendeur'
}
```

#### 6. Cycle de vie d'un contenu
- **Statuts réels** : section 5. **États dérivés** : « programmé » = `publie` et `publieLe` futur ; « à fournir » = `champsAFournir` non vide. Jamais envoyés (PB:181, PB:183).
- **Transition** : `POST /{ressource}/:id/transition` avec `{ vers, programmeLe?, motif? }` ; réponses `200`, `403`, `422` (`RG-03`, `TRANSITION_INTERDITE`) (PB:633).
- **Diagramme** (PB:636) :

| Depuis | Vers | Qui | Condition |
|---|---|---|---|
| `brouillon` | `en_relecture` | éditeur, admin | — |
| `en_relecture` | `publie` | admin | RG-03 (et RG-06 pour un article) |
| `en_relecture` | `brouillon` | admin | `motif` obligatoire |
| `publie` | `archive` | admin | déclenche une reconstruction |
| `publie` | `brouillon` | admin | dépublication ; reconstruction |
| `brouillon` | `publie` | ⛔ **A-03** | — |
| `archive` | ? | ⛔ **A-03** | — |
| modification d'un contenu publié par un éditeur | ? | ⛔ **A-03** | — |

- **Réponse d'une transition qui publie ou dépublie** : contient l'identifiant de la publication créée (PB:734). Nom du champ : ⛔ **A-09**.

#### 7. Ressources éditoriales
Verbes communs à chaque ressource (PA:290-293, PB:626-634) :
- `GET /{r}` (liste paginée) ;
- `GET /{r}/:id` ;
- `POST /{r}` (création en brouillon, `201`) ;
- `PATCH /{r}/:id` (avec `version`) ;
- `DELETE /{r}/:id` (`204`, ou `422` si l'objet est utilisé) ;
- `POST /{r}/:id/transition` ;
- `PATCH /{r}/ordre` avec `{ ids }` (A-16).

| Ressource | Champs : source | État |
|---|---|---|
| `articles` | PA:205-217 ; cohérent avec PB:349-383 | **Complet** |
| `episodes` | PA:219-227 | Complet côté PA ; à recouper avec le type `Episode` (`src/types/index.ts:65`) |
| `projets` | PA:263 (format, avancement, année, pays, thèmes, route, à fournir, ordre) ; type `Projet` (`src/data/projets.ts:12`) | ⛔ « à fournir » : **A-15** ; table de correspondance à produire |
| `villes` | type `TravelCity` (`src/types/index.ts:76`) ; PB:195 `ville_taste` | Table de correspondance à produire |
| `destinations` | PA:263 (latitude, longitude, épisode lié, carnet) ; type `Destination` (`src/data/destinations.ts:16`) | Table de correspondance à produire |
| `archive` | PA:263 (catégorie, texte, sources, fiabilité, époque, pays) ; `EntreeArchive` (`src/data/archive.ts:12`) ; sources dans `archive_source` (PB:195) | Publication refusée sans source (PB:702) |
| `distinctions` | PA:263 (année, organisme, lien, image) ; type `Distinction` (`src/types/index.ts:154`) | Source et date obligatoires (PA:370) |
| `presse` | PA:263 (source, date, lien) ; type `PressItem` (`src/types/index.ts:140`) | Idem |
| `galerie` | type `GalerieImage` (`src/types/index.ts:187`) ; PB:195 `galerie_image` | Table de correspondance à produire |
| `univers` | type `Univers` (`src/types/index.ts:58`) | Idem |
| `jalons` | type `Milestone` (`src/types/index.ts:148`) | Idem |
| `offres` | `Offre` (`src/data/offres.ts:8`) | Aucun tarif sans source (PA:374) |
| `pages` | PA:263 (« page et son SEO ») | ⛔ Champs non décrits dans aucune source : à définir |
| `tags` | section 5 | Création : **A-12** |

> « Table de correspondance à produire » : PB:47 et PA:263 disent que les champs viennent des
> types du site. La correspondance type du site ↔ champ du contrat (lesquels sont traduisibles,
> lesquels sont des médias) est un **travail de rédaction**, non fait ici pour ne rien
> inventer. Elle se fait type par type, à partir des fichiers cités.

#### 8. Boutique et créateurs
- **Créateur** (PA:268-276, PB:221-237) :
  ```ts
  type Createur = ContenuBase & {
    nom: string; pays?: string; ville?: string; photoId?: string
    estPrincipal: boolean; tauxCommission?: number    // 0 à 100, vide si non défini
    traductions: Traductions<{ bio: string; accroche?: string }>
  }
  ```
  ⚠ **Écarts à trancher** : PB:223 impose un `slug` et PB:229 un `actif`, absents de PA:268-276. Voir § 6, X-05.
- Routes : `createurs` (liste, détail, création, modification, transition, désactivation) et `GET /createurs/principal` (PA:306, PB:617, PB:847).
- **RG-21** : supprimer ou désactiver le principal → `422 RG-21`. **RG-27** : supprimer un créateur qui a des produits → `422 RG-27` (PA:306).
- **Catégories** : `categories`, champs `ordre`, `visible`, traductions `slug` et `nom` (PB:386-398). Une catégorie vide n'est pas affichée sur le site (RG-09).
- **Bijou** : ⛔ **A-02**. Champs non contestés : `numero`, `imageId`, `galerieMediaIds`, `categorieId`, `tagIds`, `visible`, `createurId`, `prixConfirme`, traductions `slug`, `nom`, `culture`, `histoire` (PA:229-241, PB:400-414). Champs dont l'**emplacement** dépend d'A-02 : `prix`, `ancienPrix`, `matieres`, `tailles`, `edition`, `atelier`, `village`, `poids`, `disponible`, `reference`.
- **Variante** : `reference`, `matiere`, `taille`, `prix` (vide = non communiqué), `stock` (PB:417-425). Obligatoire si `boutiqueEnLigne` (RG-10). En mode « sur demande » : ⛔ **A-02**.

#### 9. Médias (PB:744-776, PA:244-250, PA:294)
```ts
interface Media {
  id: string; url: string; mime: string; largeur: number | null; hauteur: number | null
  poids: number; credit: string | null; usages: number
  declinaisons: { largeur: number; url: string }[]
  traductions: Traductions<{ texteAlt: string; legende?: string }>
  decoratif: boolean
  createurId: string                                     // PB:302
}
```

| Route | Règle | Source |
|---|---|---|
| `POST /medias` | `multipart`, **un fichier** ; type réel contrôlé ; tailles par défaut 10 Mo pour une image, 25 Mo pour un PDF ; formats JPEG, PNG, WebP, AVIF, GIF, SVG nettoyé, PDF ; déclinaisons WebP 480, 960, 1600, 2400 ; texte alternatif et crédit facultatifs à l'envoi | PB:744-768 |
| `GET /medias`, `GET /medias/:id`, `PATCH /medias/:id` | Filtre `?createur=` | PA:294, PB:774 |
| `GET /medias/:id/usages` | Image principale, galerie, corps d'article, photo de créateur, bijou | PB:770 |
| `DELETE /medias/:id` | `422 RG-08` avec les usages ; fichiers retirés après 24 h | PB:770 |
| ⛔ MANQUANT | Recadrage | **A-14** |

#### 10. Audience
| Ressource | Champs | Routes | Source |
|---|---|---|---|
| `messages` | `nom`, `email`, `sujet`, `message`, `traite`, `creeLe`, `purgeLe` | `GET`, `PATCH` | PB:455-464, PA:295 |
| `demandes` | `varianteId`, `nom`, `email`, `message`, `statut` (`nouvelle`, `en_cours`, `conclue`, `annulee`), `creeLe` | `GET`, `PATCH` ; aucune action de stock (RG-11) | PB:427-435, PA:295 |
| `abonnes` | `email`, `langue`, `statut` (`en_attente`, `actif`, `desabonne`), `confirmeLe`, consentements (date, finalité, texte), non modifiables | `GET /abonnes`, `GET /abonnes/export` (CSV), `DELETE /abonnes/:id` | PB:438-454, PA:296 |
| ⛔ | États « lu » et « archivé », réponse par e-mail | — | **A-05** |
| ⛔ | Demandes de collaboration, notes internes | — | **A-04** |

#### 11. Réglages
| Ressource | Contenu | Source |
|---|---|---|
| `identite` | Champs de `SiteInfo` (`src/types/index.ts:1-21`) ; modifier `signature` ou `manifeste` exige `confirmeModificationHero: true` | PA:381, PB:704 |
| `parametres` | Dont `boutiqueEnLigne` et `multiVendeurs` (super-admin seulement, avec double saisie), durée de conservation des messages, délai de regroupement des publications | PB:836-841, PB:871, PB:938 |
| `navigation` | Reprise de `NAV_PRINCIPALE` et `FOOTER_NAV` (`src/data/navigation.ts`) | PB:940 |
| `textes-interface` | Libellés FR et EN, contrôle des clés manquantes | PA:379, PB:940 |
| `pages-legales` | Titre et rubriques de `PAGES_LEGALES` ; contenu vide signalé « à fournir » | PB:706, PB:944 |
| ⛔ | Chiffres d'audience | **A-07** |

#### 12. Publication, versions, restauration
- `POST /site/reconstruire`, `GET /site/etat-reconstruction` (PA:300, PB:621, PB:732).
- Publication : `motif` (`publication`, `depublication`, `programmee`, `manuelle`), `etat` (`en_attente`, `en_cours`, `reussie`, `echec`), `declencheeLe`, `termineeLe`, `messageErreur` (PB:491-499). Échec après 15 min : `DELAI_DEPASSE` (PB:728).
- `GET /versions/:ressource/:id`, `POST /restauration` : une restauration crée une nouvelle version et déclenche une reconstruction si le contenu est publié (PA:301, PB:736). ⛔ Corps de `POST /restauration` non décrit : **A-09**.
- ⛔ Route de l'historique filtré par état : **A-09**.

#### 13. Comptes et journal
- `GET`, `POST` et `PATCH /comptes` (PA:297). ⛔ Mode de création et de définition du mot de passe : **A-06**.
- `GET /journal`, paginé, filtrable par compte, action, entité et période ; lecture seule. Champs : `compteId`, `action`, `entite`, `entiteId`, `avant`, `apres`, `requeteId`, `creeLe` (PA:298, PB:467-478, PB:889). ⛔ Export : **A-09**.

#### 14. Tableau de bord
- `GET /tableau-de-bord` : à relire, messages non lus, contenus « à fournir » (PA:302). Forme de la réponse : à écrire.

#### 15. Fonctions préparées et verrouillées
- `multiVendeurs` faux : un seul créateur actif ; invitations (`POST`, `GET`, `DELETE /invitations`, `POST /auth/invitation/accepter`) et routes vendeur en `404` ; aucun compte vendeur (PB:579, PB:859).
- `boutiqueEnLigne` faux : aucune route de commande ; variantes facultatives (PB:840).
- Hors périmètre : RG-24, RG-25, RG-26, RG-28 côté écrans (PA:466) ; commandes, paiement, reversements (PB:869).

#### 16. Hors contrat de l'admin
- Face publique `/public/api/v1/*` (PB:638-659) : consommée par le site, pas par l'admin.
- Routes internes de build `/internal/api/v1/publication/*` (PB:728) : jamais exposées.

#### 17. Points ouverts
Renvoi aux arbitrages A-01 à A-17 et aux contradictions X-01 à X-07 (§ 6).

---

## 6. Contradictions non résolubles sans validation humaine

| ID | Contradiction | Documents | Pourquoi aucune déduction ne suffit | Arbitrage |
|---|---|---|---|---|
| X-01 | Prix d'un bijou sans variante en mode « sur demande » | PB:417-425 contre PB:679 contre PA:229-242 | PB se contredit lui-même ; toute résolution change le modèle | A-02 |
| X-02 | Une demande cite une variante, alors qu'un bijou peut n'en avoir aucune | PB:429 contre PB:679 | Contradiction interne à PB | A-02 |
| X-03 | Un admin publie-t-il un brouillon en une action ? | PA:344 contre PB:636 | PB renvoie à un diagramme absent ; impact sur le travail quotidien | A-03, A-17 |
| X-04 | Invitations pour éditeur et admin, mais routes verrouillées derrière `multiVendeurs` | PB:811 contre PB:859 | Contradiction interne à PB | A-06 |
| X-05 | `slug` et `actif` du créateur absents de PA | PB:223, PB:229 contre PA:268-276 | Ajout de champs au contrat ; le `slug` sert-il une page publique du créateur (PA:390, « page publique en aperçu ») ? | Resp. back end + resp. admin |
| X-06 | Demandes de collaboration exigées par l'admin, inexistantes côté serveur | PA:377 contre PB:653-657 | Choix fonctionnel | A-04 |
| X-07 | Propriété du contrat : livré par l'admin à la fin, respecté « sans une virgule » par le back end | PA:551 contre PB:15 | Choix de gouvernance | A-01 |

**Nouveau point relevé pour ce document.** X-05 ne figurait pas dans le rapport : PB:223 rend le `slug` d'un créateur obligatoire et unique, et PB:229 lui ajoute un booléen `actif` distinct de son `statut`. PA:268-276 n'a ni l'un ni l'autre.

---

## 7. Checklist d'autorisation du développement

### Niveau 1 — peut continuer sans attendre (aucun appel à l'API)
- [x] Étape 0 validée (pile, jetons, CI).
- [ ] Coque, navigation, design system et composants **sans données serveur** (une partie des étapes 2 et 3). Autorisé dès la validation de ce document.

### Niveau 2 — conditions pour démarrer l'étape 1 (couche `api/`, schémas, mocks)
- [ ] **A-01** tranché : propriété et procédure du contrat.
- [ ] **A-17** tranché : analyse conceptuelle et plan retrouvés, ou absence actée.
- [ ] **A-02** tranché : modèle commercial du bijou.
- [ ] **A-03** tranché : circuit de publication.
- [ ] Déductions du § 2 **validées** (une validation globale suffit).
- [ ] `DECISIONS.md` corrigé (§ 4) **validé**, puis appliqué.
- [ ] `CONTRAT-API.md` v0.1 rédigé à partir du § 5, sections 1 à 6 et 9 complètes, **signé** par les deux responsables.
- [ ] X-05 tranché (`slug` et `actif` du créateur).

### Niveau 3 — conditions par étape suivante de l'admin
| Étape de l'admin | Condition |
|---|---|
| 2, connexion | A-06 et A-10 (route du jeton, échéance de session), A-11 (domaines) |
| 4, articles | Table de correspondance d'`articles` validée ; liste blanche du contenu riche (D-21) ; attribut du média (A-10) |
| 5, médias | D-20 validée ; A-14 |
| 6, boutique | A-02 appliqué dans le contrat ; X-05 ; correspondance d'`episodes`, `projets` (A-15), `villes`, `destinations` |
| 7, autres contenus | Correspondances de `distinctions`, `presse`, `archive`, `univers`, `jalons`, `offres`, `galerie`, `pages` |
| 8, audience et réglages | A-04, A-05, A-07, A-12 |
| 9, comptes, journal, publication | A-06, A-09, A-11 (hébergeur du site), A-13 |

### Niveau 4 — avant la recette
- [ ] Parcours Playwright exécutés contre l'API réelle de préproduction (D-14).
- [ ] Fixtures MSW validées par les schémas du contrat en CI.
- [ ] Aucun écran listé en D-24 visible en production sans route réelle.

---

**Ce qui est attendu de vous.**
1. Valider ou corriger les déductions du § 2.
2. Trancher les arbitrages, en priorité **A-01, A-02, A-03 et A-17**, puis X-05.
3. Autoriser l'application du § 4 dans `admin/docs/DECISIONS.md`.
4. Autoriser la rédaction de `docs/CONTRAT-API.md` à partir du § 5.
