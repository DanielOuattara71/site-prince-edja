import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { cles } from '@/api/cles'
import { textesInterface } from '@/api/endpoints/reglages'
import type { TextesInterface } from '@/api/schemas/reglages'
import { useSession } from '@/auth/contexte-session'
import { peut } from '@/auth/permissions'
import { FilAriane } from '@/components/layout/FilAriane'
import { TitrePage } from '@/components/layout/TitrePage'
import { useNotifications } from '@/components/retours/contexte-notifications'
import { Alerte } from '@/components/ui/Alerte'
import { Bouton } from '@/components/ui/Bouton'
import { Champ } from '@/components/ui/Champ'
import { EtatErreur } from '@/components/ui/Etats'
import { Squelette } from '@/components/ui/Squelette'
import { t } from '@/i18n/fr'
import { messageErreur } from '@/lib/message-erreur'

/**
 * Textes d'interface du site (contrat § 13.5) : le dictionnaire du site public, une clé par
 * ligne, les deux langues côte à côte. Les clés viennent du site (`clesManquantes` dit ce qui
 * manque) : ici, on corrige un libellé mal tourné, on ne crée jamais une clé inconnue.
 */

/** Une ligne de l'éditeur : la clé, puis les deux langues saisissables. */
interface Ligne {
  cle: string
  fr: string
  en: string
}

export default function TextesInterface() {
  const { moi } = useSession()
  const admin = peut(moi?.compte, 'modifier', 'textes-interface')

  const requete = useQuery({
    queryKey: cles.textesInterface(),
    queryFn: () => textesInterface.lire(),
  })

  if (requete.isPending) return <Squelette lignes={8} />
  if (requete.isError || !requete.data) {
    return <EtatErreur erreur={requete.error} surReessai={() => void requete.refetch()} />
  }

  return <EditeurTextes key={requete.data.version} document={requete.data} admin={admin} />
}

function EditeurTextes({ document, admin }: { document: TextesInterface; admin: boolean }) {
  const client = useQueryClient()
  const notifier = useNotifications()
  const [lignes, setLignes] = useState<Ligne[]>(() =>
    Object.entries(document.valeurs).map(([cle, valeurs]) => ({
      cle,
      fr: valeurs.fr,
      en: valeurs.en ?? '',
    })),
  )
  const [erreur, setErreur] = useState<string | null>(null)

  const enregistrer = useMutation({
    mutationFn: () => {
      // Seules les lignes touchées partent : une clé inchangée n'est pas réécrite (§ 13.5).
      const valeurs: Record<string, { fr: string; en?: string }> = {}
      for (const ligne of lignes) {
        const depart = document.valeurs[ligne.cle]
        const bougeFr = depart ? depart.fr !== ligne.fr : true
        const bougeEn = depart ? (depart.en ?? '') !== ligne.en : true
        if (!bougeFr && !bougeEn) continue
        const ecrite: { fr: string; en?: string } = { fr: ligne.fr }
        if (bougeEn && ligne.en.trim()) ecrite.en = ligne.en
        valeurs[ligne.cle] = ecrite
      }
      return textesInterface.modifier({ valeurs, version: document.version })
    },
    onSuccess: () => {
      setErreur(null)
      notifier.succes(t('formulaire.enregistre'))
      void client.invalidateQueries({ queryKey: ['textes-interface'] })
    },
    onError: (e) => {
      setErreur(messageErreur(e))
      void client.invalidateQueries({ queryKey: ['textes-interface'] })
    },
  })

  const valable = lignes.every((ligne) => ligne.fr.trim())

  return (
    <section className="space-y-6">
      <div>
        <FilAriane elements={[{ libelle: t('menu.textesInterface') }]} />
        <TitrePage titre={t('textes.titre')}>{t('textes.titre')}</TitrePage>
        <p className="mt-2 max-w-3xl text-body text-ink-700">{t('textes.intro')}</p>
      </div>
      {!admin ? <Alerte>{t('textes.lectureSeule')}</Alerte> : null}
      {document.clesManquantes.fr.length + document.clesManquantes.en.length > 0 ? (
        <Alerte>
          {t('textes.clesManquantes')} ({document.clesManquantes.fr.length} FR /{' '}
          {document.clesManquantes.en.length} EN)
        </Alerte>
      ) : null}

      <div className="space-y-3">
        {lignes.map((ligne, rang) => (
          <div
            key={ligne.cle}
            className="grid gap-3 rounded-md border border-sand-200 p-3 sm:grid-cols-2"
          >
            <p className="text-caption font-semibold text-ink-900 sm:col-span-2">{ligne.cle}</p>
            <Champ
              libelle="FR"
              value={ligne.fr}
              disabled={!admin}
              maxLength={500}
              onChange={(e) =>
                setLignes(lignes.map((l, i) => (i === rang ? { ...l, fr: e.target.value } : l)))
              }
            />
            <Champ
              libelle="EN"
              value={ligne.en}
              disabled={!admin}
              maxLength={500}
              onChange={(e) =>
                setLignes(lignes.map((l, i) => (i === rang ? { ...l, en: e.target.value } : l)))
              }
            />
          </div>
        ))}
      </div>

      {erreur ? <Alerte ton="erreur">{erreur}</Alerte> : null}
      {admin ? (
        <div className="flex justify-end">
          <Bouton onClick={() => enregistrer.mutate()} disabled={enregistrer.isPending || !valable}>
            {enregistrer.isPending ? t('barre.enregistrementEnCours') : t('formulaire.enregistrer')}
          </Bouton>
        </div>
      ) : null}
    </section>
  )
}
