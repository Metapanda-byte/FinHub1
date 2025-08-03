import './globals.css';
import '../styles/highlight-to-chat.css';
import '../styles/analysis-popup.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/lib/supabase/auth-context';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { MobileNav } from '@/components/layout/mobile-nav';

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'FinHubIQ | Premium Financial Intelligence',
  description: 'Advanced financial analysis platform with AI-powered insights for modern investors',
  keywords: 'financial analysis, stock market, investment, AI, dashboard',
  authors: [{ name: 'FinHubIQ Team' }],
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FinHubIQ',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-sans antialiased safe-top safe-bottom min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="flex min-h-screen flex-col relative">
              <Header />
              <main className="flex-1 relative overflow-x-hidden">
                <div className="premium-gradient absolute inset-0 pointer-events-none opacity-50" />
                <div className="relative z-10">
                  {children}
                </div>
              </main>
              <Footer />
              <MobileNav />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}