import type { Bijou } from '@/types'

/**
 * MAQUETTE — la section « Livres » de la boutique.
 *
 * Ces quatre entrées sont **fictives** et servent uniquement à éprouver la mise
 * en page demandée : titres, prix et couvertures sont des placeholders. Chaque
 * `nom` porte le suffixe « (maquette) » et reste affiché partout où la donnée
 * voyage — carte et panneau de demande —, donc aucun faux titre ne peut passer
 * pour un produit réel du catalogue.
 *
 * Deux règles volontaires :
 * 1. La forme `Bijou` est reprise telle quelle : elle laisse passer les maquettes
 *    par le flux réel de la demande sans élargir les types de `demande.tsx`. Le
 *    jour où le CDC fournit la liste réelle, seul ce tableau change — ni la
 *    carte, ni la section, ni le panier, ni le filtre (qui lit `PIECES`).
 * 2. `prixConfirme` est vrai ici : c'est l'exception maquette, nécessaire pour que
 *    le panneau affiche le montant et que l'essai visuel soit parlant. Aucune
 *    pièce réelle ne peut emprunter ce tour de passe tant que la maison n'a pas
 *    validé un chiffre.
 *
 * Les couvertures réutilisent des fichiers déjà présents du site : aucun asset
 * n'est inventé.
 */
export const LIVRES_MOCK: Bijou[] = [
  {
    slug: 'maquette-livre-01',
    numero: 'M01',
    culture: 'Maquette',
    nom: 'Les Ailes du fleuve (maquette)',
    histoire: 'Titre fictif : attend la liste réelle du CDC.',
    image: `${import.meta.env.BASE_URL}images/journal/raconter-pour-exister.jpg`,
    tags: { format: 'objet', projet: 'TRIBE' },
    commerce: {
      reference: 'MOCK-L1',
      prix: 12000,
      prixConfirme: true,
      ancienPrix: null,
      matieres: [],
      tailles: [],
      edition: null,
      atelier: null,
      village: null,
      poids: null,
      galerie: [],
      disponible: true,
      createur: null,
      categorie: 'Livres & photographie',
    },
  },
  {
    slug: 'maquette-livre-02',
    numero: 'M02',
    culture: 'Maquette',
    nom: 'Le Poids des cauris (maquette)',
    histoire: 'Titre fictif : attend la liste réelle du CDC.',
    image: `${import.meta.env.BASE_URL}images/journal/porter-un-symbole.jpg`,
    tags: { format: 'objet', projet: 'TRIBE' },
    commerce: {
      reference: 'MOCK-L2',
      prix: 9500,
      prixConfirme: true,
      ancienPrix: null,
      matieres: [],
      tailles: [],
      edition: null,
      atelier: null,
      village: null,
      poids: null,
      galerie: [],
      disponible: true,
      createur: null,
      categorie: 'Livres & photographie',
    },
  },
  {
    slug: 'maquette-livre-03',
    numero: 'M03',
    culture: 'Maquette',
    nom: 'Mémoires de masques (maquette)',
    histoire: 'Titre fictif : attend la liste réelle du CDC.',
    image: `${import.meta.env.BASE_URL}images/journal/afrique-multitude-de-mondes.jpg`,
    tags: { format: 'objet', projet: 'TRIBE' },
    commerce: {
      reference: 'MOCK-L3',
      prix: 15000,
      prixConfirme: true,
      ancienPrix: null,
      matieres: [],
      tailles: [],
      edition: null,
      atelier: null,
      village: null,
      poids: null,
      galerie: [],
      disponible: true,
      createur: null,
      categorie: 'Livres & photographie',
    },
  },
  {
    slug: 'maquette-livre-04',
    numero: 'M04',
    culture: 'Maquette',
    nom: 'Le Griot silencieux (maquette)',
    histoire: 'Titre fictif : attend la liste réelle du CDC.',
    image: `${import.meta.env.BASE_URL}images/journal/griot-moderne.jpg`,
    tags: { format: 'objet', projet: 'TRIBE' },
    commerce: {
      reference: 'MOCK-L4',
      prix: 12000,
      prixConfirme: true,
      ancienPrix: null,
      matieres: [],
      tailles: [],
      edition: null,
      atelier: null,
      village: null,
      poids: null,
      galerie: [],
      disponible: true,
      createur: null,
      categorie: 'Livres & photographie',
    },
  },
]
