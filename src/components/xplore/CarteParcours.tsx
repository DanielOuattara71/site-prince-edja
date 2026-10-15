import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import { useNavigate } from 'react-router'
import type { Destination } from '@/data/destinations'
import { coordonneeValide, tracerParcours } from '@/lib/routage'
import { CADRE_CARTE, COTE_DIVOIRE, BORNES_PAYS as BORNES_DU_PAYS } from '@/lib/geo'
import { useLangue } from '@/i18n/contexteLangue'
import { cn } from '@/lib/cn'

type EtatCarte = 'chargement' | 'prete' | 'repli'

/** Pastille numérotée, aux tokens de la maison plutôt qu'à l'épingle bleue par défaut. */
function iconeEtape(numero: number): L.DivIcon {
  return L.divIcon({
    className: 'marqueur-etape',
    html: `<span class="marqueur-etape__pastille tnum">${String(numero).padStart(2, '0')}</span>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -24],
    tooltipAnchor: [0, -22],
  })
}

/**
 * Limite de ce que la carte peut montrer : le pays plus 2,2° de marge.
 *
 * Sans elle, un visiteur curieux dérive sur l'Atlantique ou sur le Burkina et ne
 * retrouve plus les étapes. Le pays reste le sujet, quelle que soit la manipulation.
 */
const LIMITE_VUE = L.latLngBounds(
  [CADRE_CARTE.sud, CADRE_CARTE.ouest],
  [CADRE_CARTE.nord, CADRE_CARTE.est],
)

/** Bornes réelles du pays : ce que le cadrage initial montre, en entier. */
const CADRE_PAYS = L.latLngBounds(
  [BORNES_DU_PAYS.sud, BORNES_DU_PAYS.ouest],
  [BORNES_DU_PAYS.nord, BORNES_DU_PAYS.est],
)

/**
 * Carte du parcours de la saison X'PLORE.
 *
 * Leaflet est piloté à la main (`useRef` + `useEffect`), sans wrapper React : la carte
 * est initialisée une fois, redessinée quand les étapes changent, et détruite au
 * démontage. `map.remove()` est ce qui empêche les fuites de conteneurs et d'écouteurs
 * d'une SPA.
 *
 * Le zoom à la molette est désactivé : sur une page qui défile, une carte qui capte le
 * scroll enferme le visiteur. Le zoom reste aux boutons, au pincement et au double-clic.
 *
 * La carte n'est pas accessible nativement : elle est donc toujours doublée de la liste
 * ordonnée des étapes, qui porte l'information et la navigation.
 */
export function CarteParcours({
  etapes,
  className,
}: {
  etapes: Destination[]
  className?: string
}) {
  const { l } = useLangue()
  const navigate = useNavigate()
  const cadre = useRef<HTMLDivElement>(null)
  const [etat, setEtat] = useState<EtatCarte>('chargement')

  // Mémoïsé : sans cela, un nouveau tableau à chaque rendu relancerait l'effet en boucle.
  const etapesValides = useMemo(() => etapes.filter((etape) => coordonneeValide(etape)), [etapes])
  const points = useMemo(
    () => etapesValides.map((etape) => ({ lat: etape.lat, lng: etape.lng })),
    [etapesValides],
  )

  // Dédoublonnage des noms pour les listes : deux étapes homonymes restent
  // distinguables par leur numéro d'ordre.
  const ordre = useMemo(
    () => etapesValides.map((etape, index) => ({ etape, numero: index + 1 })),
    [etapesValides],
  )

  /*
    Un seul effet, une carte locale.

    Deux choses sont réunies ici volontairement : l'initialisation et la destruction.
    Les tenir séparées — une carte en `useRef`, un effet de démontage à part — cassait
    le cycle de vie sous `StrictMode`, qui monte, démonte puis remonte : le second
    montage retrouvait une carte déjà détruite, et plus rien ne se dessinait.

    Tout ce que l'effet ajoute est retiré par son propre nettoyage, donc rien ne
    survit d'un cycle à l'autre.
  */
  useEffect(() => {
    const conteneur = cadre.current
    if (!conteneur || etapesValides.length === 0) return

    const map = L.map(conteneur, {
      scrollWheelZoom: false,
      zoomControl: true,
      // Le pays reste le cadre : on ne dérive ni sur l'Atlantique ni sur les voisins.
      maxBounds: LIMITE_VUE,
      // Viscosité à 0 : à 1, Leaflet forçait le zoom vers le bas pour garder tout le
      // cadre élargi visible, et le pays ne remplissait plus que la moitié de la
      // fenêtre. À 0, la limite empêche de dériver sans contraindre le cadrage.
      maxBoundsViscosity: 0,
      // Au-delà de 12, une frontière vectorielle n'apporte plus rien à l'écran.
      minZoom: 6,
      maxZoom: 12,
      // Niveaux fractionnaires : avec le pas entier par défaut, `fitBounds` arrondissait
      // vers le bas et le pays ne remplissait que la moitié du cadre.
      zoomSnap: 0,
      zoomDelta: 0.5,
    })

    /*
      Fond vectoriel : la Côte d'Ivoire tracée depuis une géométrie réelle (Natural
      Earth, domaine public). Aucune tuile 256 px — elle piquerait du flou sur écran
      retina dès qu'on zoome. Les frontières restent nettes à tous les niveaux, et
      la carte ne dépend plus d'un serveur de tuiles.
    */
    map.attributionControl.setPrefix('')
    map.attributionControl.addAttribution('Frontières © Natural Earth · tracé OSRM')

    const fond = L.layerGroup().addTo(map)

    /*
      Couleurs écrites en hex, pas en `var(--color-*)`.

      Leaflet les pose dans des **attributs** SVG (`stroke=`, `fill=`). Or une variable
      CSS ne se résout pas dans un attribut de présentation : la ligne restait
      invisible. Les valeurs sont celles des tokens de `globals.css` — à tenir synchrones.
    */
    L.geoJSON(COTE_DIVOIRE as unknown as GeoJSON.Feature, {
      style: {
        color: '#43362a', // ink-700
        weight: 1.5,
        opacity: 0.6,
        fillColor: '#f2ecdf', // sand-100
        fillOpacity: 1,
      },
    }).addTo(fond)

    /*
      Pas de graticule. Trois teintes essayées (sand-300, sand-200, sand-100) :
      une grille régulière sur toute la surface finit toujours par s'imposer, sur un
      fond aussi uni. Elle aurait demandé un réglage par écran, sans apporter
      d'information que la carte ne donne déjà.
    */

    let annule = false
    setEtat('chargement')

    tracerParcours(points)
      .then((tracés) => {
        if (annule) return

        for (const tracé of tracés) {
          /*
            OSRM renvoie une géométrie GeoJSON, donc `[longitude, latitude]`. Leaflet,
            lui, attend `[latitude, longitude]`. Sans cette inversion, chaque tracé se
            retrouvait plaqué à l'origine du SVG (« M0 0 ») — invisible.
          */
          L.polyline(
            tracé.coordinates.map(([lng, lat]) => [lat, lng]),
            {
              color: '#a8541f', // clay-600
              weight: 2.5,
              opacity: 0.95,
              dashArray: '6 7',
              lineCap: 'round',
            },
          ).addTo(fond)
        }

        for (const { etape, numero } of ordre) {
          const marqueur = L.marker([etape.lat, etape.lng], {
            icon: iconeEtape(numero),
            keyboard: true,
            riseOnHover: true,
          }).addTo(fond)

          // Étiquette permanente : le numéro seul ne dit pas quelle ville on regarde,
          // et la carte doit se lire sans avoir à cliquer six fois.
          marqueur.bindTooltip(etape.nom, {
            permanent: true,
            direction: 'top',
            offset: [0, -6],
            className: 'etiquette-etape',
          })

          marqueur.bindPopup(
            `<p class="label-caps text-ink-500">${l({ fr: 'Étape', en: 'Stop' })} ${String(numero).padStart(2, '0')}</p>` +
              `<p class="font-display text-heading-sm uppercase text-ink-900">${etape.nom}</p>` +
              `<p class="text-caption text-ink-500">${l({ fr: 'Fiche dans la liste ci-dessous', en: 'Details in the list below' })}</p>`,
          )
        }

        /*
          Le cadrage porte sur **les bornes réelles du pays** (6,4 × 6,1°), pas sur le
          cadre élargi ni sur les seules étapes : le cadre élargi ajoutait 2,2° de marge
          autour, le pays ne remplissait qu'un tiers de la fenêtre ; les étapes, elles,
          sont toutes au sud et coupaient le nord.

          Le visiteur voit donc la Côte d'Ivoire entière, avec son parcours dedans.
        */
        map.fitBounds(CADRE_PAYS, { padding: [40, 40] })

        // Le pays entier reste visible : on ne dézoome pas au-delà, sinon la carte
        // montrerait l'océan et les voisins.
        if (map.getZoom() < 6) map.setZoom(6)
        setEtat(tracés.every((tracé) => tracé.calcule) ? 'prete' : 'repli')
      })
      .catch(() => {
        // tracerParcours n'échoue pas (chaque segment a son repli) : ce cas couvre une
        // panne de Leaflet lui-même. La carte reste sur son cadrage courant.
        if (!annule) setEtat('repli')
      })

    return () => {
      annule = true
      map.remove()
    }
  }, [etapesValides, points, ordre, l])

  return (
    <div className={cn('space-y-5', className)}>
      {/*
        Hauteur : voir `.cadre-carte` dans globals.css. Classe maison, parce qu'une
        valeur arbitraire contenant des virgules n'est pas générée par Tailwind.
      */}
      <div
        ref={cadre}
        role="region"
        aria-label={l({
          fr: 'Carte du parcours X’PLORE en Côte d’Ivoire',
          en: 'Map of the X’PLORE route across Côte d’Ivoire',
        })}
        className="cadre-carte w-full overflow-hidden rounded-md border border-sand-200 bg-sand-50"
      />

      {/* Une carte interactive n'est pas accessible nativement : ces lignes sont la
          référence lisible, et portent la navigation vers les fiches. */}
      <p aria-live="polite" className="text-caption text-ink-500">
        {etat === 'chargement' && l({ fr: 'Chargement du tracé…', en: 'Drawing the route…' })}
        {etat === 'prete' &&
          l({
            fr: 'Tracé calculé par les routes les plus courtes entre les étapes, dans l’ordre de la saison.',
            en: 'Route drawn along the shortest roads between stops, in season order.',
          })}
        {etat === 'repli' &&
          l({
            fr: 'Service de routage indisponible : les étapes sont reliées en ligne droite. Ce tracé est calculé, pas la trace réelle du voyage.',
            en: 'Routing service unavailable: stops are joined by straight lines. This path is computed, not the actual journey.',
          })}
      </p>

      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ordre.map(({ etape, numero }) => (
          <li key={etape.slug} className="border-t border-sand-200 pt-3">
            <button
              type="button"
              onClick={() => navigate(`/destinations/${etape.slug}`)}
              className="group flex w-full min-h-11 items-baseline gap-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay-600"
            >
              <span aria-hidden className="label-caps shrink-0 text-clay-600">
                {String(numero).padStart(2, '0')}
              </span>
              <span className="font-display uppercase text-body text-ink-900 transition-colors duration-(--d-fast) group-hover:text-clay-600">
                {etape.nom}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}
