import Image from "next/image";
import Link from "next/link";

export function HeroAgency() {
  return (
    <section className="relative w-full min-h-[110vh] bg-[#1D34F0] overflow-hidden flex flex-col justify-end items-center pt-24">
      {/* Dashboard Button */}
      <div className="absolute top-6 right-6 md:top-10 md:right-10 z-50">
        <Link 
          href="/dashboard" 
          className="inline-block bg-[#D9FF00] text-black font-black text-lg md:text-xl uppercase px-6 py-3 border-4 border-black shadow-[6px_6px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_#000] transition-all active:translate-x-[6px] active:translate-y-[6px] active:shadow-none"
        >
          DASHBOARD
        </Link>
      </div>

      {/* Background Japanese Typography - Large Interlocking */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex flex-col items-center justify-center mix-blend-screen pointer-events-none z-0">
        <h1 className="text-[clamp(6rem,15vw,22rem)] leading-[0.8] font-black text-[#D9FF00] tracking-tighter uppercase whitespace-nowrap ml-[-10%] opacity-90">
          FERIHUI
        </h1>
        <h1 className="text-[clamp(6rem,15vw,22rem)] leading-[0.8] font-black text-transparent tracking-tighter uppercase whitespace-nowrap mr-[-10%] opacity-90" style={{ WebkitTextStroke: '4px #D9FF00' }}>
          STREAM
        </h1>
      </div>



      {/* Center Image */}
      <div className="relative z-10 w-[100%] md:w-[100%] lg:w-[60%] aspect-[3/4] max-h-[90vh] flex items-end justify-center mt-auto pointer-events-none">
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
        <div className="absolute bottom-[10%] right-[-10%] bg-[#D9FF00] text-black font-black text-2xl px-4 py-8 writing-vertical-rl rotate-180 border-4 border-black">
          次世代の創造力
        </div>
      </div>



      {/* Decorative Star */}
      <div className="absolute top-[20%] left-[10%] md:right-[10%] md:left-auto z-0">
        <div className="w-16 h-16 border-2 border-[#D9FF00] rounded-full flex items-center justify-center p-2">
          <svg viewBox="0 0 100 100" className="w-full h-full text-[#D9FF00]">
            <polygon fill="currentColor" points="50,0 60,40 100,50 60,60 50,100 40,60 0,50 40,40" />
          </svg>
        </div>
      </div>

    </section>
  );
}
