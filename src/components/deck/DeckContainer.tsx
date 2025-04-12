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
import { useState } from 'react';

interface DeckContainerProps {
  deck: any;
  maindeckOwned: any[];
  sideboardOwned: any[];
  type: 'paper' | 'arena';
}

export function DeckContainer({
  deck,
  maindeckOwned,
  sideboardOwned,
  type,
}: DeckContainerProps) {
  const [isGridView, setIsGridView] = useState(true);
  const [activeTab, setActiveTab] = useState('maindeck');

  const maindeckQuantity = deck.maindeck.map((card: any) => card.quantity).reduce((a: number, b: number) => a + b, 0);
  const sideboardQuantity = deck.sideboard.map((card: any) => card.quantity).reduce((a: number, b: number) => a + b, 0);

  const toggleLayout = () => {
    setIsGridView(!isGridView);
    // Optional: Add localStorage persistence here if needed
    // const newLayout = !isGridView;
    // localStorage.setItem(`deckLayout-global`, newLayout ? 'grid' : 'list');
  };

  // Optional: Load layout preference from localStorage
  // useEffect(() => {
  //   const savedLayout = localStorage.getItem('deckLayout-global');
  //   if (savedLayout) {
  //     setIsGridView(savedLayout === 'grid');
  //   }
  // }, []);

  return (
    <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-[theme(spacing.16)_1fr_theme(spacing.16)]">
      <div className="hidden md:flex md:flex-col md:items-center md:justify-start md:pt-4">
        <Link
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
          <span className="text-muted-foreground text-xs">To decks</span>
        </Link>
      </div>

      <div className="container mx-auto">
        <div className="flex justify-start md:hidden">
          <Link
            href={`/decks/${type}`}
            className="flex items-center justify-center gap-1"
          >
            <Button variant="outline" size="sm" className="mb-2 gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-muted-foreground text-xs">
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
            <div className="mb-2 flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="maindeck">Main Deck</TabsTrigger>
                <TabsTrigger value="sideboard">Sideboard</TabsTrigger>
              </TabsList>
              <h2 className="font-semibold text-lg">
                {activeTab === 'maindeck' ? 'Main Deck' : 'Sideboard'} (
                {activeTab === 'maindeck'
                  ? maindeckQuantity
                  : sideboardQuantity}{' '}
                cards)
              </h2>
              <Button
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

      <div className="hidden md:block"></div>
    </div>
  );
}
