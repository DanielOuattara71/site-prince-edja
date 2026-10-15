import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useSeo } from '@/hooks/useSeo'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'

const EXPECTED_USER = (import.meta.env.VITE_ADMIN_USER as string | undefined) ?? 'admin'
const EXPECTED_PASS = (import.meta.env.VITE_ADMIN_PASS as string | undefined) ?? 'admin'

const ADMIN_DASHBOARD = '/admin/dashboard'
const ADMIN_EXTERNAL_URL =
  (import.meta.env.VITE_ADMIN_CUSTOM_URL as string | undefined) ?? 'http://localhost:5175'

const AUTH_KEY = 'pe_admin_auth'

function isAuthed(): boolean {
  try {
    return sessionStorage.getItem(AUTH_KEY) === '1'
  } catch {
    return false
  }
}

export default function AdminLoginPage() {
  const navigate = useNavigate()
  useSeo({
    title: 'Connexion · Espace admin · Prince Edja',
    description: 'Accès réservé à l’administration du site Prince Edja (admin codé intégré).',
  })

  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [authed, setAuthed] = useState<boolean>(() => isAuthed())

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const u = user.trim()
    const p = pass.trim()
    if (u === EXPECTED_USER && p === EXPECTED_PASS) {
      try {
        sessionStorage.setItem(AUTH_KEY, '1')
      } catch {
        /* ignore */
      }
      setAuthed(true)
      window.setTimeout(() => {
        navigate(ADMIN_DASHBOARD)
      }, 400)
    } else {
      setError(`Identifiants incorrects. (reçu: "${u}" / "${p}" ; attendu: "${EXPECTED_USER}" / "${EXPECTED_PASS}")`)
    }
  }

  function handleGoAdmin() {
    navigate(ADMIN_DASHBOARD)
  }

  function handleLogout() {
    try {
      sessionStorage.removeItem(AUTH_KEY)
    } catch {
      /* ignore */
    }
    setAuthed(false)
    setUser('')
    setPass('')
  }

  return (
    <Section tone="light" padded={false} className="pt-32 pb-20 lg:pt-44 lg:pb-28">
      <Container>
        <div className="mx-auto max-w-xl">
          <Eyebrow>Accès réservé</Eyebrow>
          <h1 className="mt-4 font-display uppercase text-display-lg">
            Espace admin<span aria-hidden className="text-clay-500">.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-body-lg text-ink-500">
            Connexion à l’admin codé intégré au site principal (même serveur, même app). Les dossiers{' '}
            <code className="rounded bg-sand-100 px-1.5 py-0.5 text-caption">admin/</code> et{' '}
            <code className="rounded bg-sand-100 px-1.5 py-0.5 text-caption">admin-custom/</code> restent inchangés
            Séparation prévue au déploiement.
          </p>

          <div className="mt-10 rounded-xl border border-sand-200 bg-sand-100 p-8 sm:p-10">
            {authed ? (
              <div className="space-y-6">
                <p className="font-display uppercase text-heading-sm text-leaf-600">
                  Connecté<span aria-hidden>.</span>
                </p>
                <p className="text-body text-ink-500">
                  Accès validé. L’admin est intégré sur ce même serveur à{' '}
                  <code className="rounded bg-sand-50 px-1.5 py-0.5 text-caption border border-sand-200">
                    {ADMIN_DASHBOARD}
                  </code>{' '}
                  (même app, même port ; {ADMIN_EXTERNAL_URL} reste dispo pour comparatif).
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button magnetic={false} onClick={handleGoAdmin}>
                    Ouvrir l’admin
                  </Button>
                  <Button variant="ghost-dark" magnetic={false} onClick={handleLogout}>
                    Se déconnecter
                  </Button>
                </div>
                <p className="text-caption text-ink-500">
                  Tous les modules admin sont sur <code className="rounded bg-sand-50 px-1 py-0.5 text-caption border border-sand-200">/admin/*</code>, même
                  origine et même localStorage.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Identifiant"
                  id="admin_user"
                  autoComplete="username"
                  required
                  placeholder="admin"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                />
                <Input
                  label="Mot de passe"
                  id="admin_pass"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                />
                {error && (
                  <p role="alert" className="text-caption font-semibold text-clay-600">
                    {error}
                  </p>
                )}
                <div className="flex flex-wrap gap-3">
                  <Button type="submit" magnetic={false} className="shrink-0">
                    Se connecter
                  </Button>
                  <Button
                    type="button"
                    variant="ghost-dark"
                    magnetic={false}
                    onClick={() => {
                      setUser(EXPECTED_USER)
                      setPass(EXPECTED_PASS)
                      setError(null)
                    }}
                  >
                    Remplir admin / admin
                  </Button>
                </div>
                <p className="text-caption leading-relaxed text-ink-500">
                  Défaut dev : <code className="rounded bg-sand-50 px-1 py-0.5 border border-sand-200">admin / admin</code>
                  {' · '}attendu actuel :{' '}
                  <code className="rounded bg-sand-50 px-1 py-0.5 border border-sand-200">
                    {EXPECTED_USER} / {EXPECTED_PASS}
                  </code>{' '}
                  · configure via{' '}
                  <code className="rounded bg-sand-50 px-1 py-0.5 border border-sand-200">VITE_ADMIN_USER / VITE_ADMIN_PASS</code> dans{' '}
                  <code className="rounded bg-sand-50 px-1 py-0.5 border border-sand-200">.env</code> (copie{' '}
                  <code className="rounded bg-sand-50 px-1 py-0.5 border border-sand-200">.env.example</code>).
                </p>
              </form>
            )}
          </div>

          <p className="mt-8 text-caption text-ink-500">
            L’admin Decap reste accessible séparément sur{' '}
            <a
              href="http://localhost:5174"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-ink-700 underline-offset-4 hover:underline"
            >
              localhost:5174
            </a>{' '}
            (non modifié).
          </p>
        </div>
      </Container>
    </Section>
  )
}
