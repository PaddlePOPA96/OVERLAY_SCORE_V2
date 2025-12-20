import "server-only";
import admin from "firebase-admin";

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? (() => {
        try {
            return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        } catch (e) {
            console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", e.message);
            return null;
        }
    })()
    : null;

if (!admin.apps.length) {
    try {
        if (serviceAccount) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
            });
            console.log("✅ Firebase Admin initialized with Service Account");
        } else {
            // console.warn("⚠️ initializing Firebase Admin without Service Account (limited capabilities)");
            admin.initializeApp({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
            });
        }
    } catch (e) {
        console.error("❌ Firebase Admin initialization failed:", e);
    }
}

export async function verifyIdToken(token) {
    if (!token) return { success: false, error: "No token provided" };
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        return { success: true, ...decodedToken };
    } catch (error) {
        // BYPASS IF NO SERVICE ACCOUNT (Local Dev only)
        if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY && process.env.NODE_ENV === "development") {
            // eslint-disable-next-line no-console
            console.warn("⚠️ [Dev Mode] Skipping ID Token verification because FIREBASE_SERVICE_ACCOUNT_KEY is missing.");
            return { success: true, uid: "dev-user", email: "dev@local", role: "admin", isDev: true };
        }
        console.error("verifyIdToken error:", error);
        return { success: false, error: error.message };
    }
}
