import './global.css';
import { RootProvider } from 'fumadocs-ui/provider';
import { Open_Sans } from 'next/font/google';
import type { ReactNode } from 'react';
import type { Metadata } from 'next'
 
export const metadata: Metadata = {
  title: 'Veve',
  description: 'A zero-config, type-safe,  TypeScript-native testing framework and runner !',
  icons: {
    icon: "/logo.png",
  }
}

const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
});

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={openSans.className} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" type="image/png" sizes="32x32" />
        <link
  rel="apple-touch-icon"
  href="/logo.png"
  type="image/png"
  sizes="32x32"
/>
      </head>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
