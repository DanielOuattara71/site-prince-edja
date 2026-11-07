import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { cles } from '@/api/cles'
import { navigation } from '@/api/endpoints/reglages'
import type { CibleInterne } from '@/api/schemas/communs'
import type { ModificationNavigation, Navigation as NavigationLue } from '@/api/schemas/reglages'
import { useSession } from '@/auth/contexte-session'
import { peut } from '@/auth/permissions'
import { FilAriane } from '@/components/layout/FilAriane'
import { TitrePage } from '@/components/layout/TitrePage'
import { useNotifications } from '@/components/retours/contexte-notifications'
import { Alerte } from '@/components/ui/Alerte'
import { BoiteDialogue } from '@/components/ui/BoiteDialogue'
import { Bouton } from '@/components/ui/Bouton'
import { Champ } from '@/components/ui/Champ'
import { EtatErreur } from '@/components/ui/Etats'
import { Squelette } from '@/components/ui/Squelette'
import { t } from '@/i18n/fr'
import { SelecteurCible } from '@/features/gabarits/champs'
import { messageErreur } from '@/lib/message-erreur'

/**
 * Navigation du site (contrat § 13.4) : document unique, remplacé en entier à chaque PATCH.
 * Les identifiants d'entrée sont écrits par l'écran (jamais inventés par le serveur, au plus
 * 60 caractères), les cibles passent par le sélecteur de lien interne du site — pas d'adresse
 * écrite à la main, un seul niveau de sous-entrées, au plus douze par entrée.
 */

/** Une entrée telle que l'écran la tient en mémoire avant l'enregistrement. */
interface EntreeLibre {
  id: string
  libelleFr: string
  libelleEn: string
  degreFr: string
  degreEn: string
  cible: CibleInterne | null
  enfants: EntreeLibre[]
}

interface GroupeLibre {
  titreFr: string
  titreEn: string
  liens: EntreeLibre[]
}

/** Identifiant d'entrée : écrit par l'écran, un seul dans le document. */
function idDepuis(texte: string, prises: Set<string>): string {
  const base = texte
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60)
  let id = base
  let rang = 2
  while (prises.has(id)) id = `${base}-${rang++}`
  return id
}

/** Une entrée près à remplir : les champs partent tous vides, en attente d'un libellé FR. */
const entreeNeuve = (): EntreeLibre => ({
  id: '',
  libelleFr: '',
  libelleEn: '',
  degreFr: '',
  degreEn: '',
  cible: { type: 'page', cle: 'accueil' },
  enfants: [],
})

/** Le libellé affiché : le FR sert toujours, l'EN est décoratif tant qu'il manque. */
const nomDe = (e: EntreeLibre): string => e.libelleFr || t('navigation.sansLibelle')

/** L'identifiant complet d'une entité en vue « enfance » pour le listing. */
const rangDe = (entree: EntreeLibre): string => `${entree.id}__${entree.libelleFr}`

export default function Navigation() {
  const { moi } = useSession()
  const admin = peut(moi?.compte, 'modifier', 'navigation')

  const requete = useQuery({
    queryKey: cles.navigation(),
    queryFn: () => navigation.lire(),
  })

  if (requete.isPending) return <Squelette lignes={10} />
  if (requete.isError || !requete.data) {
    return <EtatErreur erreur={requete.error} surReessai={() => void requete.refetch()} />
  }

  return <EditeurNavigation key={requete.data.version} document={requete.data} admin={admin} />
}

/** L'éditeur tient le document entier en mémoire ; « Enregistrer » le renvoie en un PATCH. */
function EditeurNavigation({ document, admin }: { document: NavigationLue; admin: boolean }) {
  const client = useQueryClient()
  const notifier = useNotifications()
  const [principale, setPrincipale] = useState<EntreeLibre[]>(() =>
    document.principale.map(duDocument),
  )
  const [cta, setCta] = useState({
    libelleFr: document.ctaPrincipal.libelle.fr,
    libelleEn: document.ctaPrincipal.libelle.en ?? '',
    cible: document.ctaPrincipal.cible as CibleInterne | null,
  })
  const [pied, setPied] = useState<GroupeLibre[]>(() =>
    document.piedDePage.map((g) => ({
      titreFr: g.titre.fr,
      titreEn: g.titre.en ?? '',
      liens: g.liens.map((l) => ({ ...duDocument(l), degreFr: '', degreEn: '', enfants: [] })),
    })),
  )
  const [entrees404, setEntrees404] = useState<EntreeLibre[]>(() =>
    document.entrees404.map((l) => ({ ...duDocument(l), degreFr: '', degreEn: '', enfants: [] })),
  )
  const [ouvertes, setOuvertes] = useState<Set<string>>(() => new Set())
  const [erreur, setErreur] = useState<string | null>(null)
  /** La fenêtre d'édition ouverte : où elle est, et une copie qui vit pendant la frappe. */
  const [entreeOuverte, setEntreeOuverte] = useState<{
    conteneur: 'principale' | 'pied' | '404'
    rang: number
    enfant: number | null
    copie: EntreeLibre
  } | null>(null)
  const [groupeOuvert, setGroupeOuvert] = useState<{ rang: number; copie: GroupeLibre } | null>(
    null,
  )

  const enregistrer = useMutation({
    mutationFn: () =>
      navigation.modifier({
        ...versoDocument(principale, cta, pied, entrees404),
        version: document.version,
      }),
    onSuccess: () => {
      setErreur(null)
      notifier.succes(t('formulaire.enregistre'))
      void client.invalidateQueries({ queryKey: ['navigation'] })
    },
    onError: (e) => {
      setErreur(messageErreur(e))
      void client.invalidateQueries({ queryKey: ['navigation'] })
    },
  })

  return (
    <section className="space-y-6">
      <div>
        <FilAriane elements={[{ libelle: t('menu.navigation') }]} />
        <TitrePage titre={t('navigation.titre')}>{t('navigation.titre')}</TitrePage>
        <p className="mt-2 max-w-3xl text-body text-ink-700">{t('navigation.intro')}</p>
      </div>
      {!admin ? <Alerte>{t('navigation.lectureSeule')}</Alerte> : null}

      {/* Entrées principales (§ 13.4) : au plus huit, chacune avec ses sous-entrées pliées. */}
      <BlocNavigation titre={t('navigation.principale')} texte={t('navigation.principaleAide')}>
        {principale.map((entree, rang) => (
          <div
            key={rangDe(entree) || rang}
            className="space-y-2 rounded-md border border-sand-200 p-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Bouton
                variante="discret"
                aria-expanded={ouvertes.has(`${rang}`)}
                aria-label={`${ouvertes.has(`${rang}`) ? t('navigation.plier') : t('navigation.deplier')} ${nomDe(entree)}`}
                onClick={() =>
                  setOuvertes((v) => {
                    const suivant = new Set(v)
                    if (suivant.has(`${rang}`)) suivant.delete(`${rang}`)
                    else suivant.add(`${rang}`)
                    return suivant
                  })
                }
              >
                {ouvertes.has(`${rang}`) ? (
                  <ChevronDown aria-hidden className="size-4" />
                ) : (
                  <ChevronRight aria-hidden className="size-4" />
                )}
                {nomDe(entree)}
              </Bouton>
              {admin ? (
                <div className="flex gap-2">
                  <Bouton
                    variante="secondaire"
                    aria-label={`${t('navigation.modifier')} ${nomDe(entree)}`}
                    onClick={() =>
                      setEntreeOuverte({
                        conteneur: 'principale',
                        rang,
                        enfant: null,
                        copie: entree,
                      })
                    }
                  >
                    {t('navigation.modifier')}
                  </Bouton>
                  <Bouton
                    variante="discret"
                    aria-label={`${t('navigation.supprimer')} ${nomDe(entree)}`}
                    onClick={() => setPrincipale(retrait(principale, rang))}
                  >
                    <Trash2 aria-hidden className="size-4" />
                  </Bouton>
                </div>
              ) : null}
            </div>
            <p className="text-caption text-ink-700">{texteCible(entree)}</p>
            {ouvertes.has(`${rang}`) ? (
              <div className="space-y-1 rounded-md bg-sand-50 p-2">
                {entree.enfants.map((enfant, rangEnfant) => (
                  <div
                    key={rangDe(enfant) || rangEnfant}
                    className="flex flex-wrap items-center justify-between gap-2"
                  >
                    <span className="text-body text-ink-700">— {nomDe(enfant)}</span>
                    {admin ? (
                      <div className="flex gap-1">
                        <Bouton
                          variante="secondaire"
                          aria-label={`${t('navigation.modifier')} ${nomDe(enfant)}`}
                          onClick={() =>
                            setEntreeOuverte({
                              conteneur: 'principale',
                              rang,
                              enfant: rangEnfant,
                              copie: enfant,
                            })
                          }
                        >
                          {t('navigation.modifier')}
                        </Bouton>
                        <Bouton
                          variante="discret"
                          aria-label={`${t('navigation.supprimer')} ${nomDe(enfant)}`}
                          onClick={() => setPrincipale(sansEnfant(principale, rang, rangEnfant))}
                        >
                          <Trash2 aria-hidden className="size-4" />
                        </Bouton>
                      </div>
                    ) : null}
                  </div>
                ))}
                {entree.enfants.length < 12 ? (
                  <Bouton
                    variante="secondaire"
                    onClick={() =>
                      setEntreeOuverte({
                        conteneur: 'principale',
                        rang,
                        enfant: -1,
                        copie: entreeNeuve(),
                      })
                    }
                  >
                    <Plus aria-hidden className="size-4" />
                    {t('navigation.nouvelleSousEntree')}
                  </Bouton>
                ) : null}
              </div>
            ) : null}
          </div>
        ))}
        {principale.length < 8 ? (
          <Bouton
            variante="secondaire"
            onClick={() =>
              setEntreeOuverte({
                conteneur: 'principale',
                rang: -1,
                enfant: null,
                copie: entreeNeuve(),
              })
            }
          >
            <Plus aria-hidden className="size-4" />
            {t('navigation.nouvelleEntree')}
          </Bouton>
        ) : null}
      </BlocNavigation>

      {/* CTA principal (§ 13.4) : un libellé à deux langues et une cible. */}
      <BlocNavigation titre={t('navigation.cta')} texte={t('navigation.ctaAide')}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Champ
            libelle={`${t('navigation.libelle')} (FR)`}
            value={cta.libelleFr}
            disabled={!admin}
            maxLength={120}
            onChange={(e) => setCta({ ...cta, libelleFr: e.target.value })}
          />
          <Champ
            libelle={`${t('navigation.libelle')} (EN)`}
            value={cta.libelleEn}
            disabled={!admin}
            maxLength={120}
            onChange={(e) => setCta({ ...cta, libelleEn: e.target.value })}
          />
        </div>
        <SelecteurCible
          id="cta-cible"
          libelle={t('navigation.cible')}
          valeur={cta.cible}
          surChange={(cible) => setCta({ ...cta, cible })}
        />
      </BlocNavigation>

      {/* Groupes du pied de page (§ 13.4) : un titre, jusqu'à douze liens. */}
      <BlocNavigation titre={t('navigation.pied')} texte={t('navigation.piedAide')}>
        {pied.map((groupe, rang) => (
          <div key={`groupe-${rang}`} className="space-y-2 rounded-md border border-sand-200 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-body font-semibold text-ink-900">{groupe.titreFr}</p>
              {admin ? (
                <div className="flex gap-2">
                  <Bouton
                    variante="secondaire"
                    aria-label={`${t('navigation.modifier')} ${groupe.titreFr}`}
                    onClick={() =>
                      setGroupeOuvert({ rang, copie: { ...groupe, liens: [...groupe.liens] } })
                    }
                  >
                    {t('navigation.modifier')}
                  </Bouton>
                  <Bouton
                    variante="discret"
                    aria-label={`${t('navigation.supprimer')} ${groupe.titreFr}`}
                    onClick={() => setPied(retrait(pied, rang))}
                  >
                    <Trash2 aria-hidden className="size-4" />
                  </Bouton>
                </div>
              ) : null}
            </div>
            {groupe.liens.map((lien, rangLien) => (
              <div
                key={`lien-${rangLien}`}
                className="flex flex-wrap items-center justify-between gap-2"
              >
                <span className="text-body text-ink-700">— {nomDe(lien)}</span>
                {admin ? (
                  <div className="flex gap-1">
                    <Bouton
                      variante="secondaire"
                      aria-label={`${t('navigation.modifier')} ${nomDe(lien)}`}
                      onClick={() =>
                        setEntreeOuverte({ conteneur: 'pied', rang, enfant: rangLien, copie: lien })
                      }
                    >
                      {t('navigation.modifier')}
                    </Bouton>
                    <Bouton
                      variante="discret"
                      aria-label={`${t('navigation.supprimer')} ${nomDe(lien)}`}
                      onClick={() =>
                        setPied(
                          pied.map((g, i) =>
                            i === rang ? { ...g, liens: retrait(g.liens, rangLien) } : g,
                          ),
                        )
                      }
                    >
                      <Trash2 aria-hidden className="size-4" />
                    </Bouton>
                  </div>
                ) : null}
              </div>
            ))}
            {groupe.liens.length < 12 ? (
              <Bouton
                variante="secondaire"
                onClick={() =>
                  setEntreeOuverte({ conteneur: 'pied', rang, enfant: -1, copie: entreeNeuve() })
                }
              >
                <Plus aria-hidden className="size-4" />
                {t('navigation.nouveauLien')}
              </Bouton>
            ) : null}
          </div>
        ))}
        {pied.length < 8 ? (
          <Bouton
            variante="secondaire"
            onClick={() =>
              setGroupeOuvert({ rang: -1, copie: { titreFr: '', titreEn: '', liens: [] } })
            }
          >
            <Plus aria-hidden className="size-4" />
            {t('navigation.nouveauGroupe')}
          </Bouton>
        ) : null}
      </BlocNavigation>

      {/* Entrées de la page 404 (§ 13.4) : les liens de reprise, au plus six. */}
      <BlocNavigation titre={t('navigation.404')} texte={t('navigation.404Aide')}>
        {entrees404.map((entree, rang) => (
          <div key={`404-${rang}`} className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-body text-ink-700">{nomDe(entree)}</span>
            {admin ? (
              <div className="flex gap-1">
                <Bouton
                  variante="secondaire"
                  aria-label={`${t('navigation.modifier')} ${nomDe(entree)}`}
                  onClick={() =>
                    setEntreeOuverte({ conteneur: '404', rang, enfant: null, copie: entree })
                  }
                >
                  {t('navigation.modifier')}
                </Bouton>
                <Bouton
                  variante="discret"
                  aria-label={`${t('navigation.supprimer')} ${nomDe(entree)}`}
                  onClick={() => setEntrees404(retrait(entrees404, rang))}
                >
                  <Trash2 aria-hidden className="size-4" />
                </Bouton>
              </div>
            ) : null}
          </div>
        ))}
        {entrees404.length < 6 ? (
          <Bouton
            variante="secondaire"
            onClick={() => setEntrees404([...entrees404, entreeNeuve()])}
          >
            <Plus aria-hidden className="size-4" />
            {t('navigation.nouveauLien')}
          </Bouton>
        ) : null}
      </BlocNavigation>

      {erreur ? <Alerte ton="erreur">{erreur}</Alerte> : null}
      {admin ? (
        <div className="flex justify-end">
          <Bouton onClick={() => enregistrer.mutate()} disabled={enregistrer.isPending}>
            {enregistrer.isPending ? t('barre.enregistrementEnCours') : t('formulaire.enregistrer')}
          </Bouton>
        </div>
      ) : null}

      {entreeOuverte ? (
        <DialogueEntree
          entree={entreeOuverte}
          prises={idsPris(
            principale,
            pied.flatMap((g) => g.liens),
            entrees404,
          )}
          surFermeture={() => setEntreeOuverte(null)}
          surEnregistrer={(suivant) => {
            const c = entreeOuverte
            if (c.conteneur === 'principale') {
              setPrincipale(
                c.rang === -1
                  ? [...principale, suivant]
                  : c.enfant === null
                    ? remplace(principale, c.rang, suivant)
                    : avecEnfant(principale, c.rang, c.enfant, suivant),
              )
            } else if (c.conteneur === 'pied') {
              setPied(
                pied.map((g, i) =>
                  i === c.rang
                    ? c.enfant === null || c.enfant === -1
                      ? { ...g, liens: [...g.liens, sansEnfants(suivant)] }
                      : { ...g, liens: remplaceAi(g.liens, c.enfant, sansEnfants(suivant)) }
                    : g,
                ),
              )
            } else {
              setEntrees404(
                c.rang === -1
                  ? [...entrees404, sansEnfants(suivant)]
                  : remplaceAi(entrees404, c.rang, sansEnfants(suivant)),
              )
            }
            setEntreeOuverte(null)
          }}
        />
      ) : null}

      {groupeOuvert ? (
        <DialogueGroupe
          groupe={groupeOuvert.copie}
          surFermeture={() => setGroupeOuvert(null)}
          surEnregistrer={(suivant) => {
            setPied(
              groupeOuvert.rang === -1
                ? [...pied, suivant]
                : remplaceAi(pied, groupeOuvert.rang, suivant),
            )
            setGroupeOuvert(null)
          }}
        />
      ) : null}
    </section>
  )
}

/** Cadre visuel d'une part de la navigation : titre, aide, contenu. */
function BlocNavigation({
  titre,
  texte,
  children,
}: {
  titre: string
  texte: string
  children: ReactNode
}) {
  return (
    <div className="space-y-3 rounded-md border border-sand-200 p-4">
      <h2 className="text-heading-sm text-ink-900">{titre}</h2>
      <p className="text-caption text-ink-700">{texte}</p>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

/** Lecture d'une entrée du document serveur vers le brouillon de l'écran. */
function duDocument(lue: NavigationLue['principale'][number]): EntreeLibre {
  return {
    id: lue.id,
    libelleFr: lue.libelle.fr,
    libelleEn: lue.libelle.en ?? '',
    degreFr: lue.degre?.fr ?? '',
    degreEn: lue.degre?.en ?? '',
    cible: lue.cible as CibleInterne,
    enfants: (lue.enfants ?? []).map(duDocument),
  }
}

const retrait = <T,>(liste: T[], rang: number): T[] => liste.filter((_, i) => i !== rang)
const remplaceAi = <T,>(liste: T[], rang: number, suivant: T): T[] =>
  liste.map((v, i) => (i === rang ? suivant : v))
const remplace = (liste: EntreeLibre[], rang: number, suivant: EntreeLibre): EntreeLibre[] =>
  remplaceAi(liste, rang, suivant)
const sansEnfant = (liste: EntreeLibre[], rang: number, rangEnfant: number): EntreeLibre[] =>
  remplaceAi(liste, rang, {
    ...liste[rang]!,
    enfants: retrait(liste[rang]!.enfants, rangEnfant),
  })
const avecEnfant = (
  liste: EntreeLibre[],
  rang: number,
  rangEnfant: number,
  suivant: EntreeLibre,
): EntreeLibre[] =>
  remplaceAi(liste, rang, {
    ...liste[rang]!,
    enfants: remplaceAi(liste[rang]!.enfants, rangEnfant, sansEnfants(suivant)),
  })
/** Une sous-entrée, un lien du pied ou une entrée 404 n'a jamais d'enfants. */
const sansEnfants = (e: EntreeLibre): EntreeLibre => ({ ...e, enfants: [] })

/** Tous les identifiants d'entrées du document : une nouvelle entrée ne les reprend pas. */
function idsPris(...groupes: EntreeLibre[][]): Set<string> {
  return new Set(groupes.flatMap((g) => g.flatMap(idsDedans)))
}
function idsDedans(e: EntreeLibre): string[] {
  return [e.id, ...e.enfants.flatMap(idsDedans)]
}

function texteCible(e: EntreeLibre): string {
  if (!e.cible) return t('navigation.sansCible')
  if (e.cible.type === 'contenu') return `${e.cible.ressource} #${e.cible.id.slice(0, 8)}`
  if (e.cible.type === 'ancre') return `${e.cible.cle} #${e.cible.ancre}`
  return e.cible.cle
}

/** Libellé à deux langues pour le document d'écriture (§ 13.4) : l'EN seulement s'il est là. */
function libelleEcrit(fr: string, en: string): { fr: string; en?: string } {
  return en.trim() ? { fr: fr.trim(), en: en.trim() } : { fr: fr.trim() }
}

/** Entrée au format d'écriture (§ 13.4) : un identifiant, un libellé, un éventuel descriptif, une cible. */
interface EntreeEcrite {
  id: string
  libelle: { fr: string; en?: string | undefined }
  degre: { fr: string; en?: string | undefined } | null | undefined
  cible: CibleInterne
  enfants?: EntreeEcrite[]
}

function entreeEcrit(e: EntreeLibre): EntreeEcrite {
  const degre = e.degreFr.trim() ? libelleEcrit(e.degreFr, e.degreEn) : null
  const cible = e.cible ?? ({ type: 'page', cle: 'accueil' } as CibleInterne)
  return {
    id: e.id.trim().slice(0, 60),
    libelle: libelleEcrit(e.libelleFr, e.libelleEn),
    degre,
    cible,
    ...(e.enfants.length ? { enfants: e.enfants.map(entreeEcrit) } : {}),
  }
}

/** Vers le document d'écriture (§ 13.4) : chaque liste complète, dans l'ordre tenu à l'écran. */
function versoDocument(
  principale: EntreeLibre[],
  cta: { libelleFr: string; libelleEn: string; cible: CibleInterne | null },
  pied: GroupeLibre[],
  entrees404: EntreeLibre[],
): Omit<ModificationNavigation, 'version'> {
  return {
    principale: principale.map(entreeEcrit),
    ctaPrincipal: {
      libelle: libelleEcrit(cta.libelleFr, cta.libelleEn),
      cible: cta.cible ?? ({ type: 'page', cle: 'contact' } as CibleInterne),
    },
    piedDePage: pied.map((g) => ({
      titre: libelleEcrit(g.titreFr, g.titreEn),
      liens: g.liens.map((l) => entreeEcrit({ ...l, enfants: [] })),
    })),
    entrees404: entrees404.map((l) => entreeEcrit({ ...l, enfants: [] })),
  }
}

/** Modification ou création d'une entrée : libellé FR (obligatoire), EN, descriptif, cible. */
function DialogueEntree({
  entree,
  prises,
  surFermeture,
  surEnregistrer,
}: {
  entree: {
    conteneur: 'principale' | 'pied' | '404'
    rang: number
    enfant: number | null
    copie: EntreeLibre
  }
  prises: Set<string>
  surFermeture: () => void
  surEnregistrer: (suivant: EntreeLibre) => void
}) {
  const creee = entree.rang === -1 || entree.enfant === -1
  const [copie, setCopie] = useState<EntreeLibre>(entree.copie)
  const [erreur, setErreur] = useState<string | null>(null)

  const soumettre = (evenement: FormEvent) => {
    evenement.preventDefault()
    if (!copie.libelleFr.trim()) {
      setErreur(t('navigation.libelleRequis'))
      return
    }
    // Un identifiant n'est jamais réutilisé : les créations en tirent un depuis le libellé FR.
    surEnregistrer(creee ? { ...copie, id: idDepuis(copie.libelleFr, prises) } : copie)
  }

  return (
    <BoiteDialogue
      ouverte
      surFermeture={surFermeture}
      titre={
        creee
          ? t('navigation.nouvelleEntree')
          : `${t('navigation.modifier')} « ${nomDe(entree.copie)} »`
      }
      actions={
        <Bouton type="submit" form="formulaire-entree" disabled={!copie.libelleFr.trim()}>
          {t('formulaire.confirmer')}
        </Bouton>
      }
    >
      <form id="formulaire-entree" noValidate onSubmit={soumettre} className="space-y-4">
        <Champ
          libelle={`${t('navigation.libelle')} (FR)`}
          required
          value={copie.libelleFr}
          maxLength={120}
          erreur={erreur ?? undefined}
          onChange={(evenement) => setCopie({ ...copie, libelleFr: evenement.target.value })}
        />
        <Champ
          libelle={`${t('navigation.libelle')} (EN)`}
          value={copie.libelleEn}
          maxLength={120}
          onChange={(evenement) => setCopie({ ...copie, libelleEn: evenement.target.value })}
        />
        {entree.conteneur === 'principale' && entree.enfant === null ? (
          <>
            <Champ
              libelle={`${t('navigation.descriptif')} (FR)`}
              value={copie.degreFr}
              maxLength={120}
              onChange={(evenement) => setCopie({ ...copie, degreFr: evenement.target.value })}
            />
            <Champ
              libelle={`${t('navigation.descriptif')} (EN)`}
              value={copie.degreEn}
              maxLength={120}
              onChange={(evenement) => setCopie({ ...copie, degreEn: evenement.target.value })}
            />
          </>
        ) : null}
        <SelecteurCible
          id="entree-cible"
          libelle={t('navigation.cible')}
          valeur={copie.cible}
          surChange={(cible) => setCopie({ ...copie, cible })}
        />
      </form>
    </BoiteDialogue>
  )
}

/** Titre FR (obligatoire) et EN d'un groupe du pied de page. */
function DialogueGroupe({
  groupe,
  surFermeture,
  surEnregistrer,
}: {
  groupe: GroupeLibre
  surFermeture: () => void
  surEnregistrer: (suivant: GroupeLibre) => void
}) {
  const [titreFr, setTitreFr] = useState(groupe.titreFr)
  const [titreEn, setTitreEn] = useState(groupe.titreEn)
  const [erreur, setErreur] = useState<string | null>(null)
  const soumettre = (evenement: FormEvent) => {
    evenement.preventDefault()
    if (!titreFr.trim()) {
      setErreur(t('navigation.libelleRequis'))
      return
    }
    surEnregistrer({ ...groupe, titreFr: titreFr.trim(), titreEn: titreEn.trim() })
  }
  return (
    <BoiteDialogue
      ouverte
      surFermeture={surFermeture}
      titre={groupe.titreFr || t('navigation.nouveauGroupe')}
      actions={
        <Bouton type="submit" form="formulaire-groupe" disabled={!titreFr.trim()}>
          {t('formulaire.confirmer')}
        </Bouton>
      }
    >
      <form id="formulaire-groupe" noValidate onSubmit={soumettre} className="space-y-4">
        <Champ
          libelle={`${t('navigation.titre')} (FR)`}
          required
          value={titreFr}
          erreur={erreur ?? undefined}
          maxLength={60}
          onChange={(evenement) => setTitreFr(evenement.target.value)}
        />
        <Champ
          libelle={`${t('navigation.titre')} (EN)`}
          value={titreEn}
          maxLength={60}
          onChange={(evenement) => setTitreEn(evenement.target.value)}
        />
      </form>
    </BoiteDialogue>
  )
}
