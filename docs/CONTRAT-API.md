# CONTRAT-API — Prince EDJA

> **Version 1.3.0 · 01/11/2026 · ARRÊTÉE.**
> Contrat de la face d'administration (`/admin/api/v1`) entre l'interface d'admin (`admin/`) et
> le back end (`prince-edja-api`). La face publique figure en annexe (§ 18), à titre de
> référence pour le back end et le site.
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
| `doc`, `paragraph`, `text`, `heading` (`level` 2, 3 ou 4), `bulletList`, `orderedList`, `listItem`, `blockquote`, `hardBreak`, `image` | `bold`, `italic`, `link` |

- **`image`** : attributs `{ mediaId: string }` uniquement. L'URL est résolue à la lecture, et `GET /medias/:id/usages` retrouve l'image dans le corps.
- **`link`** : attributs `{ href: string }`. Seuls `https:`, `http:` et `mailto:`, ou une adresse relative commençant par `/`, sont acceptés.
- Tout autre nœud, marque ou attribut → `422 VALIDATION`.

### 9.2 `episodes` — films de la série X'PLORE
| Champ | Type | Règle |
|---|---|---|
| `numero` | `string` (ex. `"01"`) | P, U |
| `imageId` | `string \| null` | P |
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
`modifieLe` (v1.2.0).

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
(actions § 7).*

### 9.6 `archive` — Archive d'Afrique
| Champ | Type | Règle |
|---|---|---|
| `categorie` | `string` (≤ 60) | P |
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
Ensemble fermé : `mentions-legales`, `confidentialite`, `cookies`, `cgv`, `retours`.

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
| `POST /medias` | `multipart/form-data`, **un** fichier (champ `fichier`) et des champs facultatifs : `texteAltFr`, `texteAltEn`, `credit`, `decoratif`, `createurId`. → `201 Media`. Type réel contrôlé par le contenu : JPEG, PNG, WebP, AVIF, GIF, SVG nettoyé, PDF. Limites par défaut : 10 Mo pour une image, 25 Mo pour un PDF, paramétrables côté serveur. → `422 FICHIER_REFUSE`. Le nom d'origine du fichier n'est jamais utilisé. |
| `GET /medias` | Filtres : `q` (texte alternatif, légende, crédit), `mime` (`image` ou `pdf`), `createur`, `aFournir`, `nonUtilise=true`. Tri : `-creeLe` par défaut. Items : `Media`. |
| `GET /medias/:id` | — |
| `PATCH /medias/:id` | `traductions`, `credit`, `decoratif`, `createurId`, avec `version`. Le fichier ne se remplace pas : on envoie un nouveau média. |
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
| `GET /site` | — | Identité, navigation, textes d'interface, pages légales publiées, réglages publics (`languesActives`) |
| `GET /sitemap` | — | Adresses publiables par langue, avec date de modification |

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
