export type Card = {
  object: string;
  id: string;
  oracle_id: string;
  multiverse_ids: number[];
  mtgo_id: number;
  tcgplayer_id: number;
  cardmarket_id: number;
  name: string;
  lang: string;
  released_at: string;
  uri: string;
  scryfall_uri: string;
  layout: string;
  highres_image: boolean;
  image_status: string;
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
  all_parts: any[];
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
  games: string[];
  reserved: boolean;
  game_changer: boolean;
  foil: boolean;
  nonfoil: boolean;
  finishes: string[];
  oversized: boolean;
  promo: boolean;
  reprint: boolean;
  variation: boolean;
  set_id: string;
  set: string;
  set_name: string;
  set_type: string;
  set_uri: string;
  set_search_uri: string;
  scryfall_set_uri: string;
  rulings_uri: string;
  prints_search_uri: string;
  collector_number: string;
  digital: boolean;
  rarity: string;
  watermark: string;
  flavor_text?: string;
  card_back_id: string;
  artist: string;
  artist_ids: string[];
  illustration_id: string;
  border_color: string;
  frame: string;
  frame_effects: string[];
  security_stamp: string;
  full_art: boolean;
  textless: boolean;
  booster: boolean;
  story_spotlight: boolean;
  edhrec_rank: number;
  preview: {
    source: string;
    source_uri: string;
    previewed_at: string;
  };
  prices: {
    usd: string;
    usd_foil: string;
    usd_etched: string;
    eur: string;
    eur_foil: string;
    tix: string;
  };
  related_uris: {
    gatherer: string;
    tcgplayer_infinite_articles: string;
    tcgplayer_infinite_decks: string;
    edhrec: string;
  };
  purchase_uris: {
    tcgplayer: string;
    cardmarket: string;
    cardhoarder: string;
  };
  cardmarket_uri?: string;
};

export function extractMtgCardData(sourceObj: unknown & Card): Card {
  // Pick only the properties we need
  const {
    object,
    id,
    oracle_id,
    multiverse_ids,
    mtgo_id,
    tcgplayer_id,
    cardmarket_id,
    name,
    lang,
    released_at,
    uri,
    scryfall_uri,
    layout,
    highres_image,
    image_status,
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
    all_parts,
    legalities,
    games,
    reserved,
    game_changer,
    foil,
    nonfoil,
    finishes,
    oversized,
    promo,
    reprint,
    variation,
    set_id,
    set,
    set_name,
    set_type,
    set_uri,
    set_search_uri,
    scryfall_set_uri,
    rulings_uri,
    prints_search_uri,
    collector_number,
    digital,
    rarity,
    watermark,
    flavor_text,
    card_back_id,
    artist,
    artist_ids,
    illustration_id,
    border_color,
    frame,
    frame_effects,
    security_stamp,
    full_art,
    textless,
    booster,
    story_spotlight,
    edhrec_rank,
    preview,
    prices,
    related_uris,
    purchase_uris,
    cardmarket_uri,
  } = sourceObj;

  // Return a new object with just the properties we want
  return {
    object,
    id,
    oracle_id,
    multiverse_ids,
    mtgo_id,
    tcgplayer_id,
    cardmarket_id,
    name,
    lang,
    released_at,
    uri,
    scryfall_uri,
    layout,
    highres_image,
    image_status,
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
    all_parts,
    legalities,
    games,
    reserved,
    game_changer,
    foil,
    nonfoil,
    finishes,
    oversized,
    promo,
    reprint,
    variation,
    set_id,
    set,
    set_name,
    set_type,
    set_uri,
    set_search_uri,
    scryfall_set_uri,
    rulings_uri,
    prints_search_uri,
    collector_number,
    digital,
    rarity,
    watermark,
    ...(flavor_text !== undefined && { flavor_text }),
    card_back_id,
    artist,
    artist_ids,
    illustration_id,
    border_color,
    frame,
    frame_effects,
    security_stamp,
    full_art,
    textless,
    booster,
    story_spotlight,
    edhrec_rank,
    preview,
    prices,
    related_uris,
    purchase_uris,
    ...(cardmarket_uri !== undefined && { cardmarket_uri }),
  };
}
