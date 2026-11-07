# Éléments retirés de l'admin — inventaire pour la décision C9

Étape **C2** (06/11/2026), PROMPT-CORRECTION § 5.5. Ces écrans sont **retirés du menu et des
routes** de l'admin : leur adresse répond « Page introuvable ». **Aucun fichier n'est supprimé.**
La suppression du code n'aura lieu qu'à l'étape C9, un élément à la fois, sur confirmation écrite.

Comment le retrait est fait : les routes de l'admin sont désormais générées depuis les onglets du
menu (`admin/src/components/layout/navigation.ts`). Une adresse absente du menu n'a pas de route.
Les déclarations d'écran restent dans `ECRANS_LIVRES` (`admin/src/app/routeur.tsx`), sans route.
Réversible : remettre l'onglet dans `MENU` suffit à rouvrir l'écran.

| Élément | Adresse | Fichiers admin concernés | Tests liés (marqués `skip`) | Données côté back end |
|---|---|---|---|---|
| Univers | `/univers` | `features/editorial/specs.ts` (`SPEC_UNIVERS`), `ecrans.tsx`, `api/endpoints/editorial.ts`, `mocks/handlers/editorial-lot3.ts`, données d'exemple | `lot3.test.tsx` « univers, jalons, offres » | à relever dans `prince-edja-api` |
| Jalons | `/jalons` | idem (`SPEC_JALONS`) | idem | idem |
| Offres | `/offres` | idem (`SPEC_OFFRES`) ; relation depuis les études de cas (`champs.tsx`, `declaratif.ts`) | idem | idem |
| Études de cas | `/etudes-cas` | `specs.ts` (`SPEC_ETUDES_CAS`), `ecrans.tsx`, `mocks/handlers/editorial-lot4.ts` | `lot4.test.tsx` « études de cas » | idem |
| Pages du site | `/pages` | `specs.ts` (`SPEC_PAGES`), `ecrans.tsx` | `lot3.test.tsx` « pages : onze pages » | idem |
| Navigation | `/navigation` | `features/reglages/Navigation.tsx`, `api/endpoints/reglages.ts`, `api/schemas/reglages.ts`, `mocks/handlers/reglages.ts` | `reglages.test.tsx` « /navigation s'affiche » | idem |
| Textes d'interface | `/textes-interface` | `features/reglages/TextesInterface.tsx`, mêmes fichiers d'API | `reglages.test.tsx` « /textes-interface s'affiche » | idem |
| Motifs de contact | `/motifs-contact` | `features/contact/MotifsContact.tsx`, `api/endpoints/reglages.ts` | `motifs.test.tsx` (fichier entier) | idem |
| Page de démonstration | `/composants` (le prompt l'appelle `/demo`) | `features/demo/Composants.tsx` (développement seulement) | `composants-donnees.test.tsx` « vitrine des composants » | — |
| Ancien journal d'audit | `/journal` | — (l'écran est conservé sous `/activite`) | — | — |

## Notes

- Tests **encore actifs** sur ces familles : les tests de règles du faux serveur et les tests de
  conversion (`lot3.test.tsx` « conversions », « règles simulées ») ne passent pas par une route ;
  ils restent verts et documentent les règles jusqu'à C9.
- Les ressources (`univers`, `jalons`…) restent dans `auth/permissions.ts` : `peut()` est une copie
  du back end (`droits/peut.ts`), à nettoyer en même temps des deux côtés.
- `/journal` redirige vers `/activite` en gardant les filtres de l'adresse. L'appel d'API reste
  `/admin/api/v1/journal` tant que le back end n'a pas livré le renommage (contrat § 8, 308
  pendant une version) : voir `docs/QUESTIONS.md`.
- Le tableau de bord ne crée plus de lien vers ces familles (pas de lien mort).
- Côté back end, le retrait des routes d'écriture (PROMPT-CORRECTION § 7.4) est une tâche du dépôt
  `prince-edja-api`, non faite ici.
Les noms de tables ne sont pas recopiés ici : ils vivent dans le dépôt back end, non lu depuis cette piste (aucune table n'est supprimée dans cette mission).
