import { getAuth, GoogleAuthProvider } from 'firebase/auth'

import { app } from './app'

// Dipisah supaya auth hanya dipakai di client component
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

export { auth, googleProvider }
