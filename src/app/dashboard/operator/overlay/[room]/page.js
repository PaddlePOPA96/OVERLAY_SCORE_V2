"use client";

import ScoreboardOverlay from "@/app/dashboard/operator/overlay/_components/ScoreboardOverlay";
import { useParams } from "next/navigation";

export default function OverlayRoomPage() {
  const params = useParams();
  const rawRoom = params?.room;
  const roomId =
    typeof rawRoom === "string"
      ? rawRoom
      : Array.isArray(rawRoom) && rawRoom.length > 0
        ? rawRoom[0]
        : "default";

  return <ScoreboardOverlay roomId={roomId} />;
}
