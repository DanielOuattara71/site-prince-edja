import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { z } from 'zod'
import { aLeCode, estErreurApi } from '@/api/erreurs'
import { useSession } from '@/auth/contexte-session'
import { Alerte } from '@/components/ui/Alerte'
import { Bouton } from '@/components/ui/Bouton'
import { Champ } from '@/components/ui/Champ'
import { CadreAcces } from '@/features/acces/CadreAcces'
import { t } from '@/i18n/fr'

const schema = z.object({
  email: z.email('Adresse e-mail invalide.'),
  motDePasse: z.string().min(1, 'Mot de passe obligatoire.'),
})
type Valeurs = z.infer<typeof schema>

/** Retour après connexion : seulement une adresse interne, jamais une URL externe. */
function retourSur(valeur: string | null): string {
  return valeur && valeur.startsWith('/') && !valeur.startsWith('//') ? valeur : '/'
}

/**
 * Connexion (section 9) : message d'erreur générique, identique que le compte existe ou non ;
 * la limitation de débit du serveur est expliquée sans révéler de détail.
 */
export default function Connexion() {
  const { connecter } = useSession()
  const navigate = useNavigate()
  const [parametres] = useSearchParams()
  const [erreur, setErreur] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Valeurs>({ resolver: zodResolver(schema) })

  const envoyer = handleSubmit(async ({ email, motDePasse }) => {
    setErreur(null)
    try {
      const moi = await connecter(email, motDePasse)
      const cible = moi.compte.doitChangerMotDePasse
        ? '/changer-mot-de-passe'
        : retourSur(parametres.get('retour'))
      void navigate(cible, { replace: true })
    } catch (cause) {
      if (aLeCode(cause, 'IDENTIFIANTS_INVALIDES')) setErreur(t('connexion.refus'))
      else if (aLeCode(cause, 'TROP_DE_REQUETES')) setErreur(t('connexion.tropDeTentatives'))
      else if (estErreurApi(cause) && cause.status === 0) setErreur(t('erreur.reseau'))
      else setErreur(t('erreur.500.texte'))
    }
  })

  return (
    <CadreAcces titre={t('connexion.titre')} intro={t('connexion.intro')}>
      {erreur ? <Alerte ton="erreur">{erreur}</Alerte> : null}
      <form noValidate onSubmit={(evenement) => void envoyer(evenement)} className="space-y-5">
        <Champ
          libelle={t('connexion.email')}
          type="email"
          autoComplete="username"
          required
          erreur={errors.email?.message}
          {...register('email')}
        />
        <Champ
          libelle={t('connexion.motDePasse')}
          type="password"
          autoComplete="current-password"
          required
          erreur={errors.motDePasse?.message}
          {...register('motDePasse')}
        />
        <Bouton type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? t('connexion.envoi') : t('connexion.envoyer')}
        </Bouton>
      </form>
      <Link
        to="/mot-de-passe-oublie"
        className="inline-flex min-h-11 items-center text-body font-semibold text-clay-700 underline underline-offset-4"
      >
        {t('connexion.oubli')}
      </Link>
    </CadreAcces>
  )
}
