import { loadWishlistById } from '@/actions/wishlist/load-wishlists';
import { EditWishlistForm } from '@/components/form/EditWishlistForm';
import { notFound } from 'next/navigation';

interface EditWishlistPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditWishlistPage({
  params,
}: EditWishlistPageProps) {
  const { id } = await params;
  const wishlist = await loadWishlistById(id);

  if (!wishlist) {
    notFound();
  }

  return (
    <main className="mx-auto flex max-w-5xl flex-col p-4">
      <h1 className="mb-6 text-2xl font-bold">Edit Wishlist</h1>
      <EditWishlistForm wishlist={wishlist} />
    </main>
  );
}
