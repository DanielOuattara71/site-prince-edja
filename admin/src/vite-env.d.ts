/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Adresse de l'API d'administration. Seule variable `VITE_*` autorisée (D-07). */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
