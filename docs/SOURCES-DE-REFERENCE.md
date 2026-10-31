# Sources de référence — Prince EDJA

> Arbitrage A-17 · 30/10/2026. Inventaire des documents qui spécifient le back end et l'admin : où ils
> sont, ce qui en reste applicable, ce que les documents plus récents ont remplacé.

## 1. Constat

**[Fait]** L'analyse conceptuelle et le plan de développement **existent**, mais **hors du dépôt**, dans
le dossier Téléchargements de Windows (`C:\Users\DELL XPS 9500 COR I7\Downloads\`). Le rapport de
compatibilité du 30/10 les déclarait absents : il n'avait cherché que dans le dépôt et dans WSL.

| Document | Fichier | Date | Lu |
|---|---|---|---|
| Cahier des charges v1.0 | `Cahier_des_charges_Site_Prince_EDJA_2026 (1).md` (et `.pdf`) | 15-16/10 | Oui |
| Analyse conceptuelle — back end et admin | `Analyse-conceptuelle.docx` (aussi en PDF, dans `edja/`) | 25/10, ajout D-I le 27/10 | Oui (texte complet du `.docx`) |
| Plan de développement — back end, admin, déploiement | `Plan-de-developpement.docx` (aussi en PDF, dans `edja/`) | 26/10 | Oui |
| Actions de l'administrateur | `Actions-administrateur.pdf` (28/10) ; ancienne version `Actions de l'administrateur — Site Prince EDJA.pdf` (26/10) | 28/10 | Oui (version du 28/10) |
| Fonctionnement du système — workflow de bout en bout | `edja/Fonctionnement du système Prince EDJA — le workflow de bout en bout (2).pdf` | 27/10 | Oui |
| Prompt espace vendeur | `PROMPT-ESPACE-VENDEUR-PRINCE-EDJA.md` | 28/10 | Parcouru (fonctions verrouillées) |
| Prompt back end | `PROMPT-BACKEND-PRINCE-EDJA.md` ; identique, octet pour octet, à `docs/PROMPT-BACKEND-PRINCE-EDJA.md` | 28/10 | Oui |
| Prompt admin | `PROMPT-ADMIN-PRINCE-EDJA.md` ; identique à `docs/PROMPT-ADMIN-PRINCE-EDJA.md` | 28/10 | Oui |
| Tâches du CDC | `CDC_TACHES_PRINCE_EDJA.md` | 11/10 | Non (tâches du site public, hors back end) |
| Audits de conformité du site | `Audit de conformité — Site Prince EDJA*.pdf` | 25 et 29/10 | Non (site public) |

**Recommandation.** Verser ces documents dans le dépôt, sous `docs/reference/`, pour qu'une
personne qui reprend le projet les trouve. Ils sont aujourd'hui sur un seul poste.

## 2. Préséance retenue

`docs/CONTRAT-API.md` › analyse conceptuelle › actions de l'administrateur et workflow › prompt back
end › prompt admin › `admin/docs/DECISIONS.md`. Le cahier des charges fixe le besoin ; aucune règle
ne le contredit.

## 3. Ce qui reste applicable

| Élément | Source | Où il vit maintenant |
|---|---|---|
| Règles RG-01 à RG-28, RG-V1 à RG-V3 | Analyse § 3 | Contrat § 4.3, § 7, § 10 à 12 |
| Diagramme d'états (contenu, abonné, demande) | Analyse § 9 | Contrat § 7.3, § 12 |
| Un bijou a au moins une variante ; une demande porte sur une variante | Analyse RG-10, RG-11, MCD | Contrat § 10.3 ; décision D-27 |
| Créateur avec `slug`, statut, principal unique | Analyse § 4, D-I | Contrat § 10.2 ; décision D-28 |
| Droits : l'admin gère les comptes éditeurs, le super-admin les admins | Analyse § 10, actions § 9 | Contrat § 5 ; décision D-30 |
| Champs par famille de contenu | Actions § 3 à 9 | Contrat § 9 à 13 |
| Formulaire B2B enregistré en base | Plan phase 4, actions § 8 | Contrat § 12.1 et § 18 ; décision D-29 |
| Chiffres clés et audience administrables et datés | CDC, actions § 7 à 9 | Contrat § 13.1, § 13.2 |
| Phase 1 « front prêt » (couche d'accès au-dessus de `data/*`) | Plan § 3 | `docs/PLAN-DE-LANCEMENT.md`, chantier S1 |
| Portes de validation G1 à G5 | Plan § 2 | `docs/PLAN-DE-LANCEMENT.md` |
| Risques (contenu non rédigé, décisions tardives, équipe d'une personne) | Plan § 6 | Inchangés |

## 4. Ce qui est remplacé

| Élément d'origine | Source | Remplacé par | Motif |
|---|---|---|---|
| D-B : CMS headless (Payload, Directus, Strapi) par défaut | Plan § 1 | API sur mesure en Fastify, Drizzle, PostgreSQL | Prompt back end § 4, « décidé » (plus récent) |
| D-C : VPS et stockage objet, à choisir | Plan § 1 | Cloudflare R2 | Prompt back end § 4 |
| D-G : service d'e-mails à choisir | Plan § 1 | Brevo | Prompt back end § 4 |
| Préfixe public `/api/v1` | Analyse § 10 | `/public/api/v1` | Prompt back end § 8 |
| `variante.stock NOT NULL DEFAULT 0` | Analyse § 7 | `stock` facultatif | Vide n'est pas zéro (CDC) |
| Navigation, offres, audience « restent dans le code » | Analyse § 12 | Ressources administrables | Actions § 7 à 9, CDC (« administrables et datées ») |
| Volumes « 3 articles, 2 épisodes, 1 bijou » | Analyse § 1 | 7 articles, 6 épisodes, 10 pièces, 7 entrées d'archive | Comptage dans `src/data/*` |
| « Restauration… réservée au super-admin » | Analyse § 10, actions § 9 | Restauration d'une **version** : admin ; d'une **sauvegarde** : super-admin, hors API | Prompt admin § 8 ; la sauvegarde est une procédure d'exploitation |
| Admin sans gestion des créateurs ni des comptes | Workflow § 8 (tableau) | L'admin gère les créateurs et les comptes éditeurs | Analyse § 10 et actions § 5 et 9 (rang supérieur, et cohérentes entre elles) |
| Contenu archivé : « URL conservée » | Analyse § 9 | Retiré du site ; son slug reste **réservé** | Workflow § 4 et prompt back end § 8 (deux sources plus récentes) ; réserver le slug garde la possibilité de rétablir l'adresse |

## 5. Ce qui reste à obtenir du client

Repris du plan (§ 1) et du workflow (§ 9), complété par le contrat (§ 20) :

- textes légaux (mentions, confidentialité, cookies, CGV, retours) ;
- prix confirmés, matières, créateurs et sources de chaque pièce ;
- chiffres d'audience et leurs dates de validation ;
- corps des articles, sections manquantes des épisodes, entrées d'archive avec leurs sources ;
- durées de conservation des données ;
- confirmation de la signature et du manifeste du héros ;
- nom de domaine et hébergement (D-F du plan, M-06 du contrat) ;
- activation de l'anglais pour les contenus (M-01).
