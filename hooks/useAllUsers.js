import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { dbFirestore } from "@/lib/firebase";

export function useAllUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const usersRef = collection(dbFirestore, "users");
        const unsub = onSnapshot(usersRef, (snapshot) => {
            const userList = snapshot.docs.map((doc) => ({
                uid: doc.id,
                ...doc.data(),
            }));
            setUsers(userList);
            setLoading(false);
        });

        return () => unsub();
    }, []);

    return { users, loading };
}
