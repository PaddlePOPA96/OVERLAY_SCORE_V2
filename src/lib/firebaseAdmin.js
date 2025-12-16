import "server-only";
import admin from "firebase-admin";

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : null;

if (!admin.apps.length) {
    if (serviceAccount) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
        });
    } else {
        // Fallback: This might fail if not on Vercel/GCP environment variables usage
        // or properly authorized environment.
        // For MVP if no service account is provided, we might skip auth or use default creds
        // which requires GOOGLE_APPLICATION_CREDENTIALS for local dev.
        // 
        // IF we are running locally without key, this helper will likely fail to verify tokens properly
        // unless authenticated via gcloud CLI.
        try {
            admin.initializeApp({
                databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
            });
        } catch (e) {
            console.warn("Firebase Admin failed to initialize", e);
        }
    }
}

export async function verifyIdToken(token) {
    if (!token) return null;
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        return decodedToken;
    } catch (error) {
        // BYPASS IF NO SERVICE ACCOUNT (Local Dev only)
        if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY && process.env.NODE_ENV === "development") {
            // eslint-disable-next-line no-console
            console.warn("⚠️ [Dev Mode] Skipping ID Token verification because FIREBASE_SERVICE_ACCOUNT_KEY is missing.");
            return { uid: "dev-user", email: "dev@local", role: "admin" };
        }
        console.error("verifyIdToken error:", error);
        return null;
    }
}
