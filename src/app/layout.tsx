import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import ClientLayout from "./client-layout";

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

export const metadata: Metadata = {
  title: "FS Tracker - Дашборд здоровья",
  description: "Персональный трекер питания и веса с интеграцией FatSecret",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${roboto.variable} font-sans antialiased`}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
