import { Link } from 'react-router'
import { ArrowUpRight } from 'lucide-react'
import { ARTICLES, EPISODES } from '@/data/content'
import { useLangue } from '@/i18n/contexteLangue'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { Reveal } from '@/components/motion/Reveal'
import { LazyImage } from '@/components/media/LazyImage'
import { Eyebrow } from '@/components/ui/Eyebrow'

/**
 * À la une de la page d'accueil.
 *
 * Le contenu n'est pas saisi ici : le bloc lit le dernier article publié, et se replie
 * sur le premier film de la série si aucun article ne l'est encore. Il reste donc
 * administrable depuis les panneaux Articles et Épisodes, sans écran de plus.
 */
export function ALaUne() {
  const { t, l } = useLangue()

  const article = ARTICLES.find((entree) => entree.statut === 'publié')
  const film = EPISODES[0]

  if (!article && !film) return null

  const une = article
    ? {
        etiquette: t('alaune.article'),
        titre: article.titre,
        chapo: article.extrait,
        image: article.image,
        to: `/journal/${article.slug}`,
      }
    : {
        etiquette: t('alaune.film'),
        titre: film.titre,
        chapo: film.pitch,
        image: film.image,
        to: `/xplore/${film.slug}`,
      }

  return (
    <Section tone="light" className="bg-sand-150">
      <Container>
        <Reveal>
          <Link
            to={une.to}
            className="group grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-16 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-clay-600"
          >
            <div className="lg:col-span-7">
              <LazyImage
                src={une.image}
                alt={une.titre}
                ratio="16/10"
                className="overflow-hidden rounded-md bg-sand-200"
              />
            </div>

            <div className="space-y-5 lg:col-span-5">
              <div className="flex items-center gap-3">
                <Eyebrow num="03">{une.etiquette}</Eyebrow>
              </div>
              <h2 className="font-display uppercase text-display-lg leading-[0.95]">
                {une.titre}
              </h2>
              <p className="max-w-xl text-body-lg text-ink-700">{une.chapo}</p>
              <span className="group inline-flex items-center gap-2 text-button font-semibold text-clay-600">
                {l({ fr: 'Voir', en: 'View' })}
                <ArrowUpRight
                  aria-hidden
                  className="size-4 transition-transform duration-(--d-fast) ease-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </span>
            </div>
          </Link>
        </Reveal>
      </Container>
    </Section>
  )
}
