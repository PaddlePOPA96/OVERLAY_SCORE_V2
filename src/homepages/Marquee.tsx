export function Marquee() {
  const items = [
    "CHINDO LOVER",
    "✦",
    "VALORANT STREAMER",
    "✦",
    "ANIME-LOVERS",
    "✦",

  ];

  return (
    <div className="w-[110%] -ml-[5%] bg-[#D9FF00] overflow-hidden py-5 border-y-[0.4vw] border-black z-40 relative shadow-[0_20px_0px_#000] -rotate-2 -mt-[5%] -mb-[3%]">
      <div className="flex w-[200%] animate-[marquee_20s_linear_infinite] items-center">
        {/* Duplicate items to create seamless loop */}
        {[...items, ...items, ...items].map((item, i) => (
          <span
            key={i}
            className="text-black font-black text-2xl md:text-4xl tracking-widest whitespace-nowrap px-8 uppercase"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
