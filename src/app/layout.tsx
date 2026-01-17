import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sounds of Zhangzhou",
  description: "A digital interactive installation capturing the pulse of Zhangzhou during the Spring Festival",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
