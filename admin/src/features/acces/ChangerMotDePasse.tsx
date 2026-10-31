import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { z } from 'zod'
import { changerMotDePasse } from '@/api/endpoints/auth'
import { aLeCode, erreursDeChamp, estErreurApi } from '@/api/erreurs'
import { motDePasseSchema } from '@/api/schemas/auth'
import { useSession } from '@/auth/contexte-session'
import { Alerte } from '@/components/ui/Alerte'
import { Bouton } from '@/components/ui/Bouton'
import { Champ } from '@/components/ui/Champ'
import { CadreAcces } from '@/features/acces/CadreAcces'
import { JaugeRobustesse } from '@/features/acces/JaugeRobustesse'
import { t } from '@/i18n/fr'

const schema = z
  .object({
    motDePasseActuel: z.string().min(1, 'Mot de passe actuel obligatoire.'),
    nouveauMotDePasse: motDePasseSchema,
    confirmation: z.string(),
  })
  .refine((valeurs) => valeurs.nouveauMotDePasse === valeurs.confirmation, {
    message: t('changer.differents'),
    path: ['confirmation'],
  })
type Valeurs = z.infer<typeof schema>

/**
 * Changement de mot de passe : obligatoire à la première connexion, avant tout autre écran
 * (section 8). Le serveur révoque alors les autres sessions du compte (§ 3.2 du contrat).
 */
export default function ChangerMotDePasse() {
  const { moi, rafraichir } = useSession()
  const navigate = useNavigate()
  const [erreur, setErreur] = useState<string | null>(null)
  const obligatoire = moi?.compte.doitChangerMotDePasse ?? false
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Valeurs>({ resolver: zodResolver(schema) })
  const nouveau = useWatch({ control, name: 'nouveauMotDePasse' }) ?? ''

  const envoyer = handleSubmit(async ({ motDePasseActuel, nouveauMotDePasse }) => {
    setErreur(null)
    try {
      await changerMotDePasse(motDePasseActuel, nouveauMotDePasse)
      await rafraichir()
      void navigate('/', { replace: true })
    } catch (cause) {
      if (aLeCode(cause, 'IDENTIFIANTS_INVALIDES')) {
        setError('motDePasseActuel', { message: t('changer.actuelFaux') })
      } else if (estErreurApi(cause) && cause.code === 'VALIDATION') {
        for (const { champ, message } of erreursDeChamp(cause)) {
          if (champ === 'nouveauMotDePasse') setError('nouveauMotDePasse', { message })
        }
      } else {
        setErreur(t('erreur.500.texte'))
      }
    }
  })

  return (
    <CadreAcces
      titre={t('changer.titre')}
      intro={obligatoire ? t('changer.obligatoire') : undefined}
    >
      {erreur ? <Alerte ton="erreur">{erreur}</Alerte> : null}
      <form noValidate onSubmit={(evenement) => void envoyer(evenement)} className="space-y-5">
        <Champ
          libelle={t('changer.actuel')}
          type="password"
          autoComplete="current-password"
          required
          erreur={errors.motDePasseActuel?.message}
          {...register('motDePasseActuel')}
        />
        <div className="space-y-2">
          <Champ
            libelle={t('changer.nouveau')}
            type="password"
            autoComplete="new-password"
            required
            aide={t('changer.aide')}
            erreur={errors.nouveauMotDePasse?.message}
            {...register('nouveauMotDePasse')}
          />
          <JaugeRobustesse motDePasse={nouveau} />
        </div>
        <Champ
          libelle={t('changer.confirmation')}
          type="password"
          autoComplete="new-password"
          required
          erreur={errors.confirmation?.message}
          {...register('confirmation')}
        />
        <Bouton type="submit" className="w-full" disabled={isSubmitting}>
          {t('changer.envoyer')}
        </Bouton>
      </form>
      {!obligatoire ? (
        <Link
          to="/"
          className="inline-flex min-h-11 items-center font-semibold text-clay-700 underline underline-offset-4"
        >
          {t('erreur.retourAccueil')}
        </Link>
      ) : null}
    </CadreAcces>
  )
}
