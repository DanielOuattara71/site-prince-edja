export type Langue = 'fr' | 'en'

/**
 * Dictionnaire du chrome et de la navigation.
 *
 * Périmètre assumé : les libellés d'interface et de navigation. Le contenu éditorial
 * reste en français et n'est pas traduit. Il n'a pas de pendant anglais à ce jour, et
 * inventer une traduction serait inventer un fait. La forme reste ouverte : le jour où
 * le contenu est traduit, il entre dans ce même dictionnaire.
 *
 * Strings uniquement, aucune fonction : les accords de nombre et les compositions se
 * font par `t()` + `avecPluriel()`, plutôt que par des valeurs appelables dont le type
 * se dégrade en union à l'indexation.
 */
export const DICTIONNAIRE = {
  fr: {
    'nav.etiquette': 'Navigation principale',
    'nav.ouvrirMenu': 'Ouvrir le menu',
    'nav.fermerMenu': 'Fermer le menu',
    'nav.groupePrince': 'Prince Edja · parcourir',
    'nav.ouvrirGroupe': 'Afficher les sous-rubriques',
    'nav.fermerGroupe': 'Masquer les sous-rubriques',

    // Formulaires : option neutre d'un select requis. Sans elle, la première valeur est
    // déjà sélectionnée et `required` ne peut jamais échouer.
    'form.choisir': 'Choisissez…',

    'recherche.declencheur': 'Rechercher',
    'recherche.ouvrir': 'Ouvrir la recherche',
    'recherche.fermer': 'Fermer la recherche',
    'recherche.titre': 'Rechercher',
    'recherche.champ': 'Rechercher un article, un film, une destination, un objet',
    'recherche.vide': 'Tapez quelques lettres. Les résultats sont groupés par type.',
    'recherche.aucunResultat': 'Aucun résultat. Essayez un lieu, un thème ou un titre.',
    'recherche.indication': 'Utilisez les flèches pour naviguer, Entrée pour ouvrir.',
    'recherche.aVenir': 'à venir',
    'recherche.resultatUn': 'résultat',
    'recherche.resultatsPlusieurs': 'résultats',

    'type.article': 'Articles',
    'type.film': 'Films & épisodes',
    'type.destination': 'Destinations',
    'type.objet': 'Objets',

    'fil.etiquette': "Fil d'Ariane",
    'fil.pageCourante': 'Page courante',

    'langue.etiquette': 'Choisir la langue',
    'langue.courante': 'Langue courante',
    'langue.changerPrefixe': 'Passer en',

    'cta.travailler': 'Travailler avec Prince',
    'hero.ctaHistoire': 'Découvrir mon histoire',
    'hero.ctaTravailler': 'Travailler avec moi',

    'preuves.etiquette': 'Chiffres clés',
    'preuves.aFournir': 'À fournir',

    'alaune.article': 'Dernier article',
    'alaune.film': 'Dernier film',

    'collab.imageAFournir': 'Visuel à fournir',
    'collab.casAFournir': 'Étude de cas à fournir',
    'collab.clientAFournir': 'Client, année et résultats à fournir',

    'newsletter.titre': 'La lettre du griot',
    'newsletter.prenom': 'Prénom',
    'newsletter.email': 'Email',
    'newsletter.pays': 'Pays',
    'newsletter.consentement': 'J’accepte de recevoir la lettre.',
    'newsletter.cta': 'Je m’inscris',
    'newsletter.confirme': 'Inscription enregistrée. Le prestataire d’emailing reste à choisir : aucune confirmation n’a encore été envoyée.',
    'newsletter.metaPreferences': 'Choisissez ce que vous voulez recevoir de la lettre du griot.',
    'newsletter.metaDesinscription': 'Se désinscrire de la lettre du griot.',
    'newsletter.confirmeCompact': 'Inscription enregistrée.',
    'newsletter.pageTitre': 'La lettre du griot',
    'newsletter.preferences': 'Préférences',
    'newsletter.desinscription': 'Me désinscrire',

    'b2b.succes': 'Demande envoyée. La maison répond sous 48 heures ouvrées.',
    'b2b.choisirType': 'Choisissez le type de collaboration',
    'histoires.aLaUne': 'Projet à la une',

    'demande.titre': 'Votre demande',
    'demande.fermer': 'Fermer la demande',
    'demande.vide': 'Aucune pièce sélectionnée pour l’instant.',
    'demande.surDemande': 'Sur demande',
    'demande.retirer': 'Retirer',
    'demande.envoyer': 'Envoyer la demande',
    'demande.envoyee': 'Votre client de messagerie vient de s’ouvrir avec la sélection. La maison répond avec les disponibilités et les délais.',
    'demande.explication': 'La collection se vend sur demande : aucun paiement n’a lieu sur ce site. Les prix validés apparaîtront ici le jour où la maison les communiquera.',
    'demande.vider': 'Vider la sélection',
    'demande.declencheur': 'Voir ma sélection',

    'carte.ajouter': 'Ajouter à ma demande',

    'catalogue.titre': 'Catalogue de la collection',
    'catalogue.recherche': 'Rechercher une pièce',
    'catalogue.categorie': 'Catégorie',
    'catalogue.toutesCategories': 'Toutes les catégories',
    'catalogue.disponibles': 'Disponibles',
    'catalogue.tri': 'Trier',
    'catalogue.triNumero': 'Ordre de la collection',
    'catalogue.triPrixCroissant': 'Prix croissant',
    'catalogue.triPrixDecroissant': 'Prix décroissant',
    'catalogue.aucunResultat': 'Aucune pièce ne correspond à cette recherche.',
    'catalogue.reinitialiser': 'Tout afficher',
    'catalogue.selectionActive': 'Votre sélection contient des pièces.',
    'b2b.erreur': 'L’envoi a échoué. Écrivez directement à contact@ohenetour.com.',

    'curseur.voir': 'Voir',

    'legal.aFournir': 'Contenu à fournir',
    'legal.aFournirTexte':
      "Cette page n'est pas encore rédigée. Les textes juridiques seront fournis par la maison, puis validés avant mise en ligne. La structure est en place : seule la copie manque.",
    'legal.contactLien': 'Contacter la maison',

    'p404.titre': 'Cette page a pris la mer',
    'p404.texte':
      "Le lien est peut-être ancien, ou l'adresse mal recopiée. Voici par où reprendre le voyage.",
    'p404.ou': 'Ou revenir à l’accueil',

    'a11y.allerContenu': 'Aller au contenu',
    'a11y.navigationPrincipale': 'Navigation principale',
    'a11y.piedDePage': 'Pied de page',
  },

  en: {
    'nav.etiquette': 'Main navigation',
    'nav.ouvrirMenu': 'Open menu',
    'nav.fermerMenu': 'Close menu',
    'nav.groupePrince': 'Prince Edja · browse',
    'nav.ouvrirGroupe': 'Show sub-sections',
    'nav.fermerGroupe': 'Hide sub-sections',

    'form.choisir': 'Choose…',

    'recherche.declencheur': 'Search',
    'recherche.ouvrir': 'Open search',
    'recherche.fermer': 'Close search',
    'recherche.titre': 'Search',
    'recherche.champ': 'Search an article, a film, a destination, an object',
    'recherche.vide': 'Type a few letters. Results are grouped by type.',
    'recherche.aucunResultat': 'No results. Try a place, a theme or a title.',
    'recherche.indication': 'Use the arrow keys to browse, Enter to open.',
    'recherche.aVenir': 'coming soon',
    'recherche.resultatUn': 'result',
    'recherche.resultatsPlusieurs': 'results',

    'type.article': 'Articles',
    'type.film': 'Films & episodes',
    'type.destination': 'Destinations',
    'type.objet': 'Objects',

    'fil.etiquette': 'Breadcrumb',
    'fil.pageCourante': 'Current page',

    'langue.etiquette': 'Choose language',
    'langue.courante': 'Current language',
    'langue.changerPrefixe': 'Switch to',

    'cta.travailler': 'Work with Prince',
    'hero.ctaHistoire': 'Discover my story',
    'hero.ctaTravailler': 'Work with me',

    'preuves.etiquette': 'Key figures',
    'preuves.aFournir': 'To be provided',

    'alaune.article': 'Latest article',
    'alaune.film': 'Latest film',

    'collab.imageAFournir': 'Visual to be provided',
    'collab.casAFournir': 'Case study to be provided',
    'collab.clientAFournir': 'Client, year and results to be provided',

    'newsletter.titre': 'The griot letter',
    'newsletter.prenom': 'First name',
    'newsletter.email': 'Email',
    'newsletter.pays': 'Country',
    'newsletter.consentement': 'I agree to receive the letter.',
    'newsletter.cta': 'Subscribe',
    'newsletter.confirme': 'Subscription recorded. The email provider is still to be chosen: no confirmation has been sent yet.',
    'newsletter.metaPreferences': 'Choose what you want to receive from the griot letter.',
    'newsletter.metaDesinscription': 'Unsubscribe from the griot letter.',
    'newsletter.confirmeCompact': 'Subscription recorded.',
    'newsletter.pageTitre': 'The griot letter',
    'newsletter.preferences': 'Preferences',
    'newsletter.desinscription': 'Unsubscribe',

    'b2b.succes': 'Request sent. The house replies within 48 working hours.',
    'b2b.choisirType': 'Choose the type of partnership',
    'histoires.aLaUne': 'Featured project',

    'demande.titre': 'Your request',
    'demande.fermer': 'Close the request',
    'demande.vide': 'No piece selected yet.',
    'demande.surDemande': 'On request',
    'demande.retirer': 'Remove',
    'demande.envoyer': 'Send the request',
    'demande.envoyee': 'Your email client just opened with the selection. The house replies with availability and lead times.',
    'demande.explication': 'The collection is sold on request: no payment happens on this site. Validated prices will appear here once the house provides them.',
    'demande.vider': 'Clear the selection',
    'demande.declencheur': 'View my selection',

    'carte.ajouter': 'Add to my request',

    'catalogue.titre': 'Collection catalogue',
    'catalogue.recherche': 'Search a piece',
    'catalogue.categorie': 'Category',
    'catalogue.toutesCategories': 'All categories',
    'catalogue.disponibles': 'Available',
    'catalogue.tri': 'Sort',
    'catalogue.triNumero': 'Collection order',
    'catalogue.triPrixCroissant': 'Price ascending',
    'catalogue.triPrixDecroissant': 'Price descending',
    'catalogue.aucunResultat': 'No piece matches this search.',
    'catalogue.reinitialiser': 'Show all',
    'catalogue.selectionActive': 'Your selection contains pieces.',
    'b2b.erreur': 'Sending failed. Write directly to contact@ohenetour.com.',

    'curseur.voir': 'View',

    'legal.aFournir': 'Content to be provided',
    'legal.aFournirTexte':
      'This page is not written yet. Legal copy will be supplied by the house and approved before publication. The structure is in place: only the wording is missing.',
    'legal.contactLien': 'Contact the house',

    'p404.titre': 'This page has gone to sea',
    'p404.texte':
      'The link may be old, or the address mistyped. Here is where to pick the journey back up.',
    'p404.ou': 'Or go back home',

    'a11y.allerContenu': 'Skip to content',
    'a11y.navigationPrincipale': 'Main navigation',
    'a11y.piedDePage': 'Footer',
  },
} satisfies Record<Langue, Record<string, string>>

export type CleTraduction = keyof (typeof DICTIONNAIRE)['fr']

/** Accord de nombre, sans fonction dans le dictionnaire. */
export function avecPluriel(n: number, un: string, plusieurs: string): string {
  return `${n} ${n > 1 ? plusieurs : un}`
}
