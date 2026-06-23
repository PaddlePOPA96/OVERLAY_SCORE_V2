import { getFirestore } from 'firebase/firestore'

import { app } from './app'

export const dbFirestore = getFirestore(app)
