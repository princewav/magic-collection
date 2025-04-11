export type CardFace = {
  object: string;
  name: string;
  mana_cost: string;
  type_line: string;
  oracle_text: string;
  power?: string;
  toughness?: string;
  artist: string;
  artist_id: string;
  illustration_id?: string;
};

export type Card = {
  id: string;
  cardId: string;
  cardmarket_id: number | null;
  name: string;
  released_at: string;
  scryfall_uri: string;
  layout: string;
  image_uris: {
    small: string;
    normal: string;
    large: string;
    png: string;
    art_crop: string;
    border_crop: string;
  };
  mana_cost: string;
  cmc: number;
  type_line: string;
  oracle_text: string;
  power: string;
  toughness: string;
  colors: string[];
  color_identity: string[];
  keywords: string[];
  legalities: {
    standard: string;
    future: string;
    historic: string;
    timeless: string;
    gladiator: string;
    pioneer: string;
    explorer: string;
    modern: string;
    legacy: string;
    pauper: string;
    vintage: string;
    penny: string;
    commander: string;
    oathbreaker: string;
    standardbrawl: string;
    brawl: string;
    alchemy: string;
    paupercommander: string;
    duel: string;
    oldschool: string;
    premodern: string;
    predh: string;
  };
  set: string;
  set_name: string;
  scryfall_set_uri: string;
  collector_number: string;
  rarity: string;
  flavor_text?: string;
  cardmarket_uri?: string;
  card_faces?: CardFace[];
  prices: {
    eur: string | null;
    eur_foil: string | null;
    tix: string | null;
  };
};

export function extractMtgCardData(sourceObj: unknown & Card): Card {
  // Pick only the properties we need
  const {
    id,
    cardmarket_id,
    name,
    released_at,
    scryfall_uri,
    layout,
    image_uris,
    mana_cost,
    cmc,
    type_line,
    oracle_text,
    power,
    toughness,
    colors,
    color_identity,
    keywords,
    legalities,
    set,
    set_name,
    scryfall_set_uri,
    collector_number,
    rarity,
    flavor_text,
    cardmarket_uri,
    card_faces,
    prices,
  } = sourceObj;

  // Return a new object with just the properties we want
  return {
    id: '',
    cardId: id,
    cardmarket_id,
    name,
    released_at,
    scryfall_uri,
    layout,
    image_uris,
    mana_cost,
    cmc,
    type_line,
    oracle_text,
    power,
    toughness,
    colors,
    color_identity,
    keywords,
    legalities,
    set,
    set_name,
    scryfall_set_uri,
    collector_number,
    rarity,
    prices,
    ...(flavor_text !== undefined && { flavor_text }),
    ...(cardmarket_uri !== undefined && { cardmarket_uri }),
    ...(card_faces !== undefined && { card_faces }),
  };
}

export type CollectionCard = {
  id: string;
  binderName: string;
  binderType: string;
  name: string;
  setCode: string;
  setName: string;
  collectorNumber: string;
  foil: 'normal' | 'foil' | 'etched'; // Expanded for different foil types
  rarity: 'common' | 'uncommon' | 'rare' | 'mythic' | 'special';
  quantity: number;
  manaBoxId: string;
  scryfallId: string;
  purchasePrice: number;
  purchasePriceCurrency: string;
  misprint: boolean;
  altered: boolean;
  condition:
    | 'near_mint'
    | 'lightly_played'
    | 'moderately_played'
    | 'heavily_played'
    | 'damaged';
  language: string; // ISO language code (e.g., "en", "jp", "de")

  // Optional fields you might want to consider
  dateAdded?: Date;
  tags?: string[];
  notes?: string;
  imageUri?: string;
  collectionType: 'paper' | 'arena';
  cardId: string;
};

export type CardWithQuantity = Card & { quantity: number };

export enum Rarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  MYTHIC = 'mythic',
  BONUS = 'bonus',
  SPECIAL = 'special',
}

export const rarityOrder = [
  Rarity.COMMON,
  Rarity.UNCOMMON,
  Rarity.RARE,
  Rarity.MYTHIC,
  Rarity.BONUS,
  Rarity.SPECIAL,
];

export enum Layout {
  NORMAL = 'normal',
  SPLIT = 'split',
  FLIP = 'flip',
  TRANSFORM = 'transform',
  MODAL_DFC = 'modal_dfc',
}
