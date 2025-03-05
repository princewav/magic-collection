import { Card } from "@/app/models/Card";
import { CardRepository } from "@/app/repositories/CardRepository";
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'card.db');

export class SQLiteCardRepository implements CardRepository {
  private db: Database.Database;

  constructor() {
    this.db = new Database(dbPath);
  }

  async getCardById(id: string): Promise<Card | null> {
    try {
      const stmt = this.db.prepare('SELECT * FROM cards WHERE id = ?');
      const row = stmt.get(id) as any;
      if (!row) {
        return null;
      }
      return this.mapRowToCard(row);
    } catch (error) {
      console.error("Error getting card by id from database:", error);
      return null;
    }
  }

  async getAllCards(): Promise<Card[]> {
    try {
      const stmt = this.db.prepare('SELECT * FROM cards');
      const rows = stmt.all() as any[];
      return rows.map(this.mapRowToCard);
    } catch (error) {
      console.error("Error getting all cards from database:", error);
      return [];
    }
  }

  private mapRowToCard(row: any): Card {
    return {
      object: row.object,
      id: row.id,
      oracle_id: row.oracle_id,
      multiverse_ids: JSON.parse(row.multiverse_ids),
      mtgo_id: row.mtgo_id,
      tcgplayer_id: row.tcgplayer_id,
      cardmarket_id: row.cardmarket_id,
      name: row.name,
      lang: row.lang,
      released_at: row.released_at,
      uri: row.uri,
      scryfall_uri: row.scryfall_uri,
      layout: row.layout,
      highres_image: !!row.highres_image,
      image_status: row.image_status,
      image_uris: JSON.parse(row.image_uris),
      mana_cost: row.mana_cost,
      cmc: row.cmc,
      type_line: row.type_line,
      oracle_text: row.oracle_text,
      power: row.power,
      toughness: row.toughness,
      colors: JSON.parse(row.colors),
      color_identity: JSON.parse(row.color_identity),
      keywords: JSON.parse(row.keywords),
      all_parts: JSON.parse(row.all_parts),
      legalities: JSON.parse(row.legalities),
      games: JSON.parse(row.games),
      reserved: !!row.reserved,
      game_changer: !!row.game_changer,
      foil: !!row.foil,
      nonfoil: !!row.nonfoil,
      finishes: JSON.parse(row.finishes),
      oversized: !!row.oversized,
      promo: !!row.promo,
      reprint: !!row.reprint,
      variation: !!row.variation,
      set_id: row.set_id,
      set: row.set,
      set_name: row.set_name,
      set_type: row.set_type,
      set_uri: row.set_uri,
      set_search_uri: row.set_search_uri,
      scryfall_set_uri: row.scryfall_set_uri,
      rulings_uri: row.rulings_uri,
      prints_search_uri: row.prints_search_uri,
      collector_number: row.collector_number,
      digital: !!row.digital,
      rarity: row.rarity,
      watermark: row.watermark,
      flavor_text: row.flavor_text,
      card_back_id: row.card_back_id,
      artist: row.artist,
      artist_ids: JSON.parse(row.artist_ids),
      illustration_id: row.illustration_id,
      border_color: row.border_color,
      frame: row.frame,
      frame_effects: JSON.parse(row.frame_effects),
      security_stamp: row.security_stamp,
      full_art: !!row.full_art,
      textless: !!row.textless,
      booster: !!row.booster,
      story_spotlight: !!row.story_spotlight,
      edhrec_rank: row.edhrec_rank,
      preview: JSON.parse(row.preview),
      prices: JSON.parse(row.prices),
      related_uris: JSON.parse(row.related_uris),
      purchase_uris: JSON.parse(row.purchase_uris),
    };
  }
}
