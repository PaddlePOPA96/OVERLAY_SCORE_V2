import "./globals.css";

export const metadata = {
  title: "Scoreboard System",
  description: "Realtime Scoreboard Next.js + Firebase",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
