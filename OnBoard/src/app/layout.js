import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "FindMyClicks.Ai | AI Face Search",
  description: "Instantly find every photo you appear in with our premium AI face recognition technology.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <div className="global-glow"></div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Providers>
            {children}
          </Providers>
        </div>
      </body>
    </html>
  );
}
