# PROMPT — Front-end de l'espace admin Prince EDJA

Tu es chargé de construire le front-end de l'espace d'administration du site Prince EDJA. Lis tout ce document avant d'agir. Ne code rien tant que tu n'as pas terminé la lecture, puis commence par l'étape 0 de la section 13 et arrête-toi pour attendre ma validation.

## 2. Rôle, objectif et périmètre

Tu es un développeur front-end senior, expert React et TypeScript, soucieux d'accessibilité et de rigueur. Tu construis **depuis zéro** l'interface d'administration du site de Prince Edja, avec le rôle d'un produit livrable, pas d'une maquette.

**Objectif** : une application web d'administration qui permet à trois rôles (éditeur, administrateur, super-admin) de gérer tout le contenu du site public : récits, épisodes, projets, pièces de la boutique, médias, textes de pages, audience, paramètres, comptes. L'interface est conçue pour qu'un back-end réel vienne ensuite se brancher sans la réécrire.

**Ce que tu livres**

1. Une application React + TypeScript autonome, dans son propre dossier, avec une seule interface qui adapte menus et actions au rôle connecté.
2. Une couche d'accès à l'API qui, pour l'instant, s'appuie sur des données simulées (mocks) respectant le contrat de la section 7.
3. Tous les écrans de la section 9, les composants transverses de la section 10 et les règles de la section 11.
4. Des tests, une documentation courte (`README`) et un guide de branchement du back-end.

**Ce que tu ne fais pas**

- Pas de back-end, pas de base de données, pas de serveur d'authentification : la section 7 fixe le contrat que le futur back-end respectera.
- Pas de modification du site public.
- Pas de réutilisation de l'ancien admin (il est supprimé : formulaires de démonstration, `localStorage`, identifiants par défaut). Tu repars d'une page blanche.
- Pas de contenu inventé : ni texte éditorial, ni chiffre, ni prix, ni source. Les jeux de données de démonstration sont clairement marqués « exemple ».

**Langue** : l'interface de l'admin est en français. Les contenus qu'elle édite existent en français et en anglais (section 10).

**Mode multi-vendeurs : préparé, pas construit.** Le cahier des charges prévoit qu'EDJA Shop s'ouvre un jour à d'autres créateurs et artisans. Dans ce prompt, tu construis **uniquement la préparation** : l'entité Créateur, son écran d'administration, le rattachement de chaque bijou à un créateur, le réglage `multiVendeurs` (faux par défaut) et des permissions capables de tester le propriétaire d'un objet. Tu ne construis **pas** l'espace vendeur (menus, commandes, reversements) : il fera l'objet d'un autre prompt. Mais ton architecture ne doit pas l'empêcher : aucun test de rôle écrit en dur, aucune liste qui suppose un seul créateur, aucun composant qui ignore le propriétaire d'un objet.

## 3. Contexte du projet

Le site public est celui de **Prince Edja**, entrepreneur, storyteller et producteur audiovisuel basé à Abidjan. Il suit un cahier des charges en trois lots : Prince EDJA (identité, à propos, presse), EDJA Shop (collection de bijoux TRIBE) et Projets & Histoires (X'PLORE, Taste & Travel, journal, archive).

**Ce qui existe côté public** : un site React à deux langues (français, anglais) dont tout le contenu est écrit dans des fichiers de données du code : 7 articles, 6 épisodes, 10 pièces, 3 villes Taste & Travel, 6 destinations, 7 projets, 8 entrées d'archive, 4 distinctions, 6 parutions de presse, 5 jalons, et des textes écrits directement dans les pages. Les visiteurs ne peuvent rien envoyer qui soit stocké.

**Ce qui est supprimé** : l'ancien espace admin (sept écrans dont trois vides, un faux magasin en `localStorage`, une connexion `admin` / `admin`). Ne cherche pas à le lire ni à le réutiliser.

**Ce qui vient après toi** : un back-end (base PostgreSQL et API) sera construit ensuite à partir du contrat de la section 7. Tout ce que tu inventes en mock doit donc être réaliste et remplaçable sans changer les écrans.

**Faits du métier à respecter partout**

- Le cahier des charges interdit d'inventer une donnée de crédibilité : prix, matière, créateur, chiffre d'audience, date de validation, provenance, source. Un champ inconnu reste **vide**, et l'interface doit distinguer « vide » de « zéro ».
- La boutique est aujourd'hui en mode « sur demande » : une pièce sans prix confirmé s'affiche « sur demande », jamais un montant.
- Le contenu peut être « à fournir » : l'admin affiche cet état sans le masquer.
- Une entrée d'archive sans source n'est pas publiable.
- La signature et la phrase manifeste du hero sont imposées par le cahier des charges : toute modification demande une confirmation explicite.

## 4. Pile technique et contraintes

**Base commune avec le site public** (relevée dans son code ; aligne les versions sur son `package.json`, sans les deviner) :

- React et TypeScript en mode strict, Vite comme outil de build, alias de chemin `@` vers `src`.
- Tailwind CSS 4 configuré par le bloc `@theme` d'un fichier CSS, plugin `@tailwindcss/vite`.
- `react-router` pour le routage, `lucide-react` pour les icônes, `clsx` et `tailwind-merge` pour les classes.
- `vitest` pour les tests.
- Polices installées en local par `@fontsource` (Anton, Manrope, Fraunces) : aucune requête vers un CDN de polices.

**Bibliothèques que tu ajoutes** (choix par défaut ; remplace-en une seulement si tu justifies en deux phrases dans le `README`) :

| Besoin | Choix par défaut | Raison |
| --- | --- | --- |
| Données serveur, cache, états de chargement | TanStack Query | Isole l'API ; le passage du mock au vrai back-end ne touche pas les écrans |
| Formulaires et validation | React Hook Form + Zod | Les schémas Zod portent les règles de la section 11 |
| Éditeur de texte riche | Tiptap (ProseMirror) | Corps des récits, sortie JSON stockable |
| Réordonner des listes | dnd-kit, avec alternative clavier | Accessibilité |
| Mocks d'API | MSW (Mock Service Worker) | Les appels HTTP réels sont interceptés, donc le code est celui de la production |
| Tests de bout en bout | Playwright | Parcours clés par rôle |
| Accessibilité automatisée | `eslint-plugin-jsx-a11y` et axe | Contrôles en CI |

**Contraintes techniques non négociables**

- TypeScript strict, aucun `any` ni `@ts-ignore` sans commentaire justificatif.
- Aucune clé, mot de passe ou identifiant dans le code ni dans le bundle ; la seule variable d'environnement attendue côté client est l'adresse de l'API (`VITE_API_URL`).
- Aucun contenu stocké dans `localStorage` ni `sessionStorage` ; l'authentification se fera par cookie `HttpOnly` posé par le back-end, donc le front ne lit jamais de jeton. Seules des préférences d'affichage (panneau replié, filtre mémorisé) peuvent être gardées, avec `try/catch`.
- Une seule application admin, servie sur sa propre adresse (pas dans l'application publique), avec un `basename` réglable.
- Pas de dépendance abandonnée ou sans mise à jour récente ; installe chaque dépendance à une version précise et note-la.
- Aucune requête vers un service tiers au chargement (pas d'analytics, pas de CDN) : l'admin manipule des données personnelles.

## 5. Identité visuelle et design system

L'admin est de la même famille que le site public mais plus sobre : un outil de travail, pas une vitrine. **Copie à l'identique le bloc `@theme` et la couche sémantique `:root` de `styles/globals.css` du site public** (jointe), puis complète-les seulement pour les besoins propres à l'admin.

**Jetons à reprendre**

| Rôle | Jeton | Usage dans l'admin |
| --- | --- | --- |
| Fond de page | `sand-50` (`--color-bg`) | Zone de travail |
| Surface | `sand-100` (`--color-surface`) | Cartes, panneaux, tableaux |
| Filet | `sand-200` (`--color-border`) | Bordures, séparateurs |
| Texte | `ink-900` ; secondaire `ink-700` ; muet `ink-500` | `ink-500` est le plus clair qui passe 4,5:1 sur le sable : ne jamais l'éclaircir |
| Accent | `clay-600`, survol `clay-700`, aplat `clay-500` | Boutons principaux, liens, focus |
| Marque | `leaf-600`, `forest-950`, `forest-900` | Barre latérale sombre (texte crème), titres de section |
| Or | `gold-400` | Filets et puces décoratifs seulement, jamais en texte |
| Rouge `promo-500` |  | Uniquement l'aperçu d'un prix barré |

Règles de couleur du site à respecter : pas de texte `sage` ni `leaf` sur fond sombre (contraste insuffisant, c'est crème et or là-bas) ; l'or ne sert jamais de texte sur fond clair ; aucune couleur n'est utilisée seule pour transmettre un état.

**Typographie**

- Titres de page et de section : `font-display` (Anton) en capitales, avec les échelles `heading-md` et `heading-sm` du thème.
- Texte, formulaires, tableaux : `font-sans` (Manrope), corps `body`, notes en `caption`.
- `font-quote` (Fraunces) : réservée aux citations de l'aperçu, pas à l'interface.
- Libellés courts de rubrique : l'utilitaire `label-caps` du site.

**Statuts** : cinq pastilles avec icône **et** libellé, jamais la couleur seule.

| État | Libellé | Traitement |
| --- | --- | --- |
| `brouillon` | Brouillon | Fond `sand-200`, texte `ink-900` |
| `en_relecture` | En relecture | Fond `gold-300` atténué avec texte `ink-900` |
| `publie` | Publié | Fond `sage-100`, texte `forest-900` |
| `archive` | Archivé | Contour `sand-300`, texte `ink-500` |
| `a_fournir` | À fournir | Contour pointillé `clay-600`, texte `clay-700` |

**Composants de base à créer** (inspire-toi de ceux du site public dans `components/ui` : `Button`, `Badge`, `Field`, `Tag`, `Eyebrow`, `SectionHeading`) : bouton (primaire, secondaire, discret, danger), champ de texte, zone de texte, liste déroulante, case à cocher, interrupteur, onglets, tableau de données, boîte de dialogue, panneau latéral, notification, état vide, état de chargement, bandeau d'erreur.

**Mouvement** : transitions courtes (250 ms au plus, courbe `ease-expo` du thème), pas de parallaxe, pas de curseur personnalisé, pas d'animation de décor ; tout mouvement respecte `prefers-reduced-motion`.

**Mise en page** : barre latérale fixe à gauche sur écran large, menu repliable en bas ou en panneau sur mobile ; contenu en colonne ; l'admin doit rester utilisable sur téléphone pour la lecture et les actions rapides (traiter un message, publier), et confortable sur ordinateur pour la rédaction.

## 6. Architecture de l'application

Organise le code par famille de contenu (`features`) plutôt que par type de fichier, avec une couche `api` unique que les écrans ne contournent jamais.

```text
admin/
  src/
    app/            routeur, fournisseurs, gabarits (coque, page de connexion)
    api/
      client.ts     seul endroit qui appelle fetch
      schemas/      schémas Zod = contrat de données de la section 7
      endpoints/    une fonction typée par route
      mocks/        gestionnaires MSW et jeux de données d'exemple
    auth/           AuthProvider, permissions.ts, gardes de route
    components/
      ui/           composants de base (section 5)
      layout/       barre latérale, en-tête de page, fil d'Ariane
      editor/       éditeur de texte riche
      media/        sélecteur et médiathèque
      i18n/         champs FR / EN, indicateur de traduction
      statut/       pastille de statut, barre d'actions de publication
    features/
      recits/  episodes/  projets/  taste-travel/  boutique/
      distinctions/  presse/  destinations/  archive/  accueil/
      pages/  a-propos/  navigation/  textes-interface/
      medias/  audience/  parametres/  comptes/  journal/
    lib/            utilitaires (slug, dates, formats, erreurs)
    styles/         globals.css (jetons repris du site public)
    test/           outils et configuration de test
```

**Routes** (adresses en français, sans accent)

| Groupe | Adresses | Rôle minimal |
| --- | --- | --- |
| Accès | `/connexion`, `/mot-de-passe-oublie`, `/changer-mot-de-passe` | Public |
| Accueil de l'admin | `/` (tableau de bord) | Éditeur |
| Récits | `/recits`, `/recits/nouveau`, `/recits/:id` | Éditeur |
| Épisodes et projets | `/episodes`, `/projets`, `/taste-travel` (+ `nouveau`, `:id`) | Éditeur |
| Boutique | `/boutique/pieces`, `/boutique/categories` (+ `nouveau`, `:id`) | Éditeur (catégories : administrateur) |
| Autres contenus | `/distinctions`, `/presse`, `/destinations`, `/archive`, `/galerie`, `/univers`, `/jalons`, `/offres`, `/audience-chiffres` | Éditeur |
| Pages | `/pages`, `/pages/:id` (textes de page, SEO) | Éditeur |
| Médias | `/medias`, `/medias/:id` | Éditeur |
| Public reçu | `/messages`, `/demandes`, `/abonnes` | Administrateur |
| Réglages | `/identite`, `/navigation`, `/pages-legales`, `/textes-interface` | Administrateur |
| Technique | `/comptes`, `/journal`, `/parametres-techniques`, `/restauration` | Super-admin (journal : administrateur en lecture) |

**État et données**

- Les données du serveur passent par TanStack Query (clés de requête par famille, invalidation après écriture) ; aucun autre magasin global.
- L'état d'un formulaire vit dans le formulaire (React Hook Form) ; un brouillon non enregistré déclenche un avertissement avant de quitter la page.
- L'utilisateur connecté et son rôle viennent d'un appel `GET /auth/moi` au démarrage ; sans session valide, redirection vers `/connexion`.
- Les droits passent par une seule fonction `peut(role, action, ressource)` dans `auth/permissions.ts`, utilisée par les menus, les routes et les boutons. Cacher un bouton n'est pas une sécurité (le back-end revérifiera), mais l'interface ne propose jamais une action interdite.
- Chaque page chargée à la demande (`lazy`), avec un état de chargement et un état d'erreur.

## 7. Couche API : contrat et mocks

Le contrat ci-dessous est celui que le futur back-end respectera ; il découle du modèle de données de l'analyse conceptuelle. Écris-le sous forme de schémas Zod dans `api/schemas/`, déduis-en les types TypeScript et simule-le avec MSW.

**Conventions**

- Base : `/admin/api/v1`. JSON en UTF-8. Dates en ISO 8601.
- Authentification : cookie `HttpOnly` posé par le serveur ; chaque appel d'écriture envoie un en-tête anti-CSRF `X-CSRF-Token` obtenu par `GET /auth/moi`.
- Listes paginées : `?page=1&pageSize=20&q=&statut=&langue=&tri=-modifieLe` renvoie `{ items, page, pageSize, total }`.
- Concurrence : chaque contenu porte un `version` ; une écriture renvoie `409` si la version a changé, et l'interface propose de recharger.
- Erreurs : `{ status, code, message, champ?, details? }`. `code` est une règle de gestion (`RG-03`) ou un code technique (`VERSION_PERIMEE`). `401` renvoie à la connexion, `403` affiche un écran « accès refusé », `422` s'affiche au champ concerné, `429` invite à patienter.

**Types principaux** (schémas Zod à écrire d'après ces formes)

```ts
type Langue = 'fr' | 'en'
type Role = 'editeur' | 'admin' | 'super_admin'
type StatutContenu = 'brouillon' | 'en_relecture' | 'publie' | 'archive'
type Traductions<T> = Partial<Record<Langue, T>>   // une langue peut manquer

interface ContenuBase {
  id: string
  statut: StatutContenu
  publieLe: string | null          // futur = publication programmée
  creeLe: string
  modifieLe: string
  auteurId: string
  version: number
}

interface Article extends ContenuBase {
  imageId: string | null
  categorie: 'Voyage' | 'Histoire' | 'Patrimoine' | 'Tourisme'
            | 'Hospitalité' | 'Opinion' | 'Portraits' | 'Carnets de route'
  tagIds: string[]
  dureeLecture: number | null      // calculée depuis le corps
  aLaUne: boolean
  traductions: Traductions<{
    slug: string; titre: string; extrait: string
    corps: JSONContent | null      // sortie Tiptap
    seoTitre?: string; seoDescription?: string
  }>
}

interface Episode extends ContenuBase {
  numero: string; imageId: string | null; guideMediaId: string | null
  destinationId: string | null; tagIds: string[]; trailerUrl: string | null
  traductions: Traductions<{
    slug: string; titre: string; lieu: string; pitch: string
    synopsisLong?: string; noteIntention?: string; personnages?: string
    makingOf?: string; presse?: string; credits?: string
  }>
}

interface Bijou extends ContenuBase {
  numero: string; imageId: string | null; galerieMediaIds: string[]
  categorieId: string; tagIds: string[]; visible: boolean
  commerce: {
    reference: string; prix: number | null; prixConfirme: boolean
    ancienPrix: number | null; matieres: string[]; tailles: string[]
    edition: { numero: number; total: number } | null
    atelier: string | null; village: string | null; poids: number | null
    disponible: boolean
    createur: { nom: string; pays: string | null; ville: string | null; bio: string } | null
  }
  variantes?: Variante[]           // seulement si la boutique en ligne est activée
  traductions: Traductions<{ slug: string; nom: string; culture: string; histoire: string }>
}

interface Media {
  id: string; url: string; mime: string; largeur: number | null; hauteur: number | null
  poids: number; credit: string | null; usages: number
  declinaisons: { largeur: number; url: string }[]
  traductions: Traductions<{ texteAlt: string; legende?: string }>
  decoratif: boolean               // vrai = texte alternatif vide autorisé
}

interface Tag {
  id: string; type: 'pays' | 'ville' | 'theme' | 'annee' | 'format' | 'projet'
  code: string; traductions: Traductions<{ libelle: string }>
}

interface Compte {
  id: string; email: string; nom: string; role: Role; actif: boolean
  derniereConnexion: string | null; doitChangerMotDePasse: boolean
}
```

Les autres familles suivent le même modèle `ContenuBase` + `traductions` : projet (format, avancement, année, pays, thèmes, route, à fournir, ordre), ville Taste & Travel, destination (latitude, longitude, épisode lié, carnet), entrée d'archive (catégorie, texte, sources, fiabilité, époque, pays), distinction (année, organisme, lien, image), parution de presse (source, date, lien), image de galerie, univers, jalon, offre, page et son SEO. Les champs exacts viennent des types du site public (`types/index.ts`, `data/*`) et de l'analyse conceptuelle, sections 4 et 6.

**Créateur et rattachement.** Ajoute ces types et ce champ :

```ts
type Createur = ContenuBase & {
  nom: string;
  pays?: string;
  ville?: string;
  photoId?: string;            // Media
  estPrincipal: boolean;       // un seul : la plateforme (EDJA Shop)
  tauxCommission?: number;     // 0 à 100, vide si non défini ; jamais inventé
  traductions: Traductions<{ bio: string; accroche?: string }>;
};
// Bijou gagne : createurId: string  (par défaut l'id du créateur principal)
// Compte gagne : createurId?: string (obligatoire si role === 'vendeur')
// Role devient : 'editeur' | 'admin' | 'super_admin' | 'vendeur'
```

Le rôle `vendeur` existe dans les types et dans `peut()` mais aucun écran vendeur n'est créé. Le réglage `multiVendeurs` (booléen, faux par défaut, modifiable par le super-admin seulement) vient s'ajouter à `boutiqueEnLigne`.

**Routes à simuler**

| Route | Usage |
| --- | --- |
| `POST /auth/connexion`, `POST /auth/deconnexion`, `GET /auth/moi` | Session, rôle, jeton anti-CSRF |
| `POST /auth/changer-mot-de-passe`, `POST /auth/mot-de-passe-oublie` | Première connexion et réinitialisation |
| `GET /{ressource}`, `GET /{ressource}/:id` | Liste paginée, détail |
| `POST /{ressource}`, `PATCH /{ressource}/:id`, `DELETE /{ressource}/:id` | Création, modification avec `version`, suppression |
| `POST /{ressource}/:id/transition` avec `{ vers, programmeLe? }` | Soumettre, publier, dépublier, archiver |
| `PATCH /{ressource}/ordre` avec `{ ids }` | Réordonner |
| `GET/POST/PATCH/DELETE /medias`, `GET /medias/:id/usages` | Médiathèque ; l'envoi est multipart et renvoie les déclinaisons |
| `GET/PATCH /messages`, `/demandes` | Lecture, statut, réponse |
| `GET /abonnes`, `GET /abonnes/export`, `DELETE /abonnes/:id` | Liste, export CSV, suppression |
| `GET/POST/PATCH /comptes` | Comptes et rôles |
| `GET /journal` | Journal d'audit paginé, filtrable |
| `GET/PATCH /parametres`, `/identite`, `/navigation`, `/textes-interface`, `/pages-legales` | Réglages |
| `POST /site/reconstruire`, `GET /site/etat-reconstruction` | Déclenche et suit la publication du site |
| `GET /versions/:ressource/:id`, `POST /restauration` | Historique et restauration |
| `GET /tableau-de-bord` | Compteurs : à relire, messages non lus, contenus à fournir |

`{ressource}` vaut : `articles`, `episodes`, `projets`, `villes`, `bijoux`, `categories`, `distinctions`, `presse`, `destinations`, `archive`, `galerie`, `univers`, `jalons`, `offres`, `pages`, `tags`.

S'ajoutent à cette liste : `createurs` (création, modification, transition de statut, désactivation) et la route `GET /createurs/principal`. Les listes de `bijoux` et de `medias` acceptent un filtre `?createur=`. Quand `multiVendeurs` est faux, le mock ne renvoie qu'un seul créateur actif, le principal. Une tentative de supprimer ou de désactiver le créateur principal renvoie `422` avec `RG-21` ; supprimer un créateur qui possède des produits renvoie `422` avec `RG-27`.

**Comportement exigé des mocks**

- MSW intercepte de vrais appels `fetch` ; les écrans ignorent qu'ils parlent à un mock.
- Les mocks **appliquent les règles de gestion** de la section 11 côté « serveur » : publier sans texte alternatif renvoie `422` avec `RG-03`, un doublon de slug renvoie `422` avec `RG-04`, une version périmée renvoie `409`, un rôle insuffisant renvoie `403`.
- Latence simulée de 200 à 600 ms, échecs aléatoires activables par un réglage de développement, pagination réelle.
- Trois comptes d'essai (un par rôle) existent **uniquement** dans les mocks, chargés seulement en mode développement. Le build de production ne doit contenir ni MSW, ni jeux d'exemple, ni ces comptes : ajoute un contrôle automatique qui le vérifie en cherchant ces marqueurs dans le dossier `dist`.
- Les données d'exemple sont réalistes dans leur forme mais **marquées « Exemple »** dans les titres ; aucun texte prétendument réel n'est inventé, et les champs « à fournir » restent vides.
- Un réglage `boutiqueEnLigne` (faux par défaut) active les variantes, le stock, les commandes et les paiements dans les types et les écrans ; tant qu'il est faux, la boutique est en mode « sur demande ».

## 8. Rôles et droits

L'interface s'adapte au rôle : une action interdite est **absente** (pas grisée sans explication). La vérité reste côté serveur ; l'interface ne fait que refléter `peut(role, action, ressource)` défini dans `auth/permissions.ts`. Aucun test de rôle ne doit être écrit en dur dans un composant.

| Action | Éditeur | Admin | Super-admin |
| --- | --- | --- | --- |
| Créer et modifier un brouillon | Oui | Oui | Oui |
| Soumettre à relecture | Oui | Oui | Oui |
| Publier, dépublier, programmer | Non | Oui | Oui |
| Archiver et restaurer une version | Non | Oui | Oui |
| Supprimer un contenu | Non | Oui, s'il n'est pas utilisé | Oui, s'il n'est pas utilisé |
| Téléverser et décrire un média | Oui | Oui | Oui |
| Supprimer un média | Non | Oui, s'il n'est pas utilisé | Oui, s'il n'est pas utilisé |
| Lire et traiter messages et demandes | Non | Oui | Oui |
| Voir et exporter les abonnés | Non | Oui | Oui |
| Modifier navigation, textes d'interface, pages légales | Non | Oui | Oui |
| Modifier la signature et le manifeste du héros | Non | Oui, avec confirmation | Oui, avec confirmation |
| Paramètres du site et identité | Non | Oui | Oui |
| Déclencher la reconstruction du site | Non | Oui | Oui |
| Créer des comptes éditeur ou admin | Non | Non | Oui |
| Créer ou rétrograder un super-admin | Non | Non | Oui, jamais le dernier |
| Consulter le journal d'audit | Non | Lecture | Lecture et export |
| Activer `boutiqueEnLigne` | Non | Non | Oui |

**Comportements à implémenter**

- Le menu latéral, les boutons, les routes et les actions groupées sont tous filtrés par `peut`. Une route interdite affiche la page « Accès refusé » (403), pas une redirection silencieuse.
- Un éditeur voit « Soumettre à relecture » là où un admin voit « Publier » ; le statut `en_relecture` apparaît dans le tableau de bord de l'admin.
- Une réponse `403` du serveur affiche un message clair et recharge `GET /auth/moi`, car le rôle a pu changer.
- Un compte ne peut ni se supprimer, ni se rétrograder lui-même, ni retirer le dernier super-admin : les boutons correspondants sont absents et le mock renvoie `422`.
- La première connexion impose le changement du mot de passe avant tout autre écran.

**Préparation du rôle vendeur.** La signature devient `peut(compte, action, ressource, objet?)`. L'objet, quand il est fourni, porte son `createurId` : pour un compte `vendeur`, la fonction n'accepte l'action que si `objet.createurId === compte.createurId`. Pour les trois rôles actuels, l'objet est ignoré. Écris dès maintenant les tests du rôle `vendeur` sur `peut()` : un vendeur voit ses produits, jamais ceux d'un autre, ne publie jamais, et n'accède à aucun contenu éditorial. Aucun écran n'utilise encore ce rôle ; la route de connexion du mock ne crée pas de compte vendeur tant que `multiVendeurs` est faux.

Le serveur renverra `404` (et non `403`) quand un vendeur demande l'objet d'un autre créateur, pour ne rien révéler. L'interface traite ce cas comme une page introuvable.

## 9. Écrans à construire

Chaque famille de contenu suit le **même gabarit** : une liste, un formulaire, une fiche de détail avec historique. Construis d'abord ce gabarit générique (`ListePage`, `FormulairePage`), puis décline-le par famille ; ne recopie pas de code d'une famille à l'autre.

**Gabarit de liste.** Tableau avec recherche, filtres (statut, langue, tag), tri, pagination serveur, sélection multiple et actions groupées filtrées par rôle. Chaque ligne affiche le titre, le statut (icône + libellé), la date de modification, l'auteur et un indicateur de traduction FR/EN. États obligatoires : chargement (squelette), vide (message et bouton de création), erreur (message et bouton « Réessayer »). Sous 768 px, le tableau devient une liste de cartes.

**Gabarit de formulaire.** Colonne principale pour le contenu, colonne latérale pour statut, publication, image principale, tags et SEO. Barre de statut collée en haut avec les boutons autorisés par le rôle. Enregistrement manuel et brouillon automatique toutes les 30 secondes, avertissement avant de quitter avec des modifications non enregistrées, aperçu fidèle au site public, onglet « Historique » avec restauration.

| Écran | Route | Contenu et particularités |
| --- | --- | --- |
| Connexion | `/connexion` | E-mail, mot de passe, message d'erreur générique, verrouillage après échecs répétés, lien de réinitialisation |
| Tableau de bord | `/` | Compteurs : à relire, brouillons, messages non lus, contenus « à fournir » ; dernières modifications ; état de la reconstruction |
| Articles et récits | `/articles` | Éditeur riche, extrait, catégorie, tags, image principale ; les 7 articles existants sont « à venir » sans corps, le formulaire doit l'afficher comme « à fournir » |
| Épisodes | `/episodes` | Numéro, titre, résumé, vidéo ou lien, guide PDF optionnel, ville associée |
| Projets et villes | `/projets`, `/villes` | Description, galerie, ordre d'affichage par glisser-déposer avec alternative clavier |
| Bijoux | `/bijoux` | Nom, matières, description, images ; **prix masqué** tant que `prixConfirme` est vide ; bloc variantes visible seulement si `boutiqueEnLigne` |
| Catégories de la boutique | `/categories` | Huit catégories dont une seule est alimentée ; compteur de bijoux rattachés |
| Distinctions et presse | `/distinctions`, `/presse` | Source et date obligatoires |
| Destinations | `/destinations` | Lieu, texte, images, lien vers épisode |
| Archive | `/archive` | Une entrée sans source n'est pas publiable (règle du CDC, voir section 11) ; champ source mis en évidence |
| Galerie et médias | `/medias` | Médiathèque : grille, recherche, envoi multiple, texte alternatif FR/EN, recadrage, usages d'un média, suppression bloquée si utilisé |
| Univers, jalons, offres | `/univers`, `/jalons`, `/offres` | Listes ordonnables ; aucun chiffre d'audience ou de tarif sans source |
| Pages du site | `/pages` | Accueil et pages fixes ; signature et manifeste du héros avec confirmation explicite |
| Messages | `/messages` | Boîte de réception, non lu, traité, archivé ; réponse par e-mail ; jamais de suppression silencieuse |
| Demandes | `/demandes` | Demandes sur mesure et de collaboration, statuts et notes internes |
| Abonnés | `/abonnes` | Liste, recherche, export CSV, suppression ; aucun envoi de campagne dans cette version |
| Navigation et textes | `/navigation`, `/textes-interface` | Menus ordonnables ; libellés FR/EN avec contrôle des clés manquantes |
| Pages légales | `/pages-legales` | Éditeur riche versionné ; le texte juridique est fourni par le client, jamais généré |
| Paramètres et identité | `/parametres` | Onze champs de `SiteInfo`, réseaux, coordonnées ; champ vide ≠ zéro |
| Comptes | `/comptes` | Super-admin seulement : création, rôle, désactivation, réinitialisation |
| Journal | `/journal` | Qui, quoi, quand, avant et après ; filtres ; lecture seule |
| Publication | `/publication` | Bouton « Reconstruire le site », suivi d'état, historique des reconstructions |
| Profil | `/profil` | Changement de mot de passe, langue de l'interface |
| Erreurs | `*` | 403, 404 et erreur inattendue, avec retour au tableau de bord |

Le client n'a pas encore fourni tous les contenus : chaque écran doit rester utilisable avec des données vides, et les champs manquants sont signalés par la pastille « à fournir », jamais remplacés par du texte de remplissage.

**Écran ajouté : Créateurs** (`/createurs`, admin et super-admin). Liste des créateurs avec statut et nombre de produits, formulaire (nom, pays, ville, photo, bio et accroche en FR et EN, taux de commission facultatif, jamais prérempli), page publique en aperçu. Le créateur principal porte la mention « Plateforme » et ne peut ni être supprimé ni désactivé (RG-21). Un créateur qui possède des produits ne se supprime pas : le bouton propose de le désactiver et explique que ses produits seront dépubliés (RG-27). Dans la fiche d'un bijou, ajoute un sélecteur de créateur (valeur par défaut : le principal) ; dans la liste des bijoux et la médiathèque, ajoute un filtre par créateur, masqué tant que `multiVendeurs` est faux. Les listes et formulaires n'affichent aucune colonne ni champ « vendeur » dans ce cas. Cela porte le total à **25 écrans**.

## 10. Composants transverses

Ces composants vivent dans `components/` et sont réutilisés par tous les écrans. Chacun est documenté par un court exemple d'usage et couvert par un test.

| Composant | Rôle et exigences |
| --- | --- |
| `Bouton`, `Champ`, `Select`, `Case`, `Interrupteur` | Primitives basées sur les jetons ; états focus, désactivé, erreur ; zone cliquable de 44 px minimum ; libellé toujours relié au champ |
| `ChampTraduit` | Deux onglets FR et EN pour un même champ, avec indicateur « traduit / à traduire / vide » ; la langue FR est la référence, EN peut rester vide tant que la langue n'est pas active (RG-03) |
| `PastilleStatut` | Icône et libellé pour `brouillon`, `en_relecture`, `publie`, `archive`, `a_fournir` ; jamais la couleur seule |
| `BarreStatut` | Barre collée du formulaire : statut courant, date de publication programmée, boutons autorisés par `peut`, indicateur d'enregistrement |
| `EditeurRiche` | Tiptap : titres 2 à 4, gras, italique, listes, citation, lien, image issue de la médiathèque ; sortie en JSON structuré, jamais du HTML brut ; collage nettoyé ; aucune balise de script ou de style acceptée |
| `SelecteurMedia` | Ouvre la médiathèque en boîte de dialogue, recherche, envoi à la volée ; refuse de valider un média sans texte alternatif (RG-08) |
| `ListeOrdonnable` | Glisser-déposer avec dnd-kit **et** boutons « monter » et « descendre » au clavier ; annonce vocale de la nouvelle position |
| `SelecteurTags` | Tags par groupe (format, pays, thème, projet) ; au moins un tag de format pour un article (RG-06) |
| `TableauDonnees` | Tri, pagination serveur, sélection multiple, colonnes masquables, état vide et erreur ; bascule en cartes sous 768 px |
| `BoiteDialogue`, `Confirmation` | Piège de focus, fermeture à `Echap`, retour du focus ; la confirmation d'une action destructive nomme l'objet concerné et le nombre d'éléments touchés |
| `Notifications` | Zone `aria-live` polie pour les succès, assertive pour les erreurs ; disparition automatique seulement pour les succès |
| `AvertissementSortie` | Bloque la navigation et la fermeture de l'onglet si des modifications ne sont pas enregistrées |
| `HistoriqueVersions` | Liste des versions, comparaison simple avant / après, restauration confirmée |
| `PanneauUsages` | Liste des contenus qui utilisent un média ou un tag ; explique pourquoi une suppression est refusée |
| `IndicateurAFournir` | Pastille et compteur pour tout champ attendu du client et pas encore reçu ; ne propose jamais de valeur par défaut inventée |
| `ApercuSite` | Rend le contenu avec les mêmes styles que le site public, en mobile et en bureau |
| `ErrorBoundary`, `Squelette`, `EtatVide`, `EtatErreur` | Les trois états d'une liste ou d'un détail ; message en français clair, sans trace technique |
| `LienEvitement`, `FilAriane`, `TitrePage` | Lien d'évitement vers le contenu, fil d'Ariane, titre unique `h1` par page qui met aussi à jour `document.title` |

**Formulaires.** React Hook Form et un schéma Zod par famille ; les messages d'erreur sont en français, liés au champ par `aria-describedby`, et un résumé des erreurs en tête de formulaire reçoit le focus à la soumission. Les erreurs `422` du serveur sont rattachées au champ concerné grâce au code RG renvoyé.

**Composants ajoutés pour le multi-vendeurs.** `SelecteurCreateur` (liste des créateurs publiés, recherche, valeur par défaut le principal, accessible au clavier) et `FiltreCreateur` pour les listes. Les deux se masquent d'eux-mêmes quand `multiVendeurs` est faux. Le composant `TableauDonnees` accepte une colonne « Créateur » facultative, et `PanneauUsages` indique aussi le créateur propriétaire d'un média.

## 11. Règles de gestion dans l'interface

Le serveur fait foi, mais l'interface doit **empêcher l'erreur avant l'envoi** et expliquer clairement le refus quand il arrive. Les codes RG proviennent de l'analyse conceptuelle ; affiche-les en petit dans le message d'erreur, pour que l'équipe puisse faire le lien avec la documentation.

| Code | Règle | Effet dans l'interface |
| --- | --- | --- |
| RG-01 | Un seul statut par contenu | Une seule pastille, transitions limitées aux suivantes autorisées |
| RG-02 | Seul un admin publie | Bouton « Publier » absent pour l'éditeur, qui voit « Soumettre à relecture » |
| RG-03 | Publication : titre, slug, résumé, image avec texte alternatif, dans chaque langue active | Bouton « Publier » actif mais, si une exigence manque, ouvre une liste cliquable des champs manquants qui mène à chacun |
| RG-04 | Slug unique par type et par langue | Généré depuis le titre, modifiable, contrôlé à la saisie ; un doublon propose une variante |
| RG-05 | Date future = publication programmée | Sélecteur de date et d'heure, fuseau `Africa/Abidjan` affiché ; statut « programmé » visible |
| RG-06 | Un article porte au moins un tag de format | Erreur de validation sur `SelecteurTags` avant l'envoi |
| RG-07 | Articles liés : au moins un tag en commun, hors lui-même | Aperçu de l'article montre les articles liés calculés, non saisis à la main |
| RG-08 | Un média a texte alternatif et crédit ; suppression refusée s'il est référencé | Champs obligatoires à l'envoi ; suppression remplacée par `PanneauUsages` |
| RG-09 | Une catégorie vide n'est pas affichée | Compteur de bijoux et mention « masquée sur le site » |
| RG-10 | Un bijou a au moins une variante ; prix et stock sur la variante | Seulement si `boutiqueEnLigne` ; sinon bijou sans variante, en mode « sur demande » |
| RG-11 | Une demande cite une variante et un contact valide, sans réserver de stock | Lecture seule côté admin ; aucune action de stock |
| RG-12 | Abonné actif après confirmation ; e-mail unique | Statut « en attente » ou « confirmé », filtre associé |
| RG-13 | Consentement : date, finalité, texte accepté | Colonnes visibles dans la fiche abonné, non modifiables |
| RG-14 | Messages conservés 24 mois (durée à valider) | Date de purge affichée ; la durée est un paramètre, pas une constante |
| RG-15 | Limitation par IP et champ piège | Aucun effet admin ; le mock des formulaires publics ne fait pas partie de ce périmètre |
| RG-16 | Rôle unique ; dernier super-admin intouchable ; seul un super-admin gère les admins | Boutons absents, confirmation à double saisie pour changer un rôle |
| RG-17 | Toute action est journalisée | Chaque écran liste une activité récente ; le journal est consultable |
| RG-18 | Mot de passe haché ; aucun identifiant par défaut en production | Aucun identifiant dans le code livré ; jauge de robustesse à la création |
| RG-19 | Publier ou dépublier déclenche une reconstruction | Après une publication, bandeau « Site en cours de mise à jour » avec suivi ; `/publication` donne l'historique |

**Règles du cahier des charges et de non-invention**

- Ne jamais préremplir ni inventer un prix, une matière, un créateur, un chiffre d'audience ou une source. Un champ vide se montre comme « à fournir » ; vide et zéro ne sont pas la même chose, le zéro doit être saisi volontairement.
- La boutique est « sur demande » : un prix n'est montré sur le site que si `prixConfirme` est renseigné. Le formulaire du bijou affiche l'avertissement tant qu'il est vide.
- Une entrée d'archive sans source n'est pas publiable.
- La signature et le manifeste du héros sont imposés par le cahier des charges : toute modification demande une confirmation explicite qui rappelle cette origine.
- Le contenu est bilingue FR et EN ; le texte alternatif de chaque image est exigé dans chaque langue active.
- Les textes juridiques sont fournis par le client ; l'interface n'en génère aucun et signale leur absence.

**Règles ajoutées pour le mode multi-vendeurs**

| Code | Règle | Effet dans l'interface |
| --- | --- | --- |
| RG-20 | Chaque produit appartient à un seul créateur | Sélecteur de créateur obligatoire, valeur par défaut le principal |
| RG-21 | Un seul créateur principal, ni supprimable ni désactivable | Boutons absents, mention « Plateforme » ; le mock renvoie `422` |
| RG-22 | Un vendeur n'accède qu'aux objets de son créateur | Test dans `peut()` ; `404` du serveur traité comme page introuvable |
| RG-23 | Un produit de vendeur passe par `en_relecture`, un admin publie | Préparé dans les transitions ; aucun écran vendeur pour l'instant |
| RG-27 | Un créateur qui possède des produits ou commandes se désactive, ne se supprime pas | Bouton « Désactiver » avec explication des conséquences |

Les règles RG-24, RG-25, RG-26 et RG-28 (commandes, commissions, reversements, invitations) concernent l'espace vendeur et la vente en ligne : ne les implémente pas dans cette livraison.

## 12. Normes à respecter

Ces normes sont **non négociables**. Elles s'appliquent à chaque écran et chaque composant, et une étape de livraison n'est pas validée tant qu'une seule est violée.

**Accessibilité (WCAG 2.2 niveau AA)**

- Contraste de 4,5:1 pour le texte, 3:1 pour les composants. Sur fond clair, le texte le plus clair autorisé est `ink-500`. Pas de texte `sage` ou `leaf` sur fond sombre. `gold` et `promo-500` ne servent jamais de couleur de texte courant.
- Tout se fait au clavier : ordre de tabulation logique, focus visible d'au moins 2 px, aucun piège de focus hors dialogues, raccourcis jamais exclusifs.
- Cibles tactiles de 44 × 44 px minimum.
- Un `h1` par page, hiérarchie de titres sans saut, points de repère `header`, `nav`, `main`, lien d'évitement en premier élément focusable.
- Information jamais portée par la couleur seule : icône et libellé pour les statuts et erreurs.
- `prefers-reduced-motion` respecté : aucune animation de déplacement ni de défilement lorsqu'il est actif.
- Annonces `aria-live` pour enregistrements, erreurs et changements de statut ; changement de route annoncé et focus replacé sur le `h1`.
- Texte jusqu'à 200 % de zoom et fenêtre de 320 px sans défilement horizontal.

**Design et langue**

- Uniquement les jetons du site public (section 5) ; aucune couleur ni police en dur dans les composants. Polices hébergées avec `@fontsource`, aucun appel à un service tiers au chargement.
- Interface d'administration en français ; tous les libellés passent par un dictionnaire (`i18n/fr.ts`) pour permettre une version anglaise plus tard. Dates et nombres au format français, fuseau `Africa/Abidjan`.
- Mode clair uniquement dans cette version, sauf si le site public propose un mode sombre.
- Mobile d'abord : tout écran reste utilisable à 320 px ; la navigation latérale devient un tiroir.

**Sécurité**

- Aucun secret, mot de passe, jeton ou identifiant par défaut dans le code, les variables d'environnement `VITE_*` (hors `VITE_API_URL`) ou le dépôt (RG-18).
- Session par cookie `HttpOnly`, `Secure`, `SameSite` ; en-tête `X-CSRF-Token` sur toute requête qui modifie ; `credentials: 'include'`.
- Rien du contenu ni de la session dans `localStorage`, `sessionStorage` ou les URL ; seules les préférences d'affichage (colonnes, filtres) y sont autorisées.
- Aucun `dangerouslySetInnerHTML` sans passer par un assainisseur centralisé ; le contenu riche est du JSON rendu par composants.
- Téléversements : type et taille vérifiés côté client **et** serveur ; le nom de fichier n'est jamais utilisé tel quel.
- Déconnexion automatique après inactivité avec avertissement 2 minutes avant ; écran verrouillé sans perte du brouillon.
- L'administration est exclue des moteurs de recherche : `noindex` et en-tête `X-Robots-Tag`.

**Qualité du code**

- TypeScript strict, `any` interdit, aucune assertion `as` non justifiée ; ESLint avec `jsx-a11y`, Prettier.
- Aucun fichier de plus de 300 lignes ; un composant fait une chose ; la logique métier est dans des hooks et des fonctions pures testables.
- Aucune requête `fetch` en dehors de `api/` ; aucun test de rôle en dehors de `auth/permissions.ts`.
- Aucune dépendance ajoutée sans justification ; versions figées par le fichier de verrouillage.

**Performance**

- Découpage par route avec chargement différé ; l'éditeur riche et la médiathèque ne sont chargés qu'à l'ouverture.
- Budget indicatif : moins de 250 ko de JavaScript compressé pour la page de connexion et le tableau de bord.
- Images de la médiathèque en miniatures, avec dimensions réservées pour éviter les sauts de mise en page.

**Non-invention**

- Aucun texte de remplissage, aucune statistique, aucun nom de client, aucun prix prétendu réel. Les données d'exemple sont marquées « Exemple ».

## 13. Tests, critères d'acceptation et livraison

**Tests exigés**

- Vitest et Testing Library : `peut()` pour les trois rôles sur chaque action, schémas Zod, transitions de statut, composants transverses.
- Playwright sur les parcours critiques : connexion et première connexion, création d'un article puis soumission par un éditeur, publication par un admin, refus de publication sans texte alternatif, envoi d'un média, réordonnancement au clavier, suppression refusée d'un média utilisé, création d'un compte par un super-admin, accès refusé d'un éditeur à `/comptes`.
- Contrôle axe sur chaque route, zéro violation de niveau sérieux ou critique.
- Contrôle automatique du build de production : aucune trace de MSW, de données d'exemple ni de comptes d'essai dans `dist`, aucune variable `VITE_*` autre que `VITE_API_URL`.

**Tests ajoutés pour le multi-vendeurs.** Tests unitaires de `peut()` pour le rôle `vendeur` avec objet propre et objet d'un autre créateur ; test du mock qui refuse de supprimer le créateur principal (`RG-21`) ; test Playwright qui crée un créateur, lui attribue un bijou, puis vérifie que ni le sélecteur ni le filtre ne s'affichent tant que `multiVendeurs` est faux.

**Critères d'acceptation globaux**

- Les 25 écrans de la section 9 existent, sont accessibles selon le rôle et montrent leurs trois états (chargement, vide, erreur).
- Chaque règle de la section 11 est observable dans l'interface et couverte par au moins un test.
- `npm run build`, `npm run lint`, `npm run typecheck` et `npm test` passent sans avertissement.
- Remplacer les mocks par le vrai back-end ne demande que de changer `VITE_API_URL` et de retirer l'enregistrement de MSW : aucun écran n'est modifié.

**Livraison par étapes.** Travaille dans cet ordre et **arrête-toi à la fin de chaque étape** avec un court compte rendu (ce qui est fait, ce qui reste, les questions) ; ne passe pas à la suivante sans mon feu vert.

| Étape | Contenu | Validation |
| --- | --- | --- |
| 0 | Lecture du `package.json` et de `globals.css` du site public, proposition de pile alignée, squelette du projet, jetons, lint, tests, CI | Je valide la pile et les versions |
| 1 | Couche `api/` et mocks MSW, types, `auth/permissions.ts`, client HTTP avec CSRF et gestion des erreurs | Tests des mocks et de `peut()` |
| 2 | Coquille : mise en page, navigation par rôle, connexion, première connexion, pages d'erreur, `LienEvitement` | Parcours de connexion pour les trois rôles |
| 3 | Composants transverses de la section 10 | Page de démonstration et tests |
| 4 | Gabarits liste et formulaire, puis Articles de bout en bout | Parcours éditeur puis admin |
| 5 | Médiathèque et ses usages | Envoi, texte alternatif, suppression refusée |
| 6 | Créateurs, bijoux, catégories, épisodes, projets, villes, destinations | Mode « sur demande », prix masqué, créateur principal protégé |
| 7 | Distinctions, presse, archive, univers, jalons, offres, pages | Archive sans source non publiable |
| 8 | Messages, demandes, abonnés, navigation, textes, pages légales, paramètres | Export CSV, confirmation du manifeste |
| 9 | Comptes, journal, publication, profil, tableau de bord | Parcours super-admin |
| 10 | Audit d'accessibilité, performance, nettoyage, documentation | Tous les critères d'acceptation |

**Documentation à livrer.** Un `README` (installation, scripts, variables, structure), un fichier `docs/CONTRAT-API.md` récapitulant chaque route simulée, ses entrées, ses sorties et ses codes d'erreur (c'est la spécification que le back-end devra respecter), et un fichier `docs/DECISIONS.md` pour chaque choix pris en cas d'incertitude.

**En cas de doute.** Pose une question plutôt que d'inventer. Si une information manque (versions réelles, textes légaux, prestataires de paiement, dossiers `admin/` et `public/` absents de l'archive), note-la dans `docs/DECISIONS.md` et continue avec l'hypothèse la plus prudente.

Fin du prompt.
