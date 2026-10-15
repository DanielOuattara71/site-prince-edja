# Prince Edja, site officiel

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

Placeholders SVG dans `public/images/`, à remplacer par les photos/vidéos réelles
d'OHENE Prod (AVIF/WebP recommandé, vidéos mp4 ≤ 3 Mo avec poster).

## Déploiement

GitHub Pages, via `.github/workflows/deploy.yml` : un push sur la branche `recent`
(ou un déclenchement manuel) installe les dépendances, build et publie `dist/`.
Le site est servi sous la base `/site-prince-edja/` (`vite.config.ts`).

`vercel.json` reste dans le dépôt mais n'est pas utilisé par la CI : à supprimer
si Vercel n'est pas retenu. `public/sitemap.xml` et `public/robots.txt` pointent
encore vers `prince-edja.vercel.app` sans le préfixe de base, à réaligner sur
l'URL de production avant la prochaine mise en ligne.
