import { useEffect, useState, type ReactNode } from 'react'
import { LANGUES, type Langue } from '@/api/schemas/communs'
import {
  ContexteLangueFormulaire,
  EVENEMENT_LANGUE,
  useLangueFormulaire,
} from '@/components/formulaire/langue-formulaire'
import { Onglets } from '@/components/ui/Onglets'
import { t, type CleTraduction } from '@/i18n/fr'
import { cn } from '@/lib/cn'

/**
 * Fournisseur et sélecteur de langue d'un formulaire (U2) : un seul jeu « Français / Anglais »
 * en haut. Une pastille « À compléter » marque la langue qui a des champs requis vides, une
 * pastille « Erreur » celle qui a un champ refusé. L'information ne passe pas par la couleur
 * seule : la pastille est écrite.
 */
export function FournisseurLangue({
  aCompleter = [],
  enErreur = [],
  children,
}: {
  aCompleter?: Langue[]
  enErreur?: Langue[]
  children: ReactNode
}) {
  const [langue, setLangue] = useState<Langue>('fr')

  // Le résumé d'erreurs demande la langue d'un champ avant d'y placer le curseur.
  useEffect(() => {
    const surDemande = (evenement: Event) => {
      const demandee = (evenement as CustomEvent<string>).detail
      if ((LANGUES as readonly string[]).includes(demandee)) setLangue(demandee as Langue)
    }
    window.addEventListener(EVENEMENT_LANGUE, surDemande)
    return () => window.removeEventListener(EVENEMENT_LANGUE, surDemande)
  }, [])

  return (
    <ContexteLangueFormulaire.Provider value={{ langue, choisir: setLangue }}>
      <fieldset className="flex flex-wrap items-center gap-2">
        <legend className="float-left mr-2 text-body font-semibold text-ink-900">
          {t('langueFormulaire.libelle')}
        </legend>
        {LANGUES.map((l) => {
          const choisie = l === langue
          const erreur = enErreur.includes(l)
          const manque = aCompleter.includes(l)
          return (
            <button
              key={l}
              type="button"
              aria-pressed={choisie}
              onClick={() => setLangue(l)}
              className={cn(
                'inline-flex min-h-11 items-center gap-2 rounded-md border px-4 text-button font-semibold transition-colors duration-(--d-fast)',
                choisie
                  ? 'border-ink-900 bg-ink-900 text-cream-100'
                  : 'border-sand-300 bg-sand-50 text-ink-900 hover:bg-sand-100',
              )}
            >
              {t(`langue.${l}` as CleTraduction)}
              {erreur || manque ? (
                <span
                  className={cn(
                    'rounded-full border px-2 text-caption font-semibold',
                    choisie
                      ? 'border-cream-100 text-cream-100'
                      : erreur
                        ? 'border-clay-700 text-clay-700'
                        : 'border-dashed border-clay-600 text-clay-700',
                  )}
                >
                  {erreur ? t('traduction.erreur') : t('langueFormulaire.aCompleter')}
                </span>
              ) : null}
            </button>
          )
        })}
      </fieldset>
      {children}
    </ContexteLangueFormulaire.Provider>
  )
}

/**
 * Contenu propre à chaque langue (corps riche, aperçu) : la langue du formulaire s'il y en a
 * une, sinon des onglets par langue comme avant.
 */
export function ParLangue({
  libelle,
  onglets,
}: {
  libelle: string
  onglets: { id: Langue; libelle: string; contenu: ReactNode }[]
}) {
  const contexte = useLangueFormulaire()
  if (!contexte) return <Onglets libelle={libelle} onglets={onglets} />
  const choisi = onglets.find((o) => o.id === contexte.langue)
  if (!choisi) return <p className="text-body text-ink-700">{t('langueFormulaire.vide')}</p>
  return <div>{choisi.contenu}</div>
}
