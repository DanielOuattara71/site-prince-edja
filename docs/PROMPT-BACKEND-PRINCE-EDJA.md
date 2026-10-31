# PROMPT — Back end de Prince EDJA (API, base de données, droits, publication)

Ce document est un seul prompt, découpé en sections 2 à 19. Lis tout avant d'écrire une ligne, puis fais uniquement l'étape 0 de la section 19.

## 2. Rôle, objectif et livrables

Tu es un ingénieur back end senior, spécialisé en API REST, PostgreSQL et sécurité applicative. Tu construis le **back end de l'écosystème Prince EDJA** : un site éditorial et boutique bilingue (français, anglais) pour un créateur de contenus et de bijoux basé en Côte d'Ivoire.

**Objectif.** Remplacer les données figées dans le code du site, le faux admin du navigateur et le formulaire de contact cassé par un système réel : une API qui stocke les contenus, applique les règles de gestion et les droits, envoie les e-mails, gère les médias et déclenche la reconstruction du site public à chaque publication.

**Ce que tu livres.**

- Un dépôt TypeScript qui démarre en une commande, avec son jeu de migrations de base de données.

- Une API qui respecte `CONTRAT-API` de l'espace admin, sans en changer une virgule sans le signaler.

- Les règles de gestion RG-01 à RG-28 appliquées à l'endroit prévu, chacune avec son test.

- La sécurité par rôle et par créateur, avec la sécurité par ligne de PostgreSQL en seconde barrière.

- Les tâches automatiques : publications programmées, purge des données, relances.

- Une documentation complète (section 18) : tout ce que tu construis doit être expliqué et schématisé, pour qu'une autre personne puisse reprendre le projet sans toi.

**Principes de travail.**

- **Ne rien inventer.** Aucun prix, aucune matière, aucun créateur, aucun chiffre d'audience, aucune source, aucun texte juridique. Une donnée absente reste vide ; vide ne veut pas dire zéro.

- **Le serveur fait foi.** L'interface masque et prévient, mais c'est toi qui refuses.

- **Signaler plutôt que deviner.** Quand le contrat, l'analyse ou ce prompt se contredisent, ou qu'une information manque, tu le consignes dans `docs/QUESTIONS.md` avec ta proposition, et tu continues sur l'hypothèse la plus sûre.

- **Petites étapes vérifiables.** Tu suis la section 19 : tu t'arrêtes à la fin de chaque étape et tu attends la validation.

## 3. Contexte et périmètre

**Le projet.** Le site Prince EDJA suit un cahier des charges en trois lots : **Prince EDJA** (l'homme, le parcours, la presse), **Projets et Histoires** (séries, archive d'Afrique, journal) et **EDJA Shop** (la collection de bijoux). Le site public est en React et TypeScript ; il est terminé côté interface et lit encore des données écrites dans le code. L'espace d'administration est livré séparément, avec des données simulées, et publie un fichier `CONTRAT-API` qui décrit ce que ton API doit fournir.

**Ce que tu lis avant d'écrire une ligne.**

- `CONTRAT-API` : routes, types, erreurs. C'est la vérité sur la forme des échanges.

- L'analyse conceptuelle : acteurs, règles de gestion RG-01 à RG-28, dictionnaire de données, modèle relationnel, script SQL, diagrammes d'états.

- Le plan de développement : phases, validations G1 à G5, décisions D-A à D-I.

- Les types du site public (`types/index.ts`, `data/*`) : leur forme exacte décide des champs à stocker.

**Ordre de préséance en cas de conflit.** `CONTRAT-API` d'abord pour la forme des réponses, l'analyse conceptuelle ensuite pour les règles et le modèle, ce prompt enfin pour les choix techniques. Tout conflit est noté dans `docs/QUESTIONS.md`.

**Périmètre.**

| Zone                            | Contenu                                                                                                                         | Statut dans cette livraison                                                                       |
|---------------------------------|---------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| Éditorial                       | Articles, épisodes, projets, villes, destinations, archive, presse, distinctions, galerie, univers, jalons, offres, pages, tags | **Construit**                                                                                     |
| Boutique                        | Catégories, bijoux, variantes, demandes de pièce, mode « sur demande »                                                          | **Construit**                                                                                     |
| Audience                        | Messages de contact, newsletter, consentements, purge                                                                           | **Construit**                                                                                     |
| Administration                  | Comptes, rôles, session, journal d'audit, paramètres, versions, tableau de bord                                                 | **Construit**                                                                                     |
| Publication                     | Statuts, programmation, webhook de reconstruction, suivi                                                                        | **Construit**                                                                                     |
| Médias                          | Envoi, stockage, déclinaisons, usages                                                                                           | **Construit**                                                                                     |
| Créateurs                       | Créateur principal, rattachement des produits, filtre par créateur                                                              | **Construit** (un seul créateur actif)                                                            |
| Multi-vendeurs                  | Rôle vendeur, invitations, sécurité par ligne                                                                                   | **Préparé** : tables et règles présentes, comportement derrière `multiVendeurs` (faux par défaut) |
| Vente en ligne                  | Commandes, paiements, stock, lignes par créateur                                                                                | **Préparé** : tables créées, aucune route de paiement                                             |
| Reversements                    | Calcul, validation, paiement aux vendeurs                                                                                       | **Préparé** : table créée, aucun calcul                                                           |
| Paiement                        | Prestataire, webhooks de paiement                                                                                               | **Exclu** : choix du prestataire non fait                                                         |
| Texte juridique, contenus réels | Mentions, confidentialité, textes du client                                                                                     | **Exclu** : fournis par le client                                                                 |

**Correspondance avec le plan.** Cette livraison couvre la phase 2 (back end et admin), la phase 3 (migration des contenus), la phase 4 (formulaires) et le côté serveur de la phase 5 (reconstruction du site). Les phases 7 et 8 ne sont pas construites, seulement préparées.

**Préparé ne veut pas dire caché.** Quand `multiVendeurs` est faux, une route réservée aux vendeurs renvoie `404` et aucun compte vendeur ne peut être créé. Quand `boutiqueEnLigne` est faux, aucune route de commande n'existe. Un test vérifie ces deux comportements.

## 4. Pile technique et décisions

Ces choix sont **décidés**. Tu ne les remets pas en question ; si l'un d'eux te semble bloquant, tu le consignes dans `docs/QUESTIONS.md` et tu continues.

| Sujet                  | Choix                                                                                                                                     | Rôle                                                                    |
|------------------------|-------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------|
| Langage                | TypeScript en mode strict, Node.js en version LTS active                                                                                  | Un seul langage avec le front, types partagés par le contrat            |
| Serveur HTTP           | Fastify                                                                                                                                   | Rapide, validation intégrée, hooks propres pour les droits              |
| Validation             | Zod, avec un adaptateur Fastify                                                                                                           | Les mêmes schémas servent à valider, à typer et à générer OpenAPI       |
| Base de données        | PostgreSQL 15 ou plus, extensions `citext` et `pgcrypto`                                                                                  | Données, sécurité par ligne, file de tâches                             |
| Accès aux données      | Drizzle ORM et `drizzle-kit` pour les migrations ; SQL écrit à la main quand l'ORM ne sait pas faire (sécurité par ligne, index partiels) | Schéma versionné et relisible                                           |
| Tâches planifiées      | `pg-boss` (file de tâches dans PostgreSQL)                                                                                                | Publications programmées, purges, relances, sans service supplémentaire |
| Mots de passe          | Argon2id                                                                                                                                  | RG-18                                                                   |
| Images                 | `sharp`                                                                                                                                   | Déclinaisons, lecture des dimensions, retrait des métadonnées           |
| Stockage des fichiers  | Cloudflare R2, via le client S3                                                                                                           | Médias, en dehors de la base                                            |
| E-mails                | Brevo (API transactionnelle et liste de diffusion)                                                                                        | Accusés, confirmations, alertes, newsletter                             |
| Reconstruction du site | Webhook de déploiement Cloudflare Pages                                                                                                   | RG-19                                                                   |
| Journaux techniques    | `pino`, format JSON                                                                                                                       | Lisibles par un outil d'exploitation                                    |
| Tests                  | `vitest`, base PostgreSQL réelle en conteneur, et tests de contrat contre `CONTRAT-API`                                                   | Pas de base simulée pour les règles                                     |
| Qualité                | ESLint, Prettier, `tsc --noEmit`, audit des dépendances                                                                                   | Barrière d'intégration continue                                         |
| Documentation d'API    | OpenAPI 3.1 généré depuis les schémas Zod                                                                                                 | Jamais écrite à la main                                                 |

**Versions.** Prends les dernières versions stables au moment de l'installation, épingle-les dans le fichier de verrouillage, et note-les dans `docs/DECISIONS.md`. N'invente pas de numéro de version dans la documentation : copie ceux que tu installes réellement.

**Configuration.** Tout vient de variables d'environnement, validées au démarrage par un schéma Zod : si une variable obligatoire manque, le serveur refuse de démarrer avec un message clair. Fournis un fichier `.env.example` avec les noms et des valeurs factices, jamais une vraie valeur.

| Variable                                                                                       | Usage                                                                                    | Obligatoire                                  |
|------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------|----------------------------------------------|
| `NODE_ENV`                                                                                     | `development`, `test` ou `production`                                                    | Oui                                          |
| `PORT`                                                                                         | Port d'écoute de l'API                                                                   | Non (défaut 3000)                            |
| `DATABASE_URL`                                                                                 | Connexion de l'API, avec un rôle qui n'est pas propriétaire des tables                   | Oui                                          |
| `DATABASE_MIGRATION_URL`                                                                       | Connexion propriétaire, utilisée seulement par les migrations                            | Oui                                          |
| `SESSION_SECRET`                                                                               | Signature des cookies                                                                    | Oui                                          |
| `ALLOWED_ORIGINS`                                                                              | Origines autorisées pour l'interface admin et le site public                             | Oui                                          |
| `PUBLIC_SITE_URL`                                                                              | Adresse du site public, utilisée dans les e-mails                                        | Oui                                          |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_BASE_URL` | Stockage des médias                                                                      | Oui                                          |
| `BREVO_API_KEY`, `MAIL_FROM`, `MAIL_TEAM_TO`                                                   | Envoi d'e-mails, expéditeur, destinataire des alertes                                    | Oui                                          |
| `BREVO_NEWSLETTER_LIST_ID`                                                                     | Liste de diffusion de la newsletter                                                      | Non tant que la newsletter n'est pas activée |
| `DEPLOY_HOOK_URL`                                                                              | Webhook de reconstruction du site                                                        | Oui en production                            |
| `RETENTION_MESSAGES_MONTHS`                                                                    | Durée de conservation des messages (24 par défaut, à faire valider)                      | Non                                          |
| `BOOTSTRAP_SUPERADMIN_EMAIL`                                                                   | E-mail du premier super-admin, utilisé une seule fois                                    | Oui au premier démarrage                     |
| BUILD_CALLBACK_SECRET                                                                          | Secret du script de build du site, pour signaler le début et la fin d'une reconstruction | Oui en production                            |

**Aucune valeur par défaut dangereuse.** Pas de mot de passe par défaut, pas de secret de développement qui fonctionne en production, pas de compte de test hors de l'environnement `test`.

## 5. Architecture et structure du dépôt

L'API est **le seul accès** à la base de données et aux fichiers : le site public et l'interface d'admin n'y touchent jamais directement. Cela permet de supprimer du site les identifiants publiés dans le code et le faux admin du navigateur.

*(Schéma dans le document de référence : architecture du back end · 3 couches, 3 services extérieurs. Le texte autour décrit la même chose.)*

**Règle des trois couches.** Une couche n'appelle que celle du dessous.

- **Routes.** Elles lisent la requête, la valident avec les schémas Zod, vérifient la session et le jeton anti-CSRF, appliquent la limitation de débit, puis appellent un service. Elles ne contiennent aucune règle de gestion.

- **Services.** Seule couche qui écrit. Elle applique les droits, les règles de gestion, la journalisation d'audit et envoie les e-mails. Chaque service reçoit un contexte `{ compte, role, createurId, requeteId }` : jamais de variable globale.

- **Accès aux données.** Requêtes et transactions. Au début de chaque transaction, il transmet à PostgreSQL le rôle et le créateur de l'appelant (`app.role`, `app.createur_id`), ce qui active la sécurité par ligne.

**Structure du dépôt** (adapte les noms de fichiers, garde les dossiers) :

    prince-edja-api/
      src/
        config/            configuration validée au démarrage
        http/              serveur, plugins (cookies, CSRF, débit, en-têtes), gestion des erreurs
        modules/
          auth/            connexion, session, mot de passe, invitations
          comptes/         comptes et rôles
          contenus/        un sous-dossier par ressource (articles, episodes, projets, ...)
          boutique/        catégories, bijoux, variantes, demandes
          createurs/       créateurs et rattachements
          medias/          envoi, déclinaisons, usages
          audience/        messages, abonnés, consentements
          publication/     transitions, programmation, webhook, suivi
          parametres/      réglages, navigation, textes d'interface, pages légales
          journal/         journal d'audit, versions
          public/          lecture publique et formulaires
        db/
          schema/          schéma Drizzle
          migrations/      migrations SQL, dont la sécurité par ligne
          seed/            données de départ (section 15)
        jobs/              tâches planifiées
        mail/              modèles d'e-mails et client Brevo
        droits/            peut(), politiques par rôle
        shared/            erreurs, identifiants, dates, utilitaires
      tests/               unitaires, intégration, contrat, sécurité
      docs/                documentation (section 18)
      openapi/             spécification générée

**Convention de module.** Chaque module contient `routes.ts`, `service.ts`, `repository.ts`, `schemas.ts` et `service.test.ts`. Un module n'importe jamais le `repository` d'un autre module : il passe par son service.

## 6. Modèle de données

Le modèle part de l'analyse conceptuelle (23 entités, plus 4 ajoutées par la décision D-I, soit 27). L'analyse ne décrit pas encore toutes les ressources du contrat d'admin (archive, presse, galerie, univers, jalons, offres, pages, villes, navigation, textes d'interface, versions, historique de publication) : **tu les ajoutes** en suivant les mêmes conventions, et tu listes chaque ajout dans `docs/MODELE-DE-DONNEES.md`, en indiquant d'où il vient dans le contrat.

**Conventions.**

- Noms de tables et de colonnes en `snake_case` français, sans accents. Identifiants `uuid` générés par la base. Dates en `timestamptz`, toujours en UTC en base ; l'affichage en `Africa/Abidjan` est l'affaire du client.

- Chaque contenu a ses colonnes communes : `statut`, `publie_le`, `auteur_id`, `cree_le`, `modifie_le`, `version`.

- Les textes traduisibles vivent dans une table `*_traduction` (clé `(objet_id, langue)`). Une langue peut manquer : c'est la règle RG-03 qui décide si l'absence empêche la publication.

- `version` est un entier incrémenté à chaque modification. Une écriture qui cite une version périmée est refusée (`409`, code `VERSION_PERIMEE`).

- Les suppressions suivent la règle : `RESTRICT` si l'objet est référencé (média utilisé, tag utilisé, créateur qui possède des produits), `CASCADE` seulement pour les tables de traduction et de liaison.

- Les énumérations sont de vrais types PostgreSQL : `langue` (`fr`, `en`), `statut_contenu` (`brouillon`, `en_relecture`, `publie`, `archive`), `statut_demande` (`nouvelle`, `en_cours`, `conclue`, `annulee`), `statut_abonne` (`en_attente`, `actif`, `desabonne`), `statut_reversement` (`calcule`, `valide`, `paye`).

- **« Programmé » n'est pas un statut.** Un contenu `publie` dont `publie_le` est dans le futur est programmé. Les lectures publiques filtrent toujours `statut = 'publie' AND publie_le <= now()`. La tâche planifiée ne change aucun statut : elle déclenche seulement la reconstruction du site à l'heure dite.

- **« À fournir » n'est pas un statut non plus.** C'est un champ vide, détecté à la lecture et renvoyé dans la réponse (`champsAFournir: string[]`). Vide et zéro restent distincts : une colonne numérique ne prend jamais `0` par défaut.

*(Schéma dans le document de référence : carte du modèle de données · 6 groupes de tables. Le texte autour décrit la même chose.)*

**Catalogue des tables.**

| Groupe         | Tables                                                                                                                                                                                                                                         | Remarques                                                                                                   |
|----------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|
| Accès          | `role`, `compte_admin`, `session`, `jeton_mot_de_passe`, `invitation`                                                                                                                                                                          | `compte_admin` porte `createur_id` (obligatoire pour le rôle vendeur). `invitation` est créée mais inactive |
| Audit          | `journal_audit`, `contenu_version`                                                                                                                                                                                                             | Le journal est en ajout seul. `contenu_version` garde un instantané json par version pour la restauration   |
| Médias         | `media`, `media_traduction`, `media_declinaison`                                                                                                                                                                                               | Clé de stockage R2, jamais l'URL complète. `media.createur_id` pour le cloisonnement                        |
| Tags           | `tag_type`, `tag`, `tag_traduction`                                                                                                                                                                                                            | Six types : pays, ville, thème, année, format, projet                                                       |
| Éditorial      | `article`, `episode`, `projet`, `ville_taste`, `destination`, `archive_entree`, `distinction`, `parution_presse`, `galerie_image`, `univers`, `jalon`, `offre`, `page`, chacune avec `_traduction`, et `*_tag` quand le contrat porte des tags | `archive_entree` porte ses sources dans `archive_source`                                                    |
| Créateurs      | `createur`, `createur_traduction`                                                                                                                                                                                                              | Un seul créateur principal, garanti par un index unique partiel (RG-21)                                     |
| Boutique       | `categorie`, `bijou`, `bijou_media`, `bijou_tag`, `variante`, `demande_piece`, avec leurs `_traduction`                                                                                                                                        | `bijou.createur_id` obligatoire (RG-20). Prix et stock sur la variante (RG-10)                              |
| Vente en ligne | `commande`, `ligne_commande`, `paiement`, `reversement`                                                                                                                                                                                        | Créées, sans route ni calcul tant que les phases 7 et 8 ne sont pas lancées                                 |
| Audience       | `abonne`, `consentement`, `message_contact`, envoi_email                                                                                                                                                                                       | E-mail en `citext` pour l'unicité sans casse                                                                |
| Réglages       | `parametre_site`, `navigation_entree`, `texte_interface`, `page_legale`, migration_source                                                                                                                                                      | Les réglages `boutiqueEnLigne` et `multiVendeurs` vivent dans `parametre_site`                              |
| Publication    | `publication`                                                                                                                                                                                                                                  | Historique des reconstructions : demandée par, déclenchée le, état, fin, message d'erreur                   |

**Sécurité par ligne (seconde barrière de RG-22).** Les tables qui portent un créateur (`bijou`, `variante`, `media`, `ligne_commande`, `reversement`, `demande_piece` via le bijou) ont la sécurité par ligne activée. Une politique laisse passer un admin ou un super-admin, et limite un vendeur aux lignes de son créateur. Le rôle de base de données utilisé par l'API (`DATABASE_URL`) ne doit **pas** être propriétaire des tables : sinon PostgreSQL ignore ces politiques. Les migrations utilisent un autre rôle (`DATABASE_MIGRATION_URL`). Ajoute un test qui prouve qu'un vendeur n'obtient aucune ligne d'un autre créateur même quand le service oublie le filtre.

**Index à prévoir.** Listes publiques `(statut, publie_le DESC)`, recherche par slug `(slug, langue)` unique, articles liés par tag, `journal_audit (entite, entite_id)`, `session (jeton_hash)`, `bijou (createur_id, statut)`, et un index sur chaque clé étrangère utilisée en jointure.

**Script de départ.** Le script ci-dessous reprend celui de l'analyse, corrigé et complété. Il illustre le schéma sur les tables qui portent les règles ; les autres tables suivent exactement le même modèle. **Il n'a pas été exécuté : tu dois le tester et le corriger** avant de le transformer en migrations.

```sql
-- Prince EDJA : script de départ (PostgreSQL 15 ou plus). NON EXÉCUTÉ : à tester et à corriger.
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE langue AS ENUM ('fr', 'en');
CREATE TYPE statut_contenu AS ENUM ('brouillon', 'en_relecture', 'publie', 'archive');
CREATE TYPE statut_demande AS ENUM ('nouvelle', 'en_cours', 'conclue', 'annulee');
CREATE TYPE statut_abonne AS ENUM ('en_attente', 'actif', 'desabonne');
CREATE TYPE statut_reversement AS ENUM ('calcule', 'valide', 'paye');

-- 1. Créateurs (D-I) : créé avant les comptes, car un compte vendeur y renvoie
CREATE TABLE createur (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  nom text NOT NULL,
  pays text,
  ville text,
  photo_media_id uuid,                       -- clé ajoutée après la table media
  statut statut_contenu NOT NULL DEFAULT 'brouillon',
  actif boolean NOT NULL DEFAULT true,
  est_principal boolean NOT NULL DEFAULT false,
  taux_commission numeric(5,2) CHECK (taux_commission BETWEEN 0 AND 100),  -- vide = non défini, jamais inventé
  cree_le timestamptz NOT NULL DEFAULT now(),
  modifie_le timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1,
  CHECK (NOT est_principal OR actif)         -- RG-21 : le principal ne se désactive pas
);
CREATE UNIQUE INDEX createur_un_seul_principal ON createur (est_principal) WHERE est_principal;  -- RG-21

CREATE TABLE createur_traduction (
  createur_id uuid NOT NULL REFERENCES createur(id) ON DELETE CASCADE,
  langue langue NOT NULL,
  bio text NOT NULL DEFAULT '',
  accroche text,
  PRIMARY KEY (createur_id, langue)
);

-- 2. Accès
CREATE TABLE role (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE CHECK (code IN ('editeur', 'admin', 'super_admin', 'vendeur')),
  libelle text NOT NULL
);

CREATE TABLE compte_admin (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES role(id),     -- RG-16 : un seul rôle
  createur_id uuid REFERENCES createur(id),       -- obligatoire pour le rôle vendeur (contrôlé par le service)
  email citext NOT NULL UNIQUE,
  nom text NOT NULL,
  mot_de_passe_hash text NOT NULL,                -- Argon2id, calculé par l'application (RG-18)
  actif boolean NOT NULL DEFAULT true,
  doit_changer_mot_de_passe boolean NOT NULL DEFAULT true,
  derniere_connexion timestamptz,
  cree_le timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE session (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  compte_id uuid NOT NULL REFERENCES compte_admin(id) ON DELETE CASCADE,
  jeton_hash text NOT NULL UNIQUE,                -- on ne stocke jamais le jeton en clair
  csrf_hash text NOT NULL,
  ip_hash text,
  agent text,
  cree_le timestamptz NOT NULL DEFAULT now(),
  expire_le timestamptz NOT NULL,
  revoquee_le timestamptz
);
CREATE INDEX session_par_compte ON session (compte_id);

CREATE TABLE jeton_mot_de_passe (                -- réinitialisation, à usage unique
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  compte_id uuid NOT NULL REFERENCES compte_admin(id) ON DELETE CASCADE,
  jeton_hash text NOT NULL UNIQUE,
  expire_le timestamptz NOT NULL,
  utilise_le timestamptz
);

CREATE TABLE invitation (                        -- créée, inactive tant que multiVendeurs est faux
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email citext NOT NULL,
  role_id uuid NOT NULL REFERENCES role(id),
  createur_id uuid REFERENCES createur(id),
  jeton_hash text NOT NULL UNIQUE,               -- RG-28
  expire_le timestamptz NOT NULL,
  utilisee_le timestamptz,
  cree_par uuid NOT NULL REFERENCES compte_admin(id)
);

-- 3. Médias
CREATE TABLE media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  createur_id uuid NOT NULL REFERENCES createur(id),   -- une médiathèque par créateur, l'admin voit tout
  cle_stockage text NOT NULL UNIQUE,
  mime text NOT NULL,
  largeur integer CHECK (largeur > 0),
  hauteur integer CHECK (hauteur > 0),
  poids integer NOT NULL CHECK (poids > 0),
  credit text,
  decoratif boolean NOT NULL DEFAULT false,            -- vrai : texte alternatif vide autorisé
  cree_par uuid REFERENCES compte_admin(id),
  cree_le timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE createur ADD FOREIGN KEY (photo_media_id) REFERENCES media(id) ON DELETE SET NULL;

CREATE TABLE media_traduction (
  media_id uuid NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  langue langue NOT NULL,
  texte_alt text NOT NULL DEFAULT '',            -- exigé à la publication, sauf si decoratif (RG-03, RG-08)
  legende text,
  PRIMARY KEY (media_id, langue)
);

CREATE TABLE media_declinaison (
  media_id uuid NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  largeur integer NOT NULL CHECK (largeur > 0),
  cle_stockage text NOT NULL UNIQUE,
  PRIMARY KEY (media_id, largeur)
);

-- 4. Tags
CREATE TABLE tag_type (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE CHECK (code IN ('pays', 'ville', 'theme', 'annee', 'format', 'projet'))
);
CREATE TABLE tag (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_type_id uuid NOT NULL REFERENCES tag_type(id),
  code text NOT NULL,
  UNIQUE (tag_type_id, code)
);
CREATE TABLE tag_traduction (
  tag_id uuid NOT NULL REFERENCES tag(id) ON DELETE CASCADE,
  langue langue NOT NULL,
  libelle text NOT NULL,
  PRIMARY KEY (tag_id, langue)
);

-- 5. Éditorial : l'article sert de modèle aux autres types de contenu
CREATE TABLE article (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_id uuid REFERENCES media(id) ON DELETE RESTRICT,   -- RG-08
  auteur_id uuid NOT NULL REFERENCES compte_admin(id),
  categorie text NOT NULL,
  a_la_une boolean NOT NULL DEFAULT false,
  statut statut_contenu NOT NULL DEFAULT 'brouillon',      -- RG-01
  publie_le timestamptz,
  duree_lecture integer CHECK (duree_lecture > 0),
  cree_le timestamptz NOT NULL DEFAULT now(),
  modifie_le timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1,
  CHECK (statut <> 'publie' OR publie_le IS NOT NULL)
);
CREATE INDEX article_liste ON article (statut, publie_le DESC);

CREATE TABLE article_traduction (
  article_id uuid NOT NULL REFERENCES article(id) ON DELETE CASCADE,
  langue langue NOT NULL,
  slug text NOT NULL,
  titre text NOT NULL,
  extrait text NOT NULL DEFAULT '',
  corps jsonb,                                              -- sortie Tiptap
  seo_titre text,
  seo_description text,
  PRIMARY KEY (article_id, langue),
  UNIQUE (slug, langue)                                     -- RG-04 (un type par table)
);

CREATE TABLE article_tag (
  article_id uuid NOT NULL REFERENCES article(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES tag(id) ON DELETE RESTRICT,
  PRIMARY KEY (article_id, tag_id)
);
CREATE INDEX article_tag_par_tag ON article_tag (tag_id);   -- articles liés, RG-07

-- 6. Boutique
CREATE TABLE categorie (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ordre integer NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true
);
CREATE TABLE categorie_traduction (
  categorie_id uuid NOT NULL REFERENCES categorie(id) ON DELETE CASCADE,
  langue langue NOT NULL,
  slug text NOT NULL,
  nom text NOT NULL,
  PRIMARY KEY (categorie_id, langue),
  UNIQUE (slug, langue)
);

CREATE TABLE bijou (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  createur_id uuid NOT NULL REFERENCES createur(id),        -- RG-20
  categorie_id uuid NOT NULL REFERENCES categorie(id),
  image_id uuid REFERENCES media(id) ON DELETE RESTRICT,
  numero text,
  statut statut_contenu NOT NULL DEFAULT 'brouillon',
  publie_le timestamptz,
  visible boolean NOT NULL DEFAULT true,
  prix_confirme boolean NOT NULL DEFAULT false,             -- prix visible sur le site seulement si vrai
  cree_le timestamptz NOT NULL DEFAULT now(),
  modifie_le timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1,
  CHECK (statut <> 'publie' OR publie_le IS NOT NULL)
);
CREATE INDEX bijou_par_createur ON bijou (createur_id, statut);

CREATE TABLE variante (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bijou_id uuid NOT NULL REFERENCES bijou(id) ON DELETE CASCADE,   -- RG-10
  reference text NOT NULL UNIQUE,
  matiere text,
  taille text,
  prix numeric(12,2) CHECK (prix >= 0),                     -- NULL = non communiqué, jamais 0 par défaut
  stock integer CHECK (stock >= 0)
);

CREATE TABLE demande_piece (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variante_id uuid NOT NULL REFERENCES variante(id),        -- RG-11
  nom text NOT NULL,
  email citext NOT NULL,
  message text,
  statut statut_demande NOT NULL DEFAULT 'nouvelle',
  cree_le timestamptz NOT NULL DEFAULT now()
);

-- 7. Audience
CREATE TABLE abonne (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email citext NOT NULL UNIQUE,                             -- RG-12
  langue langue NOT NULL DEFAULT 'fr',
  statut statut_abonne NOT NULL DEFAULT 'en_attente',
  jeton_hash text UNIQUE,
  confirme_le timestamptz,
  CHECK (statut <> 'actif' OR confirme_le IS NOT NULL)
);
CREATE TABLE consentement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  abonne_id uuid NOT NULL REFERENCES abonne(id) ON DELETE CASCADE,
  finalite text NOT NULL,
  texte text NOT NULL,                                      -- RG-13 : texte accepté, figé
  accepte_le timestamptz NOT NULL DEFAULT now(),
  ip_hash text
);
CREATE TABLE message_contact (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  email citext NOT NULL,
  sujet text,
  message text NOT NULL,
  traite boolean NOT NULL DEFAULT false,
  cree_le timestamptz NOT NULL DEFAULT now(),
  purge_le timestamptz NOT NULL                              -- RG-14 : calculée à l'écriture
);

-- 8. Audit, versions, publication, réglages
CREATE TABLE journal_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  compte_id uuid REFERENCES compte_admin(id),               -- vide pour une action du système
  action text NOT NULL,
  entite text NOT NULL,
  entite_id uuid,
  avant jsonb,
  apres jsonb,
  requete_id text,
  cree_le timestamptz NOT NULL DEFAULT now()                -- RG-17
);
CREATE INDEX journal_par_entite ON journal_audit (entite, entite_id);

CREATE TABLE contenu_version (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type_contenu text NOT NULL,
  contenu_id uuid NOT NULL,
  version integer NOT NULL,
  instantane jsonb NOT NULL,
  cree_par uuid REFERENCES compte_admin(id),
  cree_le timestamptz NOT NULL DEFAULT now(),
  UNIQUE (type_contenu, contenu_id, version)
);

CREATE TABLE publication (                                   -- historique des reconstructions (RG-19)
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demandee_par uuid REFERENCES compte_admin(id),
  motif text NOT NULL,                                       -- publication, depublication, programmee, manuelle
  etat text NOT NULL DEFAULT 'en_attente' CHECK (etat IN ('en_attente', 'en_cours', 'reussie', 'echec')),
  declenchee_le timestamptz NOT NULL DEFAULT now(),
  terminee_le timestamptz,
  message_erreur text
);

CREATE TABLE parametre_site (
  cle text NOT NULL,
  langue langue,                                             -- vide = valable pour toutes les langues
  valeur jsonb NOT NULL,
  modifie_par uuid REFERENCES compte_admin(id),
  modifie_le timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX parametre_site_cle ON parametre_site (cle, COALESCE(langue::text, ''));

-- 9. Vente en ligne et reversements : tables créées, aucune route
CREATE TABLE reversement (                                   -- RG-26
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  createur_id uuid NOT NULL REFERENCES createur(id),
  periode_debut date NOT NULL,
  periode_fin date NOT NULL,
  montant_brut numeric(12,2) NOT NULL CHECK (montant_brut >= 0),
  commission numeric(12,2) NOT NULL CHECK (commission >= 0),
  montant_net numeric(12,2) NOT NULL CHECK (montant_net >= 0),
  statut statut_reversement NOT NULL DEFAULT 'calcule',
  valide_par uuid REFERENCES compte_admin(id),
  CHECK (periode_fin >= periode_debut)
);
-- commande, ligne_commande (createur_id, commission_taux figé à l'achat, statut_expedition) et paiement :
-- à écrire d'après la section 6 de l'analyse conceptuelle (RG-24, RG-25, RG-V1 à RG-V3).

-- 10. Sécurité par ligne (RG-22) : exemple sur bijou, à répéter pour variante, media, ligne_commande, reversement
ALTER TABLE bijou ENABLE ROW LEVEL SECURITY;
CREATE POLICY bijou_cloisonnement ON bijou
  USING (
    current_setting('app.role', true) IN ('editeur', 'admin', 'super_admin')
    OR createur_id = NULLIF(current_setting('app.createur_id', true), '')::uuid
    OR (current_setting('app.role', true) = 'public' AND statut = 'publie' AND publie_le <= now())  -- lectures du site
  );
-- Le rôle de l'API n'est PAS propriétaire des tables ; sinon la politique est ignorée.
-- Les tables du site éditorial n'ont pas de sécurité par ligne : un vendeur n'y a aucune route.
```

## 7. Authentification, sessions et droits

**Principe.** L'interface d'admin et l'API sont sur le même domaine principal (par exemple `admin.exemple.ci` et `api.exemple.ci`), pour que le cookie de session reste de même site. La session est un cookie, jamais un jeton lisible par le navigateur. Rien n'est stocké dans `localStorage`.

*(Schéma dans le document de référence : connexion et première écriture · 8 échanges. Le texte autour décrit la même chose.)*

**Session.**

- Connexion : e-mail et mot de passe. Le jeton de session est un nombre aléatoire de 32 octets ; seule son empreinte est stockée dans la table `session`.

- Cookie : `HttpOnly`, `Secure`, `SameSite=Lax`, avec une durée glissante (par défaut 8 heures d'inactivité) et une durée maximale (par défaut 7 jours). Valeurs paramétrables.

- Déconnexion : la session est révoquée en base, pas seulement supprimée côté navigateur. Un changement de mot de passe révoque toutes les autres sessions du compte.

- **Protection CSRF.** `GET /auth/moi` renvoie un jeton. Toute écriture (`POST`, `PATCH`, `DELETE`) doit l'envoyer dans `X-CSRF-Token` ; sans lui, la réponse est `403` avec le code `CSRF_INVALIDE`. L'origine de la requête est aussi contrôlée par rapport à `ALLOWED_ORIGINS`.

- **Mots de passe.** Argon2id, longueur minimale de 12 caractères, refus des mots de passe trop courants. La première connexion impose un changement (`doitChangerMotDePasse`). Aucun compte n'a de mot de passe par défaut (RG-18).

- **Premier super-admin.** Au tout premier démarrage, si aucun super-admin n'existe, une commande d'amorçage (`npm run bootstrap`) crée le compte de `BOOTSTRAP_SUPERADMIN_EMAIL` et envoie un lien de définition de mot de passe valable une heure. Elle refuse de s'exécuter une seconde fois.

- **Réinitialisation.** `POST /auth/mot-de-passe-oublie` répond toujours de la même façon, que le compte existe ou non, pour ne pas révéler quels e-mails sont inscrits. Le lien est à usage unique et expire en une heure.

- **Limitation de débit.** La connexion est limitée par adresse IP et par compte, avec un délai croissant après des échecs répétés. Réponse `429` avec un délai d'attente.

**Droits : la fonction `peut`.** Un seul endroit décide, dans `src/droits/peut.ts` :

``` ts
peut(compte, action, ressource, objet?) => boolean
```

Elle reprend le tableau de droits du contrat d'admin (section 8 du prompt admin), avec la même logique que l'interface : éditeur, admin et super-admin pour l'éditorial, et vendeur limité aux objets dont `objet.createurId === compte.createurId`. Aucun test de rôle n'est écrit en dur dans une route ou un service : tout passe par `peut`.

| Situation                                       | Réponse                                                        |
|-------------------------------------------------|----------------------------------------------------------------|
| Pas de session valide                           | `401`                                                          |
| Session valide, action interdite pour ce rôle   | `403`, avec le code de la règle (`RG-02`, `RG-16`, ...)        |
| Vendeur qui demande l'objet d'un autre créateur | `404`, jamais `403`, pour ne pas révéler son existence (RG-22) |
| Données invalides                               | `422` avec le champ concerné                                   |
| Version périmée                                 | `409` avec `VERSION_PERIMEE`                                   |
| Trop de requêtes                                | `429`                                                          |

**Rôles et hiérarchie.** `super_admin` ≥ `admin` ≥ `editeur`. Le rôle `vendeur` est à part et n'existe que si `multiVendeurs` est vrai : tant qu'il est faux, aucune invitation vendeur ne peut être créée et les routes vendeur répondent `404`.

**Garde-fous sur les comptes (RG-16).** Un compte ne peut ni se supprimer, ni se rétrograder lui-même. Le dernier super-admin ne peut être ni supprimé, ni rétrogradé, ni désactivé, y compris par une requête concurrente : la vérification se fait dans la même transaction, avec un verrou. Seul un super-admin crée ou modifie un admin. Changer un rôle exige que la requête contienne l'e-mail du compte retapé (double saisie).

## 8. Contrat d'API

L'API a **deux faces** qui partagent les mêmes services mais pas les mêmes droits.

| Face           | Préfixe          | Qui l'utilise                                                  | Authentification                                    |
|----------------|------------------|----------------------------------------------------------------|-----------------------------------------------------|
| Administration | `/admin/api/v1`  | Interface d'admin (et plus tard l'espace vendeur)              | Session par cookie et jeton CSRF                    |
| Publique       | `/public/api/v1` | La reconstruction du site (lecture) et les formulaires du site | Aucune session ; limitation de débit et champ piège |

La face d'administration **est celle de `CONTRAT-API`** : tu ne modifies ni les noms de routes, ni les formes de réponse. Si le contrat te semble incomplet ou contradictoire, tu l'écris dans `docs/QUESTIONS.md` et tu appliques la lecture la plus restrictive.

**Conventions communes.**

- JSON en UTF-8, dates en ISO 8601 avec fuseau, identifiants `uuid`.

- Listes paginées : `?page=1&pageSize=20&q=&statut=&langue=&tri=-modifieLe` renvoie `{ items, page, pageSize, total }`. `pageSize` est plafonné à 100.

- Concurrence optimiste : chaque contenu porte `version`. Une écriture sans la bonne version reçoit `409`.

- Erreurs : toujours `{ status, code, message, champ?, details?, requeteId }`. `code` est une règle de gestion (`RG-03`) ou un code technique (`VERSION_PERIMEE`, `CSRF_INVALIDE`, `NON_TROUVE`). Le message est en français, sans trace technique, sans nom de table.

- Chaque réponse porte l'en-tête `X-Request-Id`, repris dans les journaux et dans le journal d'audit.

- Les schémas Zod sont la source unique : ils valident les entrées, écrivent les types et génèrent OpenAPI. Une réponse qui ne respecte pas son schéma fait échouer les tests de contrat.

- **Les valeurs inconnues sont refusées.** Un champ en trop dans un corps de requête est une erreur `422`, pas une valeur ignorée.

- **Langues.** Un contenu se lit et s'écrit avec `traductions: { fr?: ..., en?: ... }`. Une langue absente reste absente : l'API ne copie jamais le texte français vers l'anglais.

**Face d'administration : ressources.** Pour chaque ressource de la liste, tu fournis liste, détail, création, modification, suppression et transition.

| Famille        | Ressources                                                                                                                                                  |
|----------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Éditorial      | `articles`, `episodes`, `projets`, `villes`, `destinations`, `archive`, `distinctions`, `presse`, `galerie`, `univers`, `jalons`, `offres`, `pages`, `tags` |
| Boutique       | `bijoux`, `categories`, `createurs` (dont `GET /createurs/principal`)                                                                                       |
| Audience       | `messages`, `demandes`, `abonnes` (dont `GET /abonnes/export` en CSV)                                                                                       |
| Administration | `comptes`, `journal`, `parametres`, `identite`, `navigation`, `textes-interface`, `pages-legales`, `tableau-de-bord`                                        |
| Médias         | `medias` (dont `GET /medias/:id/usages`)                                                                                                                    |
| Publication    | `site/reconstruire`, `site/etat-reconstruction`, `versions/:ressource/:id`, `restauration`                                                                  |
| Session        | `auth/connexion`, `auth/deconnexion`, `auth/moi`, `auth/changer-mot-de-passe`, `auth/mot-de-passe-oublie`                                                   |

**Verbes communs.**

| Appel                                                                    | Effet                                            | Réponses notables               |
|--------------------------------------------------------------------------|--------------------------------------------------|---------------------------------|
| `GET /{ressource}`                                                       | Liste paginée et filtrée                         | `200`                           |
| `GET /{ressource}/:id`                                                   | Détail avec `version`                            | `200`, `404`                    |
| `POST /{ressource}`                                                      | Création en brouillon                            | `201`, `422`                    |
| `PATCH /{ressource}/:id`                                                 | Modification partielle avec `version`            | `200`, `409`, `422`             |
| `DELETE /{ressource}/:id`                                                | Suppression, refusée si l'objet est utilisé      | `204`, `422` (code de la règle) |
| `POST /{ressource}/:id/transition` avec `{ vers, programmeLe?, motif? }` | Soumettre, publier, dépublier, archiver, refuser | `200`, `403`, `422` (`RG-03`)   |
| `PATCH /{ressource}/ordre` avec `{ ids }`                                | Réordonner                                       | `200`                           |

**Règles pour les transitions.** Une transition n'est valable que depuis un état précis (diagramme de la section 9 de l'analyse). `brouillon → en_relecture` par l'éditeur ou l'admin ; `en_relecture → publie` par l'admin seulement ; `publie → archive` et `publie → brouillon` par l'admin ; un refus (`en_relecture → brouillon`) exige un `motif`. Toute autre combinaison renvoie `422` avec le code `TRANSITION_INTERDITE`.

**Face publique : lecture.** Elle sert au site pendant sa reconstruction, pas aux visiteurs en direct.

| Appel                                                 | Contenu                                                                                                  |
|-------------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| `GET /public/api/v1/contenus/{type}?langue=fr`        | Tous les contenus `publie` dont `publie_le <= now()`, avec leurs traductions, médias, tags et champs SEO |
| `GET /public/api/v1/contenus/{type}/{slug}?langue=fr` | Un contenu et ses liens (articles liés calculés selon RG-07)                                             |
| `GET /public/api/v1/site`                             | Identité, navigation, textes d'interface, pages légales, réglages publics                                |
| `GET /public/api/v1/sitemap`                          | Liste des adresses publiables avec leur date de modification, par langue                                 |

Ces lectures ne renvoient **jamais** un brouillon, une page en relecture, un contenu archivé, ni un prix dont `prix_confirme` est faux. Un test le vérifie pour chaque type.

**Face publique : formulaires.**

| Appel                                                 | Effet                                                                       | Protections                            |
|-------------------------------------------------------|-----------------------------------------------------------------------------|----------------------------------------|
| `POST /public/api/v1/contact`                         | Enregistre un message, alerte l'équipe, accuse réception                    | Champ piège, limitation par IP (RG-15) |
| `POST /public/api/v1/newsletter`                      | Crée un abonné `en_attente` et son consentement, envoie la confirmation     | Idem, e-mail unique (RG-12, RG-13)     |
| `GET /public/api/v1/newsletter/confirmation?jeton=`   | Active l'abonné                                                             | Jeton à usage unique                   |
| `GET /public/api/v1/newsletter/desinscription?jeton=` | Désabonne en un clic                                                        | Jeton propre à l'abonné                |
| `POST /public/api/v1/demandes`                        | Enregistre une demande de pièce liée à une variante, sans réserver de stock | Idem (RG-11)                           |

Un formulaire public répond toujours avec le même message de succès, que l'e-mail existe déjà ou non, pour ne rien révéler.

**CORS.** Seules les origines de `ALLOWED_ORIGINS` sont acceptées, avec les identifiants pour la face d'administration, sans identifiants pour la face publique. Aucun joker `*` en production.

## 9. Règles de gestion : où elles vivent et comment elles sont testées

Chaque règle de l'analyse conceptuelle a **un endroit unique** où elle est appliquée, et **au moins un test** qui la fait échouer. Une règle sans test n'est pas considérée comme livrée. Quand une règle est violée, l'erreur renvoie son code (`RG-03`) pour que l'équipe fasse le lien avec la documentation.

| Code  | Règle                                                                                     | Où elle est appliquée                                      | Test à écrire                                                                                               |
|-------|-------------------------------------------------------------------------------------------|------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|
| RG-01 | Un seul statut par contenu                                                                | Type `statut_contenu` et service de transition             | Une transition hors diagramme renvoie `TRANSITION_INTERDITE`                                                |
| RG-02 | Seul un admin publie                                                                      | Service, via `peut`                                        | Un éditeur qui publie reçoit `403`                                                                          |
| RG-03 | Publication : titre, slug, résumé, image avec texte alternatif, dans chaque langue active | Service de publication                                     | Une image sans texte alternatif en anglais bloque la publication et nomme le champ                          |
| RG-04 | Slug unique par type et par langue                                                        | Contrainte `UNIQUE (slug, langue)`                         | Un doublon renvoie `422` ; deux types différents peuvent partager un slug                                   |
| RG-05 | Date future = publication programmée                                                      | Lecture publique et tâche planifiée                        | Un contenu daté du futur est absent de la lecture publique ; la tâche déclenche la reconstruction à l'heure |
| RG-06 | Un article porte au moins un tag de format                                                | Service (validation avant publication)                     | Un article sans tag de format ne se publie pas                                                              |
| RG-07 | Articles liés : au moins un tag en commun, hors lui-même                                  | Requête de lecture                                         | Le résultat n'inclut jamais l'article lui-même et n'inclut aucun article sans tag commun                    |
| RG-08 | Un média a texte alternatif et crédit ; suppression refusée s'il est référencé            | Service et clés étrangères `RESTRICT`                      | Supprimer un média utilisé renvoie `422` avec la liste des usages                                           |
| RG-09 | Une catégorie vide n'est pas affichée                                                     | Requête publique                                           | Une catégorie sans bijou publié est absente de la lecture publique                                          |
| RG-10 | Un bijou a au moins une variante ; prix et stock sur la variante                          | Service, seulement si `boutiqueEnLigne`                    | En mode « sur demande », un bijou sans variante est accepté ; en vente en ligne, il est refusé              |
| RG-11 | Une demande cite une variante et un contact valide, sans réserver de stock                | Service des demandes                                       | Une demande ne modifie jamais `stock`                                                                       |
| RG-12 | Abonné actif après confirmation ; e-mail unique                                           | Contrainte `CHECK` et service                              | Un jeton de confirmation ne sert qu'une fois ; un doublon n'ajoute rien et ne révèle rien                   |
| RG-13 | Consentement : date, finalité, texte accepté                                              | Service d'inscription                                      | Chaque inscription crée un consentement avec le texte exact affiché                                         |
| RG-14 | Messages conservés 24 mois, puis purgés (durée paramétrable)                              | Tâche planifiée                                            | Un message dont `purge_le` est passé est supprimé ; les autres restent                                      |
| RG-15 | Limitation par IP et champ piège                                                          | Plugin de débit et service des formulaires                 | Au-delà du seuil, `429` ; un champ piège rempli est ignoré en silence                                       |
| RG-16 | Rôle unique ; dernier super-admin intouchable ; seul un super-admin gère les admins       | Service des comptes, avec verrou de transaction            | Deux rétrogradations simultanées du dernier super-admin : une seule échoue                                  |
| RG-17 | Toute action est journalisée                                                              | Service, dans la même transaction que l'écriture           | Une écriture qui échoue ne laisse aucune ligne de journal ; une qui réussit en laisse une                   |
| RG-18 | Mot de passe haché ; aucun identifiant par défaut                                         | Module d'authentification                                  | Aucun mot de passe en clair en base ni dans les journaux ; pas de compte à l'installation                   |
| RG-19 | Publier ou dépublier déclenche une reconstruction                                         | Service de publication                                     | Chaque transition concernée crée une ligne `publication` et appelle le webhook                              |
| RG-20 | Un produit appartient à un seul créateur                                                  | Clé étrangère non nulle                                    | Un bijou sans créateur est impossible ; la valeur par défaut est le principal                               |
| RG-21 | Un seul créateur principal, ni supprimable ni désactivable                                | Index unique partiel, `CHECK` et service                   | Supprimer ou désactiver le principal renvoie `422` avec `RG-21`                                             |
| RG-22 | Un vendeur n'accède qu'aux objets de son créateur                                         | Service (filtre), `peut` et sécurité par ligne             | Trois tests : via l'API, via le service sans filtre, via la base                                            |
| RG-23 | Un produit de vendeur passe par `en_relecture`, un admin publie                           | Service de transition                                      | Un vendeur qui tente `publie` reçoit `403`                                                                  |
| RG-24 | Une commande est découpée en lignes par créateur                                          | Phase 7 : table préparée, aucune route                     | Seulement le test de présence des colonnes                                                                  |
| RG-25 | Commission figée à l'achat                                                                | Phase 7 : colonne `commission_taux` préparée               | Seulement le test de présence de la colonne                                                                 |
| RG-26 | Un reversement regroupe les lignes livrées d'une période                                  | Phase 8 : table préparée, aucun calcul                     | Seulement le test de présence de la table                                                                   |
| RG-27 | Un créateur avec produits ou commandes se désactive, ne se supprime pas                   | Service et clés étrangères                                 | Suppression refusée avec `RG-27` ; la désactivation dépublie ses produits                                   |
| RG-28 | Invitation par lien à usage unique et à durée limitée                                     | Module d'invitations, actif seulement avec `multiVendeurs` | Un lien déjà utilisé ou expiré est refusé ; avec `multiVendeurs` faux, `404`                                |

**Règles de non-invention** (toutes testées) :

- Aucune valeur par défaut inventée pour un prix, une matière, un créateur, un chiffre d'audience ou une source. Un champ vide reste vide, et vide n'est pas zéro.

- Une entrée d'archive sans source n'est pas publiable.

- La signature et le manifeste du héros ne changent qu'avec une confirmation explicite dans la requête (`confirmeModificationHero: true`), et chaque modification est journalisée.

- Aucun texte juridique n'est généré : une page légale sans contenu fourni est renvoyée vide et signalée comme « à fournir ».

- Le prix n'est visible côté public que si `prix_confirme` est vrai.

**Où mettre le code.** Chaque règle est une fonction nommée (par exemple `verifierPublication`, `verifierDernierSuperAdmin`) dans le service qui la porte, avec le code de la règle en commentaire. Pas de règle de gestion dans une route, ni dans une requête SQL anonyme.

## 10. Publication, programmation et reconstruction du site

Le site public est un ensemble de pages générées à l'avance. Quand un contenu change de visibilité, l'API doit demander une nouvelle génération et suivre son déroulement (RG-19).

*(Schéma dans le document de référence : chaîne de publication · 6 étapes et 2 cas particuliers. Le texte autour décrit la même chose.)*

**Ce que tu construis.**

- **Déclencheurs.** Toute transition vers `publie`, hors de `publie` (dépublication, archivage), toute modification d'un contenu déjà publié, tout changement de navigation, de textes d'interface, d'identité ou de page légale, et la route `POST /site/reconstruire`.

- **Mise en file après validation.** La demande n'est mise en file qu'**après** la validation de la transaction : jamais de reconstruction pour une écriture annulée. L'insertion de la ligne `publication` se fait dans la même transaction que l'écriture, la tâche est créée juste après.

- **Regroupement.** Plusieurs demandes arrivées en moins de 60 secondes (valeur paramétrable) produisent un seul appel au webhook. Chaque demande garde sa ligne `publication`, rattachée au même build.

- **Appel du webhook.** La tâche appelle `DEPLOY_HOOK_URL` avec trois essais espacés. Un échec définitif passe la publication à `echec`, avec le message d'erreur, et envoie un e-mail à `MAIL_TEAM_TO`.

- **Suivi du build.** Au début, le script de build du site appelle `POST /internal/api/v1/publication/demarrage` ; à la fin, `POST /internal/api/v1/publication/termine` avec `reussie` ou `echec` et un message. Ces deux routes n'acceptent que l'en-tête secret `X-Build-Secret` (variable `BUILD_CALLBACK_SECRET`) et ne sont jamais exposées dans OpenAPI public. Si aucun retour n'arrive au bout de 15 minutes, la publication passe à `echec` avec le motif `DELAI_DEPASSE`.

- **Programmation (RG-05).** Un contenu `publie` dont `publie_le` est dans le futur ne change pas de statut. À sa création ou modification, l'API planifie une tâche à `publie_le` (identifiant stable par contenu pour qu'une modification remplace la tâche au lieu de la doubler). À l'heure dite, la tâche ouvre une publication de motif `programmee`. Un redémarrage du serveur ne doit perdre aucune tâche : elles vivent dans PostgreSQL.

- **Suivi côté admin.** `GET /site/etat-reconstruction` renvoie la dernière publication et son état ; l'historique complet est lisible, filtré par état.

**Ce que l'interface attend.** Après une publication, la réponse de la transition contient l'identifiant de la publication créée, que l'interface suit pour afficher « site en cours de mise à jour ». Une publication qui échoue ne défait pas l'écriture : le contenu reste `publie` en base, et le message d'erreur dit que le site n'est pas encore à jour.

**Restauration d'une version.** `POST /restauration` remet un contenu dans l'état d'une version enregistrée dans `contenu_version`, crée une nouvelle version (l'historique n'est jamais réécrit), journalise l'action et déclenche une reconstruction si le contenu est publié.

**Points à valider avant la phase 5.** Le mécanisme de retour du build (routes internes ci-dessus) suppose que le script de build peut appeler l'API ; si l'hébergeur l'interdit, bascule sur une interrogation périodique de l'API de l'hébergeur et note le choix dans `docs/DECISIONS.md`.

## 11. Médias

Aujourd'hui, les images du site sont stockées en texte encodé (base64) dans le navigateur. Tu les remplaces par un vrai stockage de fichiers.

**Envoi.** `POST /medias` en `multipart/form-data`, un fichier par appel. L'API :

1.  vérifie la session, le jeton CSRF et le droit d'envoyer un média ;

2.  contrôle le **type réel** du fichier par son contenu et non par son extension ou l'en-tête envoyé (formats acceptés : JPEG, PNG, WebP, AVIF, GIF, SVG nettoyé, PDF pour les guides) ;

3.  refuse au-delà d'une taille maximale paramétrable (10 Mo par défaut pour une image, 25 Mo pour un PDF) et au-delà d'une dimension raisonnable ;

4.  lit les dimensions, retire les métadonnées personnelles (position GPS, appareil) avec `sharp` ;

5.  génère des **déclinaisons** en largeurs 480, 960, 1600 et 2400 (sans agrandir une image plus petite), au format WebP, en plus de l'original ;

6.  envoie le tout vers R2 sous une clé aléatoire (jamais le nom d'origine), puis enregistre `media`, `media_traduction` et `media_declinaison` dans une transaction ;

7.  renvoie l'objet `Media` du contrat, avec `url` et `declinaisons`.

Si une étape échoue après l'envoi vers R2, les fichiers déjà envoyés sont supprimés : pas de fichier orphelin.

**SVG.** Un SVG peut contenir du script. Il est soit nettoyé par une liste blanche d'éléments, soit refusé. Jamais servi tel quel.

**Texte alternatif et crédit (RG-03, RG-08).**

- L'envoi accepte un média sans texte alternatif, car on peut le décrire ensuite. Mais il est **non publiable** : un contenu qui l'utilise ne peut pas passer à `publie` tant que `texte_alt` est vide dans chaque langue active, sauf si `decoratif` est vrai.

- Le crédit est exigé pour tout média utilisé dans un contenu publié ; il reste vide quand il est inconnu, il n'est jamais inventé.

**Usages et suppression.** `GET /medias/:id/usages` liste tous les contenus qui référencent le média (image à la une, galerie, corps d'article, photo de créateur, bijou). `DELETE` renvoie `422` avec le code `RG-08` et cette liste tant que le média est utilisé. Une fois supprimé en base, les fichiers sont retirés de R2 par une tâche, avec un délai de grâce de 24 heures pour permettre de réparer une erreur.

**Lecture publique.** Les fichiers sont servis par le domaine public de R2 (`R2_PUBLIC_BASE_URL`), avec un en-tête de cache long, car la clé change à chaque nouveau fichier. L'API ne fait jamais transiter les images : elle ne renvoie que des adresses.

**Cloisonnement.** Chaque média porte un `createur_id`. L'admin voit toute la médiathèque ; un vendeur ne voit que la sienne. Les listes de médias acceptent `?createur=`.

**Tests.** Un fichier dont l'extension ment est refusé ; une image trop lourde est refusée ; une suppression de média utilisé est refusée ; un SVG avec un script est nettoyé ou refusé ; un échec d'envoi vers R2 ne laisse aucune ligne en base ; les métadonnées GPS d'une photo de test disparaissent.

## 12. Formulaires publics, e-mails, tâches planifiées et purge des données

**Principe.** Une donnée saisie par un visiteur est **d'abord enregistrée**, puis les e-mails partent en tâche de fond. Un incident chez le fournisseur d'e-mails ne doit jamais faire perdre un message ni renvoyer une erreur au visiteur.

**Contact.** `POST /public/api/v1/contact` : nom, e-mail, sujet, message, champ piège caché. Valide les longueurs, refuse les en-têtes d'e-mail injectés dans les champs, enregistre `message_contact` avec `purge_le = maintenant + durée de conservation` (RG-14). Alerte l'équipe (`MAIL_TEAM_TO`) et envoie un accusé de réception au visiteur dans sa langue.

**Newsletter (double consentement, RG-12 et RG-13).**

1.  Le visiteur saisit son e-mail et coche le consentement affiché sur le site.

2.  L'API crée (ou retrouve) l'abonné en `en_attente`, enregistre un `consentement` avec la date, la finalité et **le texte exact accepté** (envoyé par le site ou, à défaut, lu dans les réglages), puis envoie l'e-mail de confirmation avec un lien à usage unique.

3.  Au clic, l'abonné passe à `actif`, `confirme_le` est renseigné et il est ajouté à la liste Brevo.

4.  Chaque e-mail de la newsletter contient un lien de désinscription qui fonctionne en un clic, sans connexion. L'abonné passe à `desabonne` et sort de la liste Brevo.

5.  Un abonné `en_attente` jamais confirmé est supprimé après 7 jours (valeur paramétrable, à faire valider).

**La base reste la référence.** Brevo n'est qu'un outil d'envoi : l'état d'un abonné se lit toujours dans `abonne`. Si la synchronisation échoue, une tâche la reprend. L'export CSV de l'admin (`GET /abonnes/export`) vient de la base, avec le statut et la date de consentement de chacun.

**Demande de pièce (RG-11).** `POST /public/api/v1/demandes` avec la variante, le nom, l'e-mail, un message. Elle ne réserve aucun stock. L'équipe est alertée ; le visiteur reçoit un accusé de réception. Une demande portant sur une variante qui n'existe pas ou qui n'est pas publiée reçoit `404`.

**Protections communes (RG-15).** Limitation par adresse IP (par exemple 5 envois par heure et par formulaire), champ piège qui produit une réponse de succès sans rien enregistrer, taille de corps limitée, adresses IP conservées seulement sous forme d'empreinte.

**E-mails envoyés.** Chaque modèle existe en français et en anglais, en version texte et en version HTML, sans image de suivi ni lien détourné.

| E-mail                                         | Destinataire | Déclencheur                                           |
|------------------------------------------------|--------------|-------------------------------------------------------|
| Alerte de message                              | Équipe       | Contact reçu                                          |
| Accusé de réception                            | Visiteur     | Contact, demande de pièce                             |
| Alerte de demande de pièce                     | Équipe       | Demande reçue                                         |
| Confirmation d'inscription                     | Abonné       | Inscription à la newsletter                           |
| Définition ou réinitialisation de mot de passe | Compte       | Premier compte ou mot de passe oublié                 |
| Invitation                                     | Invité       | Invitation d'un éditeur, admin ou (plus tard) vendeur |
| Alerte d'échec de publication                  | Équipe       | Reconstruction échouée                                |

**Fiabilité de l'envoi.** Les e-mails passent par la file `pg-boss` : trois essais avec attente croissante, puis une ligne dans un journal d'envois (`envoi_email`) qui garde le modèle, le destinataire (haché si c'est un visiteur), l'état et la raison de l'échec. Aucun contenu de message n'est conservé dans ce journal.

**Tâches planifiées.**

| Tâche                              | Fréquence                | Effet                                                                         |
|------------------------------------|--------------------------|-------------------------------------------------------------------------------|
| Publication programmée             | À l'heure de `publie_le` | Ouvre une publication (section 10)                                            |
| Purge des messages                 | Chaque jour              | Supprime les messages dont `purge_le` est passé (RG-14)                       |
| Purge des abonnés non confirmés    | Chaque jour              | Supprime ceux qui attendent depuis plus de 7 jours                            |
| Nettoyage des sessions et jetons   | Chaque heure             | Supprime les sessions et jetons expirés                                       |
| Suppression des fichiers de médias | Chaque heure             | Retire de R2 les fichiers dont le média est supprimé depuis plus de 24 heures |
| Surveillance des publications      | Chaque minute            | Passe à `echec` une publication sans retour après 15 minutes                  |
| Synchronisation de la newsletter   | Chaque heure             | Reprend les inscriptions et désinscriptions non synchronisées                 |

Chaque tâche est **idempotente** : la relancer deux fois ne produit ni doublon ni erreur. Chaque exécution écrit une ligne de journal (début, fin, nombre d'objets traités). Les purges respectent la durée paramétrée, jamais une constante écrite dans le code.

**Données personnelles.** Les adresses IP ne sont jamais stockées en clair ; l'e-mail d'un abonné supprimé est effacé, pas seulement masqué ; la durée de conservation de chaque type de donnée est un paramétrage documenté dans `docs/DONNEES-PERSONNELLES.md`. **Ne fixe aucune durée juridique toi-même** : les valeurs par défaut sont à faire valider par le client.

## 13. Multi-vendeurs : ce qui est préparé et comment il s'active

**Intention.** Le client est le créateur principal de la plateforme. Plus tard, d'autres créateurs pourront vendre via EDJA Shop avec leur propre espace, sans jamais voir les données des autres, et le client restera au-dessus d'eux. Cette livraison ne construit pas la vente multi-vendeurs : elle fait en sorte qu'elle puisse s'ajouter **sans réécrire le modèle ni les droits**.

**Deux interrupteurs** dans `parametre_site`, modifiables par le super-admin seulement et journalisés :

| Réglage           | Défaut | Quand il est faux                                                                                                 | Quand il est vrai                                                                          |
|-------------------|--------|-------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------|
| `boutiqueEnLigne` | faux   | Boutique « sur demande » : demandes de pièce, prix visible seulement si `prix_confirme`, aucune route de commande | Variantes avec prix et stock obligatoires (RG-10) ; routes de commande ouvertes en phase 7 |
| `multiVendeurs`   | faux   | Un seul créateur actif (le principal), aucune invitation, aucun compte vendeur, routes vendeur en `404`           | Invitations, comptes vendeur, filtre et sécurité par ligne actifs                          |

Au départ, **un seul créateur existe** : le principal, créé par la migration de départ (section 15). Tous les contenus existants lui sont rattachés. L'admin pourra en ajouter d'autres, mais ils restent inactifs tant que `multiVendeurs` est faux.

**Ce qui est construit maintenant et reste actif en mode mono-vendeur.**

- Les routes `createurs` du contrat d'admin (liste, détail, création, modification, désactivation, `GET /createurs/principal`) avec RG-21 et RG-27.

- Le champ `createurId` sur `bijoux` et `medias`, le filtre `?createur=`, et le rattachement par défaut au principal (RG-20).

- `peut(compte, action, ressource, objet)` complet, y compris le rôle vendeur (section 7), avec ses tests.

- La sécurité par ligne PostgreSQL sur les tables qui portent un créateur, avec ses tests.

- Le paramètre `multiVendeurs` et son contrôle.

**Ce qui est construit mais verrouillé derrière `multiVendeurs`.**

- **Invitations (RG-28).** `POST /invitations` (création par un admin), `GET /invitations`, `DELETE /invitations/:id`, et `POST /auth/invitation/accepter` (définition du mot de passe avec le lien). Le jeton est aléatoire, stocké haché, à usage unique, valable 72 heures. Une invitation vendeur doit citer un créateur existant ; elle crée un compte `vendeur` lié à ce créateur.

- **Cloisonnement (RG-22).** Un vendeur ne liste, ne lit, ne modifie et ne supprime que les objets de son créateur. Pour tout objet d'un autre créateur, la réponse est `404`.

- **Circuit de validation (RG-23).** Un vendeur crée en `brouillon`, soumet en `en_relecture`. Toute modification d'un produit déjà publié par un vendeur le renvoie en `en_relecture`. Seul un admin publie ; un refus exige un motif visible par le vendeur.

- **Aucun accès éditorial.** Un vendeur n'a aucune route sur articles, épisodes, messages, abonnés, comptes, paramètres ni journal global. Il peut lire l'historique de ses propres objets.

- **Mode « voir comme ce vendeur ».** Un admin peut consulter les données d'un vendeur en lecture seule. Chaque consultation est journalisée. Aucune écriture n'est possible dans ce mode.

**Ce qui n'est pas construit.** Les commandes, le paiement, le calcul des commissions et les reversements (RG-24 à RG-26). Leurs tables existent et leurs colonnes sont testées, mais aucune route, aucun calcul. L'espace vendeur détaillé fait l'objet d'un autre prompt ; ce back end doit simplement ne pas lui résister.

**Activer `multiVendeurs`.** `PATCH /parametres` par un super-admin, avec confirmation par double saisie. L'API vérifie avant d'accepter : un créateur principal actif existe, tous les produits ont un `createur_id`, la politique de sécurité par ligne est en place (contrôle au démarrage). La désactivation est refusée (`422`) tant qu'un compte vendeur actif existe : on désactive d'abord les comptes.

**Désactiver un créateur (RG-27).** Un créateur qui possède des produits ou des commandes ne se supprime pas : il se désactive. La désactivation dépublie ses produits, révoque les sessions de ses comptes vendeur, journalise l'action et déclenche une reconstruction du site.

**Tests de cloisonnement (indispensables).** Pour chaque ressource portant un créateur : un vendeur A ne voit pas, ne modifie pas, ne supprime pas les objets de B — vérifié par l'API, par le service appelé sans filtre, et directement dans la base avec le rôle de l'API. Un vendeur ne publie jamais. Avec `multiVendeurs` faux, aucune route vendeur ne répond autrement que par `404`.

## 14. Journal d'audit, sécurité et observabilité

**Journal d'audit (RG-17).** Il répond à la question « qui a fait quoi, quand, sur quoi ».

- Chaque création, modification, transition, suppression, connexion réussie ou refusée, changement de rôle, changement de réglage, reconstruction manuelle, restauration, export d'abonnés et consultation « voir comme » y laisse une ligne : compte, action, entité, identifiant, état avant et après (`jsonb`), identifiant de requête.

- La ligne est écrite **dans la même transaction** que l'action : s'il n'y a pas d'action, il n'y a pas de ligne, et inversement.

- Les mots de passe, jetons, empreintes et corps de messages privés ne figurent jamais dans `avant` ni `apres` ; ils sont remplacés par `[masque]`.

- La table est en **ajout seul** : le rôle de base de données de l'API a le droit d'insérer et de lire, pas de modifier ni de supprimer. Un test le prouve.

- Lecture : `GET /journal`, paginé, filtrable par compte, action, entité et période. L'admin lit, le super-admin lit et exporte. Un vendeur lit seulement l'historique de ses propres objets.

**Mesures de sécurité** (chacune a son test ou sa vérification automatique) :

| Sujet                | Mesure                                                                                                                                                                        |
|----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Entrées              | Validation Zod de chaque corps, paramètre et en-tête ; champs inconnus refusés ; longueurs maximales                                                                          |
| Base de données      | Uniquement des requêtes paramétrées ; aucune concaténation de texte dans le SQL ; rôle de l'API sans droit de propriétaire                                                    |
| Contenu riche        | Le corps des articles (Tiptap) est un JSON dont les nœuds et les liens sont validés contre une liste blanche ; aucun HTML brut accepté ; les liens `javascript:` sont refusés |
| En-têtes             | `helmet` (politique de contenu, `nosniff`, pas d'indication du serveur) ; HSTS en production                                                                                  |
| Cookies et CSRF      | Section 7                                                                                                                                                                     |
| Débit                | Limitation globale et plus stricte sur la connexion, la réinitialisation et les formulaires publics                                                                           |
| Mots de passe        | Argon2id ; réponses de connexion identiques que le compte existe ou non ; temps de réponse équivalent                                                                         |
| Téléversements       | Section 11                                                                                                                                                                    |
| Secrets              | Variables d'environnement seulement ; jamais dans le dépôt, les journaux, les messages d'erreur ni le journal d'audit ; analyse automatique du dépôt pour en détecter         |
| Dépendances          | `npm audit` en intégration continue ; mise à jour de sécurité planifiée ; verrouillage des versions                                                                           |
| Erreurs              | Message générique et identifiant de requête pour toute erreur inattendue ; la trace reste dans les journaux serveur                                                           |
| Données personnelles | Minimisation, IP hachées, purge (section 12) ; aucun journal technique ne contient d'e-mail de visiteur en clair                                                              |
| Sauvegardes          | Chiffrées et testées (section 17)                                                                                                                                             |

**Journaux techniques.** Une ligne JSON par requête : méthode, route (modèle, pas l'adresse réelle), statut, durée, `requeteId`, identifiant de compte. Pas de corps de requête, pas de cookie, pas d'en-tête d'autorisation.

**Surveillance.**

- `GET /sante` : le serveur répond (sans accès à la base). `GET /pret` : la base et le stockage répondent. Ces deux routes ne révèlent aucune information interne.

- Un compteur des erreurs `5xx`, du délai de réponse et de la taille de la file de tâches est exposé à l'hébergeur de supervision, sous un accès protégé.

- Le choix d'un outil de suivi des erreurs (Sentry ou autre) n'est pas fait. Prépare un point d'entrée unique pour l'ajouter plus tard sans toucher aux services, et note-le dans `docs/QUESTIONS.md`.

- Alertes minimales à documenter : base injoignable, file de tâches qui grossit, publications en échec, taux de `5xx` anormal.

## 15. Migration des contenus existants et données de départ

Le site actuel contient des contenus écrits dans le code (`src/data/*`, le dictionnaire de langue, la navigation). Ils doivent entrer dans la base **sans rien perdre et sans rien inventer**.

**Deux familles de données.**

| Famille                | Contenu                                                                                                                                       | Comment elle entre                            |
|------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------|
| **Données de départ**  | Rôles, types de tags, créateur principal, réglages par défaut, navigation, textes d'interface, catégories de la boutique, pages légales vides | `npm run seed`, rejouable sans doublon        |
| **Contenus existants** | Articles, épisodes, distinctions, destinations, projets, bijou, images, tags                                                                  | `npm run migrer:contenus`, avec essai à blanc |

**Données de départ (`seed`).**

- Les quatre rôles (`editeur`, `admin`, `super_admin`, `vendeur`) et les six types de tags.

- Le **créateur principal**, avec `est_principal = true`, actif, taux de commission **vide**. Son nom vient de l'identité de marque du site (`data/site.ts`) ; si ce nom n'existe pas, laisse-le vide et signale-le : ne l'invente pas.

- Les réglages : `boutiqueEnLigne = false`, `multiVendeurs = false`, durée de conservation des messages (24 mois, à valider), regroupement de publication (60 secondes).

- La navigation et les textes d'interface, repris tels quels depuis `data/navigation.ts` et le dictionnaire i18n (français et anglais).

- Les catégories de la boutique définies par le cahier des charges et présentes dans les données du site.

- Les cinq pages légales **vides** : titre et rubriques de `PAGES_LEGALES`, aucun texte, marquées « à fournir » et non indexées.

- **Aucun compte.** Le premier super-admin se crée par la commande d'amorçage (section 7).

**Contenus existants (`migrer:contenus`).**

1.  **Lecture.** Le script lit les données du site sous forme de fichiers JSON exportés (le site fournit un script d'export ; sinon tu écris un convertisseur qui lit les modules TypeScript). Il ne modifie jamais le dépôt du site.

2.  **Essai à blanc.** `--dry-run` n'écrit rien et produit un rapport : ce qui sera créé, les champs vides, les images sans texte alternatif, les slugs en doublon, les tags inconnus.

3.  **Statut d'entrée : brouillon.** Tout est importé en `brouillon`, même ce qui est en ligne aujourd'hui. Ainsi chaque contenu passe par les vérifications de publication (RG-03) et par un admin. La date d'origine est conservée dans `publie_le` et `cree_le` quand elle existe dans les données.

4.  **Images.** Chaque image est envoyée par le même chemin que les médias (section 11), avec ses déclinaisons. Le texte alternatif vient des données du site quand il existe ; sinon il reste vide et l'image est signalée. Le crédit n'est jamais deviné.

5.  **Rattachement.** Tous les contenus de la boutique sont rattachés au créateur principal.

6.  **Tags.** Les tags existants sont recréés avec leur traduction. Un tag qui n'existe pas dans les types attendus est signalé dans le rapport, pas créé en silence.

7.  **Rejouable.** Une table `migration_source (source, cle_source, objet_id)` retient ce qui a déjà été importé. Rejouer le script ne crée pas de doublon et met à jour seulement ce qui a changé dans la source tant que l'objet est encore en `brouillon` et non modifié dans l'admin.

8.  **Journal.** La migration écrit une ligne d'audit par objet, avec un compte système `migration`.

**Contrôles après migration.** Le rapport final compare les nombres : objets lus dans la source, objets créés, objets ignorés avec leur raison. Il liste aussi, pour chaque contenu, les champs « à fournir ». Il ne doit y avoir aucune perte sans explication.

**Adresses (SEO).** Les adresses actuelles du site (par exemple `/histoires`, `/boutique`) ne changent pas. Si un slug migré diffère de l'adresse actuelle, le script écrit la correspondance dans `docs/REDIRECTIONS.md` pour que le site puisse rediriger l'ancienne adresse vers la nouvelle.

**Hors migration.** Le contenu réel que le client doit encore fournir (liste `A-FOURNIR.md`) n'est pas inventé : il apparaît comme champs vides « à fournir » dans l'admin.

## 16. Tests, qualité et intégration continue

**Principe.** Un test qui passe sur une base simulée ne prouve rien sur les droits ni sur la sécurité par ligne. Les tests d'intégration tournent donc sur une **vraie base PostgreSQL** jetable (conteneur), avec les vraies migrations.

| Famille       | Ce qu'elle vérifie                                                                                                        | Outil                                   |
|---------------|---------------------------------------------------------------------------------------------------------------------------|-----------------------------------------|
| Unitaires     | Fonctions pures : `peut`, validations de publication, calcul de `purge_le`, durée de lecture, articles liés               | `vitest`                                |
| Intégration   | Services et routes contre la vraie base : chaque règle RG de la section 9                                                 | `vitest`, conteneur PostgreSQL          |
| Contrat       | Chaque réponse de la face d'administration respecte les schémas de `CONTRAT-API`                                          | `vitest` avec les schémas Zod           |
| Sécurité      | CSRF, session expirée, élévation de privilèges, cloisonnement vendeur sur trois niveaux, injection, téléversement hostile | `vitest`                                |
| Tâches        | Publication programmée, purges, idempotence, reprise après redémarrage                                                    | `vitest` avec horloge simulée           |
| Migrations    | Montent depuis une base vide, redescendent, et le schéma obtenu correspond au schéma Drizzle                              | script de contrôle                      |
| Charge légère | Les lectures publiques et la connexion tiennent un trafic réaliste sans erreur                                            | `autocannon`, une fois avant la recette |

**Obligations.**

- Chaque règle de la section 9 a un test nommé avec son code (`RG-16 : le dernier super-admin ne peut pas être rétrogradé`).

- Chaque route de `CONTRAT-API` a au moins un test de succès et un test de refus (rôle insuffisant, donnée invalide, version périmée).

- Les tests ne partagent pas d'état : chacun crée ses données et peut tourner seul ou en parallèle.

- **Aucun compte ni jeu d'exemple** n'est créé hors de l'environnement `test`. Un test de démarrage le vérifie.

- Un test de **non-régression de sécurité** parcourt toutes les routes de l'API et vérifie que chacune exige une session, sauf une liste blanche explicite (`/public/*`, `/auth/connexion`, `/sante`).

**Barrière de qualité.** Le build local et l'intégration continue exécutent dans cet ordre : formatage, `eslint`, `tsc --noEmit`, tests unitaires, tests d'intégration, contrôle des migrations, `npm audit` (niveau élevé ou critique bloquant), génération OpenAPI. Un seul échec bloque la fusion.

**Seuils.** Pas de pourcentage de couverture arbitraire. Les services portant une règle de gestion, `peut`, l'authentification et le cloisonnement doivent être testés sur toutes leurs branches ; le reste est jugé à la relecture.

**Jeux de données de test.** Des fabriques de données dans `tests/fabriques/` créent comptes, créateurs, contenus et médias. Les textes de test sont marqués « Exemple » et ne ressemblent pas à de vrais contenus du client.

## 17. Déploiement, environnements, sauvegardes et procédures

Tu ne déploies rien toi-même : tu prépares tout pour que **le client ou son développeur** puisse le faire, avec des étapes écrites que quelqu'un d'autre peut suivre.

**Environnements.**

| Environnement | Usage                  | Particularités                                                                                          |
|---------------|------------------------|---------------------------------------------------------------------------------------------------------|
| Local         | Développement          | `docker compose` lance PostgreSQL ; `npm run dev` ; compte de test autorisé uniquement ici et en `test` |
| Test          | Intégration continue   | Base jetable, horloge simulée, aucun service externe réel (e-mails et stockage simulés par des doubles) |
| Préproduction | Recette avec le client | Données de test, vrai service d'e-mails en mode restreint, bucket R2 séparé                             |
| Production    | Site réel              | Secrets propres, sauvegardes, supervision                                                               |

Pas de configuration partagée entre préproduction et production : ni base, ni bucket, ni clé, ni secret.

**Adresses recommandées.** Site public sur le domaine principal, administration sur un sous-domaine (`admin.`), API sur un autre (`api.`), médias sur un troisième (`medias.`). Les trois premiers partagent le même domaine principal pour que le cookie de session fonctionne (section 7).

**Livraison.**

- Un `Dockerfile` multi-étapes, image minimale, exécutée sans droits administrateur, avec le contrôle de santé `/sante`.

- Un fichier d'intégration continue qui construit, teste et produit l'image. Adapte-le à la plateforme qui héberge le dépôt et note laquelle dans `docs/DECISIONS.md`.

- Les migrations s'exécutent **avant** le démarrage de la nouvelle version, avec le rôle propriétaire (`DATABASE_MIGRATION_URL`), jamais avec celui de l'API.

- **Migrations compatibles.** Une migration ne casse jamais la version précédente de l'API : on ajoute d'abord, on bascule, on supprime dans une livraison suivante. Cela permet un retour arrière sans toucher à la base.

- Une page `docs/DEPLOIEMENT.md` décrit, étape par étape et avec des captures de commandes, la création de la base, du bucket R2, du projet Cloudflare Pages et de son webhook, de la liste Brevo, des variables d'environnement, puis la commande d'amorçage du premier super-admin.

**Sauvegardes.**

- Base : sauvegarde automatique quotidienne par l'hébergeur, conservée au moins 14 jours, avec restauration à un instant précis si l'offre le permet. Une copie chiffrée est faite chaque semaine hors de l'hébergeur.

- Médias : le bucket R2 a le versionnement et un délai de grâce de suppression (cf. section 11).

- **Une sauvegarde qui n'a jamais été restaurée ne compte pas.** Livre `docs/RESTAURATION.md` avec la procédure testée, et planifie un essai de restauration avant la mise en ligne, puis chaque trimestre.

**Retour arrière.** Image précédente redéployée ; si la migration était compatible, la base ne bouge pas. `docs/RETOUR-ARRIERE.md` décrit les deux cas.

**Guide d'exploitation (`docs/EXPLOITATION.md`).** Pour une personne non développeuse : où regarder si le site ne se met plus à jour (publication en échec), si les e-mails n'arrivent plus, si l'admin ne répond plus, comment ajouter un compte, comment changer une durée de conservation, qui contacter. Un tableau « symptôme, cause probable, action » suffit.

**Passation.** Le plan de développement (décision D-H) prévoit des comptes au nom du client, le développeur y étant invité. Prépare une liste des accès à transférer au client : base, hébergeur de l'API, Cloudflare, Brevo, domaine, dépôt.

**Coûts.** Dresse dans `docs/COUTS.md` la liste des services payants ou à quota (hébergeur, base, stockage, e-mails, domaine) **sans inventer de tarif** : indique l'unité facturée et renvoie vers la page de tarifs du fournisseur, à vérifier le jour du déploiement.

## 18. Documentation à livrer

**Exigence.** Tout ce que tu construis est expliqué, schématisé et rattaché aux règles de gestion. Quelqu'un qui n'a pas suivi le projet doit pouvoir comprendre le système, l'exploiter et le faire évoluer en lisant seulement le dépôt. La documentation est écrite **en français**, en langage clair, avec des schémas au format Mermaid dans les fichiers Markdown (ils s'affichent directement sur la plupart des plateformes de dépôt).

**Documentation qui ne vieillit pas.** Quand c'est possible, elle est **générée** : OpenAPI vient des schémas Zod, la carte du modèle vient du schéma Drizzle (`npm run docs:schema`), la matrice règles-code-tests vient des commentaires `RG-xx` du code (`npm run docs:regles`). La CI échoue si un fichier généré n'est plus à jour.

| Fichier                                                                                                          | Contenu                                                                                           | Schémas à inclure                                                                                 |
|------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| `README.md`                                                                                                      | À quoi sert le projet, démarrer en cinq minutes, commandes utiles, carte de la documentation      | Schéma général des briques                                                                        |
| `docs/ARCHITECTURE.md`                                                                                           | Les trois couches, les modules, les dépendances autorisées, les flux principaux                   | Couches ; flux de publication ; flux de connexion ; flux d'envoi d'e-mail                         |
| `docs/MODELE-DE-DONNEES.md`                                                                                      | Chaque table : rôle, colonnes, contraintes, règle qui la concerne, et pourquoi                    | Diagramme entité-relation par groupe de tables ; états d'un contenu, d'un abonné et d'une demande |
| `docs/API.md` et `openapi/openapi.json`                                                                          | Conventions, erreurs, pagination, exemples de requêtes et de réponses pour chaque famille         | Aucun (l'OpenAPI est généré)                                                                      |
| `docs/REGLES-DE-GESTION.md`                                                                                      | Pour RG-01 à RG-28 : énoncé, fichier et fonction où elle vit, test qui la prouve                  | Matrice règle, code, test                                                                         |
| `docs/DROITS.md`                                                                                                 | Tableau de droits par rôle, cas du vendeur, 401, 403 et 404                                       | Arbre de décision d'une requête                                                                   |
| `docs/SECURITE.md`                                                                                               | Menaces envisagées, mesures, ce qui reste à surveiller                                            | Les trois barrières de cloisonnement                                                              |
| `docs/PUBLICATION.md`                                                                                            | De la transition à la reconstruction du site, programmation, échecs, suivi                        | Chaîne de publication, avec les états d'une publication                                           |
| `docs/MEDIAS.md`                                                                                                 | Cycle de vie d'un média, déclinaisons, suppression                                                | Parcours d'un envoi                                                                               |
| `docs/DONNEES-PERSONNELLES.md`                                                                                   | Données collectées, finalité, durée de conservation paramétrée, purge                             | Tableau donnée, finalité, durée                                                                   |
| `docs/MULTI-VENDEURS.md`                                                                                         | Ce qui est préparé, ce qui est actif, comment activer, tests de cloisonnement                     | Schéma des interrupteurs et de leurs effets                                                       |
| `docs/MIGRATION.md`, `docs/REDIRECTIONS.md`                                                                      | Rapport de migration, champs « à fournir », correspondance des adresses                           | Aucun                                                                                             |
| `docs/DECISIONS.md`                                                                                              | Un enregistrement par choix technique : contexte, décision, conséquences, versions installées     | Aucun                                                                                             |
| `docs/QUESTIONS.md`                                                                                              | Contradictions et manques repérés, ta proposition, état (ouverte, tranchée)                       | Aucun                                                                                             |
| `docs/DEPLOIEMENT.md`, `docs/EXPLOITATION.md`, `docs/RESTAURATION.md`, `docs/RETOUR-ARRIERE.md`, `docs/COUTS.md` | Section 17                                                                                        | Topologie de déploiement                                                                          |
| `docs/GLOSSAIRE.md`                                                                                              | Les mots métier (créateur, variante, « sur demande », « à fournir ») et leur traduction technique | Aucun                                                                                             |
| `CONTRIBUER.md`                                                                                                  | Conventions de code, de nommage, de tests, de messages de commit                                  | Aucun                                                                                             |

**Dans le code.** Chaque service porte un commentaire d'en-tête qui dit ce qu'il fait, quelles règles il applique (`RG-xx`) et ce qu'il ne fait pas. Pas de commentaire qui répète le code : seulement le pourquoi.

**Exemples réels.** Dans `docs/API.md`, chaque famille donne un appel complet (requête et réponse) copié d'un test qui passe, pas écrit à la main. Chaque erreur de règle montre le message qu'elle renvoie.

**Interface de consultation.** En développement et en préproduction seulement, l'API sert sa documentation interactive sur `/docs`. En production, elle est désactivée.

**Règle d'honnêteté.** Dans chaque document, ce qui n'a pas été exécuté ou testé est dit comme tel. Aucun numéro de version, aucun tarif et aucune valeur de performance ne sont écrits de mémoire : ils viennent de ce que tu as installé ou mesuré.

## 19. Livraison par étapes, critères d'acceptation, interdits et incertitudes

**Méthode.** Tu travailles étape par étape. À la fin de chacune, tu t'arrêtes, tu exécutes la barrière de qualité de la section 16 et tu réponds avec un compte rendu court : ce qui est fait, ce qui a été testé (avec le résultat réel des commandes), ce qui ne l'est pas, les entrées ajoutées dans `docs/QUESTIONS.md`. Tu n'enchaînes pas sans validation.

| Étape                          | Contenu                                                                                                                       | Critères d'acceptation                                                                                                                                                         |
|--------------------------------|-------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 0\. Cadrage                    | Lecture de `CONTRAT-API`, de l'analyse, du plan et des types du site. Aucun code.                                             | `docs/QUESTIONS.md` liste chaque contradiction ou manque ; un plan détaillé des étapes suivantes ; les tables ajoutées au modèle sont listées avec leur source dans le contrat |
| 1\. Socle                      | Dépôt, configuration validée, serveur, erreurs normalisées, journaux, `/sante`, `/pret`, Docker, intégration continue, README | Une commande lance l'API et la base ; le serveur refuse de démarrer si une variable manque ; la CI passe                                                                       |
| 2\. Base de données            | Schéma Drizzle, migrations, sécurité par ligne, données de départ, `docs/MODELE-DE-DONNEES.md`                                | Les migrations montent et descendent ; le rôle de l'API n'est pas propriétaire ; le test de sécurité par ligne passe ; le diagramme est généré                                 |
| 3\. Accès                      | Sessions, CSRF, connexion, mot de passe, amorçage du super-admin, `peut`, comptes et rôles                                    | RG-16 et RG-18 testées, dont la concurrence ; 401, 403 et 404 conformes ; aucun compte par défaut                                                                              |
| 4\. Contenu éditorial          | Ressources éditoriales, traductions, transitions, versions, slugs, journal d'audit, historique et restauration                | RG-01 à RG-08 et RG-17 testées ; contrat respecté sur tous les types ; réponses `409` sur version périmée                                                                      |
| 5\. Médias                     | Envoi, déclinaisons, stockage, usages, suppression différée                                                                   | Tests de la section 11 ; aucun fichier orphelin après échec                                                                                                                    |
| 6\. Boutique et créateurs      | Catégories, bijoux, variantes, demandes, créateurs                                                                            | RG-09, 10, 11, 20, 21 et 27 testées ; prix jamais inventé ni affiché sans confirmation                                                                                         |
| 7\. Lecture publique           | Face publique en lecture, sitemap, articles liés                                                                              | Aucun brouillon, archive ni programmé dans les lectures ; RG-07 et RG-09 testées                                                                                               |
| 8\. Audience et e-mails        | Contact, newsletter, demandes, modèles d'e-mails, file de tâches, purges                                                      | RG-12 à RG-15 testées ; un échec d'e-mail ne perd aucun message ; tâches idempotentes                                                                                          |
| 9\. Publication                | Webhook, regroupement, suivi du build, programmation, surveillance                                                            | RG-05 et RG-19 testées ; redémarrage sans perte de tâche ; échec simulé géré                                                                                                   |
| 10\. Multi-vendeurs verrouillé | Invitations, cloisonnement, circuit de validation, mode « voir comme », interrupteurs                                         | RG-22, 23 et 28 testées sur trois niveaux ; avec `multiVendeurs` faux, tout répond `404`                                                                                       |
| 11\. Migration                 | Script de migration, essai à blanc, rapport                                                                                   | Aucun objet perdu sans explication ; relançable sans doublon                                                                                                                   |
| 12\. Clôture                   | Sécurité, charge légère, documentation complète, guide d'exploitation, essai de restauration, liste de passation              | Toute la section 18 livrée ; `npm audit` sans alerte élevée ; la barrière de qualité passe ; matrice RG complète                                                               |

**Interdits.**

- Ne pas inventer de prix, de matière, de créateur, de source, de chiffre d'audience, de texte juridique, de tarif de service ni de numéro de version.

- Ne pas écrire de secret, de clé ou de mot de passe dans le dépôt, les tests (hors faux secrets évidemment factices), les journaux ou la documentation.

- Ne pas créer de compte par défaut ni de route de démonstration en production.

- Ne pas modifier `CONTRAT-API` sans le consigner dans `docs/QUESTIONS.md` et attendre la validation.

- Ne pas contourner `peut`, ni écrire un test de rôle en dur dans une route.

- Ne pas construire de route de commande, de paiement ou de reversement dans cette livraison.

- Ne pas dire qu'une commande a réussi sans en montrer le résultat réel ; ne pas écrire qu'une partie du code a été testée si elle ne l'a pas été.

**Incertitudes connues.** Elles sont à consigner dans `docs/QUESTIONS.md` dès l'étape 0 et à traiter avec la personne responsable, pas à deviner :

- Le script SQL de l'analyse n'a jamais été exécuté.

- Les versions réelles du `package.json` du site et la présence des dossiers `admin/` et `public/` ne sont pas vérifiées.

- Les statuts d'expédition (`a_preparer`, `expediee`, `livree`, `annulee`) sont une proposition.

- Le prestataire de paiement, le taux de commission, le contrat vendeur, la politique de retours et les règles douanières ne sont pas choisis.

- Les durées de conservation des données (messages, abonnés non confirmés, données de commande) sont des valeurs par défaut à faire valider.

- Le mécanisme de retour du build dépend de ce que l'hébergeur du site autorise.

- L'outil de suivi des erreurs n'est pas choisi.

**Ta première réponse.** Fais l'étape 0 seulement : le résumé de ce que tu as compris du projet en dix lignes, les entrées de `docs/QUESTIONS.md`, la liste des tables que tu ajoutes au modèle et le plan des étapes suivantes. Puis arrête-toi et attends mon feu vert.
