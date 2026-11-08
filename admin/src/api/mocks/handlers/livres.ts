import { ID_CREATEUR_PRINCIPAL } from '@/api/mocks/donnees'
import { entreeLivreSchema, modificationLivreSchema, type Livre } from '@/api/schemas/livres'
import { magasin } from '@/api/mocks/magasin'
import { erreur } from '@/api/mocks/reponses'
import { ressourceSimulee, titreDe } from '@/api/mocks/ressource-simulee'
import { manquesImage, manquesTraduits, texteOuVide } from '@/api/mocks/handlers/editorial'

/**
 * Livres simulés (SCHEMAS § 8.3 ; contrat 1.5.0 proposé, § 22), sur la fabrique commune (D-63).
 * Règles : RG-03 (titre, résumé, couverture avec texte alternatif), RG-10 (au moins une
 * variante), RG-20 (créateur), RG-29 / RG-30 (catégorie de la famille `produit`).
 */
export const handlersLivres = ressourceSimulee<Livre>({
  nom: 'livres',
  collection: () => magasin.livres,
  remplacer: (liste) => {
    magasin.livres = liste
  },
  entree: entreeLivreSchema,
  modification: modificationLivreSchema,
  champTitre: 'titre',
  slugs: true,
  traduction: (e) => ({ titre: e['titre'], resume: texteOuVide(e['resume']) }),
  champsInitiaux: (e) => ({
    reference: String(e['reference']),
    // Sans multi-vendeurs, le créateur est le principal (RG-20) ; jamais inventé autrement.
    createurId: (e['createurId'] as string | null | undefined) ?? ID_CREATEUR_PRINCIPAL,
    categorieId: (e['categorieId'] as string | null | undefined) ?? null,
    imageId: (e['imageId'] as string | null | undefined) ?? null,
    galerieMediaIds: (e['galerieMediaIds'] as string[] | undefined) ?? [],
    visible: (e['visible'] as boolean | undefined) ?? true,
    prixConfirme: (e['prixConfirme'] as boolean | undefined) ?? false,
    auteur: (e['auteur'] as string | null | undefined) ?? null,
    editeur: (e['editeur'] as string | null | undefined) ?? null,
    isbn: (e['isbn'] as string | null | undefined) ?? null,
    anneePublication: (e['anneePublication'] as number | null | undefined) ?? null,
    nombrePages: (e['nombrePages'] as number | null | undefined) ?? null,
    variantes: (e['variantes'] as Livre['variantes'] | undefined) ?? [],
    tagIds: (e['tagIds'] as string[] | undefined) ?? [],
  }),
  exigences: (o) => [
    ...manquesTraduits(o.traductions, { titre: 'Titre', resume: 'Résumé' }),
    ...manquesImage(o.imageId, 'imageId', true),
    ...(o.categorieId ? [] : [{ champ: 'categorieId', message: 'Catégorie manquante.' }]),
    ...(o.createurId ? [] : [{ champ: 'createurId', message: 'Créateur manquant.' }]),
    ...(o.variantes.length > 0
      ? []
      : [{ champ: 'variantes', message: 'Au moins une variante est exigée.' }]),
  ],
  credibilite: (o) => (o.auteur ? [] : ['auteur']),
  controler: (o) => {
    if (magasin.livres.some((autre) => autre.id !== o.id && autre.reference === o.reference)) {
      return erreur(422, 'RG-04', 'Cette référence est déjà celle d’un autre livre.', {
        champ: 'reference',
      })
    }
    // Comme le back end : la catégorie d'un livre est obligatoire dès l'enregistrement (colonne
    // `NOT NULL`, contrat 1.5.0 § 22.3).
    if (!o.categorieId) {
      return erreur(422, 'VALIDATION', 'Catégorie obligatoire.', { champ: 'categorieId' })
    }
    {
      const categorie = magasin.categories.find((c) => c.id === o.categorieId)
      if (!categorie) {
        return erreur(422, 'VALIDATION', 'Cette catégorie n’existe pas.', { champ: 'categorieId' })
      }
      if (categorie.famille !== 'produit') {
        return erreur(422, 'CATEGORIE_INCOMPATIBLE', 'Un livre prend une catégorie de produits.', {
          champ: 'categorieId',
        })
      }
    }
    for (const [i, v] of o.variantes.entries()) {
      if (v.ancienPrix !== null && v.prix !== null && v.ancienPrix <= v.prix) {
        return erreur(422, 'VALIDATION', 'L’ancien prix doit dépasser le prix.', {
          champ: `variantes[${i}].ancienPrix`,
        })
      }
    }
    return null
  },
  // Une variante écrite sans identifiant en reçoit un (RG-33 : elle appartient à ce livre).
  apresEcriture: (o) => {
    o.variantes = o.variantes.map((v) => (v.id ? v : { ...v, id: crypto.randomUUID() }))
  },
  tris: {
    reference: (o) => o.reference,
    titre: (o) => titreDe(o, 'titre').toLowerCase(),
  },
  // Auteur, catégorie et prix minimal lisibles dans la liste (ECRANS § 4.3).
  resume: (o) => {
    const prix = o.variantes.flatMap((v) => (v.disponible && v.prix !== null ? [v.prix] : []))
    return {
      numero: o.reference,
      auteur: o.auteur,
      categorie:
        magasin.categories.find((c) => c.id === o.categorieId)?.traductions.fr?.nom ?? null,
      prixMin: prix.length ? Math.min(...prix) : null,
      visible: o.visible,
    }
  },
  filtrer: (o, params) => {
    const categorie = params.get('categorie')
    return !categorie || o.categorieId === categorie
  },
})
