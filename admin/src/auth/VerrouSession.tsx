import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { aLeCode } from '@/api/erreurs'
import { useSession } from '@/auth/contexte-session'
import { delaisSession, minutesRestantes, useVerrou } from '@/auth/inactivite'
import { useNotifications } from '@/components/retours/contexte-notifications'
import { Alerte } from '@/components/ui/Alerte'
import { BoiteDialogue } from '@/components/ui/BoiteDialogue'
import { Bouton } from '@/components/ui/Bouton'
import { Champ } from '@/components/ui/Champ'
import { t } from '@/i18n/fr'
import { messageErreur } from '@/lib/message-erreur'

/**
 * Session tombée pendant le travail (D-16, D-38) : une boîte non fermable recouvre l'écran,
 * **la page reste montée** et le formulaire garde sa saisie. Le mot de passe suffit pour
 * reprendre (l'adresse est celle du compte) ; l'action interrompue est à relancer.
 */
export function VerrouSession() {
  const { moi, connecter, deconnecter } = useSession()
  const { verrouille, deverrouiller } = useVerrou()
  const notifier = useNotifications()
  const navigate = useNavigate()
  const [motDePasse, setMotDePasse] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)
  const [envoi, setEnvoi] = useState(false)

  if (!moi) return null
  const email = moi.compte.email

  const reprendre = async (evenement: FormEvent) => {
    evenement.preventDefault()
    setEnvoi(true)
    setErreur(null)
    try {
      await connecter(email, motDePasse)
      setMotDePasse('')
      deverrouiller()
      notifier.succes(t('verrou.retabli'))
    } catch (cause) {
      setErreur(
        aLeCode(cause, 'IDENTIFIANTS_INVALIDES')
          ? t('connexion.refus')
          : aLeCode(cause, 'TROP_DE_REQUETES')
            ? t('connexion.tropDeTentatives')
            : messageErreur(cause),
      )
    } finally {
      setEnvoi(false)
    }
  }

  const quitter = async () => {
    await deconnecter()
    void navigate('/connexion', { replace: true })
  }

  return (
    <BoiteDialogue
      ouverte={verrouille}
      fermable={false}
      surFermeture={() => undefined}
      titre={t('verrou.titre')}
      description={t('verrou.texte')}
    >
      <form className="space-y-4" onSubmit={(evenement) => void reprendre(evenement)}>
        <p className="text-body text-ink-900">
          {t('verrou.compte')} <strong>{email}</strong>
        </p>
        {/* Champ caché : les gestionnaires de mots de passe associent la saisie au bon compte. */}
        <input type="email" name="email" value={email} autoComplete="username" readOnly hidden />
        <Champ
          type="password"
          libelle={t('connexion.motDePasse')}
          autoComplete="current-password"
          required
          value={motDePasse}
          onChange={(evenement) => setMotDePasse(evenement.target.value)}
        />
        {erreur ? <Alerte ton="erreur">{erreur}</Alerte> : null}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Bouton variante="secondaire" onClick={() => void quitter()}>
            {t('coque.deconnexion')}
          </Bouton>
          <Bouton type="submit" disabled={envoi || !motDePasse}>
            {envoi ? t('connexion.envoi') : t('verrou.reprendre')}
          </Bouton>
        </div>
      </form>
    </BoiteDialogue>
  )
}

/**
 * Avertissement d'inactivité, deux minutes avant l'échéance de la session (D-16). « Rester
 * connecté » relit la session, ce qui repousse l'échéance glissante. À l'échéance, l'écran se
 * verrouille comme après un `401`.
 */
export function AvertissementInactivite() {
  const { moi, rafraichir, deconnecter } = useSession()
  const { verrouille, verrouiller } = useVerrou()
  const navigate = useNavigate()
  const expireLe = moi?.session.expireLe
  const [ouvert, setOuvert] = useState(false)
  const [maintenant, setMaintenant] = useState(() => Date.now())
  const [expireVue, setExpireVue] = useState(expireLe)
  // Une nouvelle échéance (session relue) referme l'avertissement, sans effet de remise à zéro.
  if (expireVue !== expireLe) {
    setExpireVue(expireLe)
    setOuvert(false)
  }

  useEffect(() => {
    if (!expireLe || verrouille) return
    const { avantAvertissement, avantEcheance } = delaisSession(expireLe, Date.now())
    const avertir = setTimeout(() => {
      setMaintenant(Date.now())
      setOuvert(true)
    }, avantAvertissement)
    const echoir = setTimeout(() => {
      setOuvert(false)
      verrouiller()
    }, avantEcheance)
    return () => {
      clearTimeout(avertir)
      clearTimeout(echoir)
    }
  }, [expireLe, verrouille, verrouiller])

  useEffect(() => {
    if (!ouvert) return
    const minuterie = setInterval(() => setMaintenant(Date.now()), 15_000)
    return () => clearInterval(minuterie)
  }, [ouvert])

  if (!expireLe) return null
  const minutes = minutesRestantes(expireLe, maintenant)

  return (
    <BoiteDialogue
      ouverte={ouvert && !verrouille}
      surFermeture={() => setOuvert(false)}
      titre={t('inactivite.titre')}
      description={`${t('inactivite.texte.debut')} ${minutes} ${
        minutes > 1 ? t('inactivite.minutes') : t('inactivite.minute')
      }. ${t('inactivite.texte.fin')}`}
      actions={
        <>
          <Bouton
            variante="secondaire"
            onClick={() => {
              void deconnecter().then(() => navigate('/connexion', { replace: true }))
            }}
          >
            {t('coque.deconnexion')}
          </Bouton>
          <Bouton onClick={() => void rafraichir()}>{t('inactivite.rester')}</Bouton>
        </>
      }
    />
  )
}
