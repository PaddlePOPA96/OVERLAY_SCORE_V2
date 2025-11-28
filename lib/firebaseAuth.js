import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { app } from "./firebase";

// Dipisah dari firebase.js supaya auth hanya dipakai di client component
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
