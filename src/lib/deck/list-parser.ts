export interface ParsedCard {
  name: string;
  set: string;
  quantity: number;
  setNumber: number;
}

export interface DeckList {
  mainDeck: ParsedCard[];
  sideboard: ParsedCard[];
}

export function parseDeckList(text: string): DeckList {
  console.log(text);
  const lines = text.trim().split('\n');
  const deckList: DeckList = { mainDeck: [], sideboard: [] };
  let currentSection: keyof DeckList = 'mainDeck';

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine === '') continue;
    if (trimmedLine.toLowerCase() === 'sideboard') {
      currentSection = 'sideboard';
      continue;
    }
    const match = trimmedLine.match(/^(\d+)\s+([^()]+)\s+\((\w+)\)\s*(\d*)$/);
    if (match) {
      const [, count, name, set, setNumber] = match;
      deckList[currentSection].push({
        name: name.trim(),
        set: set.trim(),
        quantity: parseInt(count),
        setNumber: parseInt(setNumber || '0'),
      });
    }
  }

  return deckList;
}
