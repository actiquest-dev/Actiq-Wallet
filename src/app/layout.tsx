import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const inter = Space_Grotesk({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Actiquest Mini App - complete our tasks and earn $ACTI tokens",
  description: "Actiquest app - complete our tasks and earn $ACTI tokens",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="format-detection" content="telephone=no"/>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=no, viewport-fit=cover, minimum-scale=1.0, maximum-scale=1.0"
        />
        <meta name="format-detection" content="telephone=no"/>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge"/>
        <meta name="MobileOptimized" content="176"/>
        <meta name="HandheldFriendly" content="True"/>
        <meta name="robots" content="noindex,nofollow"/>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      </head>
      <body className={inter.className} style={{backgroundColor:'white'}}>
       {children}
      </body>
    </html>
  );
}
