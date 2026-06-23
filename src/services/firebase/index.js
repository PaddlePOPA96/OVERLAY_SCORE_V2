// Barrel export untuk semua Firebase services.
// Import dari sini jika butuh beberapa service sekaligus,
// atau import langsung dari sub-file untuk tree-shaking lebih baik.
import { app } from './app'
import { auth } from './auth'
import { db } from './db'
import { dbFirestore } from './firestore'

export { app, db, dbFirestore, auth }
