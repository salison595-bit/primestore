import "./globals.css";
import { Inter } from "next/font/google";
import { CombinedProviders } from "../components/Providers";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: {
    default: "PRIME STORE - Premium Experience",
    template: "%s | PRIME STORE"
  },
  description: "Elevate your level with exclusive products. Premium quality, luxury design, streetwear technology.",
  keywords: ["prime store", "premium", "streetwear", "luxury", "fashion", "quality"],
  creator: "Prime Store Team",
  publisher: "Prime Store",
  
  // Open Graph
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://primestore.com",
    title: "PRIME STORE - Premium Experience",
    description: "Elevate your level with exclusive products",
    images: [
      {
        url: "https://primestore.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Prime Store Logo"
      }
    ]
  },

  // Twitter
  twitter: {
    card: "summary_large_image",
    site: "@primestore",
    creator: "@primestore",
    title: "PRIME STORE - Premium Experience",
    description: "Elevate your level with exclusive products",
    images: ["https://primestore.com/twitter-image.jpg"]
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },

  // Verification
  verification: {
    google: "your-google-verification-code",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0d0d0d',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <head>
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="https://api.primestore.com" />
        
        {/* Canonical */}
        <link rel="canonical" href="https://primestore.com" />
        
        {/* Alternate versions */}
        <link rel="alternate" type="application/rss+xml" href="https://primestore.com/rss" />
        
        {/* Meta robots */}
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        
        {/* Security headers */}
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta name="color-scheme" content="dark" />
      </head>
      <body className={`${inter.className} bg-black text-white`}>
        <CombinedProviders>
          {children}
        </CombinedProviders>
      </body>
    </html>
  );
}
