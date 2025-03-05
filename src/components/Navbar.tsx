import { Home, Book, ListChecks, Heart } from "lucide-react";
import Link from "next/link";

interface NavbarProps {}

const Navbar: React.FC<NavbarProps> = () => {
  return (
    <nav className="shadow-md p-4">
      <div className="container flex items-center">
        <div className="text-2xl font-bold mr-4">Magic Collection</div>
        <div className="flex space-x-4">
          <Link href="/" className="flex flex-col items-center">
            <Home className="h-5 w-5" />
            <span>Browse</span>
          </Link>
          <Link href="/decks" className="flex flex-col items-center">
            <Book className="h-5 w-5" />
            <span>Decks</span>
          </Link>
          <Link href="/collection" className="flex flex-col items-center">
            <ListChecks className="h-5 w-5" />
            <span>Collection</span>
          </Link>
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
