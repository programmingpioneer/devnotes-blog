import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Providers from "@/components/shared/Providers";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import JSONLD from "@/components/shared/JSONLD";
import ProgressBar from "@/components/layout/ProgressBar";
import { siteConfig } from "@/content/config";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/jsonld";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.title, template: `%s — ${siteConfig.title}` },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.title,
    title: siteConfig.title,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    creator: siteConfig.author.twitter,
  },
  robots: { index: true, follow: true },
};

const themeScript = `try{const t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={geist.variable}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen flex flex-col">
        <Providers>
          <JSONLD data={[organizationJsonLd(), websiteJsonLd()]} />
          <ProgressBar />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}