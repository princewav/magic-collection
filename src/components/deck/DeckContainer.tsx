'use client';

import { DeckCardGrid } from '@/components/deck/DeckCardGrid';
import { DeckInfo } from '@/components/deck/DeckInfo';
import { Separator } from '@/components/ui/separator';
import { CardModalProvider } from '@/context/CardModalContext';
import CardModal from '@/components/card-modal/CardModal';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, List, Grid2X2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface DeckContainerProps {
  deck: any;
  maindeckOwned: any[];
  sideboardOwned: any[];
  type: 'paper' | 'arena';
  validationErrors: string[];
}

export function DeckContainer({
  deck,
  maindeckOwned,
  sideboardOwned,
  type,
  validationErrors,
}: DeckContainerProps) {
  const [isGridView, setIsGridView] = useState(true);
  const [activeTab, setActiveTab] = useState('maindeck');

  const maindeckQuantity = deck.maindeck
    .map((card: any) => card.quantity)
    .reduce((a: number, b: number) => a + b, 0);
  const sideboardQuantity = deck.sideboard
    .map((card: any) => card.quantity)
    .reduce((a: number, b: number) => a + b, 0);

  const toggleLayout = () => {
    setIsGridView((prev) => {
      const newLayout = !prev;
      // Save the new layout preference to localStorage
      localStorage.setItem('deckViewLayout', newLayout ? 'grid' : 'list');
      return newLayout;
    });
  };

  // Load layout preference from localStorage on initial mount
  useEffect(() => {
    const savedLayout = localStorage.getItem('deckViewLayout');
    // Only set state if a value was found in localStorage
    if (savedLayout !== null) {
      setIsGridView(savedLayout === 'grid');
    }
    // If no value is found, it defaults to the useState initial value (true/grid)
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div
      data-role="deck-container-layout"
      className="grid grid-cols-1 gap-4 p-4 md:grid-cols-[theme(spacing.16)_1fr_theme(spacing.16)]"
    >
      <div
        data-role="back-link-desktop-container"
        className="hidden md:flex md:flex-col md:items-center md:justify-start md:pt-4"
      >
        <Link
          data-role="back-link-desktop"
          href={`/decks/${type}`}
          className="flex flex-col items-center justify-center gap-1"
        >
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 gap-2 rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span
            data-role="back-link-text-desktop"
            className="text-muted-foreground text-xs"
          >
            To decks
          </span>
        </Link>
      </div>

      <div data-role="main-content-area" className="container mx-auto">
        {validationErrors && validationErrors.length > 0 && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Deck Illegality Detected</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        <div
          data-role="back-link-mobile-container"
          className="flex justify-start md:hidden"
        >
          <Link
            data-role="back-link-mobile"
            href={`/decks/${type}`}
            className="flex items-center justify-center gap-1"
          >
            <Button variant="outline" size="sm" className="mb-2 gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span
                data-role="back-link-text-mobile"
                className="text-muted-foreground text-xs"
              >
                To {type} decks
              </span>
            </Button>
          </Link>
        </div>
        <CardModalProvider>
          <DeckInfo deck={deck} />
          <Tabs
            defaultValue="maindeck"
            value={activeTab}
            onValueChange={setActiveTab}
            className="mt-4"
          >
            <div
              data-role="tabs-header"
              className="mb-2 flex items-center justify-between"
            >
              <TabsList>
                <TabsTrigger value="maindeck">Main Deck</TabsTrigger>
                <TabsTrigger value="sideboard">Sideboard</TabsTrigger>
              </TabsList>
              <p
                data-role="tab-title-with-count"
                className="flex flex-col items-center justify-center font-semibold capitalize md:flex-row md:items-baseline md:gap-2 md:text-lg"
              >
                <span data-role="tab-title">
                  {activeTab === 'maindeck' ? 'Main Deck' : 'Sideboard'}
                </span>
                <span
                  data-role="tab-count"
                  className="text-muted-foreground text-sm"
                >
                  (
                  {activeTab === 'maindeck'
                    ? maindeckQuantity
                    : sideboardQuantity}
                  {' cards'})
                </span>
              </p>
              <Button
                data-role="layout-toggle-button"
                variant="outline"
                size="icon"
                onClick={toggleLayout}
                className="h-8 w-8"
                title={
                  isGridView ? 'Switch to list view' : 'Switch to grid view'
                }
              >
                {isGridView ? (
                  <List className="h-4 w-4" />
                ) : (
                  <Grid2X2 className="h-4 w-4" />
                )}
              </Button>
            </div>
            <TabsContent value="maindeck">
              <DeckCardGrid
                decklist={deck.maindeck}
                collectedCards={maindeckOwned}
                type={type}
                board="maindeck"
                isGridView={isGridView}
              />
            </TabsContent>
            <TabsContent value="sideboard">
              <DeckCardGrid
                decklist={deck.sideboard}
                collectedCards={sideboardOwned}
                type={type}
                board="sideboard"
                isGridView={isGridView}
              />
            </TabsContent>
          </Tabs>
          <CardModal />
        </CardModalProvider>
      </div>

      <div data-role="spacer-right" className="hidden md:block"></div>
    </div>
  );
}
