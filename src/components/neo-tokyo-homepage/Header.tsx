import Link from "next/link";

import { Phone } from "lucide-react";

export function Header() {
  return (
    <header className="absolute top-0 left-0 w-full flex items-center justify-between px-8 py-6 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-[#D9FF00] flex items-center justify-center rotate-45">
          <div className="w-4 h-4 bg-black"></div>
        </div>
        <span className="text-white font-black text-2xl tracking-widest uppercase">
          FERIHUI <span className="text-xs font-normal align-top ml-1"> ワサフー</span>
        </span>
      </div>

      {/* Navigation */}
      {/* <nav className="hidden md:flex items-center gap-8 text-white text-sm font-bold tracking-wider">
        <Link href="#" className="hover:text-[#D9FF00] transition-colors uppercase">Home</Link>
        <Link href="#" className="hover:text-[#D9FF00] transition-colors uppercase">About Us</Link>
        <Link href="#" className="hover:text-[#D9FF00] transition-colors uppercase">Our Services</Link>
      </nav> */}
    </header>
  );
}
