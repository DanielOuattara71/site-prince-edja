import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { App } from '@/app/App'
import type { CompteDroits } from '@/auth/permissions'
import { MemoryRouter } from 'react-router'
import { BarreInferieure } from '@/components/layout/BarreInferieure'
import { entreesVisibles, MENU } from '@/components/layout/navigation'
import { connecter, utiliserFauxServeur } from '@/test/faux-serveur'

/** C2 : menu à neuf entrées, onglets, retraits et redirection (PROMPT-CORRECTION § 5). */

utiliserFauxServeur()
afterEach(() => window.history.pushState({}, '', '/'))

const compte = (role: CompteDroits['role'], createurId: string | null = null): CompteDroits => ({
  id: `essai-${role}`,
  role,
  actif: true,
  createurId,
})

const vue = (c: CompteDroits) =>
  Object.fromEntries(entreesVisibles(c).map((e) => [e.libelle, e.visibles.map((o) => o.libelle)]))

describe('déclaration du menu', () => {
  it('neuf entrées, une icône chacune', () => {
    expect(MENU.map((e) => e.libelle)).toEqual([
      'Tableau de bord',
      'Journal',
      'Projets',
      'Boutique',
      'Médiathèque',
      'Preuves et presse',
      'Boîte de réception',
      'Réglages',
      'Technique',
    ])
    for (const entree of MENU) expect(entree.icone).toBeTruthy()
  })

  it('aucune adresse retirée ne figure dans le menu', () => {
    const chemins = MENU.flatMap((e) => e.onglets.map((o) => o.chemin))
    for (const retire of [
      '/navigation',
      '/textes-interface',
      '/motifs-contact',
      '/univers',
      '/jalons',
      '/offres',
      '/etudes-cas',
      '/pages',
      '/demo',
      '/composants',
      '/journal',
    ])
      expect(chemins).not.toContain(retire)
  })
})

describe('entrées et onglets visibles par rôle (peut)', () => {
  it('éditeur : contenus et médiathèque, ni boîte de réception, ni réglages, ni technique', () => {
    const v = vue(compte('editeur'))
    expect(Object.keys(v)).toEqual([
      'Tableau de bord',
      'Journal',
      'Projets',
      'Boutique',
      'Médiathèque',
      'Preuves et presse',
    ])
    expect(v['Boutique']).toEqual(['Bijoux', 'Livres'])
    expect(v['Preuves et presse']).toEqual(['Distinctions', 'Presse', 'Partenaires'])
  })

  it('admin : les neuf entrées ; Technique a ses trois onglets', () => {
    const v = vue(compte('admin'))
    expect(Object.keys(v)).toHaveLength(9)
    expect(v['Boutique']).toEqual(['Bijoux', 'Livres', 'Catégories', 'Créateurs'])
    expect(v['Technique']).toEqual(['Publication', 'Activité', 'Comptes'])
    expect(v['Réglages']).toEqual(['Identité et paramètres', 'Pages légales', 'Étiquettes'])
  })

  it('super-admin : les neuf entrées', () => {
    expect(Object.keys(vue(compte('super_admin')))).toHaveLength(9)
  })

  it('vendeur : seulement Boutique (sans Créateurs ni Catégories) et Médiathèque (ECRANS § 0.5)', () => {
    const v = vue(compte('vendeur', 'createur-1'))
    expect(Object.keys(v)).toEqual(['Boutique', 'Médiathèque'])
    expect(v['Boutique']).toEqual(['Bijoux', 'Livres'])
    // Ni « Sur le site » (photos fixes, galeries) : un vendeur ne voit que ses médias.
    expect(v['Médiathèque']).toEqual(['Tous les fichiers'])
  })

  it('une entrée pointe vers son premier onglet visible', () => {
    const boutique = entreesVisibles(compte('vendeur', 'createur-1')).find(
      (e) => e.cle === 'boutique',
    )
    expect(boutique?.chemin).toBe('/bijoux')
  })
})

describe('routes', () => {
  const ouvrir = async (chemin: string) => {
    await connecter('admin')
    window.history.pushState({}, '', chemin)
    return render(<App />)
  }

  it('barre d’onglets du groupe, onglet courant marqué, entrée du menu surlignée', async () => {
    await ouvrir('/bijoux')
    const onglets = await screen.findByRole('navigation', { name: 'Onglets : Boutique' })
    const courant = within(onglets).getByRole('link', { name: 'Bijoux' })
    expect(courant.getAttribute('aria-current')).toBe('page')
    expect(within(onglets).getByRole('link', { name: 'Livres' })).toBeTruthy()
    const menu = screen.getByRole('navigation', { name: 'Navigation principale' })
    expect(within(menu).getByRole('link', { name: 'Boutique' }).getAttribute('aria-current')).toBe(
      'page',
    )
  })

  it('Journal n’a pas de barre d’onglets', async () => {
    await ouvrir('/articles')
    await screen.findByRole('heading', { level: 1, name: 'Articles' })
    expect(screen.queryByRole('navigation', { name: /^Onglets/ })).toBeNull()
  })

  it.each(['/univers', '/navigation', '/motifs-contact', '/pages', '/composants'])(
    '%s répond « Page introuvable »',
    async (chemin) => {
      await ouvrir(chemin)
      expect(
        await screen.findByRole('heading', { level: 1, name: 'Page introuvable' }),
      ).toBeTruthy()
    },
  )

  it('/journal redirige vers /activite en gardant les filtres', async () => {
    await connecter('super')
    window.history.pushState({}, '', '/journal?action=publier')
    render(<App />)
    expect(await screen.findByRole('heading', { level: 1, name: 'Activité' })).toBeTruthy()
    expect(window.location.pathname).toBe('/activite')
    expect(window.location.search).toBe('?action=publier')
  })
})

describe('barre inférieure mobile (U11)', () => {
  const rendre = (c: CompteDroits) =>
    render(
      <MemoryRouter>
        <BarreInferieure compte={c} plusOuvert={false} surPlus={() => undefined} />
      </MemoryRouter>,
    )

  it('admin : Journal, Boutique, Boîte de réception, Plus ; cibles de 44 px au moins', () => {
    rendre(compte('admin'))
    const barre = screen.getByRole('navigation', { name: 'Raccourcis' })
    const noms = [...within(barre).getAllByRole('link'), within(barre).getByRole('button')].map(
      (e) => e.textContent,
    )
    expect(noms).toEqual(['Journal', 'Boutique', 'Boîte de réception', 'Plus'])
    for (const lien of within(barre).getAllByRole('link'))
      expect(lien.className).toMatch(/min-h-14/)
  })

  it('vendeur : seulement Boutique et Plus', () => {
    rendre(compte('vendeur', 'createur-1'))
    const barre = screen.getByRole('navigation', { name: 'Raccourcis' })
    expect(
      within(barre)
        .getAllByRole('link')
        .map((l) => l.textContent),
    ).toEqual(['Boutique'])
    expect(within(barre).getByRole('button', { name: 'Plus' })).toBeTruthy()
  })
})
