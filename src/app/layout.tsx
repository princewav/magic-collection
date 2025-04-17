import type { Metadata } from 'next/types';
// import { Inter } from 'next/font/google'; // Remove Inter
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
// const inter = Inter({ subsets: ['latin'] }); // Remove Inter usage

export const metadata: Metadata = {
  title: 'MTG Card Viewer',
  description: 'View MTG Cards',
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
      className={cn(GeistSans.variable, GeistMono.variable)} // Add Geist variables
    >
      <body
        className={cn(
          // inter.className, // Remove Inter className
          'bg-background text-foreground mb-20 min-h-screen md:mb-0',
        )}
      >
        <React.StrictMode>
          <ThemeProvider>
            <CardModalProvider>
              <Navbar />
              {children}
              <CardModal />
              <Toaster />
            </CardModalProvider>
          </ThemeProvider>
        </React.StrictMode>
      </body>
    </html>
  );
}
