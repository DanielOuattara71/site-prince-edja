import { SITE } from '@/acces/site'
import { photoOuRepli } from '@/acces/photos'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { Reveal } from '@/components/motion/Reveal'
import { LazyImage } from '@/components/media/LazyImage'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { img } from '@/lib/images'

/**
 * Manifeste de la page d'accueil.
 *
 * Le CDC demande trois choses et rien de plus : un texte court sur la mission, un
 * portrait éditorial et une citation. Les chiffres ne vivent plus ici, ils ont leur
 * propre bande (« Preuves ») : les répéter sur le même écran les rendait invisibles.
 *
 * Le portrait vient de l'emplacement `accueil.portrait` (contrat § 34.1) : la maison le
 * remplit depuis l'admin sans redéployer de fichier, et retombe sur le portrait du dépôt
 * tant que rien n'a été assigné (aucune image inventée).
 */
export function IntroBio() {
  const portrait = photoOuRepli('accueil.portrait', img(`images/a-propos/portrait-edja.jpg`))

  return (
    <Section tone="light">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <LazyImage
              src={portrait.src}
              srcSet={portrait.srcSet}
              sizes="(max-width: 1024px) 100vw, 40vw"
              alt="Prince Edja, portrait éditorial"
              ratio="4/5"
              className="overflow-hidden rounded-md bg-sand-200"
            />
          </Reveal>

          <div className="space-y-8 lg:col-span-7">
            <Reveal>
              <div className="space-y-6">
                <Eyebrow>Qui suis-je</Eyebrow>
                <blockquote className="border-l-2 border-leaf-600 pl-6 font-quote text-heading-sm italic leading-snug text-ink-900 sm:text-heading-md">
                  {SITE.mission}
                </blockquote>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <p className="max-w-2xl text-body-lg text-ink-700">{SITE.role}</p>
            </Reveal>

            <Reveal delay={0.16}>
              <a
                href={SITE.linkedin}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center text-button font-semibold text-ink-900"
              >
                {SITE.linkedinLabel}
              </a>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  )
}
