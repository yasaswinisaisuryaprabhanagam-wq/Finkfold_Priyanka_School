import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SCHOOL } from "@/lib/school-config";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: `${SCHOOL.name} – Official Website & Attendance Portal`,
    template: `%s | ${SCHOOL.name}`,
  },
  description: `Official website and attendance portal of ${SCHOOL.name}, Rasapūdipalem, Andhra Pradesh. Empowering students through quality education and active parent communication.`,
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
