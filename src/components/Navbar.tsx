'use client';

import { Home, Book, ListChecks, Heart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface NavbarProps {}

const Navbar: React.FC<NavbarProps> = () => {
  return (
    <nav className="p-4 shadow-md">
      <div className="container flex items-center">
        <div className="mr-4 text-2xl font-bold">Magic Collection</div>
        <div className="flex space-x-4">
          <Link href="/" className="flex flex-col items-center">
            <Home className="h-5 w-5" />
            <span>Browse</span>
          </Link>
          <Link href="/decks" className="flex flex-col items-center">
            <Book className="h-5 w-5" />
            <span>Decks</span>
          </Link>
          <div className="group relative flex items-center">
            <Link href="/collection" className="flex flex-col items-center">
              <ListChecks className="h-5 w-5" />
              <span>Collection</span>
            </Link>
            <div className="relative ml-3 flex max-w-0 items-center space-x-2 overflow-hidden opacity-0 transition-all duration-300 group-hover:max-w-full group-hover:opacity-100">
              <Link
                href="/paper"
                className="flex flex-col items-center justify-between"
              >
                <Image
                  src="/images/card-w.png"
                  alt="Paper"
                  width={20}
                  height={20}
                />
                <span className="text-xs">Paper</span>
              </Link>
              <Link
                href="/arena"
                className="flex flex-col items-center justify-between"
              >
                <Image
                  src="/images/arena-w.png"
                  alt="Arena"
                  width={25}
                  height={20}
                />
                <span className="text-xs">Arena</span>
              </Link>
            </div>
          </div>
          <Link href="/wishlists" className="flex flex-col items-center">
            <Heart className="h-5 w-5" />
            <span>Wishlists</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
