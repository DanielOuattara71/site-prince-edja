# Dépendances justifiées — site public

> Règle du projet (PROMPT-CORRECTION § 13) : aucune dépendance sans une ligne ici (nom, rôle,
> alternative écartée). L'admin et le back end tiennent leur propre liste.

| Paquet | Type | Rôle | Alternative écartée |
|---|---|---|---|
| `zod` 4.6.7 | développement (construction seulement) | `scripts/charger-donnees.ts` valide chaque réponse de l'API publique avant de l'écrire dans `src/data/generated/` (LIAISON § C.2 : un appel qui échoue ou une réponse qui ne ressemble pas au contrat fait échouer la construction, jamais un site à moitié vide). Rien n'arrive dans le paquet envoyé au navigateur. | Contrôles écrits à la main : plus longs, moins sûrs, et différents des schémas Zod de l'admin et du back end qui décrivent le même contrat. |
