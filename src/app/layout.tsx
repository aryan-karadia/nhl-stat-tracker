import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { TeamProvider } from "@/context/team-context";
import { Nav } from "@/components/nav";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});
const plexMono = IBM_Plex_Mono({
  variable: "--font-code",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "NHL Stat Tracker",
  description: "Track NHL standings, salary cap, and draft picks for every team",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${spaceGrotesk.variable} ${plexMono.variable} font-sans antialiased min-h-screen`}>
        <TeamProvider>
          <Nav />
          <main className="site-main mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
            {children}
          </main>
        </TeamProvider>
      </body>
    </html>
  );
}
