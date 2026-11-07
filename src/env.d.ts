/// <reference types="vite/client" />

/** Variables lues par le navigateur. Préfixes exposés : `VITE_` et `PUBLIC_` (`vite.config.ts`). */
interface ImportMetaEnv {
  /** Adresse de l’API face publique, sans barre finale. Absente : formulaires fermés en production. */
  readonly PUBLIC_API_URL?: string
  readonly PUBLIC_LANGUES?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
