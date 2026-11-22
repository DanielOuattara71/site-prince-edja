import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FileText, Trash2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { cles } from '@/api/cles'
import { medias } from '@/api/endpoints/contenus'
import { Bouton } from '@/components/ui/Bouton'
import { MessageErreurChamp } from '@/components/ui/EnveloppeChamp'
import { useNotifications } from '@/components/retours/contexte-notifications'
import { t } from '@/i18n/fr'
import { messageErreur } from '@/lib/message-erreur'

/**
 * PDF de l'article : dépôt immédiat (l'article accepte ce média), retrait. Ce champ est
 * l'alternative au corps écrit — soit le PDF, soit le texte (contrat 1.12.0 § 29.2).
 */
export function PanneauPdf({
  valeur,
  surChange,
  erreur,
  libelle = t('article.pdf'),
  id = 'pdfId',
}: {
  valeur: string | null
  surChange: (id: string | null) => void
  erreur?: string | undefined
  libelle?: string
  id?: string
}) {
  const client = useQueryClient()
  const notifier = useNotifications()
  const fichierRef = useRef<HTMLInputElement>(null)
  const [enCours, setEnCours] = useState(false)
  const media = useQuery({
    queryKey: cles.media(valeur ?? ''),
    queryFn: () => medias.lire(valeur ?? ''),
    enabled: Boolean(valeur),
  })

  const deposer = useMutation({
    mutationFn: async (fichier: File) => {
      if (fichier.type !== 'application/pdf') {
        throw new Error(t('guides.pdfSeulement'))
      }
      return medias.envoyer(fichier, { emplacement: 'Article de presse', texteAltFr: fichier.name })
    },
    onSuccess: async (depose) => {
      surChange(depose.id)
      await client.invalidateQueries({ queryKey: ['medias'] })
    },
    onError: (échec) => {
      notifier.erreur(messageErreur(échec))
    },
  })

  async function choisir(evenement: React.ChangeEvent<HTMLInputElement>) {
    const fichier = evenement.target.files?.[0]
    evenement.target.value = ''
    if (!fichier) return
    setEnCours(true)
    try {
      await deposer.mutateAsync(fichier)
      notifier.succes(t('guides.depose'))
    } finally {
      setEnCours(false)
    }
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-body font-semibold text-ink-900">{libelle}</legend>
      <p className="text-caption text-ink-700">{t('article.pdfAide')}</p>
      {valeur && media.data ? (
        <figcaption className="space-y-2 rounded-md border border-sand-200 bg-sand-100 p-3">
          <p className="flex items-center gap-2 text-body font-semibold text-ink-900">
            <FileText aria-hidden className="size-5" />
            PDF joint
          </p>
          <p className="break-all text-caption text-ink-700">
            {media.data.traductions.fr?.texteAlt || 'PDF de l’article'}
          </p>
        </figcaption>
      ) : null}
      <input
        ref={fichierRef}
        id={`${id}-fichier`}
        type="file"
        accept="application/pdf"
        className="sr-only"
        aria-label={valeur ? t('article.changerPdf') : t('article.deposerPdf')}
        onChange={(e) => void choisir(e)}
      />
      <div className="flex flex-wrap gap-2">
        <Bouton
          id={id}
          variante="secondaire"
          disabled={enCours}
          onClick={() => fichierRef.current?.click()}
        >
          <Upload aria-hidden className="size-4" />
          {valeur ? t('article.changerPdf') : t('article.deposerPdf')}
        </Bouton>
        {valeur ? (
          <Bouton variante="discret" onClick={() => surChange(null)}>
            <Trash2 aria-hidden className="size-4" />
            {t('medias.supprimer')}
          </Bouton>
        ) : null}
      </div>
      {enCours ? <span className="text-caption text-ink-500">{t('guides.envoi')}</span> : null}
      {erreur ? <MessageErreurChamp>{erreur}</MessageErreurChamp> : null}
    </fieldset>
  )
}
