import * as Comlink from 'comlink'
import type { Remote } from 'comlink'
import type { DbWorker } from './db.worker'

export type DbClient = Remote<DbWorker>

let initPromise: Promise<DbClient> | null = null

export function getDb(): Promise<DbClient> {
  if (!initPromise) {
    initPromise = (async () => {
      const worker = new Worker(new URL('./db.worker.ts', import.meta.url), { type: 'module' })
      const db = Comlink.wrap<DbWorker>(worker)
      await db.init()
      return db
    })()
  }
  return initPromise
}
