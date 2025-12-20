import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, updateDoc, getDoc } from "firebase/firestore";
import { auth, googleProvider } from "@/lib/firebaseAuth";
import { dbFirestore } from "@/lib/firebaseFirestore";
import { db } from "@/lib/firebase"; // Realtime Database
import { ref, set, get, child } from "firebase/database";

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
  await set(ref(db, `users/${uid}/role`), newRole);
}



export async function syncUserToFirestore(user) {
  if (!user) return;

  const userRef = doc(dbFirestore, "users", user.uid);
  const snap = await getDoc(userRef);

  const envAdminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const isSuperAdmin = user.email === envAdminEmail;

  // Jika data belum ada, buat baru
  if (!snap.exists()) {
    await setDoc(userRef, {
      email: user.email,
      role: isSuperAdmin ? "admin" : "user", // Auto-admin jika email sesuai env
      createdAt: new Date().toISOString(),
      syncedAt: new Date().toISOString(),
    });
  } else {
    // Jika data ada, tapi dia sebenarnya Super Admin (env), pastikan role-nya admin di DB juga
    if (isSuperAdmin && snap.data().role !== "admin") {
      await updateDoc(userRef, { role: "admin" });
    }
  }

  // --- Sync to Realtime Database (NEW) ---
  // --- Sync to Realtime Database (NEW) ---
  try {
    const rtdbRef = ref(db);
    // Use try-read pattern
    const rtdbSnap = await get(child(rtdbRef, `users/${user.uid}`));
    const currentRole = isSuperAdmin ? "admin" : (snap.exists() ? snap.data().role : "user");

    if (!rtdbSnap.exists() || rtdbSnap.val().role !== currentRole) {
      await set(ref(db, `users/${user.uid}`), {
        role: currentRole,
        email: user.email,
        syncedAt: new Date().toISOString()
      });
    }
  } catch (err) {
    console.error("Failed to sync user role to Realtime Database. Check Rules.", err);
    // Do not throw, so app continues to work (just streaming broadcast will fail)
  }
}
