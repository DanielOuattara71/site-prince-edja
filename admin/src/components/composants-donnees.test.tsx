import { useMutation } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { useState } from 'react'
import { Link } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { App } from '@/app/App'
import { articles } from '@/api/endpoints/contenus'
import type { Moi } from '@/api/schemas/auth'
import { ID_CREATEUR_PRINCIPAL, IDS_EXEMPLE, MOT_DE_PASSE_ESSAI } from '@/api/mocks/donnees'
import { magasin } from '@/api/mocks/magasin'
import { CLE_SESSION } from '@/auth/contexte-session'
import { AvertissementInactivite, VerrouSession } from '@/auth/VerrouSession'
import { SelecteurCreateur } from '@/components/createurs/SelecteurCreateur'
import { AvertissementSortie } from '@/components/formulaire/AvertissementSortie'
import { BarreStatut } from '@/components/formulaire/BarreStatut'
import { ChampTraduit } from '@/components/formulaire/ChampTraduit'
import { TableauDonnees } from '@/components/listes/TableauDonnees'
import { PanneauUsages } from '@/components/medias/PanneauUsages'
import { SelecteurMedia } from '@/components/medias/SelecteurMedia'
import { SelecteurTags } from '@/components/tags/SelecteurTags'
import { HistoriqueVersions } from '@/components/versions/HistoriqueVersions'
import { violationsGraves } from '@/test/axe'
import { utiliserFauxServeur } from '@/test/faux-serveur'
import { rendreAvecSession } from '@/test/rendu'

/** Composants transverses branchés sur la session et le faux serveur (étape 3). */

utiliserFauxServeur()
afterEach(() => localStorage.clear())

describe('champ traduit', () => {
  it('état par langue ; l’anglais inactif est facultatif ; ids au chemin du contrat', async () => {
    await rendreAvecSession(
      <ChampTraduit
        nom="titre"
        libelle="Titre"
        requis
        valeurs={{ fr: 'Bonjour' }}
        surChange={() => undefined}
      />,
    )
    const [fr, en] = await screen.findAllByRole('tab')
    expect(fr?.textContent).toContain('Traduit')
    expect(en?.textContent).toContain('À traduire')
    const champEn = document.getElementById('traductions.en.titre') as HTMLInputElement
    expect(champEn.required).toBe(false)
    expect((document.getElementById('traductions.fr.titre') as HTMLInputElement).required).toBe(
      true,
    )
    expect(screen.getByText(/Langue non active sur le site/)).toBeTruthy()
  })
})

describe('barre de statut (RG-01, RG-02, RG-05)', () => {
  const brouillon = { statut: 'brouillon' as const, publieLe: null, champsAFournir: [] }

  it('l’éditeur soumet à relecture, il ne publie pas', async () => {
    await rendreAvecSession(
      <BarreStatut
        ressource="articles"
        contenu={brouillon}
        enregistrement="modifie"
        surEnregistrer={() => undefined}
        surAction={() => undefined}
      />,
      { role: 'editeur' },
    )
    expect(await screen.findByRole('button', { name: 'Soumettre à relecture' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Publier' })).toBeNull()
  })

  it('l’admin publie ou refuse une relecture ; une date future se lit « programmé »', async () => {
    const surAction = vi.fn()
    await rendreAvecSession(
      <>
        <BarreStatut
          ressource="articles"
          contenu={{ statut: 'en_relecture', publieLe: null, champsAFournir: ['credit'] }}
          enregistrement="enregistre"
          surEnregistrer={() => undefined}
          surAction={surAction}
        />
        <BarreStatut
          ressource="articles"
          contenu={{ statut: 'publie', publieLe: '2099-01-01T09:00:00Z', champsAFournir: [] }}
          enregistrement="enregistre"
          surEnregistrer={() => undefined}
          surAction={() => undefined}
        />
      </>,
    )
    fireEvent.click(await screen.findByRole('button', { name: 'Publier' }))
    expect(surAction).toHaveBeenCalledWith('publier')
    expect(screen.getByRole('button', { name: 'Refuser' })).toBeTruthy()
    expect(screen.getByText('À compléter')).toBeTruthy()
    expect(screen.getByText('Programmé')).toBeTruthy()
    expect(screen.getByText(/heure d’Abidjan/)).toBeTruthy()
  })
})

describe('avertissement de sortie', () => {
  it('bloque la navigation d’un formulaire modifié, puis laisse partir sur confirmation', async () => {
    await rendreAvecSession(
      <>
        <Link to="/ailleurs">Partir</Link>
        <AvertissementSortie actif />
      </>,
      { routes: [{ path: '/ailleurs', element: <h1>Ailleurs</h1> }] },
    )
    fireEvent.click(await screen.findByRole('link', { name: 'Partir' }))
    const dialogue = await screen.findByRole('dialog', { name: 'Modifications non enregistrées' })
    fireEvent.click(within(dialogue).getByRole('button', { name: 'Rester sur la page' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    fireEvent.click(screen.getByRole('link', { name: 'Partir' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Quitter sans enregistrer' }))
    expect(await screen.findByRole('heading', { name: 'Ailleurs' })).toBeTruthy()
  })
})

describe('tableau de données', () => {
  const lignes = [
    { id: '1', titre: 'Alpha', auteur: 'Exemple Admin' },
    { id: '2', titre: 'Bêta', auteur: 'Exemple Éditeur' },
  ]
  const colonnes = [
    {
      id: 'titre',
      entete: 'Titre',
      cellule: (l: (typeof lignes)[number]) => l.titre,
      tri: 'titre',
      principale: true,
    },
    {
      id: 'auteur',
      entete: 'Auteur',
      cellule: (l: (typeof lignes)[number]) => l.auteur,
      masquable: true,
    },
  ]

  function Essai() {
    const [tri, setTri] = useState('titre')
    const [selection, setSelection] = useState<string[]>([])
    const [page, setPage] = useState(1)
    return (
      <>
        <p>
          tri={tri} page={page}
        </p>
        <TableauDonnees
          libelle="Articles"
          colonnes={colonnes}
          lignes={lignes}
          cle={(l) => l.id}
          libelleLigne={(l) => l.titre}
          etat="pret"
          total={45}
          page={page}
          pageSize={20}
          surPage={setPage}
          tri={tri}
          surTri={setTri}
          selection={selection}
          surSelection={setSelection}
          preferences="essai"
        />
      </>
    )
  }

  it('tri, sélection, pagination serveur, colonne masquée mémorisée, sans violation axe', async () => {
    const { container } = await rendreAvecSession(<Essai />)
    const tableau = await screen.findByRole('table', { name: 'Articles' })
    const entete = within(tableau).getByRole('columnheader', { name: /Titre/ })
    expect(entete.getAttribute('aria-sort')).toBe('ascending')
    fireEvent.click(within(entete).getByRole('button'))
    expect(screen.getByText('tri=-titre page=1')).toBeTruthy()

    fireEvent.click(within(tableau).getByRole('checkbox', { name: 'Sélectionner toute la page' }))
    expect(screen.getByText(/2 sélectionné/)).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /Suivant/ }))
    expect(screen.getByText('tri=-titre page=2')).toBeTruthy()

    fireEvent.click(screen.getByRole('checkbox', { name: 'Auteur' }))
    expect(within(tableau).queryByRole('columnheader', { name: 'Auteur' })).toBeNull()
    expect(localStorage.getItem('pe-admin:colonnes:essai')).toBe('["auteur"]')
    expect(await violationsGraves(container)).toEqual([])
  })

  it('états vide et erreur', async () => {
    await rendreAvecSession(
      <>
        <TableauDonnees
          libelle="Vide"
          colonnes={colonnes}
          lignes={[]}
          cle={(l) => l.id}
          etat="pret"
          total={0}
          page={1}
          pageSize={20}
          surPage={() => undefined}
        />
        <TableauDonnees
          libelle="Panne"
          colonnes={colonnes}
          lignes={undefined}
          cle={(l) => l.id}
          etat="erreur"
          erreur={new Error('x')}
          total={0}
          page={1}
          pageSize={20}
          surPage={() => undefined}
        />
      </>,
    )
    expect(await screen.findByText('Aucun élément.')).toBeTruthy()
    expect(screen.getByText('Chargement impossible')).toBeTruthy()
  })
})

describe('sélecteur de tags (RG-06)', () => {
  it('signale l’absence de tag de format, puis l’efface au choix', async () => {
    function Essai() {
      const [ids, setIds] = useState<string[]>([])
      return <SelecteurTags valeur={ids} surChange={setIds} exigerFormat afficherErreur />
    }
    await rendreAvecSession(<Essai />, { role: 'editeur' })
    expect(await screen.findByText(/Choisissez au moins une étiquette de format/)).toBeTruthy()
    fireEvent.click(screen.getByLabelText('Article'))
    await waitFor(() =>
      expect(screen.queryByText(/Choisissez au moins une étiquette de format/)).toBeNull(),
    )
  })
})

describe('sélecteur de média (RG-08)', () => {
  it('refuse une image sans texte alternatif tant qu’il n’est pas saisi, puis l’enregistre', async () => {
    const choix = vi.fn()
    await rendreAvecSession(
      <SelecteurMedia ouverte surFermeture={() => undefined} surChoix={choix} />,
      {
        role: 'editeur',
      },
    )
    const dialogue = await screen.findByRole('dialog', { name: 'Choisir une image' })
    fireEvent.click(await within(dialogue).findByRole('button', { name: 'Sans texte alternatif' }))
    const valider = within(dialogue).getByRole('button', {
      name: 'Enregistrer et choisir',
    }) as HTMLButtonElement
    expect(valider.disabled).toBe(true)
    fireEvent.change(within(dialogue).getByLabelText(/Texte alternatif \(FR\)/), {
      target: { value: 'Exemple : une pirogue au lever du jour' },
    })
    expect(valider.disabled).toBe(false)
    fireEvent.click(valider)
    await waitFor(() => expect(choix).toHaveBeenCalledOnce())
    expect(choix.mock.calls[0]?.[0].traductions.fr.texteAlt).toBe(
      'Exemple : une pirogue au lever du jour',
    )
    expect(
      magasin.medias.find((m) => m.id === IDS_EXEMPLE.mediaSansAlt)?.traductions.fr?.texteAlt,
    ).toBe('Exemple : une pirogue au lever du jour')
  })

  it('une image complète se choisit directement', async () => {
    const choix = vi.fn()
    await rendreAvecSession(
      <SelecteurMedia ouverte surFermeture={() => undefined} surChoix={choix} />,
    )
    const dialogue = await screen.findByRole('dialog')
    fireEvent.click(await within(dialogue).findByRole('button', { name: /paysage décrit/ }))
    fireEvent.click(within(dialogue).getByRole('button', { name: 'Choisir cette image' }))
    expect(choix.mock.calls[0]?.[0].id).toBe(IDS_EXEMPLE.mediaComplet)
  })
})

describe('panneau des usages', () => {
  it('explique le refus et mène à chaque contenu', async () => {
    await rendreAvecSession(
      <PanneauUsages
        objet="ce média"
        usages={[
          {
            ressource: 'articles',
            id: IDS_EXEMPLE.articlePublie,
            titre: 'Exemple — article publié',
            champ: 'imageId',
            statut: 'publie',
          },
        ]}
      />,
    )
    expect(await screen.findByText(/retirez ce média de ces contenus/)).toBeTruthy()
    expect(
      screen.getByRole('link', { name: 'Exemple — article publié' }).getAttribute('href'),
    ).toBe(`/articles/${IDS_EXEMPLE.articlePublie}`)
  })
})

describe('historique des versions (§ 14.2)', () => {
  it('compare une ancienne version à l’actuelle et la restaure après confirmation', async () => {
    const restauree = vi.fn()
    const { connecter } = await import('@/test/faux-serveur')
    await connecter('admin')
    const initial = await articles.lire(IDS_EXEMPLE.articleBrouillon)
    const modifie = await articles.modifier(initial.id, {
      version: initial.version,
      traductions: { fr: { titre: 'Exemple — titre modifié' } },
    })

    await rendreAvecSession(
      <HistoriqueVersions
        ressource="articles"
        id={modifie.id}
        actuel={modifie}
        versionCourante={modifie.version}
        titre="Exemple — titre modifié"
        surRestauration={restauree}
      />,
    )
    fireEvent.click(await screen.findByRole('button', { name: 'Comparer' }))
    expect(await screen.findByRole('cell', { name: 'Exemple — titre modifié' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Restaurer la version 1' }))
    const dialogue = await screen.findByRole('dialog')
    expect(dialogue.textContent).toContain('« Exemple — titre modifié »')
    fireEvent.click(within(dialogue).getByRole('button', { name: 'Restaurer' }))
    await waitFor(() => expect(restauree).toHaveBeenCalledOnce())
    const article = magasin.articles.find((a) => a.id === modifie.id)
    expect(article?.traductions.fr?.titre).toBe(initial.traductions.fr?.titre)
    expect(article?.version).toBe(modifie.version + 1)
    expect(article?.statut).toBe('brouillon')
  })
})

describe('sélecteur de créateur (RG-20)', () => {
  it('absent en mono-vendeur', async () => {
    const { container } = await rendreAvecSession(
      <SelecteurCreateur valeur={null} surChange={() => undefined} />,
    )
    await waitFor(() => expect(container.textContent).toBe(''))
  })

  it('en multi-vendeurs : créateurs actifs, le principal par défaut', async () => {
    magasin.multiVendeurs = true
    function Essai() {
      const [id, setId] = useState<string | null>(null)
      return <SelecteurCreateur valeur={id} surChange={setId} />
    }
    await rendreAvecSession(<Essai />)
    const liste = (await screen.findByLabelText(/Créateur du produit/)) as HTMLSelectElement
    await waitFor(() => expect(liste.value).toBe(ID_CREATEUR_PRINCIPAL))
    // Le créateur d'exemple est inactif : il n'est pas proposé (RG-27).
    expect(within(liste).getAllByRole('option')).toHaveLength(1)
  })
})

describe('session tombée pendant le travail (D-16, D-38)', () => {
  function Formulaire() {
    const [brouillon, setBrouillon] = useState('')
    const envoi = useMutation({ mutationFn: () => articles.lister() })
    return (
      <>
        <input
          aria-label="Brouillon"
          value={brouillon}
          onChange={(e) => setBrouillon(e.target.value)}
        />
        <button type="button" onClick={() => envoi.mutate()}>
          Envoyer
        </button>
        <VerrouSession />
      </>
    )
  }

  it('un 401 verrouille l’écran sans perdre la saisie ; le mot de passe suffit pour reprendre', async () => {
    await rendreAvecSession(<Formulaire />, { role: 'editeur' })
    const champ = (await screen.findByLabelText('Brouillon')) as HTMLInputElement
    fireEvent.change(champ, { target: { value: 'Mon texte en cours' } })
    magasin.session = null
    fireEvent.click(screen.getByRole('button', { name: 'Envoyer' }))

    const dialogue = await screen.findByRole('dialog', { name: 'Session expirée' })
    expect(dialogue.textContent).toContain('editeur@exemple.test')
    expect(within(dialogue).queryByRole('button', { name: 'Fermer' })).toBeNull()
    expect((screen.getByLabelText('Brouillon') as HTMLInputElement).value).toBe(
      'Mon texte en cours',
    )

    fireEvent.change(within(dialogue).getByLabelText(/Mot de passe/), {
      target: { value: MOT_DE_PASSE_ESSAI },
    })
    fireEvent.click(within(dialogue).getByRole('button', { name: 'Reprendre' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(screen.getByText(/Session rétablie/)).toBeTruthy()
    expect((screen.getByLabelText('Brouillon') as HTMLInputElement).value).toBe(
      'Mon texte en cours',
    )
  })

  it('avertit deux minutes avant l’échéance ; « Rester connecté » repousse l’échéance', async () => {
    const { client } = await rendreAvecSession(<AvertissementInactivite />)
    await waitFor(() => expect(client.getQueryData(CLE_SESSION)).toBeTruthy())
    const moi = client.getQueryData<Moi>(CLE_SESSION) as Moi
    client.setQueryData(CLE_SESSION, {
      ...moi,
      session: { expireLe: new Date(Date.now() + 90_000).toISOString() },
    })
    const dialogue = await screen.findByRole('dialog', { name: 'Session bientôt expirée' })
    expect(dialogue.textContent).toContain('2 minutes')
    fireEvent.click(within(dialogue).getByRole('button', { name: 'Rester connecté' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    const relu = client.getQueryData<Moi>(CLE_SESSION)
    expect(Date.parse(relu?.session.expireLe ?? '')).toBeGreaterThan(Date.now() + 60 * 60_000)
  })
})

describe('vitrine des composants', () => {
  // Vitrine retirée des routes (C2, « page de démonstration ») : test conservé jusqu'à C9.
  it.skip('se rend en développement, sans violation axe', async () => {
    const { connecter } = await import('@/test/faux-serveur')
    await connecter('admin')
    window.history.pushState({}, '', '/composants')
    const { container } = render(<App />)
    expect(await screen.findByRole('heading', { level: 1, name: 'Composants' })).toBeTruthy()
    await screen.findByRole('table', { name: 'Articles' })
    await screen.findByRole('heading', { name: 'Historique des versions' })
    expect(await violationsGraves(container)).toEqual([])
    window.history.pushState({}, '', '/')
  })
})
