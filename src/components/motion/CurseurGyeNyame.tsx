import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'
import { useLangue } from '@/i18n/contexteLangue'

/**
 * Symbole Gye Nyame servant de curseur.
 *
 * Le fichier vit dans `public/images/gyenyame.png`. Il n'est ni recoloré ni déformé :
 * `object-fit: contain` et aucune teinte appliquée.
 */
const SYMBOLE = `${import.meta.env.BASE_URL}images/gyenyame.png`

/**
 * Rotation des couleurs de la traînée.
 *
 * Les valeurs sont des `var()` lus dans `globals.css` (`--curseur-perle-*`) : la
 * palette reste la seule source de vérité, y compris pour du style écrit en JS.
 */
const COULEURS = [
  'var(--curseur-perle-1)',
  'var(--curseur-perle-2)',
  'var(--curseur-perle-3)',
  'var(--curseur-perle-4)',
]

const NB_PERLES = 14
const TAILLE_CURSEUR = 56
const TAILLE_PERLE = 16
const PAS_PERLE = 0.9

/** Suivi du symbole : 0,2 = retard court. Plus petit = plus fluide mais plus mou. */
const SUIVI = 0.2
const SUIVI_PERLE = 0.35

const HORS_ECRAN = -100

interface Perle {
  el: HTMLDivElement
  x: number
  y: number
}

export function CurseurGyeNyame() {
  const curseur = useRef<HTMLDivElement>(null)
  const etiquette = useRef<HTMLSpanElement>(null)
  const { l } = useLangue()

  // La langue change sans recréer le curseur : un `l` en dépendance démonterait et
  // remonterait tout l'effet à chaque bascule FR/EN.
  const langueRef = useRef(l)
  useEffect(() => {
    langueRef.current = l
  }, [l])

  // Un changement de page désarme l'effet : après un clic dans une galerie, la zone
  // a quitté le DOM et aucun `mouseout` ne viendra jamais le signaler — le curseur
  // natif resterait masqué sur la page suivante.
  const { pathname } = useLocation()
  useEffect(() => {
    document.body.classList.remove('curseur-on')
    curseur.current?.classList.remove('curseur--actif', 'curseur--survol')
  }, [pathname])

  useEffect(() => {
    // Écran tactile : il n'y a pas de pointeur permanent, l'effet n'aurait aucun sens
    // et laisserait le curseur natif masqué sans rien mettre à la place.
    const tactile = window.matchMedia('(hover: none)').matches
    const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (tactile || reduit) return

    const noeud = curseur.current
    const texte = etiquette.current
    if (!noeud) return

    const perles: Perle[] = Array.from({ length: NB_PERLES }, (_, index) => {
      const taille = TAILLE_PERLE - index * PAS_PERLE
      const el = document.createElement('div')
      el.className = 'perle'
      el.style.width = `${taille}px`
      el.style.height = `${taille}px`
      el.style.margin = `${-taille / 2}px 0 0 ${-taille / 2}px`
      el.style.backgroundColor = COULEURS[index % COULEURS.length]
      el.style.opacity = `${1 - index / NB_PERLES}`
      document.body.appendChild(el)
      return { el, x: HORS_ECRAN, y: HORS_ECRAN }
    })

    // Le curseur porte ses dimensions dans le CSS ; on les aligne ici pour que le
    // décalage de centrage corresponde à la taille réelle, sinon le symbole serait
    // décalé du point suivi.
    noeud.style.width = `${TAILLE_CURSEUR}px`
    noeud.style.height = `${TAILLE_CURSEUR}px`
    noeud.style.margin = `${-TAILLE_CURSEUR / 2}px 0 0 ${-TAILLE_CURSEUR / 2}px`

    let sourisX = HORS_ECRAN
    let sourisY = HORS_ECRAN
    let curseurX = HORS_ECRAN
    let curseurY = HORS_ECRAN
    let image = 0

    const onMove = (event: MouseEvent) => {
      sourisX = event.clientX
      sourisY = event.clientY
    }
    window.addEventListener('mousemove', onMove)

    // Boucle unique : elle ne touche que `transform`. Aucune propriété de layout n'est
    // lue ni écrite ici, donc pas de reflow par frame.
    const boucle = () => {
      curseurX += (sourisX - curseurX) * SUIVI
      curseurY += (sourisY - curseurY) * SUIVI
      noeud.style.transform = `translate3d(${curseurX}px, ${curseurY}px, 0)`

      let px = curseurX
      let py = curseurY
      for (const perle of perles) {
        perle.x += (px - perle.x) * SUIVI_PERLE
        perle.y += (py - perle.y) * SUIVI_PERLE
        perle.el.style.transform = `translate3d(${perle.x}px, ${perle.y}px, 0)`
        px = perle.x
        py = perle.y
      }

      image = requestAnimationFrame(boucle)
    }
    image = requestAnimationFrame(boucle)

    /*
      Survol par délégation, et non par écoute posée sur chaque lien au montage.
      Le DOM change à chaque navigation dans une SPA : une liste figée au chargement
      ne verrait jamais les pages chargées ensuite. `closest` sur `mouseover`
      (qui remonte) détecte l'entrée sur n'importe quel lien, présent ou futur.

      L'effet est opt-in : il ne se lève que dans une zone `[data-curseur]` — les
      galeries et le lookbook. Ailleurs le curseur natif reste seul : `cursor: none`
      sur tout le site coûtait la précision du pointeur sur les liens, les formulaires
      et les petits boutons de la boutique.
    */
    let actif: Element | null = null
    let zoneActive: Element | null = null

    const activer = (zone: Element) => {
      zoneActive = zone
      document.body.classList.add('curseur-on')
      noeud.classList.add('curseur--actif')
    }

    const desactiver = () => {
      zoneActive = null
      document.body.classList.remove('curseur-on')
      noeud.classList.remove('curseur--actif', 'curseur--survol')
    }

    const onOver = (event: MouseEvent) => {
      const cible = event.target instanceof Element ? event.target : null
      const zone = cible?.closest('[data-curseur]') ?? null

      if (zone) {
        if (zone !== zoneActive) activer(zone)
      } else if (zoneActive) {
        desactiver()
      }

      // L'étiquette « Voir » ne s'affiche que sur un lien de la zone : un libellé
      // flottant hors contexte n'aurait aucun sens.
      const lien = zone ? (cible?.closest('a, button, .product') ?? null) : null
      if (lien === actif) return
      actif = lien

      if (lien) {
        if (texte) {
          texte.textContent = lien.getAttribute('data-cursor') ?? langueRef.current({ fr: 'Voir', en: 'View' })
        }
        noeud.classList.add('curseur--survol')
      } else {
        noeud.classList.remove('curseur--survol')
      }
    }

    // Sortie de zone. `relatedTarget` désigne la cible suivante : s'il reste dans la
    // même zone, on ne désactive pas, sinon chaque passage d'un enfant à l'autre
    // ferait clignoter le symbole.
    const onOut = (event: MouseEvent) => {
      if (!zoneActive) return
      const vers = event.relatedTarget instanceof Element ? event.relatedTarget : null
      if (vers && vers.closest('[data-curseur]') === zoneActive) return
      desactiver()
    }

    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)

    const onDown = () => noeud.classList.add('curseur--clic')
    const onUp = () => noeud.classList.remove('curseur--clic')
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)

    return () => {
      cancelAnimationFrame(image)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      perles.forEach((perle) => perle.el.remove())
      // La classe pouvait être restée posée si le composant est démonté depuis
      // une zone active : sans ce retrait, le curseur natif resterait masqué.
      document.body.classList.remove('curseur-on')
      noeud.classList.remove('curseur--actif', 'curseur--survol', 'curseur--clic')
    }
  }, [])

  return (
    <div ref={curseur} className="curseur" aria-hidden="true">
      <img src={SYMBOLE} alt="" />
      <span ref={etiquette}>Voir</span>
    </div>
  )
}
