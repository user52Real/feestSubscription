import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'
import { ErrorBoundary } from 'react-error-boundary';
import { GlobalError } from '@/components/error-boundary/global-error';
import { AdSense } from "@/components/ads/AdSense";
import { TooltipProvider } from '@/components/ui/tooltip'


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Feest - Event Management Platform',
    template: '%s | Feest'
  },
  description: 'Professional event management platform for organizing and managing events',
  keywords: ['events', 'management', 'organization', 'planning'],
  authors: [{ name: 'user52' }],
  creator: 'Shareflyt',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://shareflyt.xyz',
    title: 'Feest - Event Management Platform',
    description: 'Professional event management platform for organizing and managing events',
    siteName: 'Feest'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Feest - Event Management Platform',
    description: 'Professional event management platform for organizing and managing events',
    creator: '@ch1pset4x'
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {  
  return (
    <ClerkProvider dynamic={true}>
      <html lang="en" suppressHydrationWarning>
        <head>
          <AdSense publisherId={process.env.NEXT_PUBLIC_GOOGLE_ADS_CLIENT_ID!} />
        </head>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider>
              <ErrorBoundary FallbackComponent={GlobalError}>
                {children}
              </ErrorBoundary>
              <Toaster />
            </TooltipProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}