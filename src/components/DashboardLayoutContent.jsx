"use client";

import { usePathname } from "next/navigation";

// Layout Imports
import LayoutWrapper from "@layouts/LayoutWrapper";
import VerticalLayout from "@layouts/VerticalLayout";

// Component Imports
import Navigation from "@components/layout/vertical/Navigation";
import Navbar from "@components/layout/vertical/Navbar";
import VerticalFooter from "@components/layout/vertical/Footer";
import DashboardAuthGuard from "@/components/DashboardAuthGuard";

export default function DashboardLayoutContent({ children }) {
  const pathname = usePathname();

  // Public OBS graphic overlays shouldn't have layout templates or login guards
  const isOverlay = pathname.includes("/overlay") || pathname.includes("/running-text");

  if (isOverlay) {
    return (
      <>
        {children}
        <style dangerouslySetInnerHTML={{
          __html: `
            html, body, #__next, [data-mui-color-scheme], [data-mui-color-scheme="dark"], [data-mui-color-scheme="light"] {
              background: transparent !important;
              background-color: transparent !important;
            }
          `
        }} />
      </>
    );
  }

  return (
    <DashboardAuthGuard>
      <LayoutWrapper
        verticalLayout={
          <VerticalLayout navigation={<Navigation />} navbar={<Navbar />} footer={<VerticalFooter />}>
            {children}
          </VerticalLayout>
        }
      />
    </DashboardAuthGuard>
  );
}
