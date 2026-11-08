import { useEffect, useRef, useState } from 'react'
import { CONTACT_MOTIFS, UNIVERS } from '@/acces/preuves'
import { SITE } from '@/acces/site'
import { useSeo } from '@/hooks/useSeo'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Reveal } from '@/components/motion/Reveal'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Input, Select, Textarea } from '@/components/ui/Field'
import { emailContact, envoyerContact, estRobot, formulairesOuverts } from '@/lib/formulaire'
import { useLangue } from '@/i18n/contexteLangue'
import { Button } from '@/components/ui/Button'
import { AvisFormulaireFerme } from '@/components/ui/AvisFormulaireFerme'

const SUBJECT_OPTIONS = [...CONTACT_MOTIFS.map((motif) => motif.titre), 'Autre demande']

type FormStatus = 'idle' | 'sending' | 'success' | 'error' | 'messagerie'

function ContactForm() {
  const { t } = useLangue()
  const formRef = useRef<HTMLFormElement>(null)
  const succesRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<FormStatus>('idle')

  // Le focus suivait le bouton d'envoi, démonté avec le formulaire : il retombait sur
  // le `<body>`, et un lecteur d'écran ne disait plus rien. Il va sur la confirmation.
  useEffect(() => {
    if (status === 'success') succesRef.current?.focus()
  }, [status])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!formRef.current || estRobot(formRef.current)) return

    // Sans API : la messagerie du visiteur s'ouvre avec l'e-mail prêt (décision § 8.1).
    if (!formulairesOuverts) {
      window.location.href = emailContact(new FormData(formRef.current), SITE.email)
      setStatus('messagerie')
      return
    }

    setStatus('sending')
    const envoye = await envoyerContact(formRef.current)
    if (envoye) {
      setStatus('success')
      formRef.current.reset()
    } else {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div
        ref={succesRef}
        role="status"
        tabIndex={-1}
        className="flex h-full flex-col items-start justify-center gap-5 rounded-xl border border-sand-200 bg-sand-100 p-10"
      >
        <p className="font-display uppercase text-heading-md text-ink-900">
          Message envoyé<span aria-hidden className="text-clay-500">.</span>
        </p>
        <p className="text-body text-ink-500">
          Merci, l’équipe revient vers vous rapidement. Pour une demande presse urgente,
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
      className="space-y-6 rounded-xl border border-sand-200 bg-sand-100 p-8 sm:p-10"
    >
      {!formulairesOuverts && <AvisFormulaireFerme />}

      {/* Champ piège du contrat (`siteWeb`) : invisible, laissé vide par un humain. */}
      <input
        type="text"
        name="siteWeb"
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
      />

      <Input label="Votre nom" id="nom" autoComplete="name" required placeholder="Nom et prénom" />
      <Input
        label="Votre email"
        id="email"
        type="email"
        autoComplete="email"
        required
        placeholder="vous@exemple.com"
      />
      <Select
        label="Votre demande"
        id="demande"
        options={SUBJECT_OPTIONS}
        optionVide="Choisissez votre demande"
        required
      />
      <Textarea label="Votre message" id="message" required placeholder="Parlons du prochain récit…" />

      {/* Messages d'état montés en permanence : insérés au moment de l'événement, ils
          ne sont pas annoncés de façon fiable par les lecteurs d'écran. Le succès
          quitte ce formulaire ; l'échec et l'ouverture de la messagerie y vivent. */}
      <div role="status" aria-live="polite">
        {status === 'messagerie' ? <AvisFormulaireFerme etat="messagerie" /> : null}
      </div>
      <div role="alert" aria-live="assertive" className="min-h-6">
        {status === 'error' ? (
          <p className="text-caption font-semibold text-clay-700">
            L’envoi n’a pas abouti. Écrivez-nous à {SITE.email}.
          </p>
        ) : null}
      </div>

      <Button type="submit" magnetic={false} disabled={status === 'sending'}>
        {status === 'sending'
          ? 'Envoi en cours…'
          : formulairesOuverts
            ? 'Envoyer le message'
            : t('formulaire.preparer')}
      </Button>
    </form>
  )
}

export default function ContactPage() {
  useSeo({
    title: 'Contact · Prince Edja',
    description:
      'Partenariats, productions, conférences, presse, projections : parlons du prochain récit. Abidjan · Côte d’Ivoire.',
  })

  return (
    <Section tone="light" padded={false} className="pt-32 pb-20 lg:pt-44 lg:pb-28">
      <Container>
        <div className="max-w-3xl space-y-6">
          <Eyebrow>Contact</Eyebrow>
          <h1 className="font-display uppercase text-display-lg">
            Parlons du prochain récit
            <span aria-hidden className="text-clay-500">.</span>
          </h1>
          <p className="max-w-2xl text-body-lg text-ink-500">
            Partenariats, productions, conférences, presse, projections et collaborations de
            marque. Décrivez votre projet en quelques lignes : la réponse vient d'une personne,
            pas d'un formulaire.
          </p>
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="space-y-12 lg:col-span-5">
            {CONTACT_MOTIFS.map((motif, index) => (
              <Reveal key={motif.numero} delay={index * 0.06}>
                <div className="border-t border-sand-200 pt-6">
                  <p aria-hidden className="font-display text-heading-sm text-clay-600">
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
                  className="mt-2 flex min-h-11 w-fit items-center font-display uppercase text-heading-sm text-ink-900 underline-offset-4 hover:underline"
                >
                  {SITE.email}
                </a>
                <p className="label-caps mt-3 text-ink-500">{SITE.localisation}</p>
              </div>
            </Reveal>

            <Reveal delay={0.25}>
              <div className="border-t border-sand-200 pt-6">
                <p className="label-caps text-ink-500">Délai de réponse</p>
                <p className="mt-2 max-w-md text-body text-ink-700">
                  Chaque demande reçoit une réponse humaine sous 24 heures ouvrées. Si le
                  projet n'est pas le bon, on le dit, et on oriente vers quelqu'un pour qui
                  il l'est.
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1} className="lg:col-span-7">
            <ContactForm />
          </Reveal>
        </div>

        {/* Les six univers, repris de « Travailler avec Prince » : ils disent ce que
            la maison sait faire, le formulaire au-dessus dit comment la contacter.
            Césure majeure `mt-24` (échelle maison). */}
        <div className="mt-24 space-y-10">
          <div className="space-y-2">
            <Eyebrow>Les univers</Eyebrow>
            <h2 className="font-display uppercase text-display-lg">
              Six maisons dans la maison
              <span aria-hidden className="text-clay-500">.</span>
            </h2>
          </div>

          <ul className="grid gap-10 lg:grid-cols-2">
            {UNIVERS.map((univers) => (
              <li key={univers.numero} className="space-y-3 border-t border-sand-200 pt-6">
                <p className="label-caps text-clay-600">{univers.numero}</p>
                <h3 className="font-display uppercase text-heading-sm">{univers.nom}</h3>
                <p className="text-body text-ink-500">{univers.pitch}</p>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  )
}
