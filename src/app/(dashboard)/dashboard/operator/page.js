"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { onAuthStateChanged } from "firebase/auth";

import { auth } from "@/lib/firebaseAuth";

import OperatorRoot from "@/app/(dashboard)/dashboard/operator/_components/OperatorRoot";

export default function OperatorPage() {
  const router = useRouter();
  const [roomId, setRoomId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Not logged in -> redirect to login
        router.replace("/login");
      } else {
        const params = new URLSearchParams(window.location.search);
        const roomFromQuery = params.get("room") || "";
        const roomFromHash = window.location.hash.replace("#", "") || "";

        setRoomId(roomFromQuery || roomFromHash || user.uid);
        setLoading(false);
      }
    });

    return () => unsub();
  }, [router]);

  if (loading || !roomId) {
    return <div className="p-6 text-slate-500 text-sm">Loading operator panel...</div>;
  }

  return <OperatorRoot initialRoomId={roomId} />;
}
