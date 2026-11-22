# CONTRAT-API — Prince EDJA

> **Version 1.21.0 · 22/11/2026 · ARRÊTÉE.**
> Contrat de la face d'administration (`/admin/api/v1`) entre l'interface d'admin (`admin/`) et
> le back end (`prince-edja-api`). Depuis la 1.13.0, la **face publique (§ 18) est normative** pour
> le site comme pour le back end : elle n'est plus une annexe de référence.
>
> Ce document **fait foi** devant `docs/PROMPT-ADMIN-PRINCE-EDJA.md` et
> `docs/PROMPT-BACKEND-PRINCE-EDJA.md`. Chaque écart à ces prompts est listé au § 1.3.

---

## Sommaire

0. Gouvernance du contrat
1. Sources, préséance et écarts aux prompts
2. Conventions générales
3. Session et authentification
4. Erreurs
5. Rôles et droits
6. Types communs
7. Cycle de vie d'un contenu
8. Gabarit d'une ressource
9. Ressources éditoriales
10. Boutique : catégories, créateurs, bijoux, variantes
11. Médias
12. Audience : messages, demandes, abonnés
13. Réglages
14. Publication du site, versions, restauration
15. Comptes et journal d'audit
16. Tableau de bord
17. Fonctions verrouillées
18. Annexe : face publique
19. Lots de livraison
20. Points ouverts
21. Journal des versions

---

## 0. Gouvernance du contrat

*Décision A-01. Arrêtée par l'architecte, conformément au workflow de bout en bout (« Prompt A produit
CONTRAT-API, Prompt B en part »).*

| Sujet | Règle |
|---|---|
| Emplacement | `docs/CONTRAT-API.md`, dans le dépôt du site et de l'admin. Le back end, qui vit dans un dépôt séparé, référence une **version étiquetée** de ce fichier (`contrat-api-v1.0.0`). |
| Rédaction et tenue | Le **responsable technique du projet** (rôle d'architecte). Il rédige toute évolution. |
| Validation | Toute version est validée par le **responsable de l'admin** et le **responsable du back end**. Dans une équipe d'une seule personne, celle-ci valide sous ses deux casquettes ; la validation est tracée au § 21. |
| Versions | Version sémantique. **Majeure** : rupture (champ retiré ou renommé, route supprimée, règle durcie). **Mineure** : ajout compatible (champ facultatif, route, valeur d'énumération côté réponse). **Correctif** : précision sans effet sur les échanges. |
| Procédure | Une évolution = une modification de ce fichier, avec le numéro de version, une entrée au § 21 et, le cas échéant, une entrée dans `admin/docs/DECISIONS.md` et dans `docs/QUESTIONS.md` du back end. Aucune implémentation ne précède la version du contrat qui la décrit. |
| Source machine | Le back end génère OpenAPI depuis ses schémas Zod (PB § 4). Ses tests de contrat vérifient chaque réponse contre ce document. L'admin écrit ses schémas Zod (`admin/src/api/schemas/`) à partir de ce document et, dès que l'OpenAPI existe, vérifie en CI que ses schémas y sont conformes. |
| Divergence | Une implémentation qui s'écarte du contrat est une **anomalie de l'implémentation**, pas une évolution du contrat. |

---

## 1. Sources, préséance et écarts aux prompts

### 1.1 Sources

| Source | Emplacement | Rôle |
|---|---|---|
| Cahier des charges v1.0 | `Téléchargements/Cahier_des_charges_Site_Prince_EDJA_2026 (1).md` | Besoin du client |
| Analyse conceptuelle (25/10, mise à jour D-I du 27/10) | `Téléchargements/Analyse-conceptuelle.docx` | Règles RG-01 à RG-28, modèle, diagramme d'états, droits |
| Actions de l'administrateur (28/10) | `Téléchargements/Actions-administrateur.pdf` | Champs par famille, matrice des actions |
| Workflow de bout en bout (27/10) | `Téléchargements/edja/Fonctionnement du système…pdf` | Cycle de vie, gouvernance des prompts |
| Plan de développement (26/10) | `Téléchargements/Plan-de-developpement.docx` | Phases, décisions D-A à D-I |
| Prompt back end (PB), prompt admin (PA) | `docs/` | Choix techniques |
| Types et données du site | `src/types/index.ts`, `src/data/*` | Forme exacte des champs (PB:47) |

Inventaire et applicabilité : `docs/SOURCES-DE-REFERENCE.md`.

### 1.2 Préséance

Ce contrat › analyse conceptuelle › actions de l'administrateur et workflow › PB › PA › décisions de
l'admin. Le cahier des charges fixe le **besoin** : aucune règle de ce contrat ne le contredit.

### 1.3 Écarts aux prompts (à lire par les deux équipes)

| Réf. | Prompt | Ce contrat | Motif |
|---|---|---|---|
| E-01 | PB:679 : bijou sans variante admis en mode « sur demande » | **Tout bijou a au moins une variante**, dans tous les modes (§ 10.3) | Analyse RG-10 et MCD (bijou 1,n variante) ; seul moyen de stocker un prix en mode « sur demande » et de rattacher une demande (RG-11) |
| E-02 | PA:232-238 : prix, matières, tailles sur le bijou | Prix, ancien prix, matière, taille, stock et disponibilité **sur la variante** ; édition, atelier, village, poids sur le bijou | Analyse § 4 et 6 ; PB:417-425 |
| E-03 | PA:344 : un admin « publie » un brouillon | Aucune transition `brouillon → publie` ; l'admin enchaîne deux transitions (§ 7.3) | Diagramme d'états de l'analyse § 9 ; workflow § 3 |
| E-04 | PB:636 : pas de sortie d'`archive` | Ajout de `archive → brouillon` (admin) | Sans elle, un contenu archivé ne peut plus jamais être corrigé ; aucune source ne l'interdit |
| E-05 | PA:434 : texte alternatif et crédit exigés à l'envoi | Facultatifs à l'envoi, exigés à la publication du contenu qui utilise le média (§ 11.3) | PB:766-768 ; non-invention du crédit |
| E-06 | PB:427-435 : une demande porte sur **une** variante | Une demande porte sur **une ou plusieurs** variantes (§ 12.2) | Le site envoie aujourd'hui une sélection de plusieurs pièces (`src/lib/demande.tsx`) ; aucune fonction existante n'est retirée |
| E-07 | PB:653-657 : aucun formulaire de collaboration | Messages typés `contact` ou `collaboration`, avec les champs B2B (§ 12.1) | CDC (« Formulaire B2B »), plan de développement phase 4, actions § 8 |
| E-08 | PB:461 : message avec un seul booléen `traite` | `statut` : `non_lu`, `lu`, `traite`, `archive` ; note interne | Actions § 8 (lire, traiter, supprimer) ; PA:376 |
| E-09 | PB:438-446 : abonné sans prénom ni pays | `prenom` et `pays` ajoutés | CDC (« Prénom + email + pays + consentement ») ; formulaire du site |
| E-10 | PA:382 et PA:444 : mot de passe saisi par le super-admin à la création | Compte créé **sans mot de passe** ; lien de définition envoyé par e-mail (§ 15.1) | PB:554-558 (aucun mot de passe par défaut, lien à usage unique) ; résout la contradiction PB:811 / PB:859 |
| E-11 | PA:321-339 : seul le super-admin crée les comptes éditeur | L'admin gère les comptes **éditeur** ; seul le super-admin gère admin et super-admin | Analyse RG-16 et § 10 ; actions § 9 |
| E-12 | PB:614-622 : pas de ressource pour l'audience, les études de cas, les partenaires, les motifs de contact | Ressources `audience`, `etudes-cas`, `partenaires`, `motifs-contact` | CDC (audience administrable et datée, études de cas, logos) ; actions § 8 |
| E-13 | PB et PA : `createur` sans `actif` (PA) | `slug` et `actif` conservés, distincts du `statut` (§ 10.2) | Analyse § 4 ; décision X-05 |
| E-14 | PB:181, PB:183 contre PA:104-112 | « Programmé » et « À fournir » sont des états **dérivés**, jamais des statuts | PB, explicite |
| E-15 | PA § 6 contre PA § 9 (adresses d'écran) | Sans objet pour l'API : les ressources sont celles de ce contrat | — |
| E-16 | Analyse : `variante.stock NOT NULL DEFAULT 0` | `stock` vide autorisé | Vide n'est pas zéro (CDC, PB:183) |

---

## 2. Conventions générales

| Règle | Valeur |
|---|---|
| Préfixe | `/admin/api/v1` |
| Format | JSON UTF-8. Corps de requête en `application/json`, sauf l'envoi de média (`multipart/form-data`). |
| Identifiants | `uuid` v4, chaînes. |
| Dates | ISO 8601 avec fuseau (`2026-10-30T09:00:00Z`). Le serveur stocke en UTC ; l'admin affiche en `Africa/Abidjan`. Une **date partielle** (année seule, année et mois) est une chaîne `AAAA`, `AAAA-MM` ou `AAAA-MM-JJ`, signalée par le type `DatePartielle`. |
| Montants | Entiers en **francs CFA** (XOF), sans décimale. `null` = non communiqué. Jamais `0` par défaut. |
| Vide et zéro | Un champ inconnu vaut `null` (ou une liste vide). `0` n'est jamais une valeur par défaut : il est saisi volontairement. |
| Champs inconnus | Un champ non prévu dans un corps de requête → `422 VALIDATION`. |
| Champs en lecture seule | `id`, `creeLe`, `modifieLe`, `auteurId`, `champsAFournir`, `languesPresentes`, `usages`, `declinaisons`, `url` ne sont jamais acceptés en écriture (`422 VALIDATION`). |
| Concurrence | Toute ressource modifiable porte `version` (entier). `PATCH`, transition et suppression exigent la `version` lue ; une version périmée → `409 VERSION_PERIMEE`. |
| Pagination | `?page=1&pageSize=20`. `pageSize` vaut 1 à 100 ; au-delà → `422`. Réponse : `{ items, page, pageSize, total }`. |
| Tri | `?tri=champ` (croissant) ou `?tri=-champ` (décroissant). Défaut : `-modifieLe`. Champs triables listés par ressource ; un autre → `422`. |
| Filtres communs | `q` (recherche plein texte sur le titre et le slug, toutes langues), `statut`, `langue` (contenus **ayant** une traduction dans cette langue), `sansLangue` (contenus **sans** traduction dans cette langue), `tag` (identifiant, répétable), `aFournir=true` (`champsAFournir` non vide). |
| Langues | `traductions: { fr?: …, en?: … }`. Une langue absente reste absente : l'API ne copie jamais le français vers l'anglais. |
| Traçabilité | Chaque réponse porte l'en-tête `X-Request-Id`, repris dans le corps des erreurs (`requeteId`) et dans le journal d'audit. |
| Cache | Les réponses de la face d'admin portent `Cache-Control: no-store`. |

### 2.1 Langues actives

Le réglage `parametres.languesActives` (défaut : `["fr"]`, § 13.3) fixe les langues **exigées à la
publication** (RG-03). Une langue inactive peut être saisie mais n'est jamais exigée.

*Motif [Fait] : le contenu éditorial du site n'existe aujourd'hui qu'en français (`AGENTS.md`, section i18n) ;
exiger l'anglais bloquerait toute publication. Activer `en` est une décision du client (§ 20).*

---

## 3. Session et authentification

### 3.1 Principes
- Session par cookie `HttpOnly`, `Secure`, `SameSite=Lax`, posé par l'API. Durée glissante de 8 h d'inactivité, durée maximale de 7 jours ; les deux sont paramétrables côté serveur (PB:548).
- L'admin et l'API sont servis sur deux sous-domaines du **même site** (`admin.<domaine>`, `api.<domaine>`). Requêtes avec `credentials: 'include'`. L'origine de l'admin figure dans `ALLOWED_ORIGINS`.
- Le jeton anti-CSRF est renvoyé par `GET /auth/moi`. Il est gardé **en mémoire** par l'admin (jamais dans le stockage du navigateur) et envoyé dans `X-CSRF-Token` sur toute requête `POST`, `PATCH` ou `DELETE`.
- Un compte qui doit changer son mot de passe (`doitChangerMotDePasse`) ne peut appeler que `GET /auth/moi`, `POST /auth/changer-mot-de-passe` et `POST /auth/deconnexion`. Toute autre route → `403 MOT_DE_PASSE_A_CHANGER`.

### 3.2 Routes

| Méthode et route | Corps | Réponse | Erreurs |
|---|---|---|---|
| `POST /auth/connexion` | `{ email, motDePasse }` | `200` `Moi` (et cookie) | `401 IDENTIFIANTS_INVALIDES` (même réponse et même délai que le compte existe ou non) ; `429` |
| `POST /auth/deconnexion` | — | `204` ; session révoquée en base | — |
| `GET /auth/moi` | — | `200` `Moi` | `401` |
| `POST /auth/changer-mot-de-passe` | `{ motDePasseActuel, nouveauMotDePasse }` | `204` ; les autres sessions du compte sont révoquées | `422 VALIDATION` (robustesse), `401` |
| `POST /auth/mot-de-passe-oublie` | `{ email }` | `204`, **toujours** | `429` |
| `POST /auth/definir-mot-de-passe` | `{ jeton, nouveauMotDePasse }` | `204` | `422 JETON_INVALIDE` (inconnu, expiré ou déjà utilisé) ; `422 VALIDATION` |

`POST /auth/definir-mot-de-passe` sert aux trois cas où un compte reçoit un lien :
1. la réinitialisation (validité 1 h) ;
2. l'amorçage du premier super-admin (1 h) ;
3. la création d'un compte (72 h, § 15.1).

Cette route ne demande ni session ni jeton CSRF (elle est appelée depuis le lien) ; elle est
limitée en débit.

**Mot de passe** : 12 caractères au minimum ; refus des mots de passe courants (PB:554).

```ts
interface Moi {
  compte: Compte                       // § 6
  csrf: string                         // jeton anti-CSRF
  session: { expireLe: string }        // échéance glissante courante, pour l'avertissement d'inactivité
  reglages: { boutiqueEnLigne: boolean; multiVendeurs: boolean; languesActives: Langue[] }
}
```

---

## 4. Erreurs

### 4.1 Forme

```ts
interface ErreurApi {
  status: number
  code: string                 // règle (RG-03) ou code technique (VERSION_PERIMEE)
  message: string              // français, sans trace technique ni nom de table
  champ?: string               // chemin du champ fautif : "traductions.en.titre", "variantes[0].prix"
  details?: unknown            // voir les codes
  requeteId: string            // égal à l'en-tête X-Request-Id
}
```

### 4.2 Codes

| Statut | Code | Quand | `details` |
|---|---|---|---|
| 401 | `NON_AUTHENTIFIE` | Pas de session valide | — |
| 401 | `IDENTIFIANTS_INVALIDES` | Connexion refusée | — |
| 403 | `CSRF_INVALIDE` | Jeton anti-CSRF absent ou faux ; origine refusée | — |
| 403 | `MOT_DE_PASSE_A_CHANGER` | Voir § 3.1 | — |
| 403 | `RG-xx` | Action interdite par une règle de droits (RG-02, RG-16, RG-23…) | — |
| 403 | `DROIT_INSUFFISANT` | Action interdite par le tableau de droits, sans règle plus précise | — |
| 404 | `NON_TROUVE` | Objet absent, ou objet d'un autre créateur pour un vendeur (RG-22) | — |
| 409 | `VERSION_PERIMEE` | `version` envoyée ≠ version courante | `{ versionCourante: number }` |
| 422 | `VALIDATION` | Corps ou paramètre invalide, champ inconnu, champ en lecture seule | `{ erreurs: { champ: string, message: string }[] }` |
| 422 | `RG-03` | Exigences de publication non remplies | `{ manquants: { champ: string, langue?: Langue, message: string }[] }` |
| 422 | `RG-xx` | Autre règle de gestion violée (RG-04, RG-06, RG-08, RG-10, RG-16, RG-20, RG-21, RG-27…) | Selon la règle ; RG-08 : `{ usages: Usage[] }` ; RG-04 : `{ suggestion: string }` |
| 422 | `TRANSITION_INTERDITE` | Transition hors du diagramme (§ 7.3) | `{ depuis, vers, autorisees: StatutContenu[] }` |
| 422 | `JETON_INVALIDE` | Lien de mot de passe inconnu, expiré ou utilisé | — |
| 422 | `FICHIER_REFUSE` | Type réel non accepté, taille ou dimensions excessives | `{ raison: 'type' \| 'taille' \| 'dimensions' }` |
| 422 | `SLUG_FIGE` | Changement du slug d'un créateur déjà publié (§ 10.2) | — |
| 422 | `MULTI_VENDEURS_INACTIF` | Activer un créateur non principal, ou toute opération vendeur, alors que `multiVendeurs` est faux | — |
| 422 | `COORDONNEES_HORS_PAYS` | Destination hors des limites du pays déclaré (§ 9.5) | — |
| 429 | `TROP_DE_REQUETES` | Limitation de débit | En-tête `Retry-After` (secondes) |
| 500 | `ERREUR_INTERNE` | Erreur inattendue | — |

### 4.3 Règles de gestion appliquées par la face d'admin

RG-01 à RG-23 et RG-27 ; RG-28 seulement si `multiVendeurs` est vrai. RG-24 à RG-26 et RG-V1 à RG-V3 ne
s'appliquent qu'à la vente en ligne et ne sont pas exposées dans cette version (§ 17).

---

## 5. Rôles et droits

Rôles : `editeur`, `admin`, `super_admin`, `vendeur`. Hiérarchie : `super_admin` ⊃ `admin` ⊃ `editeur`.
Le rôle `vendeur` est à part et n'existe que si `multiVendeurs` est vrai.

Toute décision passe par `peut(compte, action, ressource, objet?)`, côté serveur (qui fait foi) et côté
admin (qui masque). Pour un vendeur, l'objet doit porter son `createurId`.

| Action | Éditeur | Admin | Super-admin |
|---|---|---|---|
| Lire tout contenu éditorial et boutique | Oui | Oui | Oui |
| Créer un contenu ; modifier un **brouillon** | Oui | Oui | Oui |
| Modifier un contenu `en_relecture` ou `publie` | Non | Oui | Oui |
| Soumettre (`brouillon → en_relecture`) | Oui | Oui | Oui |
| Publier, refuser, dépublier, archiver, désarchiver, programmer | Non | Oui | Oui |
| Supprimer un contenu (brouillon ou archivé, non utilisé) | Non | Oui | Oui |
| Confirmer un prix (`prixConfirme`) | Non | Oui | Oui |
| Téléverser, décrire un média | Oui | Oui | Oui |
| Supprimer un média non utilisé | Non | Oui | Oui |
| Tags : créer, modifier, supprimer | Non (lecture) | Oui | Oui |
| Catégories de la boutique | Non (lecture) | Oui | Oui |
| Créateurs : créer, modifier, publier, désactiver | Non (lecture) | Oui | Oui |
| Messages, demandes, abonnés : lire, traiter, exporter, supprimer | Non | Oui | Oui |
| Identité, audience, navigation, textes d'interface, motifs de contact | Non | Oui | Oui |
| Signature et manifeste du héros (avec `confirmeModificationHero`) | Non | Oui | Oui |
| Paramètres : `languesActives`, destinataires, durées | Non | Oui | Oui |
| Paramètres : `boutiqueEnLigne`, `multiVendeurs` | Non | Non | Oui |
| Reconstruire le site | Non | Oui | Oui |
| Restaurer une version | Non | Oui | Oui |
| Comptes **éditeur** : créer, modifier, désactiver, renvoyer le lien | Non | Oui | Oui |
| Comptes **admin** et **super-admin** | Non | Non | Oui (jamais le dernier super-admin) |
| Journal d'audit : lire | Non | Oui | Oui |
| Journal d'audit : exporter | Non | Non | Oui |

Personne ne se supprime, ne se désactive ni ne se rétrograde soi-même (RG-16).

---

## 6. Types communs

```ts
type Langue = 'fr' | 'en'
type Role = 'editeur' | 'admin' | 'super_admin' | 'vendeur'
type StatutContenu = 'brouillon' | 'en_relecture' | 'publie' | 'archive'
type Traductions<T> = Partial<Record<Langue, T>>
type DatePartielle = string            // AAAA | AAAA-MM | AAAA-MM-JJ
type Slug = string                     // ^[a-z0-9]+(?:-[a-z0-9]+)*$, 1 à 120 caractères

/** Champs communs à toute ressource soumise au cycle de vie (§ 7). */
interface ContenuBase {
  id: string
  statut: StatutContenu
  publieLe: string | null              // futur = programmé (état dérivé)
  creeLe: string
  modifieLe: string
  auteurId: string
  version: number
  champsAFournir: string[]             // lecture seule (§ 7.6)
  languesPresentes: Langue[]           // lecture seule : langues ayant une traduction
}

/** Référence légère à un compte, renvoyée en lecture. */
interface CompteResume { id: string; nom: string }

interface Compte {
  id: string
  email: string
  nom: string
  role: Role
  actif: boolean
  derniereConnexion: string | null
  doitChangerMotDePasse: boolean
  createurId: string | null            // obligatoire si role === 'vendeur'
}

/** Lien interne vers une cible du site, sans adresse écrite à la main. */
type CibleInterne =
  | { type: 'page'; cle: ClePage }                                   // page fixe, § 9.15
  | { type: 'page-legale'; cle: ClePageLegale }                      // page légale, § 9.16 (v1.1.0)
  | { type: 'contenu'; ressource: RessourceLiable; id: string }      // contenu publié
  | { type: 'ancre'; cle: ClePage; ancre: string }                   // section d'une page fixe
type ClePageLegale = 'mentions-legales' | 'confidentialite' | 'cookies' | 'cgv' | 'retours'
type RessourceLiable = 'articles' | 'episodes' | 'projets' | 'destinations' | 'bijoux' | 'archive'

/** Élément de liste renvoyé par GET /{ressource} (le détail renvoie l'objet complet). */
interface ResumeContenu {
  id: string
  statut: StatutContenu | null         // null pour les ressources sans cycle de vie
  titre: string                        // titre FR, sinon EN, sinon chaîne vide
  slug: string | null
  publieLe: string | null
  modifieLe: string
  auteur: CompteResume | null
  version: number
  champsAFournir: string[]
  languesPresentes: Langue[]
  imageId: string | null
  createurId?: string                  // bijoux et médias seulement
}
```

---

## 7. Cycle de vie d'un contenu

*Décision A-03. Source : analyse § 9 (diagramme d'états), workflow § 3, PB:636.*

### 7.1 Ressources concernées
`articles`, `episodes`, `projets`, `villes`, `destinations`, `archive`, `distinctions`, `presse`,
`galerie`, `univers`, `jalons`, `offres`, `etudes-cas`, `partenaires`, `pages`, `pages-legales`,
`bijoux`, `createurs`.

### 7.2 Statuts et états dérivés
- **Statuts** : `brouillon`, `en_relecture`, `publie`, `archive` (RG-01). Un contenu est créé en `brouillon`.
- **Programmé** (état dérivé) : `statut = 'publie'` et `publieLe` dans le futur. Le contenu n'apparaît pas sur le site avant cette date (RG-05).
- **À fournir** (état dérivé) : `champsAFournir` non vide (§ 7.6).
- Ni « programmé » ni « à fournir » ne sont envoyés ni acceptés comme statut.

### 7.3 Transitions

`POST /{ressource}/:id/transition`

```ts
interface DemandeTransition {
  vers: StatutContenu
  version: number
  programmeLe?: string     // seulement pour vers = 'publie' ; date future = publication programmée
  motif?: string           // obligatoire pour un refus (en_relecture → brouillon), 3 à 1000 caractères
}
interface ReponseTransition {
  contenu: unknown         // l'objet complet de la ressource, après transition
  publicationId: string | null   // publication du site créée (RG-19), sinon null
}
```

| Depuis | Vers | Qui | Contrôles | Effets |
|---|---|---|---|---|
| `brouillon` | `en_relecture` | éditeur, admin, super-admin | Exigences de publication (§ 7.5), sauf la date | Notification au tableau de bord des admins |
| `en_relecture` | `publie` | admin, super-admin | RG-02, exigences de publication (§ 7.5) | `publieLe` = `programmeLe` ou maintenant ; reconstruction (RG-19), ou planifiée à `publieLe` (RG-05) |
| `en_relecture` | `brouillon` | admin, super-admin | `motif` obligatoire | Refus ; motif conservé dans le journal et visible sur le contenu (`dernierMotifRefus`) |
| `publie` | `brouillon` | admin, super-admin | — | Dépublication ; reconstruction ; une programmation en attente est annulée |
| `publie` | `archive` | admin, super-admin | — | Retiré du site et des listes ; son slug reste réservé (RG-04) ; reconstruction |
| `archive` | `brouillon` | admin, super-admin | — | Remise en chantier ; aucune reconstruction |

Toute autre combinaison → `422 TRANSITION_INTERDITE`. Il n'existe **pas** de transition
`brouillon → publie` : l'admin qui publie son propre brouillon enchaîne deux appels (soumettre, puis
publier). Les deux actions figurent au journal (RG-17). L'admin d'interface peut proposer un bouton
unique qui enchaîne les deux appels ; si le second échoue, le contenu reste `en_relecture` et l'erreur
est affichée.

Chaque objet de cycle de vie expose en lecture `dernierMotifRefus: string | null`.

### 7.4 Écriture selon le statut

| Statut | `PATCH` éditeur | `PATCH` admin | `DELETE` (admin) |
|---|---|---|---|
| `brouillon` | Oui | Oui | Oui, si non utilisé |
| `en_relecture` | Non (`403 RG-02`) | Oui | Non (`422 TRANSITION_INTERDITE` : refuser d'abord) |
| `publie` | Non (`403 RG-02`) | Oui ; une modification déclenche une reconstruction (PB:720) | Non : dépublier d'abord |
| `archive` | Non | Non : désarchiver d'abord | Oui, si non utilisé |

Une modification d'un contenu `publie` par un admin est revérifiée contre les exigences de publication ;
un manque → `422 RG-03`, rien n'est écrit.

*Limite assumée de la version 1 : il n'existe pas de « révision en brouillon » d'un contenu publié. Un
éditeur qui veut corriger un contenu publié le signale à un admin.*

### 7.5 Exigences de publication (RG-03)

Pour **chaque langue active** (§ 2.1) :
1. les champs marqués **P** dans la fiche de la ressource sont remplis ;
2. l'image principale, si la ressource en a une marquée **P**, existe ;
3. **chaque** média utilisé par le contenu a un texte alternatif dans la langue, sauf s'il est `decoratif` ;
4. chaque média utilisé a un `credit` renseigné (PB:768).

Règles propres à une ressource : article (RG-06, au moins un tag `format`) ; archive (au moins une
source) ; destination (coordonnées) ; bijou (au moins une variante, RG-10) ; page légale (corps non
vide). Un manque → `422 RG-03` avec la liste `details.manquants`.

### 7.6 `champsAFournir`
Calculé à chaque lecture. Contient le chemin de chaque champ :
- exigé par les exigences de publication et vide, pour chaque langue active (`traductions.fr.extrait`) ;
- **de crédibilité** et vide, même s'il n'est pas exigé à la publication. Ces champs sont marqués **C** dans les fiches (prix, matière, source, date de validation…). Ils ne bloquent pas la publication ; ils signalent ce que le client doit fournir.

---

## 8. Gabarit d'une ressource

Sauf mention contraire dans sa fiche, une ressource `{r}` expose :

| Méthode et route | Corps | Réponse | Notes |
|---|---|---|---|
| `GET /{r}` | — | `200 { items: ResumeContenu[], page, pageSize, total }` | Filtres communs (§ 2) et filtres propres |
| `GET /{r}/:id` | — | `200` objet complet | `404 NON_TROUVE` |
| `POST /{r}` | `Entree{R}` | `201` objet complet, en `brouillon` | Slug généré depuis le titre s'il est absent ; `422 RG-04` sur doublon, avec une suggestion |
| `PATCH /{r}/:id` | `Partial<Entree{R}> & { version }` | `200` objet complet | Remplacement champ par champ ; `traductions.fr` remplace la traduction française entière ; `traductions.en: null` supprime la traduction anglaise |
| `DELETE /{r}/:id?version=N` | — | `204` | `422 RG-08` ou `RG-27` si l'objet est utilisé |
| `POST /{r}/:id/transition` | `DemandeTransition` | `200 ReponseTransition` | § 7.3 |
| `PATCH /{r}/ordre` | `{ ids: string[] }` | `200 { ids }` | Ressources ordonnables seulement ; `ids` = la liste **complète** dans le nouvel ordre ; sinon `422 VALIDATION`. La dernière écriture gagne. |

`Entree{R}` = les champs de la fiche, **sans** les champs en lecture seule.

**Notation des fiches** :
- **P** : exigé à la publication, pour chaque langue active si le champ est traduit ;
- **C** : champ de crédibilité suivi dans `champsAFournir` ;
- **U** : unique ;
- **O** : facultatif.

Chaque fiche liste ses champs propres. Les champs de `ContenuBase` sont implicites.

---

## 9. Ressources éditoriales

### 9.1 `articles` — récits du journal
| Champ | Type | Règle |
|---|---|---|
| `categorie` | `'Voyage' \| 'Histoire' \| 'Patrimoine' \| 'Tourisme' \| 'Hospitalité' \| 'Opinion' \| 'Portraits' \| 'Carnets de route'` | P |
| `imageId` | `string \| null` | P |
| `tagIds` | `string[]` | RG-06 : au moins un tag de type `format` pour publier |
| `aLaUne` | `boolean` | Défaut `false`. Plusieurs articles peuvent l'être ; le site prend le plus récent. |
| `dureeLecture` | `number \| null` | Lecture seule, en minutes, calculée depuis le corps (200 mots par minute) |
| `traductions[l].slug` | `Slug` | P, U par langue (RG-04) |
| `traductions[l].titre` | `string` (1 à 200) | P |
| `traductions[l].extrait` | `string` (1 à 400) | P |
| `traductions[l].corps` | `CorpsRiche \| null` | P |
| `traductions[l].seoTitre` | `string \| null` (≤ 70) | O |
| `traductions[l].seoDescription` | `string \| null` (≤ 160) | O |

Tris : `modifieLe`, `publieLe`, `titre`. Filtres : `categorie`, `aLaUne`.
Les **articles liés** (RG-07) sont calculés par la face publique ; ils ne se saisissent pas.

**`CorpsRiche`** : document Tiptap (ProseMirror) en JSON, validé par **liste blanche** :

| Nœuds | Marques |
|---|---|
| `doc`, `paragraph`, `text`, `heading` (`level` 2, 3 ou 4), `bulletList`, `orderedList`, `listItem`, `blockquote`, `hardBreak`, `image`, `horizontalRule` | `bold`, `italic`, `link` |

- **`image`** : attributs `{ mediaId: string }` uniquement. L'URL est résolue à la lecture, et `GET /medias/:id/usages` retrouve l'image dans le corps.
- **`link`** : attributs `{ href: string }`. Seuls `https:`, `http:` et `mailto:`, ou une adresse relative commençant par `/`, sont acceptés.
- Tout autre nœud, marque ou attribut → `422 VALIDATION`.

### 9.2 `episodes` — films de la série X'PLORE
| Champ | Type | Règle |
|---|---|---|
| `numero` | `string` (ex. `"01"`) | P, U |
| `imageId` | `string \| null` | P |
| `illustrationIds` | `string[]` (max 12, ordre conservé) | O ; **1.6.0** — plusieurs images complémentaires, médias de la médiathèque |
| `guideMediaId` | `string \| null` | O ; un média PDF |
| `destinationId` | `string \| null` | O |
| `trailerUrl` | `string \| null` | O ; `https:` |
| `dureeMinutes` | `number \| null` | C |
| `tagIds` | `string[]` | O |
| `traductions[l].slug` | `Slug` | P, U |
| `traductions[l].titre` | `string` | P |
| `traductions[l].lieu` | `string` | P |
| `traductions[l].pitch` | `string` (≤ 300) | P (résumé) |
| `traductions[l].synopsisLong` | `string \| null` | C |
| `traductions[l].noteIntention` | `string \| null` | C |
| `traductions[l].personnages` | `string \| null` | C |
| `traductions[l].makingOf` | `string \| null` | C |
| `traductions[l].presse` | `string \| null` | C |
| `traductions[l].credits` | `string \| null` | C |

Tris : `numero`, `modifieLe`. Source : type `Episode` du site et PA:219-227.

### 9.3 `projets` — page « Histoires »
| Champ | Type | Règle |
|---|---|---|
| `format` | `'Documentaire' \| 'Série' \| 'Émission' \| 'Archive'` | P |
| `avancement` | `'disponible' \| 'en_production' \| 'en_preparation'` | P. **Distinct du statut éditorial** : c'est l'état de production du film. |
| `annee` | `DatePartielle \| null` | C |
| `imageId` | `string \| null` | P, **sauf** si `avancement = 'en_preparation'` |
| `cible` | `CibleInterne \| null` | O ; remplace l'adresse libre `route` du site |
| `tagIds` | `string[]` | O (pays, thème) |
| `ordre` | `number` | Ordonnable |
| `traductions[l].slug` | `Slug` | P, U |
| `traductions[l].titre` | `string` | P |
| `traductions[l].accroche` | `string` (≤ 300) | P |

`cible` désigne un contenu ou une page fixe **existants** : un projet ne peut plus pointer vers une
page inexistante (actions § 4). À la publication, si la cible est un contenu non publié →
`422 RG-03` sur `cible`.

L'indicateur `aFournir` du site n'est pas stocké : c'est `champsAFournir` (A-15).

Tris : `ordre`, `titre`, `modifieLe` (v1.2.0).

### 9.4 `villes` — Taste & Travel
| Champ | Type | Règle |
|---|---|---|
| `imageId` | `string \| null` | P |
| `tagIds` | `string[]` | O |
| `ordre` | `number` | Ordonnable |
| `traductions[l].nom` | `string` | P |
| `traductions[l].intention` | `string` (≤ 300) | P |

Pas de slug : les villes ne sont pas des pages. Source : `TravelCity`. Tris : `ordre`, `titre`,
`modifieLe` (v1.2.0). Depuis la **1.15.0**, une ville appartient à un projet par `projet.escaleIds`
(§ 32.2) : aucun champ n'est ajouté à la ville.

### 9.5 `destinations` — étapes de la carte X'PLORE
| Champ | Type | Règle |
|---|---|---|
| `latitude` | `number \| null` (−90 à 90, degrés signés) | P ; vide en brouillon (v1.2.0) |
| `longitude` | `number \| null` (−180 à 180, **négative à l'ouest**) | P ; vide en brouillon (v1.2.0) |
| `episodeId` | `string \| null` | O |
| `guideMediaId` | `string \| null` | O |
| `imageId` | `string \| null` | O |
| `tagIds` | `string[]` | P : au moins un tag `pays` |
| `traductions[l].slug` | `Slug` | P, U |
| `traductions[l].nom` | `string` | P |
| `traductions[l].texte` | `string \| null` | C |

Contrôle `COORDONNEES_HORS_PAYS` : si le tag pays est la Côte d'Ivoire (tag `pays` de code `cote-d-ivoire`, v1.2.0), la latitude doit être comprise
entre 4,2 et 10,8 et la longitude entre −8,7 et −2,4. *Motif : l'erreur de signe passée sur Adiaké
(actions § 7).* Depuis la **1.15.0**, une destination appartient à un projet via son épisode
(`episodeId` → `episodes.projetId`, § 32.2) : aucun champ n'est ajouté à la destination.

### 9.6 `archive` — Archive d'Afrique
| Champ | Type | Règle |
|---|---|---|
| `categorie` | `string` (≤ 60) | P |
| `projetId` | `uuid \| null` | O ; **1.15.0** — rattachement à un projet (§ 32.2) ; vide = entrée globale |
| `fiabilite` | `'documentee' \| 'memoire_orale' \| 'interpretation' \| null` | P, C |
| `epoque` | `string \| null` | C |
| `imageId` | `string \| null` | O |
| `tagIds` | `string[]` | O (pays) |
| `sources` | `{ libelle: string; url: string \| null; type: 'ecrite' \| 'orale' \| 'iconographique' \| 'autre' }[]` | P : **au moins une** (règle du CDC) ; C |
| `traductions[l].slug` | `Slug` | P, U |
| `traductions[l].titre` | `string` | P |
| `traductions[l].texte` | `string \| null` | P |

### 9.7 `distinctions` — distinctions et fonctions officielles
| Champ | Type | Règle |
|---|---|---|
| `nature` | `'distinction' \| 'fonction_officielle'` | P |
| `annee` | `DatePartielle \| null` | P (source et date obligatoires, PA:370) ; vide en brouillon (v1.3.0) |
| `organisme` | `string \| null` | C |
| `lien` | `string \| null` (`https:`) | C |
| `imageId` | `string \| null` | O |
| `ordre` | `number` | Ordonnable |
| `traductions[l].titre` | `string` | P |
| `traductions[l].description` | `string \| null` | C |

### 9.8 `presse` — parutions
| Champ | Type | Règle |
|---|---|---|
| `source` | `string` | P |
| `datePublication` | `DatePartielle \| null` | P ; vide en brouillon (v1.3.0) |
| `lien` | `string \| null` (`https:`) | P (« lien source obligatoire », actions § 10) ; vide en brouillon (v1.3.0) |
| `avatarId` | `string \| null` | O ; logo ou visuel du média |
| `aLaUne` | `boolean` | Une seule parution peut l'être : en passer une à `true` remet les autres à `false`. Remplace `GALLERY_QUOTE`. |
| `ordre` | `number` | Ordonnable (bande défilante) |
| `traductions[l].titre` | `string` | P |
| `traductions[l].resume` | `string \| null` | O |
| `traductions[l].citation` | `string \| null` | O ; utilisée quand `aLaUne` est vrai |

### 9.9 `galerie` — images éditoriales
| Champ | Type | Règle |
|---|---|---|
| `emplacement` | `'accueil' \| 'boutique'` | P. Accueil : `GALLERY` ; boutique : `GALERIE_SHOP` |
| `mediaId` | `string` | P |
| `cible` | `CibleInterne \| null` | O (accueil) |
| `lienExterne` | `string \| null` | O ; exclusif avec `cible` |
| `ratio` | `'1/1' \| '4/3' \| '3/2' \| '16/9' \| '4/5' \| '3/4'` | P |
| `parallaxe` | `number` (0 à 20) \| `null` | O ; amplitude, en pourcentage |
| `ordre` | `number` | Ordonnable, par emplacement |
| `traductions[l].etiquette` | `string \| null` | O |
| `traductions[l].titre` | `string \| null` | O ; P si `emplacement = 'boutique'` |
| `traductions[l].legende` | `string \| null` | O |

Filtre : `emplacement`. *Une image de galerie est un contenu ; le fichier vit dans `medias`.*

### 9.10 `univers` — six piliers de l'accueil
Champs : `numero` (`string`, P) ; `cible` (`CibleInterne | null`, P ; vide en brouillon, v1.3.0) ; `ordre` ; `traductions[l].nom` (P) ;
`traductions[l].pitch` (P).

### 9.11 `jalons` — parcours « À propos »
Champs : `periode` (`string`, P, ex. `"2014-2016"`) ; `ordre` ; `traductions[l].titre` (P) ;
`traductions[l].description` (C).

### 9.12 `offres` — offres de collaboration
Champs : `ordre` ; `traductions[l].titre` (P) ; `traductions[l].texte` (P, C). Aucun tarif n'est
stocké (PA:374).

### 9.13 `etudes-cas` — études de cas (lot 3)
| Champ | Type | Règle |
|---|---|---|
| `offreId` | `string \| null` | O |
| `imageId` | `string \| null` | P |
| `galerieMediaIds` | `string[]` | O |
| `ordre` | `number` | Ordonnable |
| `traductions[l].slug` | `Slug` | P, U |
| `traductions[l].titre` | `string` | P |
| `traductions[l].client` | `string \| null` | C |
| `traductions[l].challenge`, `.idee`, `.execution`, `.contenus`, `.diffusion`, `.resultats`, `.temoignage` | `string \| null` | P : `challenge`, `idee`, `resultats` ; C : les autres |

Source : `ETAPES_CAS` (`src/data/offres.ts`) ; la section « Galerie » correspond à `galerieMediaIds`.

### 9.14 `partenaires` — logos des collaborations (lot 3)
Champs : `logoId` (`string \| null`, P) ; `lien` (`string \| null`, O) ; `ordre` ;
`traductions[l].nom` (P). Source : `Partenaire` (`src/data/collaborations.ts`).

### 9.15 `pages` — textes des pages fixes
Ensemble **fermé** : pas de `POST` ni de `DELETE`. Une page par clé, créée par les données de départ.

```ts
type ClePage = 'accueil' | 'a-propos' | 'histoires' | 'xplore' | 'taste-and-travel' | 'boutique'
             | 'journal' | 'presse' | 'contact' | 'archive-afrique' | 'newsletter'
```

| Champ | Type | Règle |
|---|---|---|
| `cle` | `ClePage` | Lecture seule |
| `imageId` | `string \| null` | O (image de partage) |
| `traductions[l].titre` | `string` | P |
| `traductions[l].chapo` | `string \| null` | O |
| `traductions[l].seoTitre` | `string \| null` (≤ 70) | P |
| `traductions[l].seoDescription` | `string \| null` (≤ 160) | P |
| `traductions[l].blocs` | `Record<string, string>` | O ; textes de la page par clé de bloc (ex. `travel.partenaires`) |

Les **clés de bloc** autorisées par page sont déclarées par les données de départ, à partir des textes
écrits dans les composants du site (inventaire : actions § 2). Une clé inconnue → `422 VALIDATION`.
Tant que l'inventaire n'est pas fourni, aucune clé n'est déclarée : `blocs` vaut `{}` (v1.3.0).

### 9.16 `pages-legales`
Ensemble fermé : `mentions-legales`, `confidentialite`, `cookies`, `cgv`, `retours`, `cgu` (1.7.0).

Champs :
- `cle` (lecture seule) ;
- `traductions[l].titre` (P) ;
- `traductions[l].resume` (O) ;
- `traductions[l].corps` (`CorpsRiche | null`, P, C).

Le texte est **fourni par le client**, jamais généré. Une page légale n'est indexable sur le site que
`publie`.

### 9.17 `tags`
Pas de cycle de vie. Créés par les admins (A-12).

| Champ | Type | Règle |
|---|---|---|
| `type` | `'pays' \| 'ville' \| 'theme' \| 'annee' \| 'format' \| 'projet'` | Obligatoire, non modifiable |
| `code` | `Slug` | Obligatoire, U par type |
| `traductions[l].libelle` | `string` | Obligatoire en français |
| `version` | `number` | — |
| `usages` | `number` | Lecture seule |

Routes : gabarit, sans transition. Filtre : `type`. `DELETE` d'un tag utilisé →
`422 RG-08`, avec les usages. `GET /tags/:id/usages` → `Usage[]` (§ 11).

---

## 10. Boutique

### 10.1 `categories`
Pas de cycle de vie ; huit catégories créées par les données de départ (CDC).

| Champ | Type | Règle |
|---|---|---|
| `ordre` | `number` | Ordonnable |
| `visible` | `boolean` | Défaut `true` |
| `nombreBijouxPublies` | `number` | Lecture seule. À `0`, la catégorie est masquée sur le site (RG-09) |
| `traductions[l].slug` | `Slug` | Obligatoire, U |
| `traductions[l].nom` | `string` | Obligatoire |
| `version` | `number` | — |

`DELETE` d'une catégorie qui contient des bijoux → `422 RG-09`.

### 10.2 `createurs`

*Décision X-05.* Le créateur a **deux états distincts** :

| | `statut` (cycle de vie, § 7) | `actif` |
|---|---|---|
| Ce qu'il dit | Visibilité de la **page publique** du créateur | Capacité **opérationnelle** du créateur |
| Effet | La page `…/createurs/:slug` existe sur le site si `publie` | Inactif : aucun nouveau bijou ne peut lui être rattaché, ses bijoux sont dépubliés (RG-27), ses comptes vendeurs sont révoqués |

| Champ | Type | Règle |
|---|---|---|
| `slug` | `Slug` | Obligatoire, U global (un seul slug, nom propre non traduit). Généré depuis `nom`. **Figé dès la première publication** : `422 SLUG_FIGE` |
| `nom` | `string` | P |
| `pays` | `string \| null` | C |
| `ville` | `string \| null` | C |
| `photoId` | `string \| null` | O |
| `estPrincipal` | `boolean` | Lecture seule. Un seul `true` (RG-21), créé par les données de départ |
| `actif` | `boolean` | Défaut `true` pour le principal, `false` pour tout autre tant que `multiVendeurs` est faux |
| `tauxCommission` | `number \| null` (0 à 100) | Lecture seule tant que `multiVendeurs` est faux ; jamais prérempli |
| `nombreBijoux` | `number` | Lecture seule |
| `traductions[l].bio` | `string` | P |
| `traductions[l].accroche` | `string \| null` | O |

Règles :
- **RG-21** : le principal ne peut être ni supprimé, ni désactivé (`actif: false`), ni archivé → `422 RG-21`.
- **RG-27** : `DELETE` d'un créateur qui possède des bijoux → `422 RG-27`. La désactivation est un `PATCH { actif: false, version }`. Elle dépublie ses bijoux (`publie → brouillon`, journalisé) et déclenche une reconstruction.
- `actif: true` sur un créateur non principal alors que `multiVendeurs` est faux → `422 MULTI_VENDEURS_INACTIF`.

Routes supplémentaires :
- `GET /createurs/principal` → `200` objet complet.
- Filtre de liste : `actif`.

### 10.3 `bijoux` et variantes

*Décision A-02.*

**Principe.** Un bijou est une **pièce** : il porte son récit et ses caractéristiques. Une **variante** est
l'**unité qu'on demande ou qu'on achète** : elle porte la référence, la matière, la taille, le prix et la
disponibilité. Tout bijou a **au moins une variante**, dans tous les modes de la boutique (RG-10).

Une pièce unique a une seule variante. Une pièce déclinée en plusieurs matières ou tailles a une
variante par déclinaison. Le passage à la vente en ligne n'impose aucune migration de données : il
rend seulement obligatoires `prix` et `stock`.

**Champs du bijou**

| Champ | Type | Règle |
|---|---|---|
| `numero` | `string` (ex. `"01"`) | P, U |
| `categorieId` | `string` | P |
| `createurId` | `string` | Obligatoire (RG-20), défaut : créateur principal ; doit être `actif` |
| `imageId` | `string \| null` | P |
| `galerieMediaIds` | `string[]` | O ; ordonnée ; 5 à 8 images attendues par le CDC, signalées en C si moins de 5 |
| `tagIds` | `string[]` | O |
| `visible` | `boolean` | Défaut `true`. Masqué : publié mais retiré des listes et filtres |
| `prixConfirme` | `boolean` | Défaut `false`. **Admin seulement**. Passer à `true` exige qu'**au moins une** variante ait un `prix` (`422 RG-10` sur `prixConfirme`) |
| `edition` | `{ numero: number; total: number } \| null` | C ; `numero` ≤ `total` |
| `atelier` | `string \| null` | C |
| `village` | `string \| null` | C |
| `poids` | `number \| null` (grammes) | C |
| `variantes` | `Variante[]` | Lecture : toutes les variantes, triées par `ordre`. Écriture : routes dédiées ci-dessous |
| `matieres`, `tailles` | `string[]` | **Lecture seule**, déduites des variantes (valeurs distinctes non vides), pour l'affichage et les filtres |
| `traductions[l].slug` | `Slug` | P, U |
| `traductions[l].nom` | `string` | P |
| `traductions[l].culture` | `string \| null` | P, C ; origine du symbole, distincte de la catégorie |
| `traductions[l].histoire` | `string` (≤ 600) | P ; résumé et « histoire derrière l'objet » |

**Variante**

```ts
interface Variante {
  id: string
  reference: string            // U globale ; générée « {numero}-{ordre} » si absente, modifiable
  matiere: string | null       // C
  taille: string | null
  prix: number | null          // FCFA ; C ; obligatoire si boutiqueEnLigne
  ancienPrix: number | null    // seulement si prix renseigné et ancienPrix > prix ; sinon 422 VALIDATION
  stock: number | null         // ≥ 0 ; null = non suivi ; obligatoire si boutiqueEnLigne
  disponible: boolean          // défaut true ; en mode « sur demande », retire la variante des demandes
  ordre: number
  version: number
}
```

**Routes des variantes**

| Méthode et route | Corps | Réponse |
|---|---|---|
| `POST /bijoux/:id/variantes` | `Omit<Variante, 'id' \| 'version'>` (`reference` facultative) | `201 Variante` |
| `PATCH /bijoux/:id/variantes/:varianteId` | `Partial<…> & { version }` | `200 Variante` |
| `DELETE /bijoux/:id/variantes/:varianteId?version=N` | — | `204` ; la **dernière** variante → `422 RG-10` ; une variante citée par une demande → `422 RG-11` |
| `PATCH /bijoux/:id/variantes/ordre` | `{ ids }` | `200` |

**Création d'un bijou.** `POST /bijoux` accepte un champ `variantes: Omit<Variante, 'id' | 'version'>[]`
facultatif. S'il est absent ou vide, le serveur crée **une** variante par défaut, sans matière, sans taille,
sans prix et sans stock.

**Affichage du prix (règle publique, rappelée pour l'aperçu).** Le prix d'une variante n'est visible que si
`bijou.prixConfirme` est vrai **et** que `variante.prix` est renseigné ; sinon le site affiche « sur
demande ». Avec plusieurs variantes de prix différents, le site affiche « à partir de » le plus bas.

**`boutiqueEnLigne` vrai (phase 7).** Chaque variante doit avoir `prix` et `stock` pour que le bijou se publie
(`422 RG-10`).

Filtres de liste : `categorie`, `createur` (masqué dans l'admin tant que `multiVendeurs` est faux),
`visible`, `prixConfirme`. Tris : `numero`, `modifieLe`.

---

## 11. Médias

### 11.1 Type

```ts
interface Media {
  id: string
  url: string                                   // lecture seule, R2_PUBLIC_BASE_URL + clé
  mime: string
  largeur: number | null
  hauteur: number | null
  poids: number                                 // octets
  credit: string | null                         // C
  decoratif: boolean                            // vrai = texte alternatif vide autorisé
  emplacement: string | null                    // 1.6.0 — nom de l'endroit sur le site (« Galerie — hommes ») ; NULL tant que non renseigné
  createurId: string                            // défaut : créateur principal
  usages: number                                // lecture seule
  declinaisons: { largeur: number; url: string }[]   // lecture seule ; WebP 480, 960, 1600, 2400
  traductions: Traductions<{ texteAlt: string; legende: string | null }>
  champsAFournir: string[]                      // texteAlt par langue active (sauf décoratif), crédit
  creeLe: string
  creePar: CompteResume | null
  version: number
}

interface Usage {
  ressource: string           // 'articles', 'bijoux', 'createurs', 'galerie'…
  id: string
  titre: string
  champ: string               // 'imageId', 'galerieMediaIds', 'traductions.fr.corps'…
  statut: StatutContenu | null
}
```

### 11.2 Routes

| Méthode et route | Notes |
|---|---|
| `POST /medias` | `multipart/form-data`, **un** fichier (champ `fichier`) et des champs facultatifs : `texteAltFr`, `texteAltEn`, `credit`, `decoratif`, **`emplacement` (1.6.0)**, `createurId`. → `201 Media`. Type réel contrôlé par le contenu : JPEG, PNG, WebP, AVIF, GIF, SVG nettoyé, PDF. Limites par défaut : 10 Mo pour une image, 25 Mo pour un PDF, paramétrables côté serveur. → `422 FICHIER_REFUSE`. Le nom d'origine du fichier n'est jamais utilisé. |
| `GET /medias` | Filtres : `q` (texte alternatif, légende, crédit), **`emplacement` (1.6.0, sous-chaîne insensible à la casse)**, `mime` (`image` ou `pdf`), `createur`, `aFournir`, `nonUtilise=true`. Tri : `-creeLe` par défaut. Items : `Media`. |
| `GET /medias/:id` | — |
| `PATCH /medias/:id` | `traductions`, `credit`, `decoratif`, **`emplacement` (1.6.0)**, `createurId`, avec `version`. Le fichier se remplace avec la route dédiée ci-dessous (1.19.0). |
| `POST /medias/:id/remplacer` | **1.19.0, § 36.** `multipart/form-data` : un fichier (champ `fichier`) et `version` (entier). Même `id`, mêmes textes/crédit/emplacement/décoratif/créateur ; nouveau binaire et nouvelles déclinaisons, `version + 1`. → `200 Media`. `404` si introuvable, `409 VERSION_PERIMEE`, `422 FICHIER_REFUSE`. |
| `GET /medias/:id/usages` | `200 Usage[]`. Couvre les images principales, galeries, corps riches (`mediaId`), photo de créateur, avatar de presse, guides PDF, logos. |
| `DELETE /medias/:id?version=N` | `204` ; utilisé → `422 RG-08` avec `details.usages`. Fichiers retirés du stockage après un délai de grâce de 24 h. |

### 11.3 Règles
- Un média s'envoie **sans** texte alternatif ni crédit (E-05). Il apparaît alors « à fournir ».
- Un contenu ne se publie pas tant qu'un média qu'il utilise n'a pas de texte alternatif dans chaque langue active (sauf `decoratif`) et de crédit (RG-03, RG-08). L'admin incite à saisir le texte alternatif dès l'envoi.
- Le recadrage n'existe pas dans cette version ; le cadrage d'affichage passe par `ratio` (galerie). Voir § 20.

---

## 12. Audience

### 12.1 `messages` — contact et collaboration
Pas de cycle de vie éditorial ; un `statut` de traitement.

| Champ | Type | Règle |
|---|---|---|
| `type` | `'contact' \| 'collaboration'` | Lecture seule |
| `nom` | `string \| null` | Lecture seule (contact) |
| `email` | `string` | Lecture seule |
| `motif` | `string \| null` | Lecture seule ; intitulé du motif de contact au moment de l'envoi |
| `message` | `string` | Lecture seule |
| `entreprise`, `pays`, `typeCollaboration`, `calendrier`, `budget` | `string \| null` | Lecture seule ; `collaboration` seulement. `typeCollaboration` = intitulé de l'offre au moment de l'envoi |
| `statut` | `'non_lu' \| 'lu' \| 'traite' \| 'archive'` | Modifiable par `PATCH` |
| `noteInterne` | `string \| null` | Modifiable ; jamais publique |
| `creeLe` | `string` | — |
| `purgeLe` | `string` | Lecture seule ; date de purge automatique (RG-14) |
| `version` | `number` | — |

Routes :
- `GET /messages` : filtres `type`, `statut`, `q` ; tri `-creeLe`.
- `GET /messages/:id`.
- `PATCH /messages/:id` : seulement `statut`, `noteInterne`, `version`. L'admin passe un message à `lu` quand il l'ouvre.
- `DELETE /messages/:id?version=N` : admin ; journalisé.

La **réponse** au visiteur passe par la messagerie de l'équipe (lien `mailto:` dans l'admin) ; l'API
n'envoie pas de réponse dans cette version.

### 12.2 `demandes` — demandes de pièce
| Champ | Type | Règle |
|---|---|---|
| `lignes` | `{ varianteId: string; bijouId: string; libelle: string }[]` | Lecture seule ; au moins une (RG-11). `libelle` = nom de la pièce et référence au moment de l'envoi |
| `nom` | `string` | Lecture seule |
| `email` | `string` | Lecture seule |
| `message` | `string \| null` | Lecture seule |
| `statut` | `'nouvelle' \| 'en_cours' \| 'conclue' \| 'annulee'` | Modifiable ; ne revient jamais en arrière (analyse § 9) : `nouvelle → en_cours → conclue`, ou `→ annulee` depuis `nouvelle` ou `en_cours` ; sinon `422 TRANSITION_INTERDITE` |
| `noteInterne` | `string \| null` | Modifiable |
| `creeLe` | `string` | — |
| `version` | `number` | — |

Routes :
- `GET /demandes` : filtres `statut`, `createur`, `q`.
- `GET /demandes/:id`.
- `PATCH /demandes/:id` : `statut`, `noteInterne`, `version`.

Aucune action sur le stock (RG-11). Pas de suppression : une demande se clôt (`annulee`).

### 12.3 `abonnes` — newsletter
| Champ | Type | Règle |
|---|---|---|
| `email` | `string` | Lecture seule, U |
| `prenom` | `string \| null` | Lecture seule |
| `pays` | `string \| null` | Lecture seule |
| `langue` | `Langue` | Lecture seule |
| `statut` | `'en_attente' \| 'actif' \| 'desabonne'` | Lecture seule (RG-12) |
| `confirmeLe` | `string \| null` | Lecture seule |
| `consentements` | `{ finalite: string; texte: string; version: string; source: string; accepteLe: string }[]` | Lecture seule (RG-13) |
| `creeLe` | `string` | — |

Routes :
- `GET /abonnes` : filtres `statut`, `q`.
- `GET /abonnes/:id`.
- `GET /abonnes/export` : `text/csv; charset=utf-8`, colonnes `email;prenom;pays;langue;statut;confirmeLe;consentementAccepteLe;consentementVersion`. Mêmes filtres. Journalisé.
- `DELETE /abonnes/:id` : l'e-mail est effacé, pas masqué. Journalisé.

Les **segments** (culture, voyage, films, shop, professionnels) ne sont pas exposés dans cette version
(CDC : « segmentation future »).

---

## 13. Réglages

Ressources **singletons** sans cycle de vie : `GET` pour lire, `PATCH` avec `version` pour modifier.
Toute modification déclenche une reconstruction du site (PB:720) et est journalisée.

### 13.1 `identite` — `GET /identite`, `PATCH /identite`
Source : `SiteInfo` (`src/types/index.ts`).

| Champ | Type | Règle |
|---|---|---|
| `nom` | `string` | Obligatoire |
| `email` | `string` | Obligatoire ; adresse publique de contact |
| `linkedin` | `string \| null` | O |
| `localisation` | `string \| null` | O |
| `heroImageId` | `string \| null` | O ; les largeurs servies viennent des déclinaisons |
| `stats` | `{ cle: 'communaute' \| 'pays' \| 'distinctions' \| 'experience' \| 'portee'; valeur: number \| null; suffixe: string \| null; dateValidation: string \| null; source: string \| null; ordre: number; traductions: Traductions<{ libelle: string }> }[]` | Les cinq chiffres clés du CDC. `valeur` et `dateValidation` en C : un chiffre sans date s'affiche « à fournir » |
| `indicateursAudience` | `Traductions<{ geographies: string \| null; profils: string \| null; impressions: string \| null; engagement: string \| null }>` | C ; remplace `AUDIENCE_PROFILS` |
| `traductions[l].role` | `string` | Obligatoire en FR |
| `traductions[l].signature` | `string` | Obligatoire en FR ; **protégé** |
| `traductions[l].manifeste` | `string` | Obligatoire en FR ; **protégé** |
| `traductions[l].tagline` | `string[]` (3) | O |
| `traductions[l].devise` | `string \| null` | O |
| `traductions[l].mission` | `string \| null` | O |
| `traductions[l].bio` | `string[]` | O ; paragraphes |
| `traductions[l].linkedinLabel` | `string \| null` | O |
| `champsAFournir` | `string[]` | Lecture seule |

**Signature et manifeste.** Un `PATCH` qui change `signature` ou `manifeste` dans une langue exige
`confirmeModificationHero: true`, sinon `422 VALIDATION` sur ce champ. La modification est journalisée
avec l'avant et l'après.

### 13.2 `audience` — chiffres par plateforme
Ressource de liste, sans cycle de vie, ordonnable : `GET /audience`, `POST /audience`,
`PATCH /audience/:id`, `DELETE /audience/:id`, `PATCH /audience/ordre`.

| Champ | Type | Règle |
|---|---|---|
| `plateforme` | `string` | Obligatoire (« Instagram », « Toutes plateformes »…) |
| `taille` | `number \| null` | C ; abonnés |
| `portee` | `number \| null` | C ; portée mensuelle |
| `dateValidation` | `string \| null` | C ; un chiffre sans date n'est pas affiché comme validé |
| `source` | `string \| null` | C |
| `ordre` | `number` | — |
| `version` | `number` | — |

### 13.3 `parametres` — `GET /parametres`, `PATCH /parametres`

| Champ | Type | Qui modifie | Défaut |
|---|---|---|---|
| `languesActives` | `Langue[]` (contient toujours `fr`) | admin | `["fr"]` |
| `destinataires` | `{ contact: string[]; collaboration: string[]; demandes: string[] }` | admin | e-mail de l'identité |
| `conservationMessagesMois` | `number` (1 à 120) | admin | 24 (à faire valider, RG-14) |
| `purgeAbonnesNonConfirmesJours` | `number` (1 à 90) | admin | 7 (à faire valider) |
| `regroupementPublicationSecondes` | `number` (0 à 3600) | super-admin | 60 |
| `boutiqueEnLigne` | `boolean` | super-admin, avec `confirmationEmail` | `false` |
| `multiVendeurs` | `boolean` | super-admin, avec `confirmationEmail` | `false` |

- `confirmationEmail` : l'e-mail **du compte qui agit**, retapé. Absent ou faux → `422 VALIDATION`.
- Activer `multiVendeurs` : refusé tant qu'un bijou n'a pas de créateur. Le désactiver : refusé tant qu'un compte vendeur actif existe (`422 MULTI_VENDEURS_INACTIF`).
- Activer `boutiqueEnLigne` : refusé dans cette version (`422 VALIDATION`, « vente en ligne non disponible ») tant que la phase 7 n'est pas livrée (§ 17).

### 13.4 `navigation` — `GET /navigation`, `PATCH /navigation`
Source : `src/data/navigation.ts`. Document unique remplacé en entier à chaque `PATCH`.

```ts
interface EntreeNavigation {
  id: string
  libelle: Traductions<string>        // fr obligatoire
  degre: Traductions<string> | null    // ligne d'appoint
  cible: CibleInterne
  enfants: EntreeNavigation[]          // un seul niveau
}
interface Navigation {
  principale: EntreeNavigation[]
  ctaPrincipal: { libelle: Traductions<string>; cible: CibleInterne }
  piedDePage: { titre: Traductions<string>; liens: EntreeNavigation[] }[]
  entrees404: EntreeNavigation[]
  version: number
}
```

### 13.5 `textes-interface` — dictionnaire FR / EN
Source : `src/i18n/dictionnaire.ts`.

| Route | Effet |
|---|---|
| `GET /textes-interface` | `200 { valeurs: Record<string, Traductions<string>>, clesManquantes: { fr: string[]; en: string[] }, version }` |
| `PATCH /textes-interface` | `{ valeurs: Record<string, Traductions<string>>, version }` ; ne modifie que les clés fournies. Une clé inconnue → `422 VALIDATION`. Les clés sont fixées par les données de départ. |

### 13.6 `motifs-contact` (lot 3)
Ressource de liste, ordonnable, sans cycle de vie. Champs : `ordre` ; `traductions[l].titre`
(obligatoire en FR) ; `traductions[l].description`. Source : `CONTACT_MOTIFS`.

---

## 14. Publication du site, versions, restauration

### 14.1 Publication

```ts
interface Publication {
  id: string
  motif: 'publication' | 'depublication' | 'programmee' | 'manuelle' | 'reglage' | 'restauration'
  etat: 'en_attente' | 'en_cours' | 'reussie' | 'echec'
  demandeePar: CompteResume | null      // null pour le système
  declencheeLe: string
  termineeLe: string | null
  messageErreur: string | null           // 'DELAI_DEPASSE' après 15 min sans retour
  buildId: string | null                 // publications regroupées dans un même build
  objet: { ressource: string; id: string; titre: string } | null
}
```

| Route | Effet | Qui |
|---|---|---|
| `POST /site/reconstruire` | `202 Publication` (motif `manuelle`) | admin |
| `GET /site/etat-reconstruction` | `200 Publication \| null` (la plus récente) | éditeur et plus |
| `GET /site/publications` | Liste paginée ; filtres `etat`, `motif` ; tri `-declencheeLe` | admin |
| `GET /site/publications/:id` | Détail, pour le suivi après une transition (`publicationId`) | éditeur et plus |

Une publication en échec n'annule jamais l'écriture : le contenu reste `publie` en base, et le site
n'est simplement pas encore à jour.

### 14.2 Versions et restauration

| Route | Réponse |
|---|---|
| `GET /versions/:ressource/:id` | `200 { version: number; creeLe: string; creePar: CompteResume \| null; action: string }[]`, triée par version décroissante |
| `GET /versions/:ressource/:id/:version` | `200 { version, instantane: unknown }` (forme de l'objet à cette version) |
| `POST /restauration` | Corps `{ ressource, id, version, versionCourante }` → `200` objet complet. Crée une **nouvelle** version (l'historique n'est jamais réécrit), journalise, et déclenche une reconstruction si le contenu est publié. La restauration ne change pas le statut. Admin. |

`ressource` : toute ressource de cycle de vie (§ 7.1), plus `identite`, `navigation`, `textes-interface`,
`parametres`.

---

## 15. Comptes et journal d'audit

### 15.1 `comptes`

| Route | Corps | Notes |
|---|---|---|
| `GET /comptes` | — | Filtres `role`, `actif`. Items : `Compte` |
| `GET /comptes/:id` | — | — |
| `POST /comptes` | `{ email, nom, role }` | `201 Compte`, **sans mot de passe** ; un lien de définition (validité 72 h) part par e-mail. Un admin ne crée que des `editeur` ; `role: 'vendeur'` → `422 MULTI_VENDEURS_INACTIF` tant que `multiVendeurs` est faux |
| `PATCH /comptes/:id` | `{ nom?, role?, actif?, confirmationEmail? }` | Changer `role` exige `confirmationEmail` = e-mail **du compte modifié** (double saisie, RG-16). Garde-fous RG-16 dans la même transaction |
| `POST /comptes/:id/lien-mot-de-passe` | — | `204` ; renvoie un lien de définition et révoque les sessions du compte |

Pas de `DELETE` : un compte se **désactive** (`actif: false`), ce qui révoque ses sessions. Le journal
garde ses actions.

### 15.2 `journal`

```ts
interface EntreeJournal {
  id: string
  compte: CompteResume | null           // null pour le système ou la migration
  action: string                        // 'creation', 'modification', 'transition:publie', 'connexion', 'connexion_refusee', 'export_abonnes'…
  entite: string                        // nom de la ressource
  entiteId: string | null
  avant: unknown | null                 // secrets remplacés par "[masque]"
  apres: unknown | null
  requeteId: string | null
  creeLe: string
}
```

| Route | Notes |
|---|---|
| `GET /journal` | Filtres `compte`, `action`, `entite`, `entiteId`, `du`, `au` ; tri `-creeLe`. Admin |
| `GET /journal/export` | `text/csv` ; mêmes filtres. Super-admin ; l'export est lui-même journalisé |

Le journal est en ajout seul : aucune route ne le modifie ni ne le supprime.

---

## 16. Tableau de bord — `GET /tableau-de-bord`

```ts
interface TableauDeBord {
  aRelire: number                     // contenus en_relecture, toutes ressources
  brouillons: number
  aFournir: number                    // contenus dont champsAFournir n'est pas vide
  messagesNonLus: number              // 0 pour un éditeur
  demandesNouvelles: number           // 0 pour un éditeur
  derniereReconstruction: Publication | null
  dernieresModifications: { ressource: string; id: string; titre: string; modifieLe: string; auteur: CompteResume | null; statut: StatutContenu | null }[]   // 10 dernières
}
```

---

## 17. Fonctions verrouillées

| Interrupteur | Faux (cette version) |
|---|---|
| `multiVendeurs` | Un seul créateur actif, le principal. Aucun compte ni invitation vendeur. Routes `/invitations`, `/auth/invitation/accepter` et `/moi/createur` → `404`. Filtres « créateur » masqués dans l'admin. |
| `boutiqueEnLigne` | Mode « sur demande ». Aucune route de commande, de paiement ou de reversement. Activation refusée (§ 13.3). |

Ces fonctions sont décrites par l'analyse conceptuelle (RG-24 à RG-28, RG-V1 à RG-V3) et par
`PROMPT-ESPACE-VENDEUR-PRINCE-EDJA.md`. Elles feront l'objet d'une version **mineure** de ce contrat
quand elles seront construites.

---

## 18. Annexe : face publique (référence pour le back end et le site)

Préfixe `/public/api/v1`. Aucune session ; limitation de débit et champ piège (`siteWeb`, doit rester
vide) sur les formulaires (RG-15). Un formulaire répond toujours `202` avec le même corps, que l'e-mail
existe déjà ou non.

| Route | Corps | Effet |
|---|---|---|
| `POST /contact` | `{ nom, email, motif?, message, langue, siteWeb }` | Message `type: 'contact'` |
| `POST /collaboration` | `{ entreprise, pays, typeCollaboration, calendrier, budget?, email, message, langue, siteWeb }` | Message `type: 'collaboration'` |
| `POST /newsletter` | `{ email, prenom?, pays?, langue, consentement: { texte, version, source }, siteWeb }` | Abonné `en_attente`, consentement, e-mail de confirmation |
| `GET /newsletter/confirmation?jeton=` | — | Abonné `actif` |
| `GET /newsletter/desinscription?jeton=` | — | Abonné `desabonne` |
| `POST /demandes` | `{ varianteIds: string[] (1 à 20), nom, email, message?, langue, siteWeb }` | Demande `nouvelle` ; une variante inconnue, non publiée ou indisponible → `404` |
| `GET /contenus/{type}?langue=` et `/contenus/{type}/{slug}?langue=` | — | Contenus `publie` avec `publieLe ≤ maintenant` ; jamais un brouillon, une relecture, un archivé, ni un prix dont `prixConfirme` est faux |
| `GET /contenus/{type}?projetId=` (**1.15.0**) | — | Pour `episodes`, `villes`, `destinations`, `archive` : seuls les contenus du projet (§ 32.2) ; liste vide si le projet est inconnu |
| `GET /projets/{slug}/page?langue=` (**1.15.0**) | — | Page complète d'un projet publié : `{ projet, episodes, destinations, villes, entrees, partenaires }`, listes déjà filtrées et images résolues (§ 32.4) |
| `GET /categories?famille=&langue=` | — | Catégories visibles et non vides de la famille (`article`, `projet`, `produit`), avec leur effectif publié |
| `GET /site` | — | Identité, navigation, textes d'interface, pages légales publiées, réglages publics (`languesActives`) |
| `GET /sitemap` | — | Adresses publiables par langue, avec date de modification |

### 18.1 Vue publique des contenus (1.5.0, étendue en 1.6.0)

Ce que renvoient `GET /contenus/{type}` et `GET /contenus/{type}/{slug}` (`type` : `articles`,
`episodes`, `projets`, `villes`, `destinations`, `archive`, `distinctions`, `presse`, `galerie`,
`univers`, `jalons`, `offres`, `etudes-cas`, `partenaires`, `pages`, `pages-legales`) :

- **aucun champ interne** : ni `statut`, `version`, `auteur`, `auteurId`, `champsAFournir`,
  `languesPresentes`, `dernierMotifRefus`, `creeLe` ;
- **images résolues** : chaque média devient `ImagePublique | null` — `imageId` et `mediaId` →
  `image`, `logoId` → `logo`, `avatarId` → `avatar`, `bandeauId` → `bandeau`, `guideMediaId` → `guide`
  (PDF : `declinaisons` vide), `galerieMediaIds` → `galerie: ImagePublique[]` ;
- **une langue** : `?langue=` (défaut `fr`) ; la fiche porte `langue` et `traduction` (celle de la
  langue, sinon `null`) au lieu de `traductions` ; la liste ne garde que les contenus traduits dans
  cette langue ;
- les images citées par un corps riche (nœuds `image`) sont jointes dans
  `mediasCorps: Record<mediaId, ImagePublique>` ;
- **la liste porte des objets complets**, comme la fiche, plus `slug` et `titre` dans la langue : une
  ressource sans slug (distinctions, presse, villes, univers, jalons, offres, partenaires, galerie)
  n'a pas de fiche publique, tout doit venir de sa liste ;
- un projet porte aussi `categorie: { slug, nom } | null` ; un épisode porte `projetId: string | null`
  (cible de liaison, non encore résolue en slug) et, depuis la **1.6.0**, `illustrations:
  ImagePublique[]` — les images complémentaires de la fiche, dans leur ordre (vide si aucune).
  Depuis la **1.15.0**, une entrée d'`archive` porte aussi `projetId: string | null` (§ 32.2).

```ts
interface ImagePublique {
  url: string            // adresse complète (MEDIA_PUBLIC_BASE_URL / Cloudinary) ; jamais écrite par le site
  alt: string            // dans la langue demandée, sinon FR ; vide pour une image décorative
  largeur: number | null
  hauteur: number | null
  declinaisons: { largeur: number; url: string }[]   // pour srcset
}
```

**Articles** (le Journal) : la liste donne `{ id, slug, titre, extrait, categorie, categorieId, image,
aLaUne, dureeLecture, tagIds, publieLe, modifieLe }` dans la langue, les plus récents d'abord ; la
fiche donne l'article complet (corps compris).

Routes publiques servies depuis la 1.4.0 : `GET /categories?famille=&langue=` ; `GET /boutique/produits` et `/boutique/produits/{slug}` (SCHEMAS § 12.2) ; `GET /photos-fixes` (§ 22.4) et `GET /reglages` (`boutiqueEnLigne`, `multiVendeurs`, `languesActives`). Depuis la **1.6.0**, `GET /episodes` porte aussi `illustrations` ; depuis la **1.16.0**, `GET /galeries?emplacement=` sert les galeries de l'accueil et de la boutique (§ 33) ; depuis la **1.20.0**, `GET /site` (identité, § 37.2) et `GET /etiquettes` (§ 37.3). **Pas encore servies** : `GET /sitemap`, créateurs.

---

## 19. Lots de livraison

L'ordre de construction commun aux deux équipes. Un lot n'est « livré » que si le back end le sert et
que l'admin l'utilise, avec les tests des deux côtés.

| Lot | Contenu | Critère de sortie |
|---|---|---|
| **0** | § 2 à 8 : conventions, session, erreurs, droits, types, cycle de vie, gabarit | Connexion, `GET /auth/moi`, une transition refusée et une acceptée, testées sur les trois rôles |
| **1** | `articles`, `medias`, `tags`, `site/*`, `journal`, `tableau-de-bord` | Critère G2 du plan : un éditeur crée un brouillon avec image et traduction, un admin le publie, l'action est au journal, la reconstruction est suivie |
| **2** | `categories`, `createurs`, `bijoux` et variantes, `episodes`, `projets`, `villes`, `destinations` | Bijou avec variante par défaut ; prix « sur demande » ; créateur principal protégé (RG-21) |
| **3** | `distinctions`, `presse`, `archive`, `galerie`, `univers`, `jalons`, `offres`, `pages`, `etudes-cas`, `partenaires` | Archive sans source non publiable ; parution « à la une » unique |
| **4** | `messages`, `demandes`, `abonnes` et face publique des formulaires ; `identite`, `audience`, `parametres`, `navigation`, `textes-interface`, `pages-legales`, `motifs-contact` | Message de test reçu en base et par e-mail ; export CSV ; confirmation du manifeste |
| **5** | `comptes`, `versions`, `restauration` | Parcours super-admin ; restauration journalisée |

---

## 20. Points ouverts

Points **métier** que ce contrat ne tranche pas. Le contrat est conçu pour qu'aucun d'eux ne bloque le
développement : la valeur par défaut est sûre et modifiable sans rupture.

| Réf. | Question | Défaut retenu | Qui valide |
|---|---|---|---|
| M-01 | Activer l'anglais pour les contenus (`languesActives`) | Français seul | Client |
| M-02 | Durées de conservation : messages (24 mois), abonnés non confirmés (7 jours), demandes | Valeurs de PB, paramétrables | Client et juriste |
| M-03 | Projets « en préparation » publiables sans image (comportement actuel du site) | Autorisé (§ 9.3) | Client |
| M-04 | Réponse aux messages depuis l'admin, et non par la messagerie de l'équipe | Non (lien `mailto:`) | Client |
| M-05 | Recadrage et point focal des images | Non (ratio d'affichage seulement) | Client |
| M-06 | Hébergeur du site public et mécanisme de reconstruction (GitHub Pages aujourd'hui, Cloudflare Pages dans PB) ; domaines `admin.` et `api.` | Webhook générique `DEPLOY_HOOK_URL` | Client et projet, avant le lot 5 |
| M-07 | Principe des « quatre yeux » (auteur ≠ publieur) | Non imposé : un admin peut relire et publier son propre contenu | Client |

---

## 21. Journal des versions

| Version | Date | Changement | Validé par |
|---|---|---|---|
| 1.0.0 | 30/10/2026 | Première version : arbitrages A-01 à A-17 et X-05 (voir `admin/docs/DECISIONS.md`) | Responsable technique, au titre de l'admin et du back end (mandat du 30/10/2026) |
| 1.1.0 | 30/10/2026 | `CibleInterne` gagne `{ type: 'page-legale', cle }` : le pied de page du site renvoie vers les cinq pages légales, que les cibles de la 1.0.0 ne pouvaient pas désigner. Relevé par le back end en écrivant les données de départ (étape 2). Mineure : ajout d'une valeur en lecture. | Responsable technique |
| 1.2.0 | 01/11/2026 | Relevé en écrivant l'admin (D-64, D-65) et le back end (B-46) : `destinations.latitude` et `longitude` deviennent `number \| null` (une destination se crée en brouillon avant ses coordonnées, toujours exigées à la publication) ; le tag pays de la Côte d'Ivoire a le code `cote-d-ivoire` ; `projets` et `villes` acceptent `tri=ordre` (et `titre`). Mineure : une valeur ajoutée en lecture, un tri ajouté. | Responsable technique |
| 1.3.0 | 01/11/2026 | Relevé en écrivant le lot 3 (B-48, D-67) : `distinctions.annee`, `presse.datePublication`, `presse.lien` et `univers.cible` acceptent `null` en brouillon, toujours exigés à la publication ; les pages n'ont aucune clé de bloc tant que l'inventaire n'est pas fourni. Mineure : des valeurs ajoutées en lecture. | Responsable technique |
| 1.4.0 | 05/11/2026 | Annexe publique : `GET /categories?famille=&langue=` (catégories visibles et non vides d'une famille). Mineure. | Responsable technique |
| 1.5.0 | 07/11/2026 | § 22 (proposée par l'admin le 06/11) **arrêtée** avec les amendements du § 22.9, écrits en l'implémentant dans le back end (B-61 à B-65) ; § 18.1 : vue publique des contenus (images résolues, aucun champ interne, une langue) et lecture publique des articles. Vérifié par le test de contrat de l'admin contre l'API réelle (39 sur 39). Mineure : ajouts compatibles. | Responsable technique (admin et back end) |
| 1.6.0 | 11/11/2026 | § 23 (demandée par le client le 11/11) **arrêtée** : médias `emplacement` (nom de l'endroit) côté admin ; épisodes `illustrations` (jusqu'à 12 images complémentaires, ordre conservé) exposées dans le payload public et la phase d'admin ; publication d'un épisode liée à un projet. Mineure : ajouts compatibles, aucun champ supprimé, aucun renommage. | Responsable technique (admin et back end) |
| 1.7.0 | 11/11/2026 | § 24 (demandée par le client le 11/11) **arrêtée** : nœud `horizontalRule` accepté par la liste blanche du corps riche (§ 9.1) ; `pages-legales` en 1.6.0 porte `cgu` — l'ensemble fermé passe de cinq à six pages. Mineure : ajouts compatibles, aucun champ supprimé, aucun renommage. | Responsable technique (admin et back end) |
| 1.8.0 | 11/11/2026 | § 25 (demandée par le client le 11/11) **arrêtée** : les résumés de liste d'articles et de projets sont **étendus** — `extrait` (article), `accroche` et `creeLe` (projets). Additifs uniquement, aucun champ renommé ou supprimé ; aucun changement de payload public. | Responsable technique (admin et back end) |
| 1.9.0 | 12/11/2026 | § 26 (demandée par le client le 12/11) **arrêtée** : un projet garde toujours son affiche — `imageId` exigé dès la création, et à toute modification qui laisserait un projet sans affiche. Mineure : aucune route ni payload modifié, lecture publique inchangée. | Responsable technique (admin et back end) |
| 1.10.0 | 14/11/2026 | § 27 (demandée par le client le 14/11) **arrêtée** : les payloads produits publiques (`GET /public/api/v1/boutique/produits` et sa fiche) exposent les UUID des variantes — `varianteIds: z.array(z.uuid())` (≥ 1) en liste et `variantes[].id: z.uuid()` en fiche. Additives uniquement, aucun champ renommé ni supprimé ; raison : permettre au site public d'envoyer les `varianteIds` attendus par `POST /public/api/v1/demandes` (§ 18). | Responsable technique (admin et back end) |
| 1.11.0 | 19/11/2026 | § 28 (demandé par le client le 19/11) **arrêtée** : compteur de visites maison — deux tables (`statistiques_vue`, `statistiques_chemin`), route publique `POST /public/api/v1/analytics/vue`, extension additive du tableau de bord (`visitesTotales`, `visitesAujourdhui`, `visitesCeMois`, `topVues`). Aucun service externe, aucune donnée personnelle. | Responsable technique (admin et back end) |
| 1.12.0 | 19/11/2026 | § 29 (demandé par le client le 19/11) **arrêtée** : l'article ajoute `pdfId` (réf. `media` de type `application/pdf`) ; la publication d'un article exige `imageId` + (corps **ou** PDF) ; vue publique expose `pdf` (forme `imagePublique`, `declinaisons` vide, `largeur`/`hauteur` = `null`). | Responsable technique (admin et back end) |
| 1.13.0 | 19/11/2026 | § 30 (demandé par le client le 19/11) **arrêtée** : la face publique devient normative ; zéro build sur changement de contenu en production ; la page d'un contenu nouvellement publié est servie immédiatement, y compris une URL absente du dernier déploiement ; cache à durée maîtrisée et revalidation, sans invalidation ciblée ni Redis ; le contrat ne couvre pas encore les transactions (version ultérieure). | Responsable technique (admin et back end) |
| 1.14.0 | 20/11/2026 | § 31 (demandé par le client le 20/11) **arrêtée** : parcours d’achat et paiement Wave — commandes, variantes, stock réservé, total calculé serveur, session `POST /v1/checkout/sessions`, webhook signé `checkout.session.completed`, idempotence par identifiant d’événement, remboursement, simulation en dev. Multi-vendeur, comptes clients et livraison restent hors périmètre. | Responsable technique (admin et back end) |
| 1.15.0 | 20/11/2026 | § 32 (demandé par le client le 20/11) **arrêtée** : un projet devient le conteneur de ses contenus — filtrage public par `projetId` pour villes, destinations, épisodes et entrées d’archive ; `archive.projetId` ajouté (facultatif) ; route publique `GET /public/api/v1/projets/{slug}/page` assemblée selon le `template` ; le site rend une page par projet. Aucun champ supprimé ni renommé ; les contenus sans projet restent globaux. | Responsable technique (admin et back end) |
| 1.16.0 | 21/11/2026 | § 33 (demandé par le client le 21/11) **arrêtée** : la galerie de la boutique devient administrable et lisible par l'API publique — `GET /public/api/v1/galeries?emplacement=boutique&langue=` ; le lookbook d'Edja Shop ne dépend plus d'un tableau codé en dur. Aucun champ supprimé ni renommé ; la galerie de l'accueil garde sa route et son comportement. | Responsable technique (admin et back end) |
| 1.17.0 | 21/11/2026 | § 34 (demandé par le client le 21/11) **arrêtée** : la liste des emplacements de photos fixes est réduite aux cinq emplacements que le site rend réellement. `apropos.bandeau`, `contact.bandeau` et `partage.og` sont retirés — aucune page ne les affiche. Routes, champs et droits inchangés (migration 0019). | Responsable technique (admin et back end) |
| 1.18.0 | 21/11/2026 | § 35 (demandé par le client le 21/11) **arrêtée** : l'emplacement du héros est nommé d'après la page qu'il pilote — `journal.bandeau` devient `histoires.bandeau`, libellé « Histoires — bandeau ». Le visuel assigné est conservé (migration 0020). Aucune route ni forme modifiée. | Responsable technique (admin et back end) |
| 1.19.0 | 21/11/2026 | § 36 (demandé par le client le 21/11) **arrêtée** : un média peut voir son **fichier remplacé** sans changer d'identifiant — `POST /medias/:id/remplacer` (multipart `fichier` + `version`). Textes, crédit, emplacement et usages conservés ; nouvelles clés de stockage et déclinaisons, version incrémentée. Lève l'interdiction du § 11.2 et comble l'écart avec ECRANS § 5.1. | Responsable technique (admin et back end) |
| 1.20.0 | 21/11/2026 | § 37 (demandé par le client le 21/11) **arrêtée** : le site public lit enfin l'identité, les étiquettes et les réglages depuis l'API — `GET /public/api/v1/site`, `GET /public/api/v1/etiquettes` et consommation de `/reglages`. L'écran admin `/identite` est ouvert, les écrans `/navigation` et `/textes-interface` réintégrés. Aucune route existante modifiée. | Responsable technique (admin et back end) |
| 1.21.0 | 22/11/2026 | § 38 (demandé par le client le 22/11) **arrêtée** : l'envoi d'un média admin n'exige plus d'`emplacement` — l'absence de champ vaut `null` (« emplacement non précisé »). Règle de la 1.6.0 § 23.1 levée ; filtre, lecture et `PATCH` inchangés. Minior : champ passé facultatif. | Responsable technique (admin et back end) |

---

## 22. Version 1.5.0 — extensions demandées par l'admin (ARRÊTÉE)

> Statut : **arrêtée le 07/11/2026**. Proposée par l'admin le 06/11 (étapes C2 à C7, E1), implémentée
> et amendée par le back end (B-61 à B-65) ; **le § 22.9 prime** sur les § 22.1 à 22.8 là où ils
> diffèrent. Source de vérité des données : SCHEMAS-ENTITES. Tous les ajouts sont **compatibles** :
> champs facultatifs en lecture, champs facultatifs en écriture.

### 22.1 Catégories par famille (SCHEMAS § 3, RG-29 à RG-31)

| Changement | Détail |
|---|---|
| `categories.famille` | `'article' \| 'projet' \| 'produit'`, lecture ; défaut `produit` pour les catégories existantes. Écriture facultative à la création (`POST`), non modifiable ensuite. |
| `GET /categories?famille=` | Filtre par famille. Sans paramètre : toutes. |
| `categories.nombreElements` | Lecture : éléments rattachés tous statuts (articles, projets, bijoux, livres). |
| `PATCH /categories/ordre` | La liste porte toutes les catégories **d'une** famille, et elles seules. |
| `DELETE /categories/:id` | Utilisée → `409 CATEGORIE_UTILISEE`, `details: { nombre }` (remplace `422 RG-09`). |
| Unicité du slug | Par famille et par langue. |
| Nouveau code | `422 CATEGORIE_INCOMPATIBLE` : catégorie d'une autre famille (RG-29). |

### 22.2 Articles, projets, épisodes (SCHEMAS § 4 à § 6)

| Ressource | Ajout |
|---|---|
| `articles` | `categorieId: string \| null` (lecture et écriture facultatives). Le texte `categorie` reste, et accepte le nom d'une catégorie `article` (plus seulement les huit valeurs). Résumé de liste : `categorie` (nom). |
| `projets` | `categorieId: string \| null` (famille `projet`) ; `traductions[l].contenu: CorpsRiche \| null` (présentation). Résumé : `format`, `avancement`, `categorieId`, `categorie` (nom), `nombreEpisodes`. Filtres : `format`, `avancement`, `categorie`. |
| `episodes` | `projetId: string \| null` (RG-32 ; projet inexistant → `422 VALIDATION`). Résumé : `projetId`, `projet` (titre), `destination` (nom). Filtres : `projetId`, `destinationId`. |

### 22.3 Livres (SCHEMAS § 8.3, § 8.4)

`/livres` sur le gabarit § 8 (cycle de vie, versions, `PATCH /ordre` non). Champs : `reference` (U),
`createurId` (défaut : créateur principal), `categorieId` (famille `produit`), `imageId` (couverture),
`galerieMediaIds` (≤ 8), `visible` (défaut `true`), `prixConfirme`, `auteur`, `editeur`, `isbn`,
`anneePublication`, `nombrePages`, `tagIds`, `traductions[l]: { slug, titre, resume }`, et
`variantes: { id?, libelle, reference, prix, ancienPrix, stock, disponible }[]` — **tableau entier
remplacé** à chaque écriture (alternative : routes de variantes comme les bijoux, § 10.3 ; voir
`docs/QUESTIONS.md`). Exigences de publication : titre, résumé, couverture avec texte alternatif,
catégorie, créateur, au moins une variante. Résumé : `numero` (= `reference`), `auteur`, `categorie`,
`prixMin`, `visible`. Filtre : `categorie`. Cloisonnement vendeur identique aux bijoux.

### 22.4 Photos fixes (PROMPT-CORRECTION § 7.3)

`GET /emplacements-photos` → `{ items: { cle, libelle, formatConseille: string | null, mediaId,
media: { id, url, texteAlt } | null, misAJourLe }[] }`. `PUT /emplacements-photos/:cle` avec
`{ mediaId: string | null }` : image seulement, texte alternatif dans chaque langue active (`422 RG-08`),
journalisé, publication déclenchée. Droits : ressource `emplacements-photos`, lecture équipe,
modification admin (et éditeur si le client le décide, E4). Un média assigné ne se supprime pas.

### 22.5 Tableau de bord (ECRANS § 1)

`programmes?: { ressource, id, titre, publieLe }[]` : les cinq prochains contenus publiés à date
future. `messagesNonLus` et `demandesNouvelles` sont comptés pour de vrai.

### 22.6 Erreurs (U13)

Codes ajoutés au § 4.2 : `CATEGORIE_INCOMPATIBLE` (422), `CATEGORIE_UTILISEE` (409). L'admin affiche
le message du serveur ; s'il est vide, celui de `i18n/fr.ts` ; jamais le code.

### 22.7 Ce qui ne change pas encore

`/admin/api/v1/journal` reste appelé tel quel : le renommage en `/activite` (PROMPT-CORRECTION § 8,
308 pendant une version) attend le back end. L'adresse d'**écran** `/journal` de l'admin redirige
déjà vers `/activite`.

### 22.8 Templates de projet (ajout du 06/11/2026, `docs/PROPOSITION-TEMPLATES-PROJETS.md`)

`projets` gagne, tous facultatifs (un projet existant sans ces champs garde son rendu) :
`template: 'film' | 'programme' | 'bibliotheque'` (absent = celui du format : Série et Documentaire →
`film`, Émission → `programme`, Archive → `bibliotheque`) ; `blocsMasques: string[]` (blocs facultatifs
masqués, contenu conservé) ; `bandeauId` (image panoramique 21:9) ; `saison` (texte, template Film) ;
`escaleIds: string[]` (villes, template Programme) ; `partenaireIds: string[]` ;
`traductions[l].citation`, `traductions[l].programme`, `traductions[l].festivals` (textes, `null` si vides).
Résumé de liste : `template`. Filtre : `template`. Exigence de publication du template Programme : au
moins une escale (`escaleIds`). Catégories de projets de départ : Film, Tourisme, Patrimoine.

### 22.9 Amendements à l'implémentation (07/11/2026, B-61 à B-65) — font foi

| § | Proposé | Arrêté |
|---|---|---|
| 22.1 | `DELETE` d'une catégorie utilisée → `409 CATEGORIE_UTILISEE` | Contenant des bijoux : `422 RG-09` (conservé, avec `nombreElements`). Utilisée par des articles, projets ou livres : `409 CATEGORIE_UTILISEE`, `details.nombreElements`. |
| 22.1 | `nombreElements` | Servi : articles, projets, bijoux, livres, tous statuts. `GET /categories?famille=` accepté par la liste d'équipe. Les catégories publiques de produits comptent bijoux **et** livres publiés. |
| 22.2 | Résumé de projet : `format`, `avancement`, `categorieId`, `categorie`, `nombreEpisodes` | Servis : `format`, `avancement`, `categorieId`, `template`. Pas `categorie` (nom) ni `nombreEpisodes` : l'admin les déduit ou affiche « — ». |
| 22.2 | Filtres projets `format`, `avancement`, `categorie` | Servis, plus `template` ; `categorie` porte l'**identifiant**. Épisodes : `projetId`, `destinationId`. Galerie : `emplacement`. Résumé d'épisode : `projetId` seulement. |
| 22.2 | — | Un projet qui a des épisodes ne se supprime pas : `422 RG-32` (`details.nombre`). Toute référence que la base refuse de rompre → `422 VALIDATION`, jamais `500`. |
| 22.3 | Variantes d'un livre : tableau entier **ou** routes dédiées | **Les deux.** `PATCH /livres/:id` accepte `variantes` (au moins une) : avec `id` → modifiée, sans `id` → créée, absente → supprimée (sauf si une demande la cite : `422 RG-11`) ; `reference: null` = générée. Les routes `/livres/:id/variantes` restent. |
| 22.3 | `categorieId` facultatif | **Obligatoire dès la création** (colonne non nulle, comme les bijoux). Un résumé ou un libellé de variante non saisi vaut `null`. |
| 22.4 | — | Conforme. Les cinq emplacements sont semés (1.18.0, §§ 34-35) ; un média assigné ne se supprime pas (`422 RG-08`, usage `emplacements-photos`). |
| 22.5 | `programmes` | Servi : cinq prochains contenus publiés à date future, toutes ressources. |
| 22.8 | `template` absent = celui du format | Le serveur **écrit** le template du format quand il n'est pas fourni (migration 0009 : les projets existants l'ont reçu) ; la lecture le donne toujours. |
| — | Galerie : `mediaId` P | Facultatif en brouillon, exigé à la publication (migration 0010). |
| — | Audience : `dateValidation: DatePartielle` | Colonne passée en texte (migration 0011). |
| — | Pages légales | Ensemble fermé : la création est refusée à tous les rôles (`403`). |
| — | Ressources sans étiquettes (galerie, études de cas, partenaires, pages légales) | `tagIds` accepté seulement vide. |

---

## 23. Version 1.6.0 — extensions demandées par le client (ARRÊTÉE)

> Statut : **arrêtée le 11/11/2026**. Demandée par le client le même jour ; écrites ensemble dans
> les deux dépôts (site `docs/CONTRAT-API.md` et copie `prince-edja-api/docs/contrat/CONTRAT-API.md`,
> identiques octet pour octet). **§ 23.4 est la clause de non-retour** : aucune donnée existante
> supprimée, aucun schéma public cassé.

### 23.1 Médias — `emplacement` (admin uniquement)

- Nouveau champ sur la ressource média : `emplacement: string | null` — le **nom de l'endroit** où le
  média est destiné à apparaître sur le site public (« Galerie — hommes », « À propos — bandeau »,
  « Boutique — hero »…). Texte libre ; la liste proposée par l'admin n'est qu'une aide de saisie.
- **Obligatoire à l'envoi** (`multipart` de création). Facultatif sur la fiche d'un média existant :
  les médias antérieurs à la 1.6.0 portent `null` et ne se « migrent » pas — la valeur s'écrit à la
  première édition, sans inventer d'affectation.
- `GET /medias` filtre `?emplacement=<sous-chaîne>` (insensible à la casse).
- **Jamais exposée dans l'API publique** (`GET /photos-fixes`, `GET /contenus/*`) : aucun changement
  pour le site tant qu'il ne la lit pas.

### 23.2 Épisodes — `illustrations` (plusieurs images complémentaires)

- Un épisode garde **une** affiche principale (`imageId`, inchangée) et gagne **plusieurs images
  d'illustration** : `illustrationIds: string[]` (max 12, ordre conservé), liées par la table
  d'association `episode_media(episode_id, media_id, ordre)` (clé primaire composite, FK
  `→ media(id) ON DELETE RESTRICT`).
- La fiche épisode les présente dans l'ordre et les retire **sans supprimer le média** de la
  médiathèque : seule la relation disparaît.
- L'emport de nouvelles illustrations réutilise le même flux que les autres médias (picker et upload
  : mêmes routes, même contrainte `media_declinaisons`).
- **Payload public** (`GET /contenus/episodes` et `/`{slug}) : `illustrations: ImagePublique[]`,
  dans l'ordre d'insertion, `[]` par défaut. Aucun autre champ public n'est ajouté ou modifié.

### 23.3 Épisodes — publication liée à un projet

- Un épisode appartient à zéro ou un projet (`projet_id`, FK `→ projet(id) ON DELETE RESTRICT` —
  inchangé, RG-32) ; **à partir de la 1.6.0, aucune publication sans `projetId`** : la publication
  constate `422 RG-03` avec `details.manquants` incluant `{ champ: 'projet', message:
  « Un épisode appartient à un projet : choisissez-le avant la publication. » }`.
- Cette exigence s'applique aux nouvelles publications et re-publications ; les brouillons sans
  projet restent éditables. La migration E1 n'ayant jamais renseigné de projet pour les six épisodes
  publiés, la reprise éditoriale (ou une migration dédiée, validée par le client, qui les relie au
  projet X'PLORE Côte d'Ivoire) précède toute re-publication.
- La création d'une illustration n'est pas soumise à cette exigence ; elle n'est qu'appliquée à la
  publication.

### 23.4 Ce qui ne change pas (clause de non-retour)

- Les payloads publics de toutes les ressources restent en lecture **au chargement seulement**
  (LIAISON § C.2) : rien ne change côté déclenchement ; seules les clés du payload changent.
- Aucune suppression de données ; les médias existants restent sans `emplacement` ; les épisodes
  existants n'ont pas d'illustrations tant que l'équipe ne les renseigne pas.
- La galerie (accueil, boutique) et les photos fixes restent telles quelles ; aucune route publique
  nouvelle n'est fournie par la 1.6.0.

---

## 24. Version 1.7.0 — ajouts du chantier pages légales (ARRÊTÉE)

> Statut : **arrêtée le 11/11/2026**. Demandée par le client le même jour ; écrites ensemble dans
> les deux dépôts (site `docs/CONTRAT-API.md` et copie `prince-edja-api/docs/contrat/CONTRAT-API.md`,
> identiques octet pour octet). **§ 24.3 est la clause de compatibilité** : aucun changement de
> comportement des endpoints d'édition, aucune donnée modifiée ou perdue.

### 24.1 Corps riche — nœud `horizontalRule`

- La liste blanche du `CorpsRiche` (§ 9.1) accepte désormais `horizontalRule` (`<hr>` côté rendu) :
  l'admin édite un séparateur dans l'éditeur (bouton « Séparateur »), le rendu admin (`RenduCorps`)
  et le rendu site (`CorpsRiche`) l'affichent, le serveur l'accepte à l'écriture.
- Le rendu même n'a **ni attributs ni contenu** : `attrs` et `content` refusés pour ce nœud, comme
  pour tous les nœuds (§ 9.1). Aucune donnée existante n'est migrée.

### 24.2 Pages légales — sixième page `cgu`

- L'ensemble fermé des pages légales (§ 9.16) passe de cinq à six : `cgu` est ajoutée après les
  cinq déjà servies. Intitulée « Conditions générales d'utilisation » (FR) ; « Terms of use » (EN).
- La reprise dans les deux séries seed : **données de départ** (`src/db/seed/donnees/site.json`,
  `CLES_PAGE_LEGALE`) et **base existante** : migration `0013_page-cgu` insère la ligne
  `page_legale('cgu')` avec le squelette FR/EN (aucun texte juridique, comme les cinq autres). La
  maison remplit le corps et publie : même procédure (« Réglages → Pages légales »).
- Footer et routes du site : `/cgu` ajoutée (lien « CGU » dans le pied, page générique existante
  `LegalPage`), prérendue comme les cinq autres, samediscanoniques dans le sitemap.
- L'API publique (`GET /contenus/pages-legales`, § 18.1) reste la seule voie : aucun changement de
  contrat pour la publication, aucune donnée écrasée.

### 24.3 Ce qui ne change pas

- La structure et les titres des cinq pages existantes restent identiques ; aucune traduction
  inventée n'est ajoutée. Le contrat étend la liste blanche **sans en retirer** : tout corps déjà
  enregistré reste valide.
- Les deux copies du contrat restent identiques octet pour octet ; la somme SHA-256 est figée par
  `tests/unitaires/contrat.test.ts` (mise à jour par ce commit).

---

## 25. Version 1.8.0 — résumés de liste étendus (ARRÊTÉE)

> Statut : **arrêtée le 11/11/2026**. Demandée par le client le même jour ; les deux dépôts
> portent la même copie de ce contrat (`prince-edja-api/docs/contrat/CONTRAT-API.md`,
> identique octet pour octet) ; la limite de compatibilité du § 25.3 s'applique.

### 25.1 Articles — résumé de liste `extrait`

- Le résumé de liste des **articles** expose désormais `extrait` : le texte de `traductions[fr].extrait`,
  à défaut `traductions[en].extrait`, `null` dans les deux, jamais une valeur inventée. Le champ
  est additif : un client qui ne le lisait pas ne remarque rien.
- Le champ reste utilisé pour **l'aperçu** dans le Journal (titre, image, résumé, catégorie,
  statut, date), demandé par le client.

### 25.2 Projets — résumé de liste `accroche` et `creeLe`

- Le résumé de liste des **projets** ajoute :
  - `accroche` : `traductions[fr].accroche`, à défaut `traductions[en].accroche`, `null` dans les
    deux — le résumé court saisi pour le corps public (`↔ traduction.accroche`) ;
  - `creeLe` : `horodatage` ISO, date de création du projet — la liste de l'admin peut afficher la
    fiche « Date de création », ce que le tableau actuel n'affichait pas.
- Les deux champs sont additifs (aucune suppression, aucun renommage) ; le payload public
  (`GET /contenus/projets`) est **inchangé**.

### 25.3 Ce qui ne change pas

- Aucun endpoint d'écriture, aucune validation ; aucun payload public modifié ; aucune donnée
  existante migrée. Les résumés restent ce qu'ils sont côté aide et MSW (additifs).
- Les onglets transverses ne se définissent pas ici ; le reste de ce contrat est stable.

---

## 26. Version 1.9.0 — un projet garde toujours son affiche (ARRÊTÉE)

> Statut : **arrêtée le 12/11/2026**. Demandée par le client le même jour (« si pas affiche pas de
> création ») ; les deux dépôts portent la même copie de ce contrat (`prince-edja-api/docs/contrat/
> CONTRAT-API.md`, identique octet pour octet) ; la limite de compatibilité du § 26.4 s'applique.

### 26.1 Règle

- Un **projet** est refusé à la **création** tant que `imageId` n'est pas fourni — quel que soit
  l'avancement (« En préparation » compris) et quel que soit le template. Le refus est
  `422 VALIDATION`, `champ: "imageId"`, avec un message français explicite pour l'interface.
- La même règle s'applique à toute **modification** : un enregistrement qui laisserait un projet
  sans affiche est refusé (même code et même champ). Un projet existant sans affiche (état
  antérieur à cette version) redevient enregistrable dès que son affiche est choisie — c'est le
  « remplissage progressif » prévu pour les anciens projets, jamais une suppression.
- Le message renvoyé nomme le champ pour que l'interface y mène (le formulaire de projet porte
  déjà « Photo d'affiche du projet » en exigence directe à l'enregistrement).

### 26.2 Règles inchangées

- La règle RG-03 à la **publication** reste en l'état, dont l'exception « En préparation » (§ 7 de
  cette version reste sur ce seul point, devenu théorique pour les projets nés à partir de 1.9.0).
- Aucune autre ressource n'est concernée : articles, épisodes, villes, destinations, archive,
  galerie, distinctions, presse, conventions… inchangés.

### 26.3 Ce qui ne change pas

- Aucun endpoint d'écriture, aucune route, aucun payload **modifié** ; la lecture publique
  (`GET /contenus/projets`) est inchangée ; aucun champ renommé ni supprimé ; aucune donnée
  existante migrée (les projets sans affiche restent lisibles et listables, simplement
  indisponibles à l'enregistrement tant que l'affiche n'est pas choisie).

### 26.4 Compatibilité

- Un client qui enregistrait déjà une affiche à la création (comportement de l'interface entre
  1.8.0 et 1.9.0) ne voit aucun changement. Un client qui créait sans affiche doit désormais la
  fournir, comme l'exige l'interface.

---

## 27. Version 1.10.0 — la fiche produit publique expose les ids de variantes (ARRÊTÉE)

> Statut : **arrêtée le 14/11/2026**. Demandée par le client le même jour ; les deux dépôts
> portent la même copie de ce contrat (`prince-edja-api/docs/contrat/CONTRAT-API.md`,
> identique octet pour octet) ; la limite de compatibilité du § 27.3 s'applique.

### 27.1 Liste publique des produits (`GET /public/api/v1/boutique/produits`)

- Chaque élément (`produitPublieSchema`) ajoute `varianteIds: z.array(z.uuid().min(1))` :
  les UUID des variantes du produit, **dans l'ordre** dans lequel la fiche les expose
  (ordre croissant `ordre`, puis prix croissant — § 12.2). Mêmes UUID en fiche qu'en liste.
- Toute variante saisie dans l'outil public est donc identifiable côté client ; le client
  peut donc appeler `POST /public/api/v1/demandes` avec ces UUID sans aucune seconde requête.

### 27.2 Fiche publique (detail, `GET /public/api/v1/boutique/produits/:slug`)

- `variantes[]` ajoute `id: z.uuid()` : l'identifiant de chaque variante — identique
  à celle émise en liste (`varianteIds[i]` pour `variantes[i]`).

### 27.3 Ce qui ne change pas · Compatibilité

- Aucun endpoint révoqué, aucune route retirée ; aucune validation touchée côté écriture ;
  aucune donnée migrée.
- Le contrat passe en mineure : additifs seulement.
- Indexation automatique en `(famille, slug)` ; rebuild du site public à chaque publication
  reste le même — le contrat lit la même forme, plus `varianteIds`.

---

## 28. Version 1.11.0 — compteur de visites maison (ARRÊTÉE)

> Statut : **arrêtée le 19/11/2026**. Demandée par le client le même jour (« compteur maison
> dans l'API ») ; aucune donnée personnelle n'est collectée, aucun service externe n'est
> interpellé. Demandé et accepté par le client avant toute implémentation.

### 28.1 Modèle de données (montée via la migration `0014_statistiques-visites`)

Deux tables nouvelles, uniquement écrite et lue par l'API (rôle `edja_api`) ; aucune autre table,
aucune colonne n'est modifiée ; aucun index fonctionnel public pour l'instant.

```sql
CREATE TABLE statistiques_vue (
  jour   date PRIMARY KEY,
  total  integer NOT NULL DEFAULT 0
);

CREATE TABLE statistiques_chemin (
  chemin text PRIMARY KEY,
  total  integer NOT NULL DEFAULT 0
);

GRANT SELECT, INSERT, UPDATE ON statistiques_vue, statistiques_chemin TO edja_api;
```

La redescente (`bas.sql`) supprime les deux tables et la mémoire de leurs lignes (aucune restitution possible : c'est voulu).

### 28.2 Route publique `POST /public/api/v1/analytics/vue`

- Corps : `{ chemin?: string }` — `chemin` commence par `/`, au plus 300 caractères ; absent = `/`.
- Effet : incrémente `statistiques_vue(jour = today)` et `statistiques_chemin(chemin)` dans une
  seule transaction. **204** sur succès ; aucune information n'est renvoyée.
- Limitation de débit : 20 requêtes / minute / adresse IP (même régime que la limite des formulaires).
- **Aucune donnée personnelle** n'est conservée : ni adresse IP, ni agent utilisateur, ni identifiant
  de session. Le compteur ne mesure pas des personnes — il compte des **affichages de pages**
  (page views) : une session qui affiche 10 pages compte 10, une personne unique est invisible.
- La route est appelée par le site public au chargement de chaque page et à chaque changement
  de route ; sans `PUBLIC_API_URL` configurée pour le build, le site n'appelle rien (repli comme
  pour les formulaires).

### 28.3 Extension du `GET /admin/api/v1/tableau-de-bord`

Additif seulement. Les champs existants restent inchangés. Quatre champs en plus :

```ts
interface TableauDeBord {
  // ... existant (§ 16), inchangé ...
  visitesTotales: number             // somme totale, toutes pages confondues
  visitesAujourdhui: number           // vues comptées aujourd'hui
  visitesCeMois: number               // vues comptées ce mois-ci (calendrier local)
  topVues: { chemin: string; total: number }[]  // 5 pages les plus vues (chemin relatif)
}
```

Aucune autre donnée de ces deux tables n'est exposée (pas de séries journalières, pas de
détail par jour) : le tableau montre trois chiffres et les cinq pages dominantes, rien d'autre.

### 28.4 Ce qui ne change pas · Compatibilité

- Aucun endpoint retiré, aucune route, aucune validation touchée ; aucun changement de comportement
  pour les clients qui ne consomment pas `visites*`.
- Aucune des tables existantes n'est modifiée. RLS : la lecture/écriture des deux tables passe par
  le rôle `edja_api`, comme les autres tables applicatives.
- Version mineure : extension pure. Le site se reconstruit avec les données courantes ; le flux
  de publication n'est pas impacté.

---

## 29. Version 1.12.0 — un article peut porter un PDF natif (ARRÊTÉE)

> Statut : **arrêtée le 19/11/2026**. Demandée par le client le même jour, avec la
> validation des trois points ouveres : (a) PDF OU corps écrit suffit pour publier ;
> (b) page publique allégée + soin du PDF (c) upload direct dans l'article.

### 29.1 Schéma

`articles` ajoute `pdfId` : `uuid nullable`, référence vers `media.id` (même famille que
`imageId`), limitée aux médias de type `application/pdf`. Une clé `ON DELETE RESTRICT`
ajoute une dépendance d'intégrité (l'article ne peut pas être en Changelog sans PDF).

### 29.2 Exigences de publication (RG-03, articles)

Pour chaque langue active : le **corps** est exigé **sauf si l'article porte un PDF** :

- `imageId` : toujours exigé (inchangé).
- `corps` non vide, OU `pdfId` non nul : au moins l'un des deux.
- Les exigences restantes (extrait, titre, catégorie, tag format) ne changent pas.

### 29.3 Vue publique de l'article (contrat 1.5.0 § 18.1)

`ArticlePublic` (extended `ContenuPublic`) ajoute `pdf: z.object({ url, alt, largeur, hauteur, declinaisons }) | null`
— la forme exacte d'`ImagePublique` (images), mais pour un `application/pdf` : `url`
(URL publique directe), `alt` = texte alternatif du média, `largeur`/`hauteur` = `null`,
`declinaisons: []`.

Le site public, quand `pdf !== null`, offre un bouton « Télécharger le PDF » en plus du contenu
(il peut afficher soit la fiche allégée avec le bouton, soit le contenu complet si `corps`
non vide, soit les deux).

### 29.4 Compatibilité

Additive : aucun endpoint, aucune validation, aucun champ renommé ou supprimé ; les articles
créés sans PDF continuent d'être lu/lus et publiés exactement comme avant. La réassignation
`ON DELETE RESTRICT` empêche toute suppression d'un média PDF cité par un article — la règle
des photos fixes et des logos d'épisode suit la même logique (RG-08).

---

## 30. Version 1.13.0 — face publique normative et indépendance du build (ARRÊTÉE)

> Statut : **arrêtée le 19/11/2026**. Décision du client : *« le fait qu'on déclenche un build à chaque changement est mon problème »*. Version arrêtée avant tout code, conformément au § 0.

### 30.1 Ce qui change

La face publique décrite au § 18 cesse d'être une annexe « à titre de référence ». Elle devient **normative pour le site public et pour le back end** : la source de vérité des données lues par un visiteur est l'API publique, pas un instantané généré au build.

Conséquence directe : **aucune modification de contenu ne déclenche de reconstruction du site en production.** Le cycle de vie du code (déploiements maîtrisés), celui du contenu (publication dans l'admin) et celui des transactions (commandes) sont indépendants.

### 30.2 Périmètre de la version

Sont **dans** le périmètre : les contenus publics (Journal, projets, épisodes, destinations, guides, univers, jalons, offres, presse, distinctions, archive, galerie, pages légales), la navigation et les réglages publics, les catégories, les images et métadonnées de rendu (§ 18.1), les états de publication et les erreurs de lecture, les données nécessaires au référencement (titre, description, `publieLe`, `modifieLe`), et les routes déjà servies (`GET /contenus/{type}`, `GET /contenus/{type}/{slug}`, `GET /categories`, `GET /site`, `GET /sitemap`, `GET /boutique/produits`, `GET /boutique/produits/{slug}`, `GET /photos-fixes`, `GET /reglages`).

Sont **hors** périmètre et relégués à une version ultérieure : le panier, les commandes, le paiement, la réservation de stock, les remboursements, les comptes clients et le multi-vendeur (qui reste `false`, § 5). Le site continue d'utiliser `POST /public/api/v1/demandes` pour les demandes de renseignement ; aucun parcours d'achat transactionnel n'est décrit ici.

### 30.3 Règles de lecture publique

1. **Fraîcheur** : un contenu publié est lisible immédiatement après sa transition, sans attendre un déploiement. Un contenu dépublié ou archivé cesse d'être servi (§ 18).
2. **Nouvelle adresse** : l'URL d'un contenu publié doit être servie dès la première visite, **même si cette URL n'existait pas lors du dernier déploiement du frontend**. Le rendu est donc produit à partir des données de l'API, non d'une liste de routes figée au build.
3. **HTML exploitable** : la première réponse d'une page publique contient le contenu et ses métadonnées (titre, description, image, `og:*`) dans le HTML — pas une coquille vide attendant le JavaScript.
4. **Cache** : les réponses publiques peuvent être mises en cache avec une **durée de validité maîtrisée**, puis revalidées. Aucune invalidation ciblée par contenu n'est exigée dans cette version ; aucun service de cache externe n'est imposé.
5. **Dégradation** : si l'API est momentanément indisponible, une version en cache dont la fraîcheur reste acceptable peut être servie pour le contenu éditorial. Les données commerciales déjà publiées (prix, disponibilité) doivent être revalidées avant une action critique — action qui reste hors du périmètre de cette version.
6. **Médias** : toutes les URLs d'images sont produites par le back end (`MEDIA_PUBLIC_BASE_URL` / Cloudinary, § 18.1) ou résolues par le site depuis `PUBLIC_IMAGES_BASE_URL` ; aucune URL d'environnement de développement n'est écrite dans un contenu publié. Le stockage de production est Cloudinary pour tous les visuels ; le disque local est réservé au développement.

### 30.4 Démonstration et production

Deux circuits distincts sont autorisés et ne doivent pas être confondus :

- **Démonstration** (GitHub Pages) : instantané figé, build volontaire, données de départ ou JSON générés ; aucun backend en direct n'est requis pour présenter le site.
- **Production** (hébergeur à arrêter séparément) : contenu vivant lu depuis l'API, cache et revalidation, indépendance complète vis-à-vis des builds de code.

Les deux circuits partagent les composants, les styles et les règles de présentation ; seules les sources de données diffèrent.

### 30.5 Compatibilité

Additive : aucune route supprimée, aucun champ retiré ou renommé, aucune nouvelle exigence sur les payloads existants (§ 18.1). Les versions 1.5.0 à 1.12.0 restent valides. Le site peut continuer à consommer les JSON générés en mode démonstration ; la production doit consommer l'API publique. Ce changement concerne la **source de données du site**, pas les règles métier du back end : publication, droits, RG-03 et RG-08 restent inchangés.

### 30.6 Décisions encore à arrêter (hors de cette version)

- Hébergeur de production et modèle de rendu exact (serveur complet ou génération à la demande avec cache).
- Sécurité des tâches internes du backend en cas de plusieurs instances (exécution unique garantie).
- Périmètre contractuel des transactions (version ultérieure).
- Stratégie d'agrégation du compteur de visites : **résolue** — agrégation en mémoire, vidage toutes les 60 s et à l'arrêt propre (appliquée le 20/11).
- Activation éventuelle du multi-vendeur (décision métier séparée).

---

## 31. Version 1.14.0 — parcours d'achat et paiement Wave (ARRÊTÉE)

> Statut : **arrêtée le 20/11/2026**. Demandée par le client le 20/11 (« on peut faire un vrai achat »). Version arrêtée avant tout code, conformément au § 0. Le multi-vendeur reste hors périmètre (§ 5).

### 31.1 Principes généraux

1. **Le back end est le seul à parler à Wave.** La clé API Wave (`wave_sn_prod_…`) et le secret de signature restent côté serveur, dans l'environnement — jamais dans le navigateur, jamais dans le dépôt.
2. **Le prix n'est jamais cru côté client.** Le montant d'une commande est calculé par l'API depuis la base (variante, prix, quantité) au moment de la création de la session. Un `prix` envoyé par le site est ignoré ou refusé.
3. **Le stock est vérifié au moment de la commande**, pas au moment de l'affichage du catalogue. La création de session réserve le stock dans la même transaction ; l'expiration ou l'échec le libère.
4. **La confirmation de paiement vient du webhook Wave**, pas du retour navigateur (`success_url`). Les URL de retour sont indicatives ; seul l'événement signé `checkout.session.completed` fait passer la commande en `payée`.
5. **Idempotence** : Wave peut envoyer un événement plusieurs fois, dans le désordre. Chaque événement est identifié par son `id` ; un événement déjà traité est reconnu et ignore sans effet de bord.
6. **Dev = simulation, production = Wave.** En development, un prestataire fictif (`simulation`) permet de tester tout le cycle sans compte Wave ni réseau ; en production, le prestataire est `wave`. Le choix vient de la configuration, pas du navigateur.

### 31.2 Fournisseur Wave (référence contractuelle)

- Base URL : `https://api.wave.com`.
- Authentification : `Authorization: Bearer <clé API>` ; signature optionnelle mais **recommandée** : en-tête `Wave-Signature: t=<unix>,v1=<hmac>`, HMAC-SHA256 de `timestamp + corps brut` avec le secret de signature. Le timestamp est rejeté s'il a plus de 5 min ou est dans le futur de plus de 30 s.
- Création : `POST /v1/checkout/sessions` avec `{ amount: "<entier>", currency: "XOF", success_url, error_url, client_reference }`. `amount` est une **chaîne**, XOF **sans décimales**. `client_reference` (≤ 255) porte l'identifiant de notre commande.
- Réponse : objet *Checkout Session* — `id` (`cos-…`), `checkout_status` (`open` | `complete` | `expired`), `payment_status` (`processing` | `cancelled` | `succeeded`), `wave_launch_url` (à ouvrir par le navigateur, jamais en WebView), `transaction_id`, `when_created`, `when_expires`, `when_completed`.
- Vérification côté serveur : `GET /v1/checkout/sessions/:id` ou `GET /v1/checkout/sessions?transaction_id=…`.
- Remboursement : `POST /v1/checkout/sessions/:id/refund` — idempotent (un second appel répond 200 sans nouveau mouvement).
- Webhook : `POST` signé, événements `checkout.session.completed` et `checkout.session.payment_failed`, corps `{ id, type, data: { …Checkout Session… } }`. La signature se vérifie sur le **corps brut** ( jamais un corps JSON reparsé ), avec le secret du webhook (distinct de la clé API). Un événement dupliqué, manquant ou hors ordre doit être sans conséquence.
- Aucune dépendance npm ajoutée : `fetch` et `node:crypto` suffisent.

### 31.3 Modèle de données (ajouts)

| Table | Champs essentiels |
|---|---|
| `commande` | `id`, `numero` (lisible), `etat`, `total`, `devise` (`XOF`), `client_nom`, `client_email`, `session_wave_id`, `transaction_wave_id`, `fournisseur`, `cree_le`, `payee_le`, `version` |
| `ligne_commande` | `id`, `commande_id`, `variante_id`, `quantite`, `prix_unitaire`, `nom_produit` (figé à la commande) |
| `evenement_wave` | `id` (identifiant de l'événement Wave, clé primaire — idempotence), `type`, `recu_le`, `traite_le` |

États d'une commande : `en_attente` → `payee` ; `en_attente` → `expiree` | `echouee` ; `payee` → `rembourse`. Une transition est journalisée ; aucune suppression d'une commande payée.

### 31.4 Routes de la face publique (ajouts)

| Route | Corps / réponse | Règle |
|---|---|---|
| `POST /public/api/v1/commandes` | `{ lignes: [{ varianteId, quantite }], client: { nom, email }, langue }` → `{ commande, wave_launch_url }` | Le total est calculé serveur ; chaque variante doit être publiée et disponible ; le stock est réservé ; session Wave créée |
| `GET /public/api/v1/commandes/:numero` | État de la commande, sans donnée sensible | Lecture par numéro + e-mail de la commande (ou jeton) — jamais un numéro seul |
| `POST /public/api/v1/webhooks/wave` | Corps brut signé → `200` rapide | Vérification `Wave-Signature` sur le corps brut ; événement stocké puis traité de façon asynchrone |
| `POST /public/api/v1/commandes/:numero/annuler` | — | Libère le stock d'une commande encore `en_attente` ; expire la session Wave |

Limitation de débit sur ces routes. Aucune donnée de carte bancaire ne transite par le site : Wave gère le moyen de paiement.

### 31.5 Administration (ajouts)

- Écran « Commandes » : liste filtrable par état, détail d'une commande (lignes, montant, identifiants Wave, horodatages), action « Rembourser » (confirmation ; idempotente).
- Le tableau de bord expose `commandesEnAttente`, `commandesPayees`, `chiffreAffaires` (somme des commandes `payees`, en FCFA via `formatFCFA` sur le site).
- Aucun `admin` ne peut modifier le montant d'une commande. Aucune suppression de commande.

### 31.6 Compatibilité et périmètre

Additive : aucune route ni champ existant supprimé ; les familles `article`, `projet`, `produit` et les demandes de devis (`POST /demandes`) restent inchangées. Le compteur de visites (§ 28) reste tel qu'agrégé.

Hors périmètre de cette version, à arrêter séparément : **multi-vendeur** (rôles, commissions, responsabilités, livraison, remboursements partagés), **comptes clients** (historique, fidélité), **livraison** (adresses, frais, suivi), **paiements récurrents**, et tout autre prestataire que Wave. Le choix du prestataire (`wave` / `simulation`) est une variable d'environnement — aucun comportement public ne change entre les deux hors le fait que la simulation ne déplace pas d'argent.

---

## 32. Version 1.15.0 — un projet contient ses villes, destinations et entrées (ARRÊTÉE)

> Statut : **arrêtée le 20/11/2026**. Demandée par le client le 20/11 : deux projets du même
> template doivent pouvoir avoir chacun leurs villes, leurs destinations et leurs entrées
> d'archive, avec une page publique propre. Version arrêtée avant tout code (§ 0).

### 32.1 Principe

Un projet est le **conteneur de ses contenus**. Les familles `episodes`, `destinations`, `villes`
et `archive` peuvent être rattachées à un projet ; le site rend **une page publique par projet**,
dont les blocs sont choisis par le `template` du projet (§ 22.8). Deux projets du même template ne
partagent plus leurs contenus.

Aucun contenu n'est dupliqué : les relations du § 32.2 sont les seules sources de vérité. Un contenu
non rattaché reste **global** : il continue d'apparaître dans les listes sans filtre et sur les pages
historiques, sans qu'aucune donnée existante soit modifiée.

### 32.2 Relations contenu → projet

| Famille | Relation | Origine |
|---|---|---|
| `episodes` | `episodes.projetId` (uuid nullable) | champ existant (1.6.0, § 23.3) |
| `destinations` | `destinations.episodeId` → `episodes.projetId` | relation existante, non modifiée |
| `villes` | `projet.escaleIds[]` contient `villes.id` | champ existant (§ 22.8), non modifié |
| `archive` | `archive.projetId` (uuid nullable) | **ajout de la 1.15.0** |

`archive.projetId` est facultatif en écriture et vaut `null` en lecture pour une entrée existante.
Un identifiant de projet inconnu est refusé à l'écriture : `422 VALIDATION` sur `projetId`, comme
pour `episodes.projetId` (§ 22.2). Les villes et les destinations n'ajoutent aucun champ : leur
rattachement est déjà porté par `escaleIds` et par l'épisode.

### 32.3 Administration

- Les listes de ces quatre familles acceptent le filtre `?projetId=<uuid>` — déjà le cas des
  épisodes, ajouté pour `villes`, `destinations` et `archive`.
- Le formulaire d'`archive` gagne le sélecteur `projetId`, pré-rempli quand l'entrée est créée
  depuis la fiche d'un projet. Les villes restent rattachées via `escaleIds` sur la fiche projet ;
  les destinations via leur épisode.
- Une ville ajoutée à un projet entre dans `escaleIds`, dans l'ordre choisi ; l'ordre des villes
  rendues sur la page publique suit celui de `escaleIds`, pas le `ordre` global de la famille.
- Le rattachement se modifie comme un champ ordinaire, sous réserve du cycle de vie (§ 7) et des
  droits (§ 5). Aucun administrateur ne peut modifier le montant d'une commande (§ 31.5), et aucune
  règle de la 1.15.0 ne touche à la boutique.

### 32.4 Face publique

Deux ajouts à la face publique (§ 18), tous additifs :

1. `GET /public/api/v1/contenus/{type}?langue=&projetId=<uuid>` pour `episodes`, `villes`,
   `destinations` et `archive`. Sans `projetId`, le comportement est inchangé (tous les contenus
   publiés). Avec `projetId`, seuls les contenus rattachés au projet sont renvoyés, selon les
   relations du § 32.2 ; un projet inconnu donne une **liste vide**, jamais une erreur. Les objets
   gardent la forme du § 18.1 ; `archive` expose en plus `projetId` (`uuid | null`).
2. `GET /public/api/v1/projets/{slug}/page?langue=` renvoie la page complète d'un projet publié :
   `{ projet, episodes, destinations, villes, entrees, partenaires }`. `projet` est l'objet public
   du § 18.1 (avec `template`, `bandeau`, `blocsMasques`, `citation`, `saison`, `programme`,
   `festivals`). Les listes sont **déjà filtrées** par le projet et dans la forme du § 18.1 (images
   résolues, une seule langue). Un projet inexistant ou non publié répond `404`. Une famille sans
   contenu est un **tableau vide**, jamais `null`.

### 32.5 Rendu par template (site public)

Le site rend une page par projet à `/projets/{slug}` à partir de la réponse du § 32.4. Les blocs
suivent le `template` (§ 22.8) et sont masqués s'ils figurent dans `blocsMasques` :

| Template | Blocs | Données |
|---|---|---|
| `film` | héros, carte, album, épisode à la une, guides | `projet`, `destinations` (coordonnées), `episodes` |
| `programme` | héros, escales, programme, partenaires | `projet`, `villes` (ordre de `escaleIds`), `partenaires` |
| `bibliotheque` | héros, entrées, rigueur éditoriale | `projet`, `entrees` (sources + fiabilité) |

Le héros lit le titre, l'accroche, la citation et le bandeau du **projet** : aucune de ces valeurs
n'est figée dans le composant. Un bloc sans données n'est pas rendu — aucun texte ni visuel n'est
inventé pour le remplacer. Les trois pages historiques (`/xplore`, `/taste-and-travel`,
`/archive-afrique`) restent servies telles quelles en démonstration ; la production utilise la route
générique, conformément à la 1.13.0.

### 32.6 Compatibilité et périmètre

Additive : aucun champ supprimé ni renommé, aucune route existante modifiée, aucune nouvelle
exigence sur une famille sans projet. Les projets, villes, destinations, épisodes et entrées sans
rattachement gardent leur comportement actuel. Le mode démonstration (JSON générés) continue de
fonctionner ; la production consomme l'API publique (1.13.0).

Hors périmètre de la 1.15.0 : la production de contenu éditorial pour remplir une page vide (les
champs manquants restent signalés par `champsAFournir`, § 9.3), la traduction anglaise des contenus
(question 39), l'hébergement de production (§ 30.6) et le vrai prestataire Wave (§ 31).

---

## 33. Version 1.16.0 — galerie publique par emplacement (ARRÊTÉE)

> Statut : **arrêtée le 21/11/2026**. Demandée par le client le 21/11 après constat d'une
> incohérence : l'admin « Médiathèque › Sur le site › Galerie Boutique » annonce « aucune photo »
> (zéro contenu `galerie` avec `emplacement = 'boutique'`), alors qu'Edja Shop affiche un lookbook.
> Ce lookbook vient d'un tableau codé en dur dans le site (`src/data/shop.ts`), pas de l'admin.

### 33.1 Principe

Les deux galeries éditoriales — accueil et boutique — sont lues depuis la même famille
`galerie` (§ 9.9), filtrée par `emplacement`. Le site **ne garde aucun lookbook codé en dur** :
`GALERIE_SHOP` est remplacé par les données de l'API. L'admin et le site affichent ainsi
exactement la même liste, dans le même ordre (`ordre`, puis `creeLe`, puis `id`).

Aucun contenu n'est inventé : si la galerie Boutique est vide dans l'admin, Edja Shop n'affiche
**aucun** lookbook. Les cartes de la collection et les fiches produits ne sont pas concernées —
leurs visuels restent portés par `imageId` et `galerieMediaIds`.

### 33.2 Route publique

| Route | Réponse | Règle |
|---|---|---|
| `GET /public/api/v1/galeries?emplacement=&langue=` | `{ items, page, pageSize, total }` | `emplacement` (`'accueil' \| 'boutique'`) obligatoire ; contenus `publie` avec `publieLe ≤ maintenant`, triés par `ordre` ; mêmes champs que `GET /contenus/galerie` (vue publique § 18.1 : `image` résolue, `traduction` unique, `mediasCorps` si besoin). Un emplacement sans photo donne `total: 0`, jamais une erreur. |

Cette route remplace, pour les galeries, la mention « pas encore servies : galeries par
emplacement » du § 18. Les autres familles restent inchangées. La pagination suit `page` /
`pageSize` (défaut 100 pour cette route : une galerie tient en une page).

### 33.3 Administration

Aucun changement de schéma : la famille `galerie` porte déjà `emplacement`, `ordre`, `ratio`,
`parallaxe`, `cible`, `lienExterne` et les traductions `etiquette` / `titre` / `legende`.
Le bloc « Galerie Boutique » de l'écran « Sur le site » continue de créer, ordonner et supprimer
les photos exactement comme le bloc « Galerie Accueil ». Le titre FR reste obligatoire en
`emplacement = 'boutique'`.

Lors de la migration, les visuels du lookbook codé en dur sont **à recréer dans l'admin** par la
maison (l'image, le titre, la légende et le ratio de chaque entrée) : le contrat n'autorise pas
l'agent à transformer un tableau de code en contenu publié sans validation. Tant que ces entrées
n'existent pas, le lookbook reste vide — c'est le comportement attendu et honnête.

### 33.4 Compatibilité

Additive : aucune route ni champ supprimé, aucun changement de forme pour `GET /contenus/galerie`
ni pour les autres familles. En mode démonstration (JSON générés), le chargeur écrit
`galerie-accueil.json` et `galerie-boutique.json` depuis la nouvelle route ; le site s'en sert
à la construction. En production, la face publique les sert directement (1.13.0). Le champ
`emplacement` reste un enum fermé à deux valeurs.

Hors périmètre de cette version : l'exposition publique des motifs de contact, des créateurs et
des étiquettes, le sitemap et `GET /site`, qui restent à arrêter séparément.

---

## 34. Version 1.17.0 — emplacements de photos fixes réduits (ARRÊTÉE)

### 34.1 Liste semée à la 1.17.0

La liste semée passe de huit à **cinq** emplacements, tous réellement rendus par le site :

| Clé | Libellé | Consommateur |
|---|---|---|
| `accueil.heros` | Accueil — héros | `src/acces/site.ts` (héros de l'accueil) |
| `accueil.portrait` | Accueil — portrait | réservé au portrait de l'accueil |
| `apropos.portrait` | À propos — portrait | `src/pages/AboutPage.tsx` |
| `boutique.bandeau` | Boutique — bandeau | `src/lib/visuels.ts` |
| `journal.bandeau` | Journal — bandeau | **Renommé en 1.18.0** : voir § 35 — `histoires.bandeau` |

Sont **retirés** : `apropos.bandeau` (la page À propos n'affiche volontairement aucun bandeau),
`contact.bandeau` (`/contact` n'a pas de bandeau) et `partage.og` (le `og:image` reste un actif
statique du dépôt). Leur suppression est effective dans la migration 0019 et dans l'amorçage :
les cartes correspondantes disparaissent de l'écran « Sur le site », et une requête
`PUT /emplacements-photos/{cle}` sur une clé retirée répond `404`, comme pour toute clé inconnue.

### 34.2 Compatibilité

Aucune route, aucun champ, aucun droit ne change : `GET /emplacements-photos`,
`PUT /emplacements-photos/:cle` et `GET /public/api/v1/photos-fixes` gardent exactement la même
forme (§ 22.4). Le contrat ne définit pas la liste comme extensible par l'admin : les
emplacements sont semés par le back end (C6), l'admin n'en crée ni n'en supprime. La liste est
donc une donnée de migration, pas une table ouverte — c'est pourquoi elle est arrêtée ici.

Le site retire en même temps le bloc conditionnel qui rendait `apropos.bandeau` : la page À
propos ouvre directement sur son en-tête, sans bannière. Aucun autre consommateur n'est touché.

---

## 35. Version 1.18.0 — héros Histoires (ARRÊTÉE)

### 35.1 Renommage

L'emplacement qui pilote le héros de `/histoires` est nommé d'après la page qu'il alimente, et
non d'après `/journal` (qui n'a pas de bandeau) :

| Avant (1.17.0) | Depuis la 1.18.0 | Libellé |
|---|---|---|
| `journal.bandeau` | `histoires.bandeau` | Histoires — bandeau |

Les quatre autres emplacements (`accueil.heros`, `accueil.portrait`, `apropos.portrait`,
`boutique.bandeau`) et les trois emplacements retirés en 1.17.0 ne changent pas. La migration
0020 renomme la clé **sur place** : le visuel déjà assigné, son texte alternatif, l'audit et la
date de mise à jour sont conservés. L'ancienne clé répond `404`, comme toute clé inconnue.

### 35.2 Compatibilité

Aucune route, aucun champ, aucun droit ne change ; seule la valeur de `cle` (et son `libelle`)
évolue dans les réponses de `GET /emplacements-photos` et `GET /public/api/v1/photos-fixes`.
Le site lit `histoires.bandeau` dans `src/pages/HistoiresPage.tsx` ; le libellé affiché dans
l'admin devient « Histoires — bandeau ». Aucun contenu n'est inventé ni déplacé.

---

## 36. Version 1.19.0 — remplacement d'un fichier (ARRÊTÉE)

### 36.1 Décision

Le § 11.2 interdisait jusqu'ici de remplacer le binaire d'un média (« on envoie un nouveau
média »), alors que l'écran « Fiche d'un média » (ECRANS § 5.1) prévoit un bouton **Remplacer le
fichier**. Le client demande le 21/11/2026 que ce parcours existe : l'interdiction est levée.
Le remplacement est une **modification en place**, pas une création : il conserve l'identifiant
du média, donc toutes les références (contenus, galeries, photos fixes, corps riches) restent
valides sans réécriture.

### 36.2 Route et sémantique

`POST /admin/api/v1/medias/:id/remplacer` — `multipart/form-data`, exactement un fichier dans le
champ `fichier`, et un champ texte `version` (entier positif, la version lue sur la fiche).

- Le fichier passe par le même traitement qu'à l'envoi : type réel contrôlé par le contenu,
  rotation EXIF, nettoyage SVG, limites 10 Mo / 25 Mo, déclinaisons WebP 480/960/1600/2400.
- De **nouvelles clés de stockage** sont générées (original + déclinaisons) ; les anciens
  fichiers sont retirés après validation de la transaction. Aucun `overwrite` Cloudinary, aucun
  trou de disponibilité : le média reste lisible jusqu'au succès.
- La ligne `media` garde son `id`, son créateur, son texte alternatif, sa légende, son crédit,
  son emplacement et son caractère décoratif. Elle reçoit le nouveau `cle_stockage`, le nouveau
  `mime`, les nouvelles dimensions et le nouveau poids, et `version + 1`.
- Les anciennes déclinaisons sont remplacées par les nouvelles (même `mediaId`).
- L'action est journalisée sur `medias` avec `avant` et `apres`, comme un `PATCH`.
- En cas d'échec (fichier refusé, version périmée, erreur de stockage ou de base), aucun nouveau
  fichier n'est laissé orphelin et le média reste inchangé.

### 36.3 Erreurs et concurrence

`404` si le média n'existe pas ou est supprimé ; `409 VERSION_PERIMEE` avec
`details.versionCourante` si la version envoyée est périmée ; `422 FICHIER_REFUSE` pour un type
ou une taille refusés. Le droit requis est `modifier` sur `medias` (comme `PATCH`) — pas
`supprimer`. Un média déjà utilisé se remplace **sans** lever `RG-08` : c'est précisément le but
de la route (RG-08 ne protège que la suppression).

### 36.4 Compatibilité

Aucune route ni forme existante ne change ; `POST /medias`, `PATCH`, `GET`, `DELETE` et la vue
publique (§ 18.1) restent identiques. Le site public ne voit qu'une nouvelle URL d'image pour le
même média : il la lit depuis l'API à la construction (ou via le serveur dynamique, § 30), sans
réécriture d'hôte. Le bouton « Remplacer le fichier » de l'écran 5.1 devient opérationnel.

---

## 37. Version 1.20.0 — identité, étiquettes et réglages sur le site (ARRÊTÉE)

### 37.1 Périmètre

Le contrat décrivait déjà `GET /identite` et `PATCH /identite` (§ 13.1) et les étiquettes (§ 9.17),
sans que le back end les servent ni que le site les consomme. Cette version ouvre les écritures
déjà prévues et ajoute deux routes publiques. Les écrans `/navigation` et `/textes-interface`,
codés mais retirés du menu en attendant la décision C9, sont réintégrés sans changement de contrat.

### 37.2 `GET /public/api/v1/site` — identité

Vue publique du document `identite` (§ 13.1). Aucun champ interne, aucune URL relative :

```
{
  nom, email, linkedin: string | null, linkedinLabel: string | null, localisation: string | null,
  role, signature, manifeste, devise: string | null, mission: string | null,
  tagline: string[], bio: string[],
  stats: [{ cle, libelle, valeur: number | null, suffixe: string | null,
            dateValidation: string | null, source: string | null, ordre }],
  heroImage: ImagePublique | null
}
```

`statut` des champs : une valeur `null` reste vide et le site retombe sur son actif historique —
aucune donnée n'est inventée pour combler un champ non renseigné. Les libellés des stats suivent
la langue demandée (`?langue=`), avec repli sur le français.

### 37.3 `GET /public/api/v1/etiquettes` — étiquettes

`?type=&langue=` → `{ items: { id, code, type, libelle }[], total }`. Filtre `type` parmi les six
valeurs fermées du § 9.17. Les usages (`usages`) restent internes à l'admin et ne sont pas exposés.
Une liste vide est une réponse valide (`total: 0`).

### 37.4 Consommation par le site

Le chargeur écrit `site.json` et `etiquettes.json` dans `src/data/generated/` (contrat § 18.1),
aux côtés de `reglages.json`. La couche d'accès les lit à la construction (LIAISON § C.2) :

- `src/acces/site.ts` fusionne l'identité de l'API avec les valeurs de départ du dépôt, champ par
  champ, en laissant vide ce que l'API ne fournit pas ;
- `languesActives` de `reglages.json` pilote l'affichage du sélecteur de langue (le français reste
  toujours disponible) ;
- le vocabulaire des étiquettes remplace les listes codées en dur dans `src/data/content.ts` pour
  les filtres et la recherche. Si la liste API est vide, les listes de départ restent utilisées.

### 37.5 Compatibilité

Aucune route ni forme existante ne change. Les valeurs de départ du dépôt restent le repli en mode
démonstration (`PUBLIC_DATA_SOURCE` absent). En production, la face publique (§ 18) fait foi et
les JSON générés ne contiennent aucune URL relative au poste de développement.

---

## 38. Version 1.21.0 — l’emplacement des médias est facultatif à l’envoi (ARRÊTÉE)

> Statut : **arrêtée le 22/11/2026**. Demandée par le client le même jour ; écrites ensemble dans
> les deux dépôts (site `docs/CONTRAT-API.md` et copie `prince-edja-api/docs/contrat/CONTRAT-API.md`,
> identiques octet pour octet). **§ 38.4 est la clause de non-retour** : aucune donnée existante
> supprimée, aucun schéma public cassé.

### 38.1 Médias — `emplacement` (admin uniquement)

- Le champ reste `emplacement: string | null` sur la ressource média : le nom de l’endroit où le
  média est destiné à apparaître sur le site public (texte libre, max 120, « Galerie — hommes »,
  « À propos — bandeau », « Boutique — hero »…). La liste proposée par l’admin n’est qu’une aide de
  saisie.
- **Levée par cette version : l’exigence d’`emplacement` à l’envoi** (`multipart` de création) —
  règle introduite par la 1.6.0 (§ 23.1) et maintenue par les versions suivantes. Une absence de
  champ à l’envoi vaut `null` : le média est enregistré « sans emplacement » (état par défaut,
  « non précisé »), et peut l’attribuer ensuite par `PATCH /medias/:id` (facultatif / `null`).
- `GET /medias` filtre toujours `?emplacement=<sous-chaîne>` (insensible à la casse) ; l’API publique
  (`GET /photos-fixes`, `GET /contenus/*`) n’expose jamais l’emplacement.

### 38.2 Compatibilité

Aucune route, payload public ni donnée existante ne change. La seule transformation : un envoi
multipart **sans** `emplacement` est accepté et persiste `null`. Les médias déjà créés conservent
leur `emplacement` ; l’effacement par `PATCH` (`emplacement: null`) est inchangé.

### 38.3 Ce qui ne change pas

Filtres, droits, usages, journalisation : inchangés.

### 38.4 Clause de non-retour

Aucune suppression de données ; aucun champ public cassé ; le champ `emplacement` demeure optionnel
à l’écriture et lisible comme `string | null` à la lecture.
