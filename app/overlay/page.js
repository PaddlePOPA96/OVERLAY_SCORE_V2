"use client";
import { useScoreboard } from "@/hooks/useScoreboard";
import LayoutA from "./LayoutA";
import LayoutB from "./LayoutB";
import { useEffect, useState } from "react";

export default function OverlayPage() {
  const { data, displayTime, formatTime } = useScoreboard();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  // Tidak perlu wrapper div dengan class CSS yang ribet
  // Karena styling sudah dihandle di dalam masing-masing komponen Layout
  return (
    <>
      {data.layout === "A" ? (
        <LayoutA data={data} displayTime={displayTime} formatTime={formatTime} />
      ) : (
        <LayoutB data={data} displayTime={displayTime} formatTime={formatTime} />
      )}
    </>
  );
}