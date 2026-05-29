"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/operator");
  }, [router]);

  return (
    <div className="flex h-64 items-center justify-center text-slate-400 text-sm">
      Redirecting to Scoreboard Operator...
    </div>
  );
}
