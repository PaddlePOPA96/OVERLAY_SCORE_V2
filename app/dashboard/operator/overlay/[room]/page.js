"use client";

import { useScoreboard } from "@/hooks/useScoreboard";
import LayoutA from "../../_components/LayoutA";
import LayoutB from "../../_components/LayoutB";
import { useEffect, useState } from "react";
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

  const { data, displayTime, formatTime } = useScoreboard(roomId);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      {data.layout === "A" ? (
        <LayoutA
          data={data}
          displayTime={displayTime}
          formatTime={formatTime}
        />
      ) : (
        <LayoutB
          data={data}
          displayTime={displayTime}
          formatTime={formatTime}
        />
      )}
    </>
  );
}
