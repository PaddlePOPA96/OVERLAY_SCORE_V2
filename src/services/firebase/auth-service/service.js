import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail, getAdditionalUserInfo, deleteUser, sendEmailVerification } from 'firebase/auth'
import { doc, setDoc, updateDoc, getDoc, deleteDoc, collection, addDoc } from 'firebase/firestore'

import { ref, set, get, child } from 'firebase/database'

import { auth, googleProvider } from '../auth'
import { dbFirestore } from '../firestore'
import { db } from '../index' // Realtime Database
import { hashPasscode } from '@/shared/utils/hash'

export async function loginWithEmailPassword(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password)

  await logLoginEvent(cred.user, 'email_password')
  
return cred.user
}

export function validatePasswordStrength(password) {
  const minLength = 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  if (password.length < minLength) return 'Kata sandi minimal 8 karakter.'
  if (!hasUpperCase) return 'Kata sandi harus mengandung minimal 1 huruf besar.'
  if (!hasNumber) return 'Kata sandi harus mengandung minimal 1 angka.'
  if (!hasSpecialChar) return 'Kata sandi harus mengandung minimal 1 karakter spesial (!@#$ dsb).'
  
  return null
}

export async function registerWithEmailPassword(email, password, passcode) {
  const emailLower = email.toLowerCase()

  if (emailLower.includes('+')) {
    throw new Error('Email aliases (menggunakan tanda +) tidak diizinkan.')
  }
  
  const domain = emailLower.split('@')[1]
  const allowedDomains = ['gmail.com', 'yahoo.com', 'yahoo.co.id', 'outlook.com', 'hotmail.com', 'icloud.com']
  
  if (!allowedDomains.includes(domain)) {
    throw new Error('Pendaftaran hanya diizinkan menggunakan email standar (seperti Gmail, Yahoo, Outlook). Custom domain tidak diizinkan.')
  }

  const passwordError = validatePasswordStrength(password)

  if (passwordError) {
    throw new Error(passwordError)
  }
  
  if (passcode.length !== 4 || isNaN(passcode)) {
    throw new Error('Passcode harus berupa 4 angka.')
  }

  const hashedPasscode = await hashPasscode(passcode)

  const cred = await createUserWithEmailAndPassword(auth, emailLower, password)

  // Simpan passcode ke Firestore dan RTDB saat registrasi
  try {
    await setDoc(doc(dbFirestore, 'users', cred.user.uid), {
      email: cred.user.email,
      role: 'user',
      passcode: hashedPasscode,
      createdAt: new Date().toISOString(),
      syncedAt: new Date().toISOString()
    })

    await set(ref(db, `users/${cred.user.uid}`), {
      role: 'user',
      email: cred.user.email,
      passcode: hashedPasscode,
      syncedAt: new Date().toISOString()
    })
  } catch (err) {
    console.error('Failed to save passcode during registration:', err)
  }

  // Send Email Verification
  try {
    await sendEmailVerification(cred.user)
  } catch (err) {
    console.error('Failed to send email verification', err)
  }

  return cred.user
}

export async function loginWithGooglePopup() {
  const cred = await signInWithPopup(auth, googleProvider)
  const additionalInfo = getAdditionalUserInfo(cred)

  if (additionalInfo?.isNewUser) {
    // Delete the newly created user from Firebase Auth
    await deleteUser(cred.user)
    throw new Error('Akses ditolak: Akun Google ini belum terdaftar oleh Admin. Silakan hubungi Admin untuk mendaftarkan email Anda terlebih dahulu.')
  }

  await logLoginEvent(cred.user, 'google_popup')
  
  return cred.user
}

async function logLoginEvent(user, method) {
  if (!user) return

  try {
    const logsRef = collection(dbFirestore, 'login_logs')

    await addDoc(logsRef, {
      uid: user.uid,
      email: user.email,
      method: method,
      timestamp: new Date().toISOString()
    })
  } catch (err) {
    console.error('Failed to log login event:', err)
  }
}

export async function sendResetPassword(email) {
  await sendPasswordResetEmail(auth, email)
}

// Fungsi baru untuk membuat user dengan role tertentu (admin/user)
// Menggunakan secondary Firebase App agar sesi admin tidak terganggu

export async function createUserWithRole(email, password, role, passcode) {
  // Ambil config dari app utama
  const { initializeApp, deleteApp, getApps } = await import('firebase/app')
  const { getAuth, createUserWithEmailAndPassword: createUser, signOut } = await import('firebase/auth')

  // Buat secondary app instance yang terisolasi
  const secondaryAppName = `secondary-${Date.now()}`
  const primaryApp = (await import('firebase/app')).getApps()[0]
  const secondaryApp = initializeApp(primaryApp.options, secondaryAppName)
  const secondaryAuth = getAuth(secondaryApp)

  try {
    if (passcode.length !== 4 || isNaN(passcode)) {
      throw new Error('Passcode harus berupa 4 angka.')
    }

    const hashedPasscode = await hashPasscode(passcode)

    // 1. Buat user di secondary auth (tidak mengganti sesi admin)
    const cred = await createUser(secondaryAuth, email, password)
    const user = cred.user

    // 2. Simpan Role di Firestore
    await setDoc(doc(dbFirestore, 'users', user.uid), {
      email: user.email,
      role: role,
      passcode: hashedPasscode,
      createdAt: new Date().toISOString()
    })

    // 3. Simpan Role di Realtime Database
    await set(ref(db, `users/${user.uid}`), {
      role: role,
      email: user.email,
      passcode: hashedPasscode
    })

    // 4. Sign out dari secondary instance
    await signOut(secondaryAuth)

    return user
  } finally {
    // Selalu hapus secondary app untuk menghindari memory leak
    try {
      await deleteApp(secondaryApp)
    } catch (_) {
      // Ignore cleanup errors
    }
  }
}

export async function updateUserRole(uid, newRole) {
  // Update role di Firestore
  const userRef = doc(dbFirestore, 'users', uid)

  await updateDoc(userRef, { role: newRole })

  // Update Realtime Database
  try {
    await set(ref(db, `users/${uid}/role`), newRole)
  } catch (err) {
    console.warn(
      'Failed to update user role in Realtime Database. It will sync automatically when that user logs in.',
      err
    )
  }
}

export async function syncUserToFirestore(user) {
  if (!user) return

  const userRef = doc(dbFirestore, 'users', user.uid)
  const snap = await getDoc(userRef)

  // Jika data belum ada di Firestore, buat baru dengan default role 'user'
  if (!snap.exists()) {
    await setDoc(userRef, {
      email: user.email,
      role: 'user',
      createdAt: new Date().toISOString(),
      syncedAt: new Date().toISOString()
    })
  }

  // --- Sync to Realtime Database (NEW) ---
  try {
    const rtdbRef = ref(db)

    // Use try-read pattern
    const rtdbSnap = await get(child(rtdbRef, `users/${user.uid}`))

    // Ambil data terbaru dari Firestore untuk memastikan role yang sinkron
    const dbSnap = await getDoc(userRef)
    const currentRole = dbSnap.exists() ? dbSnap.data().role : 'user'
    
    // Auto-migrate passcode for existing users
    const defaultPasscode = user.email === 'admin@admin.com' || user.uid === 'JvsaI3GrseURaVqrwcQGJZnOLPp1' ? '0000' : '1234'
    let currentPasscode = defaultPasscode

    if (dbSnap.exists() && dbSnap.data().passcode) {
      currentPasscode = dbSnap.data().passcode
    } else if (rtdbSnap.exists() && rtdbSnap.val().passcode) {
      currentPasscode = rtdbSnap.val().passcode
    }

    // If currentPasscode is exactly 4 digits, it means it's not hashed yet (SHA-256 is 64 chars)
    if (currentPasscode.length === 4) {
      currentPasscode = await hashPasscode(currentPasscode)
    }

    if (!rtdbSnap.exists() || rtdbSnap.val().role !== currentRole || rtdbSnap.val().passcode !== currentPasscode) {
      await set(ref(db, `users/${user.uid}`), {
        role: currentRole,
        email: user.email,
        passcode: currentPasscode,
        syncedAt: new Date().toISOString()
      })
      
      if (dbSnap.exists() && dbSnap.data().passcode !== currentPasscode) {
        await updateDoc(userRef, { passcode: currentPasscode })
      }
    }
  } catch (err) {
    console.error('Failed to sync user role to Realtime Database.', err)
  }
}

export async function deleteUserFromDb(uid) {
  // 1. Hapus dari Firebase Auth via API
  const currentUser = auth.currentUser

  if (currentUser) {
    const token = await currentUser.getIdToken()

    const res = await fetch('/api/auth/delete-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ targetUid: uid })
    })

    if (!res.ok) {
      const errorData = await res.json()

      // Jika user sudah tidak ada di Firebase Auth, biarkan proses berlanjut untuk menghapus data 'hantu' di DB
      if (errorData.error && errorData.error.toLowerCase().includes('no user record')) {
        console.warn('User tidak ditemukan di Firebase Auth. Melanjutkan penghapusan data di database.')
      } else {
        throw new Error(`Failed to delete user from Auth: ${errorData.error}`)
      }
    }
  }

  // 2. Hapus dari Firestore
  const userRef = doc(dbFirestore, 'users', uid)

  await deleteDoc(userRef)

  // 3. Hapus dari Realtime Database
  try {
    await set(ref(db, `users/${uid}`), null)
  } catch (err) {
    console.error('Failed to delete user from Realtime Database:', err)
  }
}

export async function updateRolePermissions(roleName, newPermissions) {
  // Update di Firestore settings/roles_permissions document
  const settingsRef = doc(dbFirestore, 'settings', 'roles_permissions')

  await setDoc(settingsRef, { [roleName]: newPermissions }, { merge: true })

  // Update di Realtime Database
  try {
    await set(ref(db, `ucl_data/settings/roles_permissions/${roleName}`), newPermissions)
  } catch (err) {
    console.error('Failed to update role permissions in Realtime Database:', err)
  }
}
