import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, updateDoc, getDoc, deleteDoc } from "firebase/firestore";

import { ref, set, get, child } from "firebase/database";

import { auth, googleProvider } from "@/lib/firebaseAuth";
import { dbFirestore } from "@/lib/firebaseFirestore";
import { db } from "@/lib/firebase"; // Realtime Database

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

  // 3. Simpan Role di Realtime Database juga (untuk Rules)
  await set(ref(db, `users/${user.uid}`), {
    role: role,
    email: user.email
  });

  return user;
}

export async function updateUserRole(uid, newRole) {
  // Update role di Firestore
  const userRef = doc(dbFirestore, "users", uid);

  await updateDoc(userRef, { role: newRole });

  // Update Realtime Database
  try {
    await set(ref(db, `users/${uid}/role`), newRole);
  } catch (err) {
    console.warn("Failed to update user role in Realtime Database. It will sync automatically when that user logs in.", err);
  }
}



export async function syncUserToFirestore(user) {
  if (!user) return;

  const userRef = doc(dbFirestore, "users", user.uid);
  const snap = await getDoc(userRef);

  // Jika data belum ada di Firestore, buat baru dengan default role 'user'
  if (!snap.exists()) {
    await setDoc(userRef, {
      email: user.email,
      role: "user",
      createdAt: new Date().toISOString(),
      syncedAt: new Date().toISOString(),
    });
  }

  // --- Sync to Realtime Database (NEW) ---
  try {
    const rtdbRef = ref(db);

    // Use try-read pattern
    const rtdbSnap = await get(child(rtdbRef, `users/${user.uid}`));
    
    // Ambil data terbaru dari Firestore untuk memastikan role yang sinkron
    const dbSnap = await getDoc(userRef);
    const currentRole = dbSnap.exists() ? dbSnap.data().role : "user";

    if (!rtdbSnap.exists() || rtdbSnap.val().role !== currentRole) {
      await set(ref(db, `users/${user.uid}`), {
        role: currentRole,
        email: user.email,
        syncedAt: new Date().toISOString()
      });
    }
  } catch (err) {
    console.error("Failed to sync user role to Realtime Database.", err);
  }
}

export async function deleteUserFromDb(uid) {
  // 1. Hapus dari Firestore
  const userRef = doc(dbFirestore, "users", uid);

  await deleteDoc(userRef);

  // 2. Hapus dari Realtime Database
  try {
    await set(ref(db, `users/${uid}`), null);
  } catch (err) {
    console.error("Failed to delete user from Realtime Database:", err);
  }
}
