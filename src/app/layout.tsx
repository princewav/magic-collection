import type { Metadata } from 'next/types';
import { Inter } from 'next/font/google';
import './globals.css';
import { CardModalProvider } from '@/context/CardModalContext';
import Navbar from '@/components/Navbar';
import { cn } from '@/lib/utils';

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
    <html lang="en">
      <body className={cn(inter.className, 'dark')}>
        <Navbar />
        <CardModalProvider>{children}</CardModalProvider>
      </body>
    </html>
  );
}
