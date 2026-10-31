import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router'
import { z } from 'zod'
import { definirMotDePasse } from '@/api/endpoints/auth'
import { aLeCode } from '@/api/erreurs'
import { motDePasseSchema } from '@/api/schemas/auth'
import { Alerte } from '@/components/ui/Alerte'
import { Bouton } from '@/components/ui/Bouton'
import { Champ } from '@/components/ui/Champ'
import { CadreAcces } from '@/features/acces/CadreAcces'
import { JaugeRobustesse } from '@/features/acces/JaugeRobustesse'
import { t } from '@/i18n/fr'

const schema = z
  .object({ nouveauMotDePasse: motDePasseSchema, confirmation: z.string() })
  .refine((valeurs) => valeurs.nouveauMotDePasse === valeurs.confirmation, {
    message: t('changer.differents'),
    path: ['confirmation'],
  })
type Valeurs = z.infer<typeof schema>

type Etat = 'saisie' | 'succes' | 'jetonInvalide'

/**
 * Lien reçu par e-mail : réinitialisation, premier super-admin ou nouveau compte
 * (`POST /auth/definir-mot-de-passe`, contrat § 3.2, décision D-30).
 */
export default function DefinirMotDePasse() {
  const [parametres] = useSearchParams()
  const jeton = parametres.get('jeton')
  const [etat, setEtat] = useState<Etat>('saisie')
  const [erreur, setErreur] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Valeurs>({ resolver: zodResolver(schema) })
  const nouveau = useWatch({ control, name: 'nouveauMotDePasse' }) ?? ''

  const envoyer = handleSubmit(async ({ nouveauMotDePasse }) => {
    if (!jeton) return
    setErreur(null)
    try {
      await definirMotDePasse(jeton, nouveauMotDePasse)
      setEtat('succes')
    } catch (cause) {
      if (aLeCode(cause, 'JETON_INVALIDE')) setEtat('jetonInvalide')
      else setErreur(t('erreur.500.texte'))
    }
  })

  const lienConnexion = (
    <Link
      to="/connexion"
      className="inline-flex min-h-11 items-center font-semibold text-clay-700 underline underline-offset-4"
    >
      {t('oubli.retour')}
    </Link>
  )

  if (!jeton || etat === 'jetonInvalide') {
    return (
      <CadreAcces titre={t('definir.titre')}>
        <Alerte ton="erreur">
          {jeton ? t('definir.jetonInvalide') : t('definir.jetonAbsent')}
        </Alerte>
        <Link
          to="/mot-de-passe-oublie"
          className="inline-flex min-h-11 items-center font-semibold text-clay-700 underline underline-offset-4"
        >
          {t('connexion.oubli')}
        </Link>
      </CadreAcces>
    )
  }

  if (etat === 'succes') {
    return (
      <CadreAcces titre={t('definir.titre')}>
        <Alerte ton="succes">{t('definir.succes')}</Alerte>
        {lienConnexion}
      </CadreAcces>
    )
  }

  return (
    <CadreAcces titre={t('definir.titre')}>
      {erreur ? <Alerte ton="erreur">{erreur}</Alerte> : null}
      <form noValidate onSubmit={(evenement) => void envoyer(evenement)} className="space-y-5">
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
          {t('definir.envoyer')}
        </Bouton>
      </form>
      {lienConnexion}
    </CadreAcces>
  )
}
