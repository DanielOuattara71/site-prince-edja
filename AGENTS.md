# AGENTS.md — Prince Edja

## Stack
Vite 8 + React 19 + TypeScript ~6.0 (strict) + Tailwind CSS v4 (`@tailwindcss/vite`) + Motion (`motion/react`) + React Router 7. Fonts via `@fontsource`, importées en tête de `src/styles/globals.css` (pas dans `main.tsx`). Package manager : **npm**.

## Commands
```bash
npm run dev          # vite dev server
npm run build        # tsc -b && contraste && vite build  (typecheck is part of build)
npm run preview      # preview dist/
npm run lint         # oxlint (not eslint)
npm run typecheck    # tsc -b (project references) — retour rapide
npm run contraste    # ratios WCAG des couples palette (échoue le build si sous le seuil)
npm run images       # convertit les PNG lourds d'un dossier en JPEG/WebP + maj des refs
npm run test         # vitest run — tests de la logique pure (routage)
```
Ordre de vérification : `npm run typecheck && npm run lint && npm run test && npm run build`.
Aucun test, aucun pre-commit hook.

## CI & branches
- **Un seul workflow**, `.github/workflows/deploy.yml` : push sur **`recent`** uniquement (+ `workflow_dispatch`) → **GitHub Pages**. Il n'enchaîne que `npm install` puis `npm run build` : ni `lint`, ni `typecheck`, ni contrôle de sitemap. Un `oxlint` qui gémit ne casse rien.
- `recent` et `new` pointent aujourd'hui au même commit (`aa1cb2c`), 1 devant `origin/recent`. **Un push sur `new` ne déploie rien.** Vérifier `git rev-list --left-right --count origin/recent...HEAD` avant de conclure qu'une poussée déploie.
- ⚠️ `README.md` annonce un déploiement Vercel ; la source exécutable est la CI → GitHub Pages.
- ⚠️ `public/sitemap.xml` et `public/robots.txt` pointent vers `https://prince-edja.vercel.app`, **sans** le préfixe de base `/site-prince-edja/`. Ils sont donc faux au regard du déploiement réel, et aucun script ni étape CI ne le signale. `npm run seo` / `seo:check` **n'existent pas sur cette branche** (ils viennent de `aa1cb2c`). À trancher : domaine de production, puis sitemap cohérent.

## TypeScript
- `tsconfig.json` est référence seule → `tsconfig.app.json` (`src/`) + `tsconfig.node.json` (`vite.config.ts`).
- `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`, `verbatimModuleSyntax`, `allowImportingTsExtensions`, `moduleDetection: force`, `noFallthroughCasesInSwitch`. Variable ou paramètre inutilisé = échec ; `import type` obligatoire pour les types.
- Alias `@/*` → `src/*` (`vite.config.ts:12` + `tsconfig.app.json:12`). Toujours `@/` pour `src/`.
- ⚠️ `npx tsc --noEmit` ne vérifie **rien** ici : `tsconfig.json` est en `files: []` (mode project references). Utiliser `npm run typecheck`.

## Architecture
- Entrée : `src/main.tsx` → `src/App.tsx`. `BrowserRouter basename="/site-prince-edja"`. Home eager, tout le reste `lazy()`.
- **Routes publiques** (`src/App.tsx:105-198`) : `/`, `/a-propos`, `/a-propos/influence`, `/histoires`, `/xplore`, `/xplore/:slug`, `/taste-and-travel`, `/boutique`, `/boutique/:objet`, `/journal`, `/journal/:slug`, `/presse`, `/contact`, `/travailler-ensemble`, 5 pages légales, `*`. Les routes `/admin` sont hors `SiteLayout`.
- **La navigation a une source unique** : `src/data/navigation.ts`. Header, overlay, footer, recherche et fil d'Ariane lisent tous ce fichier. Ajouter une entrée la fait apparaître partout. Ne jamais écrire un lien de nav en dur dans un composant.
- **i18n** : `src/i18n/contexteLangue.ts` (contexte + `useLangue`), `src/i18n/FournisseurLangue.tsx` (provider), `src/i18n/dictionnaire.ts` (FR/EN, chrome uniquement). Les libellés bilingues sont des objets `{ fr, en }` résolus par `l()`. **Le contenu éditorial n'est pas traduit** — pas de pendant anglais à ce jour. Séparer le contexte du fournisseur : export autre chose qu'un composant dans un `.tsx` déclenche `react/only-export-components` et casse le fast refresh.
- **Recherche** : `src/lib/recherche.ts` (index maison, sans dépendance) + `src/components/layout/RechercheGlobale.tsx` (déclencheur + Cmd/Ctrl+K) qui charge en `lazy` `PanneauRecherche.tsx` (combobox accessible). `rechercher(requete, index)` prend l'index en paramètre : c'est le point de remplacement par un backend.
- `useSeo` (`src/hooks/useSeo.ts`) est le seul point d'écriture des balises (`title`, `description`, `og:*` absolus, canonical sans ancre, `robots` via `indexable`). `useJsonLd` est séparé : cycle de vie différent.
- Aides : `src/lib/cn.ts` (clsx + tailwind-merge), `src/lib/format.ts` (`formatFCFA` est **le** seul endroit qui formate un montant), `src/lib/motion.ts` (`DUR`, `EASE_EXPO`, `EASE_QUART`, `fadeUp`, `staggerContainer`).
- **Thème de la barre** : `Section tone="dark"` pose `data-theme-bare` ; `useThemeBare` (`src/hooks/useThemeBare.ts`) observe ce qui passe sous l'en-tête. `isDarkTop` ne sert plus que d'amorce à la première frame. Un nouvel héros sombre se déclare donc tout seul — ne jamais revenir à une liste de routes tenue à la main.
- **Curseur Gye Nyame opt-in** : l'effet (et `cursor: none`) ne se lève que dans une zone `data-curseur` (galeries, lookbook, lightbox). Pas de `data-curseur` ailleurs : le curseur natif doit rester seul.
- ⚠️ `cn()` étend `tailwind-merge` pour que les huit tokens de taille (`text-caption`, `text-heading-sm`…) restent du `font-size`. Sans cette extension, une taille écrasait la `text-{couleur}` présente dans le même `cn()`, et le héritage de couleur rendait le texte invisible.
- Un fichier de `public/` s'écrit **toujours** `` `${import.meta.env.BASE_URL}chemin` `` : `base: '/site-prince-edja/'`. Aucun `/images/` en dur dans `src/`. Dans `index.html`, Vite préfixe seul — ne pas toucher.
- **Échelle z-index** (pas de valeurs à côté) : `0` filigranes · `10` pastilles sur image · `20` contrôles d'un module · `30` aperçu flottant · `40` overlay de navigation · `50` barre fixe · `60` bouton flottant de demande · `70` recherche et loader · `80` modales (lightbox, panneau de demande, lien d'évitement) · `9999` curseur. Deux surfaces au même niveau étaient départagées par l'ordre du DOM : c'est ce que cette échelle remplace.

## Contenu (data-driven)
`src/data/content.ts` (UNIVERS, EPISODES, TRAVEL_CITIES, BIJOUX, ARTICLES, PRESS, MILESTONES, CONTACT_MOTIFS), `site.ts`, `gallery.ts`, `distinctions.ts`, typés par `src/types/index.ts`. Aucun texte en dur dans un composant.
`Tags` (`src/types/index.ts`) est le vocabulaire commun : `pays`, `ville`, `theme`, `annee`, `format`, `projet`. Les champs incertains restent **vides** — `BIJOUX` n'a volontairement ni `pays` ni `theme`, car aucune source n'indique la provenance d'une pièce.

## Direction artistique
- **Trois familles typographiques, pas quatre** : Anton (`--font-display`), Fraunces (`--font-quote`), Manrope (`--font-sans`). Aucune mono sur cette branche.
- Échelle typographique = 8 tokens (`display-xl`, `display-lg`, `heading-md`, `heading-sm`, `body-lg`, `body`, `caption`, `button`). `text-body-sm` et `text-heading-xs` **n'existent pas** : aucune règle émise, la taille retombe sur l'héritée, et le build ne dit rien.
- Palette : **trois couleurs**. Fond `sand` ivoire (`50`/`100`/`150`/`200`/`300`), encre `ink-*` (`900` titre, `700` corps, `500` muet — `500` = `#72634f`, le pas le plus clair qui tienne 4.5:1 sur tous les sables) et son pendant sombre `night-900`/`night-800` + `cream-100`. **Un seul accent : `clay-*`** (`500` aplats, `600` texte et filets, `700` survol).
- **Le vert est la famille de marque, pas un second accent** : `forest-*` pour les surfaces sombres de marque (hero boutique, CTA, blocs), `leaf-600` pour le texte et les filets sur ivoire (6.3:1 mini), `sage-*` pour les étiquettes (toujours avec `text-ink-700`). Règle dure : **jamais de vert en texte ou en puce sur fond nuit** (2.5:1) — là-bas c'est crème et or. `gold-400` est un **matériau** : filets, puces, halos — jamais en texte sur fond clair (1.9:1). `promo-500` (`#d0021b`) n'existe que pour le prix soldé.
- L'anneau `:focus-visible` (`globals.css`) lit `var(--color-accent)` (= `clay-600`) et reste en terracotta même sur les surfaces de marque : c'est la seule teinte qui tienne 3:1 sur ivoire, sur nuit et sur forêt. Ne pas le surcharger localement.
- Rayons : **aucun token `--radius-*` n'existe ici.** Utiliser `rounded-full`, `rounded-xl`, `rounded-md`. `rounded-soft`, `rounded-sharp`, `rounded-pill`, `2xl`, `3xl`, `lg`, `sm` ne génèrent aucune règle ou sortent de l'échelle — les deux premiers classes fantômes ont été éradiquées de `PanneauRecherche`, ne pas les y remettre.
- Rythme : un seul padding de héros (`pt-32 pb-20 lg:pt-44 lg:pb-28`), `section-y` pour les sections de contenu, deux largeurs de conteneur (`max-w-7xl` grilles, `max-w-3xl` lecture). Écarts verticaux : `mt-16` bloc voisin, `mt-20` nouveau groupe, `mt-24` césure majeure.
- Motion : `--d-fast` 250 ms, `--d-base` 450 ms, `--d-reveal` 750 ms. `prefers-reduced-motion` coupe boucles et parallaxes, pose les révélations d'emblée. Le grain est une texture statique : il reste.
- 16 utilitaires maison en racine de `globals.css` (`label-caps`, `section-y`, `grain`, overlays…). `@utility` ne peut **pas** être imbriqué dans Tailwind v4 : un `@utility` mal fermé casse le build entier.
- **Trame de tissage** (`motif-tisse`) : inspiration formelle du tissage ouest-africain, **sans aucun symbole nommé** — un motif porteur de sens ne devient pas une texture. Réservée aux surfaces de marque de la boutique (`forest-950`, `night-900`) : héros, `ColonneMots`, lightbox. Jamais sur sable (tache), jamais sur une photo de pièce. Opacité 5 % et `z-index: 0` : le `::after` est positionné, il passe donc **au-dessus** de tout contenu sans `z-index` — les surfaces qui l'acceptent posent `relative z-10` sur leur contenu.
- **Carte du parcours** (`/xplore`, section « La carte ») : `CarteParcours` pilote **Leaflet à la main** (`useRef` + `useEffect`), sans wrapper React — la carte est initialisée une fois, redessinée quand les étapes changent, détruite par `map.remove()` au démontage. Chargée en `lazy()` : Leaflet ne pèse que sur cette page.
  - **Fond vectoriel, pas de tuiles.** Ni OpenStreetMap ni CARTO ne fournissent de tuiles `@2x` gratuites (400 chez l'une, 256 px chez l'autre) : sur écran retina, une tuile pique du flou dès qu'on zoome. La Côte d'Ivoire est donc **tracée en vecteur** depuis `src/data/geo/cote-ivoire.json` (Natural Earth 10m, domaine public, arrondi à 3 décimales) : net à tout zoom, 23 Ko, et **zéro dépendance réseau**. L'attribution « Frontières © Natural Earth » doit rester affichée.
  - **Toutes les étapes sont à l'ouest** : la frontière orientale du pays s'arrête à 2,5 °O, et Adiaké, la plus orientale, est à 3,3 °O. Une ancienne convention « positif = ouest » l'avait placée de l'autre côté du méridien — donc hors du pays.
  - **Le tracé n'est pas la route parcourue.** Sans traces GPS, OSRM calcule la route la plus courte entre deux étapes : reconstruction, pas preuve. L'interface le dit, et si OSRM tombe chaque segment retombe sur la ligne droite (`src/lib/routage.ts`).
  - Zoom molette volontairement désactivé (une carte qui capte le scroll enferme le visiteur) ; `maxBounds` sur le pays + 2° de marge ; zoom buttooir à 7 pour qu'on voie la Côte d'Ivoire, pas seulement la côte.
- ⚠️ **Trois pièges qui vident une carte sans écrire la moindre erreur dans la console** :
  1. `var(--color-*)` ne se résout pas dans un **attribut** SVG. Leaflet l'écrit tel quel dans `stroke=`/`fill=` : la ligne reste invisible. Passer par les valeurs hex des tokens, à garder synchrones avec `globals.css`.
  2. OSRM renvoie du GeoJSON, donc `[lng, lat]` ; Leaflet attend `[lat, lng]`. Sans inversion, chaque tracé se plaque à `M0 0`.
  3. `StrictMode` est actif (`main.tsx`) : deux effets séparés — initialisation en `useRef`, destruction à part — laissent une carte déjà détruite au second montage. Tout est créé et retiré dans **un seul** `useEffect`.
- ⚠️ Une valeur arbitraire contenant des virgules (`h-[clamp(...)]`) n'est pas générée par Tailwind : le cadre mesurait 0 px de haut. La hauteur de la carte passe par la classe maison `.cadre-carte`.

## Lint / Format
- **oxlint**, plugins `react` + `typescript` + `oxc`. `react/rules-of-hooks: error`, `react/only-export-components: warn (allowConstantExport)`.
- ⚠️ `npm run lint` n'ignore rien : il balaie aussi `admin-custom/`, un **projet npm séparé** (6 des 15 warnings viennent de là). Ne pas les corriger dans une tâche sur le site.
- Prettier (`printWidth: 100`, `singleQuote: true`, `trailingComma: all`) — pas de script npm.
- Le repo utilise le pattern « ajustement d'état pendant le rendu » (`if (precedent !== actuel) setEtat(...)`) plutôt qu'un `useEffect` de remise à zéro. Un effet de reset déclenche `react(set-state-in-effect)` et un rendu visible.

## Env & assets
- `VITE_WEB3FORMS_ACCESS_KEY` (formulaire de contact), `VITE_ADMIN_USER` / `VITE_ADMIN_PASS` (défaut `admin`/`admin`), `VITE_ADMIN_CUSTOM_URL` (défaut `http://localhost:5175`).
- `.env` / `.env.local` sont gitignorés.
- Images de remplacement dans `public/images/`, générées par `scripts/placeholders.mjs`. **`sharp` est une devDependency** depuis l'optimisation (88 Mo → 6,6 Mo) : les photos livrées en PNG de plusieurs Mo doivent passer par `npm run images <dossier>`.
- Les PNG ne servent plus qu'à ce qui a besoin de transparence (logo, curseur) ; le contenu est en JPEG, avec deux largeurs pour le hero (`SITE.heroSrcSet`).

## Trois surfaces d'administration
| Surface | Rôle | Commande |
|---|---|---|
| `src/pages/admin` + `src/components/admin` | admin codé intégré à l'app principale | `npm run dev`, routes `/admin/*` |
| `admin/` | Decap CMS, projet séparé | `npm run dev` **dans `admin/`**, port 5174 |
| `admin-custom/` | admin React séparé, port 5175 | `npm run dev` **dans `admin-custom/`** |
**L'auth admin est décorative** : `AdminGuard` lit `sessionStorage['pe_admin_auth'] === '1'`, et `AdminLoginPage` compare en dur aux variables d'env tout en **affichant les identifiants attendus dans le message d'erreur**. Ce n'est pas une barrière de sécurité.

## Gotchas
- `Eyebrow` (`src/components/ui/Eyebrow.tsx`) est le marqueur de section de cette branche, avec `num` et `tone`.
- `StatItem` (`src/components/ui/StatItem.tsx`) est **thémé clair** (`text-ink-900`) et prend `value`/`suffix`/`label` en props, pas un objet. Ne pas l'utiliser sur un fond `night-*`.
- `ParallaxImage` n'a pas de prop `speed` : l'amplitude se règle par `range` (pourcentage). `priority` force le chargement immédiat.
- `LazyImage` rend une `<figure>` avec `aspect-ratio` : pas besoin de wrapper.
- Sous WSL, les assets touchés depuis Windows basculent en `100755`. `git config core.fileMode false` est déjà posé ici ; sans lui, un commit embarque des dizaines de changements de permission.
- `admin/config.yml` (Decap) vise `version_3` **et** un repo `prince-edja/site` qui n'existe pas (le vrai est `DanielOuattara71/site-prince-edja`) → à réaligner avant toute édition de contenu via Decap.
- `src/components/brand/Embleme.tsx` est **exporté mais importé nulle part** : le loader utilise `MaskEmblem`, l'onglet le favicon. Brique morte à supprimer ou à brancher dans le header.
- `dist/` est la sortie de build (gitignorée).
