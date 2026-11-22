/**
 * Worker de rendu (contrat 1.13.0 § 30) — REGISTRE DE MODULES NEUF.
 *
 * Un worker est lancé une fois par lot de données. Comme il possède son propre registre ESM,
 * les modules d'accès du site calculent leurs constantes (`ARTICLES`, `BIJOUX`…) en lisant les
 * données injectées ci-dessous — sans cache-busting, sans ancienne copie de `useSeo`.
 *
 * Protocole : le parent envoie { type: 'donnees', donnees } puis des demandes
 * { type: 'rendre', id, route, origine }. Le worker répond { type: 'page', id, page }.
 */
import { parentPort, workerData } from 'node:worker_threads'

globalThis.__PRINCE_DONNEES__ = workerData.donnees
const ssr = await import(workerData.bundle)

parentPort.on('message', async (message) => {
  if (message.type !== 'rendre') return
  try {
    const page = await ssr.rendreRoute(message.route, message.origine)
    parentPort.postMessage({ type: 'page', id: message.id, page })
  } catch (erreur) {
    parentPort.postMessage({
      type: 'page',
      id: message.id,
      erreur: erreur instanceof Error ? erreur.message : String(erreur),
    })
  }
})
