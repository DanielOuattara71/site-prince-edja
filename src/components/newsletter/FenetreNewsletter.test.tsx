import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { FenetreNewsletter } from './FenetreNewsletter'
import { FournisseurLangue } from '@/i18n/FournisseurLangue'

vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)

/** Minuteur piloté, hors `requestAnimationFrame` : l'animation de sortie de la
 *  fenêtre doit pouvoir tourner sur les frames réelles du navigateur/jsdom. */
function minuteur() {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] })
}

function renderFenetre() {
  return render(
    <FournisseurLangue>
      <MemoryRouter basename="/site-prince-edja" initialEntries={['/site-prince-edja/journal']}>
        <FenetreNewsletter />
      </MemoryRouter>
    </FournisseurLangue>,
  )
}

beforeEach(() => {
  window.localStorage.clear()
  window.sessionStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

/** Laisse l'animation de sortie d'AnimatePresence (frames réelles) se dérouler. */
async function laisseSortir() {
  await act(async () => {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve())
    })
  })
}

describe('FenetreNewsletter', () => {
  it('s’ouvre sur /journal avec un basename après le minuteur de présence', () => {
    minuteur()
    renderFenetre()

    expect(screen.queryByRole('dialog')).toBeNull()

    act(() => {
      vi.advanceTimersByTime(20_000)
    })

    expect(screen.getByRole('dialog')).toBeTruthy()
  })

  it('se ferme via le bouton ✕', async () => {
    minuteur()
    renderFenetre()
    act(() => {
      vi.advanceTimersByTime(20_000)
    })

    fireEvent.click(screen.getByRole('button', { name: 'Fermer la fenêtre' }))
    await laisseSortir()

    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('se ferme avec Échap', async () => {
    minuteur()
    renderFenetre()
    act(() => {
      vi.advanceTimersByTime(20_000)
    })

    fireEvent.keyDown(window, { key: 'Escape' })
    await laisseSortir()

    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('amène le focus dans la fenêtre à l’ouverture et le rend à l’élément précédent à la fermeture', async () => {
    minuteur()
    renderFenetre()

    const antecedent = document.createElement('button')
    antecedent.textContent = 'Ancrage'
    document.body.appendChild(antecedent)
    antecedent.focus()

    act(() => {
      vi.advanceTimersByTime(20_000)
    })

    const boutonFermer = screen.getByRole('button', { name: 'Fermer la fenêtre' })
    expect(document.activeElement).toBe(boutonFermer)

    fireEvent.click(boutonFermer)
    await laisseSortir()

    expect(document.activeElement).toBe(antecedent)
    antecedent.remove()
  })

  it('refuse l’inscription sans consentement', () => {
    minuteur()
    renderFenetre()
    act(() => {
      vi.advanceTimersByTime(20_000)
    })

    fireEvent.change(screen.getByLabelText('Prénom'), { target: { value: 'Nadia' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'nadia@example.com' } })

    const formulaire = screen.getByRole('dialog').querySelector('form')
    if (!formulaire) throw new Error('Formulaire introuvable dans la fenêtre')

    fireEvent.submit(formulaire)

    expect(
      screen.queryByText(
        'Inscription enregistrée. L’e-mail de confirmation vous suivra dès que le service d’envoi sera prêt.',
      ),
    ).toBeNull()
    expect(window.localStorage.getItem('pe_newsletter_intentions')).toBeNull()
  })
})
