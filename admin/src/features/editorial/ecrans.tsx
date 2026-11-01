import { FormulaireDeclaratif, ListeDeclarative } from '@/features/gabarits/EcransDeclaratifs'
import {
  SPEC_ARCHIVE,
  SPEC_DISTINCTIONS,
  SPEC_JALONS,
  SPEC_OFFRES,
  SPEC_PAGES,
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
export function ListeProjets() {
  return <ListeDeclarative spec={SPEC_PROJETS} />
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
