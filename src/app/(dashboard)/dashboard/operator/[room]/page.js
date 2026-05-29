"use client";

import { useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import { getAuth, onAuthStateChanged } from "firebase/auth";

import OperatorRoot from "@/app/(dashboard)/dashboard/operator/_components/OperatorRoot";

export default function OperatorRoomPage() {
  const params = useParams();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(null); // null = loading

  const rawRoom = params?.room;

  const roomId =
    typeof rawRoom === "string"
      ? rawRoom
      : Array.isArray(rawRoom) && rawRoom.length > 0
        ? rawRoom[0]
        : "default";

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Belum login → redirect ke login
        router.replace("/login");

        return;
      }

      // Hanya boleh akses room miliknya sendiri
      // Kalau mau admin bisa akses semua room, tambahkan kondisi di sini
      if (roomId !== "default" && user.uid !== roomId) {
        // Redirect ke room milik user sendiri
        router.replace(`/dashboard/operator/overlay/${user.uid}`);

        return;
      }

      setAuthorized(true);
    });

    return () => unsubscribe();
  }, [roomId, router]);

  if (!authorized) return null; // atau loading spinner

  return <OperatorRoot initialRoomId={roomId} />;
}