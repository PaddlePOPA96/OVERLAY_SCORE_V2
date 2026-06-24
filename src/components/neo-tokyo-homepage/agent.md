# Neo-Tokyo Homepage Agent Instruction Guide

This document provides instructions for an AI agent on how to integrate the newly packaged `neo-tokyo-homepage` into another Next.js project.

## Context
The user has a pre-built Neo-Tokyo themed Neo-Brutalist landing page located in the `neo-tokyo-homepage` directory. They want this layout to become the **initial homepage** (`app/page.tsx` or `pages/index.tsx`) of a different Next.js project.

## Your Tasks as an AI Agent:

1. **Locate the Directory:** 
   Ensure you have the `neo-tokyo-homepage` directory available. It contains:
   - `index.tsx` (Main wrapper component)
   - `Header.tsx` (Navigation component)
   - `HeroAgency.tsx` (Hero visual section)
   - `Marquee.tsx` (Scrolling neon banner)

2. **Copy the Components:**
   Copy the `neo-tokyo-homepage` folder into the target project's `components` directory (e.g., `src/components/neo-tokyo-homepage`).

3. **Set as Homepage:**
   Overwrite the target project's main `src/app/page.tsx` (or equivalent) to import and render this component:
   ```tsx
   import NeoTokyoLanding from "@/components/neo-tokyo-homepage/index";

   export default function Home() {
     return <NeoTokyoLanding />;
   }
   ```

4. **Verify Dependencies:**
   - Ensure `lucide-react` is installed (`npm install lucide-react`).
   - Ensure the Next.js `Image` component setup matches the project's configuration (e.g., `unoptimized: true` if they are using static exports).
   - Ensure `/profile.png` (or an equivalent placeholder) exists in the `public` directory.

5. **Tailwind CSS Configuration:**
   Add the following CSS keyframes to the global stylesheet (e.g., `globals.css`) for the marquee animation to work:
   ```css
   @keyframes marquee {
     0% {
       transform: translateX(0%);
     }
     100% {
       transform: translateX(-50%);
     }
   }
   ```
   *Note: If the project uses Tailwind v3, you may need to add `marquee` to the `tailwind.config.ts` theme extension. If it uses Tailwind v4, the inline arbitrary class `animate-[marquee_20s_linear_infinite]` combined with the `@keyframes` in CSS will work out of the box.*
