import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Collection',
  description: 'View your card collection.',
};

export default async function CollectionPage() {
  return (
    <main className="flex flex-col p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">My Collection</h1>
      </div>
      {/* <CardGrid cardIds={[]} /> */}
    </main>
  );
}
