import { Metadata } from 'next';
import { capitalize } from '@/lib/utils';
import CsvImportButton from '@/components/CsvImportButton';
import { parseCSVandInsert } from '@/actions/parse-csv';

export const metadata: Metadata = {
  title: 'Collection',
  description: 'View your card collection.',
};

type Props = {
  params: Promise<{
    type: string;
  }>;
};

export default async function CollectionPage({ params }: Props) {
  const { type } = await params;

  return (
    <main className="flex flex-col p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">{capitalize(type)} collection</h1>
        <CsvImportButton parseCsv={parseCSVandInsert} />
      </div>
      {/* <CardGrid cardIds={[]} /> */}
    </main>
  );
}
