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

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'FinHubIQ | Financial Dashboard',
  description: 'Modern SAAS financial dashboard for comprehensive financial analysis',
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
      <body className={cn(inter.className, "safe-top min-h-screen")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SWRProvider>
            <AuthProvider>
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 pb-16 sm:pb-0 animate-fade-in w-full">
                  <div className="container-wide mx-auto">
                    {children}
                  </div>
                </main>
                <div className="hidden sm:block">
                  <Footer />
                </div>
                <MobileNav />
              </div>
            </AuthProvider>
          </SWRProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}