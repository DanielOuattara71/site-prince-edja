import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ResumeErreurs } from '@/components/formulaire/ResumeErreurs'
import { ListeOrdonnable } from '@/components/listes/ListeOrdonnable'
import { DUREE_SUCCES_MS, useNotifications } from '@/components/retours/contexte-notifications'
import { FournisseurNotifications } from '@/components/retours/FournisseurNotifications'
import { BoiteDialogue } from '@/components/ui/BoiteDialogue'
import { Case } from '@/components/ui/Case'
import { Champ } from '@/components/ui/Champ'
import { Confirmation } from '@/components/ui/Confirmation'
import { IndicateurAFournir } from '@/components/ui/IndicateurAFournir'
import { Interrupteur } from '@/components/ui/Interrupteur'
import { Onglets } from '@/components/ui/Onglets'
import { PastilleStatut } from '@/components/ui/PastilleStatut'
import { Select } from '@/components/ui/Select'
import { ZoneTexte } from '@/components/ui/ZoneTexte'
import { violationsGraves } from '@/test/axe'

/** Composants transverses sans données serveur (section 10 du prompt admin). */

describe('primitives de formulaire', () => {
  it('libellé relié, erreur décrite et signalée, aucune violation axe', async () => {
    const { container } = render(
      <form>
        <Champ libelle="Titre" required erreur="Titre obligatoire." />
        <ZoneTexte libelle="Résumé" maxLength={10} defaultValue="abc" />
        <Select
          libelle="Catégorie"
          invite="Choisir…"
          options={[{ valeur: 'v', libelle: 'Voyage' }]}
        />
        <Case libelle="Image décorative" aide="Aucun texte alternatif ne sera lu." />
      </form>,
    )
    const titre = screen.getByLabelText(/^Titre/)
    expect(titre.getAttribute('aria-invalid')).toBe('true')
    expect(
      document.getElementById(titre.getAttribute('aria-describedby') ?? '')?.textContent,
    ).toContain('Titre obligatoire.')
    expect(screen.getByLabelText('Résumé')).toBeTruthy()
    expect(screen.getByText('3 / 10')).toBeTruthy()
    expect(screen.getByLabelText('Catégorie')).toBeTruthy()
    expect(screen.getByLabelText('Image décorative').getAttribute('aria-describedby')).toBeTruthy()
    expect(await violationsGraves(container)).toEqual([])
  })

  it('interrupteur : rôle switch, état dit en texte', () => {
    function Essai() {
      const [actif, setActif] = useState(false)
      return <Interrupteur libelle="Mettre à la une" actif={actif} surChange={setActif} />
    }
    render(<Essai />)
    const bouton = screen.getByRole('switch', { name: 'Mettre à la une' })
    expect(bouton.getAttribute('aria-checked')).toBe('false')
    expect(bouton.textContent).toContain('Désactivé')
    fireEvent.click(bouton)
    expect(bouton.getAttribute('aria-checked')).toBe('true')
    expect(bouton.textContent).toContain('Activé')
  })
})

describe('onglets', () => {
  it('flèches et Fin déplacent la sélection ; les panneaux masqués restent montés', () => {
    render(
      <Onglets
        libelle="Langues"
        onglets={[
          {
            id: 'fr',
            libelle: 'Français',
            contenu: <input aria-label="fr" defaultValue="Bonjour" />,
          },
          { id: 'en', libelle: 'Anglais', contenu: <input aria-label="en" /> },
        ]}
      />,
    )
    const [fr, en] = screen.getAllByRole('tab')
    expect(fr?.getAttribute('aria-selected')).toBe('true')
    expect(en?.tabIndex).toBe(-1)
    fireEvent.keyDown(fr as HTMLElement, { key: 'ArrowRight' })
    expect(en?.getAttribute('aria-selected')).toBe('true')
    expect(document.activeElement).toBe(en)
    // Le champ du panneau masqué garde sa valeur.
    expect((screen.getByLabelText('fr', { selector: 'input' }) as HTMLInputElement).value).toBe(
      'Bonjour',
    )
    fireEvent.keyDown(en as HTMLElement, { key: 'Home' })
    expect(fr?.getAttribute('aria-selected')).toBe('true')
  })
})

describe('pastilles et « à fournir »', () => {
  it('chaque état a un libellé, jamais la couleur seule', () => {
    render(
      <>
        {(
          ['brouillon', 'en_relecture', 'publie', 'programme', 'archive', 'a_fournir'] as const
        ).map((etat) => (
          <PastilleStatut key={etat} etat={etat} />
        ))}
      </>,
    )
    for (const libelle of [
      'Brouillon',
      'En relecture',
      'Publié',
      'Programmé',
      'Archivé',
      'À compléter',
    ]) {
      expect(screen.getByText(libelle)).toBeTruthy()
    }
  })

  it('rien quand tout est fourni ; sinon compteur et liste, sans valeur proposée', () => {
    const { container, rerender } = render(<IndicateurAFournir champs={[]} />)
    expect(container.textContent).toBe('')
    rerender(
      <IndicateurAFournir
        champs={['traductions.fr.extrait', 'credit']}
        libelles={{ extrait: 'Résumé' }}
        detail
      />,
    )
    expect(screen.getByText('· 2')).toBeTruthy()
    expect(screen.getByText('Résumé (FR)')).toBeTruthy()
    expect(screen.getByText('credit')).toBeTruthy()
  })
})

describe('boîtes de dialogue', () => {
  it('titre relié, croix de fermeture ; non fermable : pas de croix', () => {
    const fermer = vi.fn()
    const { rerender } = render(
      <BoiteDialogue ouverte surFermeture={fermer} titre="Choisir une image">
        contenu
      </BoiteDialogue>,
    )
    const dialogue = screen.getByRole('dialog', { name: 'Choisir une image' })
    fireEvent.click(within(dialogue).getByRole('button', { name: 'Fermer' }))
    expect(fermer).toHaveBeenCalledOnce()
    rerender(
      <BoiteDialogue ouverte surFermeture={fermer} titre="Session expirée" fermable={false}>
        contenu
      </BoiteDialogue>,
    )
    expect(within(screen.getByRole('dialog')).queryByRole('button', { name: 'Fermer' })).toBeNull()
  })

  it('la confirmation nomme l’objet et le nombre ; la double saisie bloque jusqu’à recopie', () => {
    const confirmer = vi.fn()
    render(
      <Confirmation
        ouverte
        titre="Passer en administrateur"
        objet="Exemple Éditeur"
        nombre={1}
        saisieAttendue="Exemple Éditeur"
        libelleConfirmer="Changer le rôle"
        surConfirmer={confirmer}
        surAnnuler={() => undefined}
      />,
    )
    const dialogue = screen.getByRole('dialog', { name: 'Passer en administrateur' })
    expect(dialogue.textContent).toContain('« Exemple Éditeur »')
    expect(dialogue.textContent).toContain('1 élément concerné.')
    const bouton = within(dialogue).getByRole('button', {
      name: 'Changer le rôle',
    }) as HTMLButtonElement
    expect(bouton.disabled).toBe(true)
    fireEvent.change(within(dialogue).getByLabelText(/Pour confirmer/), {
      target: { value: 'Exemple Éditeur' },
    })
    expect(bouton.disabled).toBe(false)
    fireEvent.click(bouton)
    expect(confirmer).toHaveBeenCalledOnce()
  })
})

describe('notifications', () => {
  afterEach(() => vi.useRealTimers())

  function Declencheurs() {
    const notifier = useNotifications()
    return (
      <>
        <button type="button" onClick={() => notifier.succes('Article enregistré.')}>
          succès
        </button>
        <button type="button" onClick={() => notifier.erreur('Échec.', 'req-1')}>
          erreur
        </button>
      </>
    )
  }

  it('succès poli et éphémère ; erreur assertive, persistante, avec référence', () => {
    vi.useFakeTimers()
    render(
      <FournisseurNotifications>
        <Declencheurs />
      </FournisseurNotifications>,
    )
    const polie = document.querySelector('[aria-live="polite"]') as HTMLElement
    const assertive = document.querySelector('[aria-live="assertive"]') as HTMLElement
    fireEvent.click(screen.getByRole('button', { name: 'succès' }))
    fireEvent.click(screen.getByRole('button', { name: 'erreur' }))
    expect(polie.textContent).toContain('Article enregistré.')
    expect(assertive.textContent).toContain('req-1')
    act(() => vi.advanceTimersByTime(DUREE_SUCCES_MS + 10))
    expect(polie.textContent).toBe('')
    expect(assertive.textContent).toContain('Échec.')
    fireEvent.click(within(assertive).getByRole('button', { name: 'Fermer la notification' }))
    expect(assertive.textContent).toBe('')
  })
})

describe('résumé des erreurs', () => {
  it('prend le focus à la soumission et mène au champ', async () => {
    const { rerender } = render(
      <>
        <ResumeErreurs erreurs={[]} tentative={0} />
        <input id="traductions.fr.titre" aria-label="Titre" />
      </>,
    )
    rerender(
      <>
        <ResumeErreurs
          erreurs={[{ champ: 'traductions.fr.titre', message: 'Titre obligatoire.' }]}
          tentative={1}
        />
        <input id="traductions.fr.titre" aria-label="Titre" />
      </>,
    )
    expect(document.activeElement?.textContent).toContain('Le formulaire contient des erreurs')
    fireEvent.click(screen.getByRole('link', { name: 'Titre obligatoire.' }))
    await waitFor(() => expect(document.activeElement).toBe(screen.getByLabelText('Titre')))
  })
})

describe('liste ordonnable', () => {
  it('au clavier : descendre, annoncer, garder le focus sur l’élément déplacé', () => {
    function Essai() {
      const [ordre, setOrdre] = useState(['A', 'B', 'C'])
      return (
        <ListeOrdonnable
          libelle="Ordre"
          elements={ordre}
          cle={(e) => e}
          nom={(e) => e}
          surOrdre={setOrdre}
        />
      )
    }
    render(<Essai />)
    expect(
      (screen.getByRole('button', { name: 'Monter « A »' }) as HTMLButtonElement).disabled,
    ).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Descendre « A »' }))
    const elements = within(screen.getByRole('list', { name: 'Ordre' })).getAllByRole('listitem')
    expect(elements.map((li) => li.textContent?.match(/[ABC]/)?.[0])).toEqual(['B', 'A', 'C'])
    expect(screen.getByText('« A » est maintenant en position 2 sur 3.')).toBeTruthy()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Descendre « A »' }))
  })
})
