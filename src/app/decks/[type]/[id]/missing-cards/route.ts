import { loadCollectionCardsByName } from '@/actions/deck/load-decks';
import { deckService } from '@/db/services/DeckService';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string; id: string }> }
) {

  try {
    const { type, id } = await params;
    const decks = await deckService.repo.get([id]);
    const deck = decks?.[0] || null;

    if (!deck) {
      return NextResponse.json(
        { error: 'Deck not found' },
        { status: 404 }
      );
    }

    const maindeckCardNames = deck?.maindeck?.map((card) => card.name) || [];
    const maindeckCollectedCards =
      await loadCollectionCardsByName(maindeckCardNames);
    const maindeckCollectedQuantities = Object.values(
      maindeckCollectedCards.reduce<
        Record<string, { name: string; quantity: number }>
      >((acc, card) => {
        acc[card.name] = acc[card.name] || { name: card.name, quantity: 0 };
        acc[card.name].quantity += card.quantity;
        return acc;
      }, {}),
    );
    const sideboardCardNames = deck?.sideboard?.map((card) => card.name) || [];
    const sideboardCollectedCards =
      await loadCollectionCardsByName(sideboardCardNames);
    const sideboardCollectedQuantities = Object.values(
      sideboardCollectedCards.reduce<
        Record<string, { name: string; quantity: number }>
      >((acc, card) => {
        acc[card.name] = acc[card.name] || { name: card.name, quantity: 0 };
        acc[card.name].quantity += card.quantity;
        return acc;
      }, {}),
    );

    // Create a map of collected quantities for quick lookup
    const collectedMap = new Map<string, number>([
      ...maindeckCollectedQuantities.map(c => [c.name, c.quantity] as [string, number]),
      ...sideboardCollectedQuantities.map(c => [c.name, c.quantity] as [string, number])
    ]);

    // Calculate missing cards
    const missingCards = Object.values(
      [
        ...(deck.maindeck || []).map(card => ({
          name: card.name,
          missing: Math.max(0, card.quantity - (collectedMap.get(card.name) || 0))
        })),
        ...(deck.sideboard || []).map(card => ({
          name: card.name,
          missing: Math.max(0, card.quantity - (collectedMap.get(card.name) || 0))
        }))
      ].reduce<Record<string, { name: string; missing: number }>>((acc, card) => {
        acc[card.name] = acc[card.name] || { name: card.name, missing: 0 };
        acc[card.name].missing += card.missing;
        return acc;
      }, {})
    ).filter(card => card.missing > 0);

    // Generate text file content
    const missingCardsText = missingCards
      .map(card => `${card.name} x${card.missing}`)
      .join('\n');

    return new NextResponse(missingCardsText, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="Missing_${deck.name.replace(' ', '_')}.txt"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate missing cards list' },
      { status: 500 }
    );
  }
}
