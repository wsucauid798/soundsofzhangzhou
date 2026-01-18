import type { Metadata } from "next";
import { Cormorant_Garamond, Geist } from "next/font/google";
import Script from "next/script";
import "../../public/styles/css/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-serif",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sounds of Zhangzhou",
  description:
    "A digital interactive installation capturing the pulse of Zhangzhou during the Spring Festival",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${geist.variable}`}>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-EH6MKJPY4B"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-EH6MKJPY4B');
          `}
        </Script>
      </head>
      <body className="min-h-screen bg-[#050505] font-sans text-[#ededed] antialiased">
        <Header />
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
