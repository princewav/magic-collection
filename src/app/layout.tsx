import type { Metadata } from 'next/types';
// import { Inter } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { CardModalProvider } from '@/context/CardModalContext';
import Navbar from '@/components/navbar/Navbar';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import React from 'react';
import CardModal from '@/components/card-modal/CardModal';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { SettingsProvider } from '@/context/SettingsContext';
import MobileNavbar from '@/components/navbar/MobileNavbar';

// const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Magic Collection',
  description: 'Manage your Magic: The Gathering collection',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(GeistSans.variable, GeistMono.variable)}
    >
      <body
        className={cn(
          // inter.className,
          'bg-background text-foreground mb-20 min-h-screen md:mb-0',
        )}
      >
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SettingsProvider>
              <CardModalProvider>
                <header className="sticky top-0 z-40 w-full border-b">
                  <Navbar />
                </header>

                {/* Mobile Navigation */}
                <MobileNavbar />
                {children}
                <CardModal />
                <Toaster />
              </CardModalProvider>
            </SettingsProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
