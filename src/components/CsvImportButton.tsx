'use client'

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Import } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { parseCSV } from '@/actions/parse-csv';

export default function CsvImportButton() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    try {
      const file = event.target.files?.[0];
      if (file && file.type === 'text/csv') {
        const formData = new FormData();
        formData.append('file', file);
        await parseCSV(formData);
      } else {
        alert('Please upload a valid CSV file.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Import className="mr-2 h-4 w-4" />
        )}
        Import
      </Button>
      <input ref={fileInputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFileUpload} />
    </>
  );
}
