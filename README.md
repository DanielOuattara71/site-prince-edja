# Prince Edja — Site officiel

Site vitrine multi-pages : documentaires X'PLORE & Taste & Travel, univers OHENE,
collection TRIBE, journal et presse.

## Stack

Vite + React 19 + TypeScript strict + Tailwind CSS v4 + Motion + React Router v7.
Fontes self-hosted (Anton, Manrope, Fraunces) via Fontsource.

## Commandes

```bash
npm install
npm run dev         # serveur de développement
npm run build       # build production (tsc -b && vite build)
npm run preview     # prévisualiser le build
npm run lint        # oxlint
npm run typecheck   # tsc -b
```

Garde-fou avant chaque étape : `npm run typecheck && npm run lint && npm run build`.

## Modifier le contenu

Tout le contenu vit dans `src/data/*.ts` (typé par `src/types/index.ts`).
Les composants ne contiennent aucun texte en dur.

## Médias

Placeholders SVG dans `public/images/` — à remplacer par les photos/vidéos réelles
d'OHENE Prod (AVIF/WebP recommandé, vidéos mp4 ≤ 3 Mo avec poster).

## Déploiement

Vercel — SPA rewrites via `vercel.json`. Domaine définitif à configurer puis
mettre à jour `og:url` dans `index.html`.
