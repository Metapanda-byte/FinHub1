import './globals.css';
import '../styles/highlight-to-chat.css';
import '../styles/analysis-popup.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/lib/supabase/auth-context';
import { SWRProvider } from '@/components/providers/swr-provider';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { MobileNav } from '@/components/layout/mobile-nav';
import { cn } from '@/lib/utils';
import { Suspense } from 'react';

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'FinHubIQ — Launching soon',
  description: 'Join the waitlist to get early access to FinHubIQ.',
  openGraph: {
    title: 'FinHubIQ — Launching soon',
    description: 'Join the waitlist to get early access to FinHubIQ.',
    url: 'https://finhubiq.com',
    siteName: 'FinHubIQ',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'FinHubIQ Waitlist',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FinHubIQ — Launching soon',
    description: 'Join the waitlist to get early access to FinHubIQ.',
    images: ['/og-image.jpg'],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "safe-top min-h-screen overflow-hidden")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SWRProvider>
            <AuthProvider>
              <div className="flex min-h-screen flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-hidden animate-fade-in w-full">
                  {children}
                </main>
                <div className="hidden sm:block shrink-0 sticky bottom-0 z-40">
                  <Footer />
                </div>
                <Suspense fallback={null}>
                  <MobileNav />
                </Suspense>
              </div>
            </AuthProvider>
          </SWRProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}