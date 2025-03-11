'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Import, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CsvImportButtonProps {
  parseCsv: (data: string, type: string) => Promise<void>;
  collectionType: string;
}

export default function CsvImportButton({ parseCsv, collectionType }: CsvImportButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv') {
      toast.error('Please upload a valid CSV file');
      return;
    }

    setIsLoading(true);

    try {
      const text = await file.text();
      await parseCsv(text, collectionType);
      toast.success('CSV file imported successfully');
    } catch (error) {
      toast.error('Failed to import CSV file');
      console.error(error);
    } finally {
      setIsLoading(false);
      // Reset the input value so the same file can be uploaded again if needed
      event.target.value = '';
    }
  };

  return (
    <>
      <Button onClick={handleButtonClick} disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Import className="mr-2 h-4 w-4" />
        )}
        Import
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileChange}
        disabled={isLoading}
      />
    </>
  );
}
