import { useSearchParams } from 'react-router'
import { TEMPLATES, TEMPLATES_PROJET, type TemplateProjet } from '@/lib/templates'
import { FormulaireDeclaratif, ListeDeclarative } from '@/features/gabarits/EcransDeclaratifs'
import {
  SPEC_ARCHIVE,
  SPEC_DISTINCTIONS,
  SPEC_ETUDES_CAS,
  SPEC_GALERIE,
  SPEC_JALONS,
  SPEC_LIVRES,
  SPEC_OFFRES,
  SPEC_PAGES,
  SPEC_PAGES_LEGALES,
  SPEC_PARTENAIRES,
  SPEC_PRESSE,
  SPEC_UNIVERS,
  SPEC_DESTINATIONS,
  SPEC_EPISODES,
  SPEC_PROJETS,
  SPEC_VILLES,
} from '@/features/editorial/specs'

/** Écrans du lot 2 éditorial (section 9) : chacun n'est que sa description (D-62). */

export function ListeEpisodes() {
  return <ListeDeclarative spec={SPEC_EPISODES} />
}
export function FormulaireEpisode() {
  return <FormulaireDeclaratif spec={SPEC_EPISODES} />
}
/** Liste des projets, ou ceux d'un template depuis sa carte du hub (« Template Film »). */
export function ListeProjets() {
  const [adresse] = useSearchParams()
  const choisi = adresse.get('template')
  const template =
    choisi && (TEMPLATES_PROJET as readonly string[]).includes(choisi)
      ? TEMPLATES[choisi as TemplateProjet]
      : null
  return <ListeDeclarative spec={SPEC_PROJETS} {...(template ? { titre: template.titre } : {})} />
}
export function FormulaireProjet() {
  return <FormulaireDeclaratif spec={SPEC_PROJETS} />
}
export function ListeVilles() {
  return <ListeDeclarative spec={SPEC_VILLES} />
}
export function FormulaireVille() {
  return <FormulaireDeclaratif spec={SPEC_VILLES} />
}
export function ListeDestinations() {
  return <ListeDeclarative spec={SPEC_DESTINATIONS} />
}
export function FormulaireDestination() {
  return <FormulaireDeclaratif spec={SPEC_DESTINATIONS} />
}
export function ListeArchive() {
  return <ListeDeclarative spec={SPEC_ARCHIVE} />
}
export function FormulaireArchive() {
  return <FormulaireDeclaratif spec={SPEC_ARCHIVE} />
}

// Écrans du lot 4 (§ 9.9, § 9.13 à 9.16) : la même gabarit déclaratif, nouvelles descriptions.
export function ListeGalerie() {
  return <ListeDeclarative spec={SPEC_GALERIE} />
}
export function FormulaireGalerie() {
  return <FormulaireDeclaratif spec={SPEC_GALERIE} />
}
export function ListeEtudesCas() {
  return <ListeDeclarative spec={SPEC_ETUDES_CAS} />
}
export function FormulaireEtudeCas() {
  return <FormulaireDeclaratif spec={SPEC_ETUDES_CAS} />
}
export function ListePartenaires() {
  return <ListeDeclarative spec={SPEC_PARTENAIRES} />
}
export function FormulairePartenaire() {
  return <FormulaireDeclaratif spec={SPEC_PARTENAIRES} />
}
export function ListePagesLegales() {
  return <ListeDeclarative spec={SPEC_PAGES_LEGALES} />
}
export function FormulairePageLegale() {
  return <FormulaireDeclaratif spec={SPEC_PAGES_LEGALES} />
}
export function ListeDistinctions() {
  return <ListeDeclarative spec={SPEC_DISTINCTIONS} />
}
export function FormulaireDistinctions() {
  return <FormulaireDeclaratif spec={SPEC_DISTINCTIONS} />
}
export function ListePresse() {
  return <ListeDeclarative spec={SPEC_PRESSE} />
}
export function FormulairePresse() {
  return <FormulaireDeclaratif spec={SPEC_PRESSE} />
}
export function ListeUnivers() {
  return <ListeDeclarative spec={SPEC_UNIVERS} />
}
export function FormulaireUnivers() {
  return <FormulaireDeclaratif spec={SPEC_UNIVERS} />
}
export function ListeJalons() {
  return <ListeDeclarative spec={SPEC_JALONS} />
}
export function FormulaireJalons() {
  return <FormulaireDeclaratif spec={SPEC_JALONS} />
}
export function ListeOffres() {
  return <ListeDeclarative spec={SPEC_OFFRES} />
}
export function FormulaireOffres() {
  return <FormulaireDeclaratif spec={SPEC_OFFRES} />
}
export function ListePages() {
  return <ListeDeclarative spec={SPEC_PAGES} />
}
export function FormulairePages() {
  return <FormulaireDeclaratif spec={SPEC_PAGES} />
}
export function ListeLivres() {
  return <ListeDeclarative spec={SPEC_LIVRES} />
}
export function FormulaireLivre() {
  return <FormulaireDeclaratif spec={SPEC_LIVRES} />
}
