"use client";

import { useEffect, useState } from "react";
import OperatorRoot from "@/components/operator/OperatorRoot";

// Halaman utama Operator: memilih layout A/B dan mengelola auth + room
export default function OperatorPage() {
  const [roomId, setRoomId] = useState("default");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const roomFromQuery = params.get("room") || "";
    const roomFromHash = window.location.hash.replace("#", "") || "";
    setRoomId(roomFromQuery || roomFromHash || "default");
  }, []);

  return <OperatorRoot initialRoomId={roomId} />;
}
