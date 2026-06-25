"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { HeroSidebarScores } from "./HeroSidebarScores";

export function HeroAgency() {
  const router = useRouter();
  const [isPreloading, setIsPreloading] = useState(false);

  const handleDashboardClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    setIsPreloading(true);
    
    // Tunggu animasi preloader selesai (sekitar 1.2 detik) sebelum pindah halaman
    setTimeout(() => {
      router.push("/dashboard");
    }, 1200);
  };

  const handleStreamClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    setIsPreloading(true);
    
    // Tunggu animasi preloader selesai (sekitar 1.2 detik) sebelum pindah halaman
    setTimeout(() => {
      router.push("/streams");
    }, 1200);
  };

  return (
    <section className="relative w-full min-h-[110vh] bg-[#1427c4] overflow-hidden flex flex-col justify-end items-center pt-24">

      {/* 1. NEO-BRUTALISM BACKGROUND MARQUEE GRID (Paling Belakang) */}
      <div className="absolute inset-0 flex flex-col justify-center gap-4 opacity-15 pointer-events-none select-none z-0 overflow-hidden">
        {/* Baris 1: Gerak ke Kiri */}
        <div className="w-full whitespace-nowrap flex py-2 border-y-2 border-black/5">
          <div className="animate-marquee-left flex text-[12vw] font-black uppercase text-transparent tracking-tighter leading-none" style={{ WebkitTextStroke: '3px #D9FF00' }}>
            {" FERIHUI FERIHUI FERIHUI FERIHUI FERIHUI FERIHUI FERIHUI FERIHUI".repeat(2)}
          </div>
        </div>

        {/* Baris 2: Gerak ke Kanan */}
        <div className="w-full whitespace-nowrap flex py-2 border-b-2 border-black/5">
          <div className="animate-marquee-right flex text-[12vw] font-black uppercase text-transparent tracking-tighter leading-none" style={{ WebkitTextStroke: '3px #D9FF00' }}>
            {" FERIHUI FERIHUI FERIHUI FERIHUI FERIHUI FERIHUI FERIHUI FERIHUI".repeat(2)}
          </div>
        </div>

        {/* Baris 3: Gerak ke Kiri */}
        <div className="w-full whitespace-nowrap flex py-2 border-b-2 border-black/5">
          <div className="animate-marquee-left flex text-[12vw] font-black uppercase text-transparent tracking-tighter leading-none" style={{ WebkitTextStroke: '3px #D9FF00' }}>
            {" FERIHUI FERIHUI FERIHUI FERIHUI FERIHUI FERIHUI FERIHUI FERIHUI".repeat(2)}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="absolute top-6 right-6 md:top-10 md:right-10 z-50 flex flex-col items-end gap-4">
        <a
          href="/dashboard"
          onClick={handleDashboardClick}
          className="inline-block cursor-pointer bg-[#D9FF00] text-black font-black text-lg md:text-xl uppercase px-6 py-3 border-4 border-black shadow-[6px_6px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_#000] transition-all active:translate-x-[6px] active:translate-y-[6px] active:shadow-none"
        >
          DASHBOARD
        </a>
        <a
          href="/streams"
          onClick={handleStreamClick}
          className="inline-block cursor-pointer bg-[#FF00FF] text-white font-black text-lg md:text-xl uppercase px-6 py-3 border-4 border-black shadow-[6px_6px_0px_0px_#000] -rotate-3 hover:-rotate-1 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_#000] transition-all active:translate-x-[6px] active:translate-y-[6px] active:shadow-none"
        >
          LIVE STREAM
        </a>
      </div>

      {/* Hero Sidebar Scores */}
      <HeroSidebarScores />

      {/* 2. MAIN HERO TYPOGRAPHY (Di depan Grid Marquee, Di belakang Image) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex flex-col items-center justify-center mix-blend-screen pointer-events-none z-10">
        <h1 className="animate-drift-left text-[clamp(6rem,15vw,22rem)] leading-[0.8] font-black text-[#D9FF00] tracking-tighter uppercase whitespace-nowrap ml-[-10%] opacity-90">
          FERIHUI
        </h1>
        <h1 className="animate-drift-right text-[clamp(6rem,15vw,22rem)] leading-[0.8] font-black text-transparent tracking-tighter uppercase whitespace-nowrap mr-[-10%] opacity-90" style={{ WebkitTextStroke: '4px #D9FF00' }}>
          STREAM
        </h1>
      </div>

      {/* Center Image */}
      <div className="relative z-20 w-[100%] md:w-[100%] lg:w-[60%] aspect-[3/4] max-h-[90vh] flex items-end justify-center mt-auto pointer-events-none">
        <div className="absolute bottom-0 w-full h-[90%] bg-gradient-to-t from-black/40 to-transparent"></div>
        <Image
          src="/totoprofile.png"
          alt="Neo Tokyo Creative"
          width={800}
          height={1000}
          className="object-contain w-full h-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          unoptimized
        />

        {/* Japanese Text overlay on image */}
        <div className="absolute bottom-[10%] right-[-10%] bg-[#D9FF00] text-black font-black text-2xl px-4 py-8 writing-vertical-rl rotate-180 border-4 border-black pointer-events-auto">
          次世代の創造力
        </div>
      </div>

      {/* Decorative Star */}
      <div className="absolute top-[20%] left-[10%] md:right-[10%] md:left-auto z-0">
        <div className="w-16 h-16 border-2 border-[#D9FF00] rounded-full flex items-center justify-center p-2">
          <div className="w-full h-full bg-[#D9FF00] rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* DASHBOARD PRELOADER TRANSITION (When leaving Home) */}
      <AnimatePresence>
        {isPreloading && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "100vh" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
            className="fixed top-0 left-0 w-full bg-black z-[9999] overflow-hidden pointer-events-auto"
          >
            <motion.div
              initial={{ y: "80vh" }}
              animate={{ y: "4vh" }}
              transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
              className="absolute left-[5%] text-[#D9FF00] font-black text-[clamp(4rem,12vw,12rem)] leading-none uppercase tracking-tighter"
            >
              SCOREBOS
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PAGE LOAD EXIT PRELOADER (When arriving at Home) */}
      <motion.div
        initial={{ height: "100vh" }}
        animate={{ height: 0 }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        className="fixed top-0 left-0 w-full bg-black z-[9999] overflow-hidden pointer-events-none"
      >
        <motion.div
          initial={{ y: "4vh" }}
          animate={{ y: "-100vh" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="absolute left-[5%] text-[#D9FF00] font-black text-[clamp(4rem,12vw,12rem)] leading-none uppercase tracking-tighter"
        >
          SCOREBOS
        </motion.div>
      </motion.div>
    </section>
  );
}