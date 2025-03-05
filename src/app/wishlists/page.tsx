import CardGrid from "@/components/CardGrid";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "View cards in your wishlist.",
};

export default async function WishlistPage() {
  return (
    <main className="flex flex-col p-4">
      
      <div className="flex items-center justify-between">
      <h1 className="text-4xl font-bold">My Wishlist</h1>
      </div>
      <CardGrid cardIds={[]} />
    </main>
  );
}
