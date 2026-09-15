import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SuriHub - Pembantu Suri Rumah Modern 💕',
  description: 'Aplikasi khas suri rumah Malaysia untuk pengurusan stok dapur (pantry), cadangan menu resipi tempatan & jadual kebersihan rumah.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SuriHub',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#f43f5e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ms" className="h-full bg-rose-50/50 antialiased selection:bg-rose-200 selection:text-rose-900">
      <body className={`${inter.className} min-h-full flex flex-col text-gray-800 bg-rose-50/30`}>
        {children}
      </body>
    </html>
  );
}
