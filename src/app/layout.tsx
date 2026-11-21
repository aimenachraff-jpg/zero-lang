/**
 * Root Layout
 * 
 * Professional, academic tone. No gamification.
 * Server-side rendered with client-side hydration for interactivity.
 */

import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import Link from 'next/link'
import { Header } from '@/components/layout/header'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: {
    default: 'ZERO-LANG — Advanced English Through World Knowledge',
    template: '%s | ZERO-LANG',
  },
  description: 'Free, open-source platform for B2–C2 English learners. Learn advanced English through science, technology, philosophy, economics, and current affairs. Structured curriculum, 245-term vocabulary bank, graded exercises and CEFR-aligned progress tracking.',
  keywords: [
    'English learning',
    'advanced English',
    'B2 C1 C2',
    'CEFR',
    'language learning',
    'free education',
    'open source',
    'advanced English',
    'academic English',
    'professional English',
  ],
  authors: [{ name: 'ZERO-LANG Community' }],
  creator: 'ZERO-LANG',
  publisher: 'ZERO-LANG',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://zero-lang.org',
    siteName: 'ZERO-LANG',
    title: 'ZERO-LANG — Advanced English Through World Knowledge',
    description: 'Free, open-source platform for B2–C2 English learners. Learn advanced English through science, technology, philosophy, economics, and current affairs.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ZERO-LANG — Advanced English Through World Knowledge',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZERO-LANG — Advanced English Through World Knowledge',
    description: 'Free, open-source platform for B2–C2 English learners.',
    images: ['/og-image.png'],
  },
  metadataBase: new URL('https://zero-lang.org'),
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  manifest: '/site.webmanifest',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground">
        <Providers>
          <Header />
          <div className="flex-1">{children}</div>
          <footer className="border-t bg-muted/30" role="contentinfo">
            <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row">
              <p>ZERO-LANG — advanced English through world knowledge.</p>
              <nav className="flex flex-wrap items-center gap-x-5 gap-y-2" aria-label="Footer navigation">
                <Link href="/curriculum" className="hover:text-foreground">Curriculum</Link>
                <Link href="/placement" className="hover:text-foreground">Placement</Link>
                <Link href="/vocabulary" className="hover:text-foreground">Vocabulary</Link>
                <Link href="/progress" className="hover:text-foreground">Progress</Link>
              </nav>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  )
}