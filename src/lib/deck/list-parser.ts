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

const CARD_LINE_REGEX = /^(\d+)\s+([^()]+)(?:\s+\((\w+)\))?\s*?(\d*)?$/;

export function parseDeckList(text: string): DeckList {
  const lines = text.trim().split('\n');
  const deckList: DeckList = { mainDeck: [], sideboard: [] };
  let currentSection: keyof DeckList = 'mainDeck';
  let hasValidCards = false;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine === '') continue;
    if (trimmedLine.toLowerCase() === 'sideboard') {
      currentSection = 'sideboard';
      continue;
    }
    
    try {
      const cardEntry = parseCardLine(trimmedLine);
      deckList[currentSection].push(cardEntry);
      hasValidCards = true;
    } catch {
      // Ignore invalid lines
    }
  }

  if (!hasValidCards) {
    throw new Error(`No valid card lines found. Example invalid line: '${lines[0]?.trim() || 'empty line'}'`);
  }

  return deckList;
}

export function parseCardLine(line: string): ParsedCard {
  const match = line.match(CARD_LINE_REGEX);
  if (!match) {
    throw new Error(`Invalid card line format: '${line}'`);
  }
  const [, count, name, set, setNumber] = match;
  return {
    name: name.trim(),
    set: set?.trim() || '',
    quantity: parseInt(count),
    setNumber: parseInt(setNumber || '0'),
  };
}
