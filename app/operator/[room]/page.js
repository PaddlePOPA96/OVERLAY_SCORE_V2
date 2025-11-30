"use client";

import { useParams } from "next/navigation";
import OperatorRoot from "../OperatorRoot";

// Halaman Operator versi dynamic route: /operator/[room]
export default function OperatorRoomPage() {
  const params = useParams();
  const rawRoom = params?.room;
  const roomId =
    typeof rawRoom === "string"
      ? rawRoom
      : Array.isArray(rawRoom) && rawRoom.length > 0
      ? rawRoom[0]
      : "default";

  return <OperatorRoot initialRoomId={roomId} />;
}
