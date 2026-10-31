import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { z } from 'zod'
import { demanderReinitialisation } from '@/api/endpoints/auth'
import { aLeCode } from '@/api/erreurs'
import { Alerte } from '@/components/ui/Alerte'
import { Bouton } from '@/components/ui/Bouton'
import { Champ } from '@/components/ui/Champ'
import { CadreAcces } from '@/features/acces/CadreAcces'
import { t } from '@/i18n/fr'

const schema = z.object({ email: z.email('Adresse e-mail invalide.') })
type Valeurs = z.infer<typeof schema>

/** Le message de confirmation est toujours le même : il ne dit pas si le compte existe. */
export default function MotDePasseOublie() {
  const [envoye, setEnvoye] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Valeurs>({ resolver: zodResolver(schema) })

  const envoyer = handleSubmit(async ({ email }) => {
    setErreur(null)
    try {
      await demanderReinitialisation(email)
      setEnvoye(true)
    } catch (cause) {
      setErreur(
        aLeCode(cause, 'TROP_DE_REQUETES')
          ? t('connexion.tropDeTentatives')
          : t('erreur.500.texte'),
      )
    }
  })

  return (
    <CadreAcces titre={t('oubli.titre')} intro={envoye ? undefined : t('oubli.intro')}>
      {envoye ? (
        <Alerte ton="succes">{t('oubli.confirmation')}</Alerte>
      ) : (
        <>
          {erreur ? <Alerte ton="erreur">{erreur}</Alerte> : null}
          <form noValidate onSubmit={(evenement) => void envoyer(evenement)} className="space-y-5">
            <Champ
              libelle={t('connexion.email')}
              type="email"
              autoComplete="email"
              required
              erreur={errors.email?.message}
              {...register('email')}
            />
            <Bouton type="submit" className="w-full" disabled={isSubmitting}>
              {t('oubli.envoyer')}
            </Bouton>
          </form>
        </>
      )}
      <Link
        to="/connexion"
        className="inline-flex min-h-11 items-center font-semibold text-clay-700 underline underline-offset-4"
      >
        {t('oubli.retour')}
      </Link>
    </CadreAcces>
  )
}
