import "./globals.css";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata = {
  title: "Scoreboard System",
  description: "Realtime Scoreboard Next.js + Firebase",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://identitytoolkit.googleapis.com" />
      </head>
      <body className={poppins.className}>{children}</body>
    </html>
  );
}
