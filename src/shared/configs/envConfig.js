export const clientEnv = {
    FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    FIREBASE_DATABASE_URL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
};

// Fail-fast untuk konfigurasi klien
if (!clientEnv.FIREBASE_API_KEY && process.env.NODE_ENV !== 'test') {
    console.warn("⚠️ Peringatan: NEXT_PUBLIC_FIREBASE_API_KEY belum di-set di environment.");
}

export const serverEnv = {
    FIREBASE_SERVICE_ACCOUNT_KEY: process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
    NODE_ENV: process.env.NODE_ENV
};

export const getParsedServiceAccount = () => {
    if (!serverEnv.FIREBASE_SERVICE_ACCOUNT_KEY) return null;
    try {
        return JSON.parse(serverEnv.FIREBASE_SERVICE_ACCOUNT_KEY);
    } catch (e) {
        console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', e.message);
        return null;
    }
};
