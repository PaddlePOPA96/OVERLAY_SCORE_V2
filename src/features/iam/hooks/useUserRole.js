import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { dbFirestore } from "@/lib/firebaseFirestore";

export function useUserRole(user) {
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setRole(null);
            setLoading(false);
            return;
        }

        // 1. Cek Environment Variable (Super Admin)
        const envAdminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
        if (user.email === envAdminEmail) {
            setRole("admin");
            setLoading(false);
            return;
        }

        // 2. Cek Firestore users/{uid}
        const userRef = doc(dbFirestore, "users", user.uid);
        const unsub = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setRole(data.role || "user");
            } else {
                setRole("user"); // Default jika doc belum ada
            }
            setLoading(false);
        });

        return () => unsub();
    }, [user]);

    const isAdmin = role === "admin";
    return { role, isAdmin, loading };
}
