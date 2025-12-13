import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebaseAuth";

export async function loginWithEmailPassword(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function registerWithEmailPassword(email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function loginWithGooglePopup() {
  const cred = await signInWithPopup(auth, googleProvider);
  return cred.user;
}

export async function sendResetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

// Fungsi baru untuk membuat user dengan role tertentu (admin/user)
import { dbFirestore } from "@/lib/firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";

export async function createUserWithRole(email, password, role) {
  // 1. Create Auth
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const user = cred.user;

  // 2. Simpan Role di Firestore (Collection: users, ID: uid)
  await setDoc(doc(dbFirestore, "users", user.uid), {
    email: user.email,
    role: role, // 'admin' or 'user'
    createdAt: new Date().toISOString(),
  });

  return user;
}

export async function updateUserRole(uid, newRole) {
  // Update role di Firestore
  const userRef = doc(dbFirestore, "users", uid);
  await updateDoc(userRef, { role: newRole });
}

import { getDoc } from "firebase/firestore";

export async function syncUserToFirestore(user) {
  if (!user) return;

  const userRef = doc(dbFirestore, "users", user.uid);
  const snap = await getDoc(userRef);

  // Jika data belum ada di Firestore, buat baru
  if (!snap.exists()) {
    await setDoc(userRef, {
      email: user.email,
      role: "user", // Default role
      createdAt: new Date().toISOString(),
      syncedAt: new Date().toISOString(),
    });
  }
}

