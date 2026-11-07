import type { Bijou, Categorie } from '@/api/schemas/boutique'
import type { Createur } from '@/api/schemas/createurs'
import type { CreateurEssai } from '@/api/mocks/donnees'
import { magasin } from '@/api/mocks/magasin'
import { manquesMedia, trouverMedia, type Manquant } from '@/api/mocks/regles'

/**
 * Règles de la boutique simulée (`docs/CONTRAT-API.md` § 10), reprises du back end (B-39 à
 * B-45). Elles ne prouvent rien sur le vrai serveur (D-14) : celui-ci a ses propres tests.
 */
const GALERIE_ATTENDUE = 5

export const nomBijou = (b: Pick<Bijou, 'traductions'>) =>
  b.traductions.fr?.nom ?? b.traductions.en?.nom ?? ''

/** Exigences de publication d'un bijou (§ 7.5, § 10.3), dans chaque langue active. */
export function exigencesBijou(b: Bijou): Manquant[] {
  const langues = magasin.languesActives
  const manques: Manquant[] = []
  for (const langue of langues) {
    const t = b.traductions[langue]
    const prefixe = `traductions.${langue}`
    if (!t) {
      manques.push({ champ: prefixe, langue, message: `Traduction ${langue} absente.` })
      continue
    }
    if (!t.nom.trim()) manques.push({ champ: `${prefixe}.nom`, langue, message: 'Nom manquant.' })
    if (!t.culture?.trim()) {
      manques.push({
        champ: `${prefixe}.culture`,
        langue,
        message: 'Culture d’origine du symbole manquante.',
      })
    }
    if (!t.histoire.trim()) {
      manques.push({ champ: `${prefixe}.histoire`, langue, message: 'Histoire manquante.' })
    }
  }
  if (!b.imageId) manques.push({ champ: 'imageId', message: 'Image principale manquante.' })
  else manques.push(...manquesMedia(trouverMedia(b.imageId), 'imageId', langues))
  for (const id of new Set(b.galerieMediaIds)) {
    manques.push(...manquesMedia(trouverMedia(id), 'galerieMediaIds', langues))
  }
  if (b.variantes.length === 0) {
    manques.push({ champ: 'variantes', message: 'Un bijou a au moins une variante (RG-10).' })
  }
  return manques
}

/** Vente en ligne (RG-10, B-42) : prix et stock sur chaque variante. */
export function manquesVenteEnLigne(b: Bijou): Manquant[] {
  if (!magasin.boutiqueEnLigne) return []
  return b.variantes.flatMap((v, i) => [
    ...(v.prix === null ? [{ champ: `variantes.${i}.prix`, message: 'Prix manquant.' }] : []),
    ...(v.stock === null ? [{ champ: `variantes.${i}.stock`, message: 'Stock manquant.' }] : []),
  ])
}

function credibiliteBijou(b: Bijou): string[] {
  return [
    ...magasin.languesActives.flatMap((l) =>
      b.traductions[l] && !b.traductions[l].culture?.trim() ? [`traductions.${l}.culture`] : [],
    ),
    ...(b.galerieMediaIds.length < GALERIE_ATTENDUE ? ['galerieMediaIds'] : []),
    ...(b.edition ? [] : ['edition']),
    ...(b.atelier ? [] : ['atelier']),
    ...(b.village ? [] : ['village']),
    ...(b.poids === null ? ['poids'] : []),
    ...b.variantes.flatMap((v, i) => [
      ...(v.prix === null ? [`variantes.${i}.prix`] : []),
      ...(v.matiere ? [] : [`variantes.${i}.matiere`]),
    ]),
  ]
}

const distinctes = (valeurs: (string | null)[]) => [
  ...new Set(valeurs.filter((v): v is string => Boolean(v))),
]

/** Champs calculés à chaque lecture. */
export function enrichirBijou(b: Bijou): Bijou {
  const variantes = [...b.variantes].sort((x, y) => x.ordre - y.ordre)
  const trie = { ...b, variantes }
  return {
    ...trie,
    languesPresentes: (['fr', 'en'] as const).filter((l) => b.traductions[l]),
    champsAFournir: [
      ...new Set([...exigencesBijou(trie).map((m) => m.champ), ...credibiliteBijou(trie)]),
    ],
    matieres: distinctes(variantes.map((v) => v.matiere)),
    tailles: distinctes(variantes.map((v) => v.taille)),
  }
}

/** Exigences de publication d'un créateur : nom, biographie, photo décrite (§ 10.2). */
export function exigencesCreateur(c: Createur): Manquant[] {
  const langues = magasin.languesActives
  const manques: Manquant[] = []
  if (!c.nom.trim()) manques.push({ champ: 'nom', message: 'Nom manquant.' })
  for (const langue of langues) {
    const t = c.traductions[langue]
    if (!t) {
      manques.push({
        champ: `traductions.${langue}`,
        langue,
        message: `Traduction ${langue} absente.`,
      })
    } else if (!t.bio.trim()) {
      manques.push({ champ: `traductions.${langue}.bio`, langue, message: 'Biographie manquante.' })
    }
  }
  if (c.photoId) manques.push(...manquesMedia(trouverMedia(c.photoId), 'photoId', langues))
  return manques
}

/** L'objet du contrat : sans la date de première publication, calculs refaits. */
export function enrichirCreateur(c: CreateurEssai): Createur {
  const { premierePublicationLe: _fige, ...createur } = c
  return {
    ...createur,
    languesPresentes: (['fr', 'en'] as const).filter((l) => c.traductions[l]),
    nombreBijoux: magasin.bijoux.filter((b) => b.createurId === c.id).length,
    champsAFournir: [
      ...new Set([
        ...exigencesCreateur(c).map((m) => m.champ),
        ...(c.pays ? [] : ['pays']),
        ...(c.ville ? [] : ['ville']),
      ]),
    ],
  }
}

/** Éléments rattachés à une catégorie, tous statuts : articles, projets, bijoux, livres (RG-31). */
export function elementsDeCategorie(id: string): number {
  return (
    magasin.bijoux.filter((b) => b.categorieId === id).length +
    magasin.livres.filter((l) => l.categorieId === id).length +
    magasin.articles.filter((a) => a.categorieId === id).length +
    magasin.projets.filter((p) => p.categorieId === id).length
  )
}

export function enrichirCategorie(c: Categorie): Categorie {
  return {
    ...c,
    nombreElements: elementsDeCategorie(c.id),
    nombreBijouxPublies: magasin.bijoux.filter(
      (b) => b.categorieId === c.id && b.statut === 'publie',
    ).length,
  }
}
