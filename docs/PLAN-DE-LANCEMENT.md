# Plan de lancement du développement — Prince EDJA

> 30/10/2026 · actualise le plan de développement du 26/10 (`docs/SOURCES-DE-REFERENCE.md`) avec les
> arbitrages du 30/10 et `docs/CONTRAT-API.md` v1.0.0.

## 1. Point de départ

| Brique | État réel au 30/10 | Constat |
|---|---|---|
| Site public (`src/`) | React 19, Vite 8.2.2, données écrites dans `src/data/*`, déployé sur GitHub Pages | Fonctionnel ; lit encore ses données dans le code ; Vite 8.2.2 vulnérable (serveur de développement) |
| Admin (`admin/`) | Étape 0 livrée : pile figée, jetons, lint, tests, CI | Aucun écran métier ; étape 1 débloquée par le contrat |
| Back end (`prince-edja-api`) | Inexistant | Prompt prêt (`docs/PROMPT-BACKEND-PRINCE-EDJA.md`) ; doit lire le contrat en premier |
| Contrat | `docs/CONTRAT-API.md` v1.0.0 | Fait foi pour les deux équipes |

## 2. Trois chantiers en parallèle

Le contrat découple l'admin et le back end : chacun avance contre le contrat, et ils se rejoignent à
des **points d'intégration** fixés (§ 3).

### S — Site public (peut commencer immédiatement)

| Ordre | Tâche | Critère de sortie |
|---|---|---|
| S0 | Monter Vite en 8.2.4 (faille du serveur de développement) | `npm audit` sans alerte haute ; build vert |
| S1 | **Couche d'accès** (phase 1 du plan) : un hook de lecture par famille au-dessus de `src/data/*`, aux formes du contrat (variantes de bijou, `CibleInterne`, traductions) | Porte **G1** : plus aucun import de `@/data/*` hors de la couche ; build et tests verts |
| S2 | Brancher la couche sur `/public/api/v1` (phase 5 du plan), avec prérendu | Porte **G4** : la source HTML d'une page contient titre, description et contenu |

S1 est la tâche la plus rentable à court terme : elle réduit à quelques fichiers le basculement vers
l'API, au lieu des fichiers qui importent aujourd'hui `@/data/*`.

### A — Admin

| Étape du prompt admin | Lot du contrat | Peut démarrer | Critère de sortie |
|---|---|---|---|
| 1 · couche `api/`, schémas, mocks MSW, `peut()` | Lots 0 et 1 | **Immédiatement** | Schémas = contrat ; fixtures validées par les schémas ; tests de `peut()` sur les quatre rôles |
| 2 · coque, connexion, première connexion, erreurs | Lot 0 | Après 1 | Connexion des trois rôles sur MSW ; `MOT_DE_PASSE_A_CHANGER` ; 401 et 403 |
| 3 · composants transverses | — | Après 2 (en partie dès 1) | Page de démonstration ; tests ; StarterKit restreint à la liste blanche |
| 4 · gabarits, articles | Lot 1 | Après 3 | Éditeur : brouillon puis soumission ; admin : publication, suivi de reconstruction |
| 5 · médiathèque | Lot 1 | Après 3 | Envoi sans texte alternatif, puis publication bloquée ; suppression refusée avec usages |
| 6 · créateurs, bijoux, catégories, épisodes, projets, villes, destinations | Lot 2 | Après 4 | Variante par défaut ; prix « sur demande » ; RG-21 |
| 7 · distinctions, presse, archive, galerie, univers, jalons, offres, pages, études de cas, partenaires, tags | Lot 3 | Après 4 | Archive sans source non publiable |
| 8 · messages, demandes, abonnés, réglages | Lot 4 | Après 4 | Export CSV ; confirmation du manifeste |
| 9 · comptes, journal, publication, profil, tableau de bord | Lot 5 | Après 8 | Parcours super-admin |
| 10 · audit, documentation | — | Fin | Critères d'acceptation du prompt admin |

### B — Back end

| Étape du prompt back end | Lot du contrat | Peut démarrer | Critère de sortie |
|---|---|---|---|
| 0 · cadrage | — | **Immédiatement** | `docs/QUESTIONS.md` ouvert, reprenant les écarts E-01 à E-16 du contrat ; aucun écart nouveau non signalé |
| 1 · socle | — | Après 0 | Une commande lance l'API et la base ; la CI passe |
| 2 · base de données | Tous (schéma) | Après 1 | Modèle conforme au contrat (variante obligatoire, `actif` du créateur, messages typés, abonné avec prénom et pays, demande à plusieurs lignes) ; sécurité par ligne testée |
| 3 · accès | Lot 0 | Après 2 | Sessions, CSRF, `POST /auth/definir-mot-de-passe`, `peut()`, RG-16, RG-18 |
| 4 · éditorial | Lots 1 et 3 | Après 3 | RG-01 à RG-08 et RG-17 ; transitions du § 7.3 du contrat, `archive → brouillon` compris |
| 5 · médias | Lot 1 | Après 3 | Tests de la section 11 du prompt |
| 6 · boutique et créateurs | Lot 2 | Après 4 | RG-09, RG-10 (variante obligatoire), RG-11, RG-20, RG-21, RG-27 ; `SLUG_FIGE` |
| 7 · lecture publique | Annexe § 18 | Après 6 | Aucun brouillon, archivé, programmé ou prix non confirmé dans les lectures |
| 8 · audience et e-mails | Lot 4 | Après 3 | Contact, collaboration, newsletter, demandes ; RG-12 à RG-15 |
| 9 · publication | Lot 1 (suivi) | Après 4 | RG-05, RG-19 ; `GET /site/publications/:id` |
| 10 · multi-vendeurs verrouillé | § 17 | Après 6 | Tout répond `404` avec `multiVendeurs` faux |
| 11 · migration | — | Après 6 et 8 | Une variante par pièce ; aucun objet perdu sans explication |
| 12 · clôture | — | Fin | Section 18 du prompt back end livrée |

## 3. Points d'intégration

| Point | Quand | Ce qu'on vérifie, contre l'API réelle |
|---|---|---|
| **I-0** | Admin étape 2 et back end étape 3 terminées | Connexion, `GET /auth/moi`, CSRF, cookie entre `admin.` et `api.` (ou leurs équivalents locaux), 401 et 403 |
| **I-1 = G2** | Admin étapes 4 et 5, back end étapes 4, 5 et 9 | Un éditeur crée un brouillon avec image et traduction, un admin le publie, l'action est au journal, la reconstruction est suivie jusqu'à son état final |
| **I-2** | Admin étape 6, back end étape 6 | Bijou avec variantes ; prix confirmé par un admin ; créateur principal protégé |
| **I-3 = G3** | Admin étape 8, back end étapes 8 et 11 | Contenu migré et contrôlé ; un message de test arrive en base et par e-mail ; export CSV |
| **G4** | Site S2 | Pages prérendues |
| **G5** | Tout | Recette signée par le client (plan § 5) |

À chaque point, les parcours Playwright de l'admin tournent **aussi** contre l'API réelle. Un échec
est une anomalie de l'implémentation, jamais une raison de modifier le contrat en silence.

## 4. Ce qui peut commencer aujourd'hui

1. **Admin, étape 1** : couche `api/` et mocks, à partir du contrat v1.0.0 (lots 0 et 1 d'abord).
2. **Back end, étape 0** : cadrage sur le contrat, ouverture de `docs/QUESTIONS.md`.
3. **Site, S0 et S1** : correctif de Vite, puis couche d'accès.
4. **Client** : réunir les contenus et les réponses de la liste ci-dessous.

## 5. Ce que le client doit fournir, et pour quand

| Élément | Nécessaire avant | Bloque si absent |
|---|---|---|
| Langues actives : l'anglais pour les contenus ? (M-01) | Recette (G5) | Rien : défaut français seul |
| Durées de conservation validées (M-02) | Back end étape 8 | Rien : défauts paramétrables, mais non conformes tant que non validés |
| Domaine, hébergeur du site, mécanisme de reconstruction (M-06) | Point I-0 en préproduction ; back end étape 9 | Les tests de cookie inter-sous-domaines et la reconstruction réelle |
| Textes légaux | Mise en ligne | Pages légales en `noindex` |
| Prix, matières, créateurs, sources, chiffres datés, corps d'articles | Mise en ligne | Rien techniquement : les champs restent « à fournir » |
| Signature et manifeste confirmés | Mise en ligne | Rien : les valeurs actuelles restent |

## 6. Règles de conduite

- Aucun code ne précède la version du contrat qui le décrit (`docs/CONTRAT-API.md` § 0).
- Chaque étape se termine par un compte rendu : fait, testé (avec le résultat réel des commandes), non fait, questions.
- Les contenus manquants ne sont jamais inventés : ils restent vides et signalés « à fournir ».
