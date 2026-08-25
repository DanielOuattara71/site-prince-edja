import { useRef, useState } from 'react'
import { CONTACT_MOTIFS } from '@/data/content'
import { SITE } from '@/data/site'
import { useSeo } from '@/hooks/useSeo'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Reveal } from '@/components/motion/Reveal'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Input, Select, Textarea } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'

const SUBJECT_OPTIONS = [...CONTACT_MOTIFS.map((motif) => motif.titre), 'Autre demande']

type FormStatus = 'idle' | 'sending' | 'success' | 'error'

function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [status, setStatus] = useState<FormStatus>('idle')
  const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY as string | undefined

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!accessKey) {
      setStatus('error')
      return
    }

    setStatus('sending')
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: new FormData(formRef.current ?? undefined),
      })
      const result = (await response.json()) as { success?: boolean }
      if (result.success) {
        setStatus('success')
        formRef.current?.reset()
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div
        role="status"
        className="flex h-full flex-col items-start justify-center gap-5 rounded-2xl border border-sand-200 bg-sand-100 p-10"
      >
        <p className="font-display uppercase text-heading-md text-ink-900">
          Message envoyé<span aria-hidden className="text-clay-500">.</span>
        </p>
        <p className="text-body text-ink-500">
          Merci — l’équipe revient vers vous rapidement. Pour une demande presse urgente,
          écrivez directement à {SITE.email}.
        </p>
        <Button variant="ghost-dark" onClick={() => setStatus('idle')}>
          Envoyer un autre message
        </Button>
      </div>
    )
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-sand-200 bg-sand-100 p-8 sm:p-10"
    >
      <input type="hidden" name="access_key" value={accessKey ?? ''} />
      <input type="hidden" name="subject" value="Nouveau message — site Prince Edja" />
      <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} aria-hidden />

      <Input label="Votre nom" id="nom" autoComplete="name" required placeholder="Nom et prénom" />
      <Input
        label="Votre email"
        id="email"
        type="email"
        autoComplete="email"
        required
        placeholder="vous@exemple.com"
      />
      <Select label="Votre demande" id="demande" options={SUBJECT_OPTIONS} required />
      <Textarea label="Votre message" id="message" required placeholder="Parlons du prochain récit…" />

      {status === 'error' && (
        <p role="alert" className="text-sm font-semibold text-clay-600">
          L’envoi a échoué. Vérifiez la configuration du formulaire ou écrivez à {SITE.email}.
        </p>
      )}

      <Button type="submit" magnetic={false} className={status === 'sending' ? 'pointer-events-none opacity-60' : ''}>
        {status === 'sending' ? 'Envoi en cours…' : 'Envoyer le message'}
      </Button>
    </form>
  )
}

export default function ContactPage() {
  useSeo({
    title: 'Contact — Prince Edja',
    description:
      'Partenariats, productions, conférences, presse, projections : parlons du prochain récit. Abidjan · Côte d’Ivoire.',
  })

  return (
    <Section tone="light" className="pt-32 lg:pt-44">
      <Container>
        <div className="max-w-4xl space-y-6">
          <Eyebrow>Contact</Eyebrow>
          <h1 className="font-display uppercase text-display-lg">
            Parlons du prochain récit
            <span aria-hidden className="text-clay-500">.</span>
          </h1>
          <p className="max-w-2xl text-body-lg text-ink-500">
            Partenariats, productions, conférences, presse, projections et collaborations de
            marque.
          </p>
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="space-y-12 lg:col-span-5">
            {CONTACT_MOTIFS.map((motif, index) => (
              <Reveal key={motif.numero} delay={index * 0.06}>
                <div className="border-t border-sand-200 pt-6">
                  <p aria-hidden className="font-display text-heading-sm text-gold-400">
                    {motif.numero}
                  </p>
                  <h2 className="mt-1 font-display uppercase text-heading-sm text-ink-900">
                    {motif.titre}
                  </h2>
                  <p className="mt-2 max-w-md text-body text-ink-500">{motif.description}</p>
                </div>
              </Reveal>
            ))}

            <Reveal delay={0.2}>
              <div className="border-t border-sand-200 pt-6">
                <p className="label-caps text-ink-500">En direct</p>
                <a
                  href={`mailto:${SITE.email}`}
                  className="mt-2 block font-display uppercase text-heading-sm text-ink-900 underline-offset-4 hover:underline"
                >
                  {SITE.email}
                </a>
                <p className="label-caps mt-3 text-ink-500">{SITE.localisation}</p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1} className="lg:col-span-7">
            <ContactForm />
          </Reveal>
        </div>
      </Container>
    </Section>
  )
}
