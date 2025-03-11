import { Metadata } from 'next';
import { Filters } from '@/components/Filters';
import CardModal from '@/components/CardModal';
import { CardModalProvider } from '@/context/CardModalContext';

export const metadata: Metadata = {
  title: 'My Awesome Cards',
};

const Page = async (props: {
}) => {

  return (
    <div className="min-h-screen px-4 pt-2 pb-4">
      <Filters />
      <CardModalProvider>
        <main className="antialiased">
          {/* <DeckCardGrid currentPage={currentPage} /> */}
        </main>
        <CardModal />
      </CardModalProvider>
    </div>
  );
};

export default Page;
