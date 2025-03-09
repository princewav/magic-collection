export type Card = {
  type: string;
  id: string;
  cardmarket_id: number;
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
};

export function extractMtgCardData(sourceObj: unknown & Card): Card {
  // Pick only the properties we need
  const {
    type,
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
  } = sourceObj;

  // Return a new object with just the properties we want
  return {
    type,
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
    ...(flavor_text !== undefined && { flavor_text }),
    ...(cardmarket_uri !== undefined && { cardmarket_uri }),
  };
}
