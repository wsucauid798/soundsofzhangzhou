import type { Metadata } from "next";
import { Cormorant_Garamond, Geist, Crimson_Text, Noto_Serif_SC, Noto_Sans_SC } from "next/font/google";
import Script from "next/script";
import { cookies } from "next/headers";
import "../styles/css/all.css";
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

const bodySerif = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-body-serif",
  display: "swap",
});

const notoSerifSC = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-zh",
  display: "swap",
});

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-zh-ui",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sounds of Zhangzhou",
  description:
    "A digital interactive installation capturing the pulse of Zhangzhou during the Spring Festival",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialLang = cookieStore.get("siteLang")?.value === "zh" ? "zh" : "en";

  return (
    <html
      lang="en-gb"
      className={`${cormorant.variable} ${geist.variable} ${bodySerif.variable} ${notoSerifSC.variable} ${notoSansSC.variable}`}
    >
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
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "v39ah7lh3o");
          `}
        </Script>
      </head>
      <body className="start-screen-bg flex h-screen flex-col overflow-hidden bg-[#050505] font-sans text-[#ededed] antialiased" data-lang={initialLang}>
        <Header initialLang={initialLang} />
        <main className="flex flex-1 items-center justify-center">
          {children}
        </main>
        <Footer initialLang={initialLang} />
      </body>
    </html>
  );
}
