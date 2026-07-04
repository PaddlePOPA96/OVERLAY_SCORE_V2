import { Header } from "./Header";
import { HeroAgency } from "./HeroAgency";
import { Marquee } from "./Marquee";
import { ScheduleCards } from "./ScheduleCards";
import { WorldCupKnockoutSection } from "./WorldCupKnockoutSection";

export default function NeoTokyoLanding() {
  return (
    <main className="min-h-screen bg-[#F5F4F0] font-sans selection:bg-[#D9FF00] selection:text-black overflow-x-hidden flex flex-col relative">
      <Header />
      <HeroAgency />
      <Marquee />
      <WorldCupKnockoutSection />
      {/* <ScheduleCards /> */}
    </main>
  );
}
