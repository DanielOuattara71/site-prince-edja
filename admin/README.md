# Admin Prince Edja — dossier séparé

Decap CMS (Git-based) — édite `../src/data/*.ts` + `../public/images/*` sans DB.

## Lancer
```bash
cd admin
npm install
npm run dev    # http://localhost:5174/admin/ (proxy vers site)
# test local sans GitHub : passer `backend: test-repo` dans config.yml
```

## Config
- `config.yml` mappe `src/types/index.ts` (14 entités)
- `media_folder: public/images/uploads` → commit dans repo → rebuild Vercel
- Branch `version_3` (cf `AGENTS.md`)

## Deploy
Option A (recommandé) : Vercel 2 projets — `prince-edja` (site) + `prince-edja-admin` (ce dossier en `admin/`).
Option B : copier `admin/` dans `public/admin/` du site et exclure du rewrite `vercel.json:3` → `source: "/((?!admin|assets).*)"`

## Workflow client
Éditer → Save → Editorial Workflow (brouillon) → Publish → commit Git → rebuild site (60s).
