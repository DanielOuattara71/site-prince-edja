# Les images du site sur Cloudinary

> Décision du client, 15/11/2026 : « pour les média et objet on utilisera Cloudinary ».
> Ce document couvre **les images statiques du dépôt** (`public/images/`). Les images de
> contenu (articles, projets, boutique, presse) partent déjà par l'API et la médiathèque,
> qui sert des URL Cloudinary en production — rien à faire ici pour elles.

## Les deux pipelines, en une image

| Pipeline | Source des URLs | Où vivre |
|---|---|---|
| Contenu éditorial (journal, boutique, presse…) | API publique `res.cloudinary.com/<cloud>/…` (production) | Cloudinary, via l'admin |
| Images statiques du site (placeholders actuels) | `PUBLIC_IMAGES_BASE_URL` au build, sinon repli local | `public/images/`, poussé sur Cloudinary le jour J |

## La règle de bascule : `PUBLIC_IMAGES_BASE_URL`

- **Absente** (développement, build par défaut, previews) : le site sert les fichiers de
  `public/images/` sous la base `/site-prince-edja/images/…`. Rien n'a changé.
- **Présente** (build de mise en ligne) : chaque `img(`images/<chemin>`)` se résout en
  `<PUBLIC_IMAGES_BASE_URL>/<chemin>` — mêmes noms de fichiers, mêmes déclinaisons
  (`-640.jpg` pour les cartes, `-1200.jpg`/`-2000.jpg` pour le hero). Un seul changement
  d'environnement, zéro modification du code.

Variable publique côté navigateur (comme `PUBLIC_API_URL`). Erreur classique : la renseigner
sans avoir poussé les fichiers au préalable — le site afficherait des URL 404. Pousser d'abord,
puis builder.

## Le jour de la mise en ligne

1. Créer le compte Cloudinary (plan gratuit suffisant au lancement). Noter le **nom du cloud**.
2. Noter les trois valeurs (fichier `.env` local et secrets de l'hébergeur/CI — jamais dans le dépôt) :
   `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
3. Pousser le dossier :
   ```bash
   node scripts/pousser-images-cloudinary.mjs            # dépose, ignore les existants
   node scripts/pousser-images-cloudinary.mjs --verifier # HEAD de chaque URL publique
   ```
4. Définir `PUBLIC_IMAGES_BASE_URL=https://res.cloudinary.com/<cloud>/image/upload/prince-edja/site`
   (avec `prince-edja` par défaut, ou la valeur de `CLOUDINARY_DOSSIER`) dans les secrets du CI,
   puis reconstruire et republier le site.
5. Vérifier la home, la boutique et une fiche produit : les `src` pointent sur `res.cloudinary.com`.

Le sitemap/CDN du hero, le `og:image` par défaut (`index.html`) et le domaine (`robots.txt`,
`sitemap.xml`) sont des chantiers séparés — ne pas les confondre avec celui-ci.

## Ensuite : les vraies photographies

Les 72 images de `public/images/` sont **des placeholders générés** (`scripts/placeholders.mjs`,
quelques vraies photos seulement). Deux façons de les remplacer, au choix :

- **Via l'admin** : la médiathèque dépose dans le même compte Cloudinary (même dossier) ; les
  pages de contenu passent alors par `PUBLIC_DATA_SOURCE=api` — c'est la cible.
- **En remplaçant les fichiers** puis `node scripts/pousser-images-cloudinary.mjs --ecrase`
  (re-dépose et invalide le cache Cloudinary pour les URL identiques).

Les deux peuvent cohabiter — l'admin pour le contenu, le dépôt pour ce qui reste statique.

## Ce qui n'a pas changé

- `public/images/` reste dans le dépôt : replis en local, régénération possible, historique.
- Aucun fichier du compte Cloudinary n'est supprimé par le script (dépôt uniquement, jamais de `destroy`).
- Aucune nouvelle dépendance : `fetch` et `node:crypto` (le push suit la même signature que
  `StockageCloudinary` du back end — SHA-1 trié, secret en suffixe).
- `.svg` inclus (Cloudinary accepte le type `image` ; les SVG servent aux motifs et placeholders).
- Jamais de secret ni d'URL signée dans les journaux.
