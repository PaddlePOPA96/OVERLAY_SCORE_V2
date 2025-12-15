import { getFirestore } from "firebase/firestore";
import { app } from "./firebaseApp";

export const dbFirestore = getFirestore(app);
