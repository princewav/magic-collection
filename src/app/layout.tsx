import type { Metadata } from 'next/types';
import { Inter } from 'next/font/google';
import './globals.css';
import { CardModalProvider } from '@/context/CardModalContext';
import Navbar from '@/components/navbar/Navbar';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

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
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          inter.className,
          'bg-background text-foreground min-h-screen',
        )}
      >
        <ThemeProvider>
          <Navbar />
          <CardModalProvider>{children}</CardModalProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
