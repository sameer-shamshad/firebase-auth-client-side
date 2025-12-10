import "./globals.css";
import type { Metadata } from "next";
import Navigation from "@/components/Navigation";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Plus_Jakarta_Sans } from "next/font/google";
import "./googleIcons.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta-sans",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Firebase SSO",
  description: "Firebase SSO Template",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${plusJakartaSans.variable} antialiased`}>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
