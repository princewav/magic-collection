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

  async insertCard(card: Card): Promise<void> {
    try {
      const insert = this.db.prepare(`
        INSERT INTO cards (
          id, oracle_id, name, lang, released_at, uri, scryfall_uri, layout, highres_image, image_status,
          mana_cost, cmc, type_line, oracle_text, power, toughness, colors, color_identity, keywords, legalities,
          games, reserved, game_changer, foil, nonfoil, finishes, oversized, promo, reprint, variation, set_id, set, set_name,
          set_type, collector_number, digital, rarity, watermark, flavor_text, card_back_id, artist, artist_ids, illustration_id, border_color, frame, frame_effects, security_stamp, full_art, textless, booster, story_spotlight, edhrec_rank, preview, prices, related_uris, purchase_uris
        ) VALUES (
          @id, @oracle_id, @name, @lang, @released_at, @uri, @scryfall_uri, @layout, @highres_image, @image_status,
          @mana_cost, @cmc, @type_line, @oracle_text, @power, @toughness, @colors, @color_identity, @keywords, @legalities,
          @games, @reserved, @game_changer, @foil, @nonfoil, @finishes, @oversized, @promo, @reprint, @variation, @set_id, @set, @set_name,
          @set_type, @collector_number, @digital, @rarity, @watermark, @flavor_text, @card_back_id, @artist, @artist_ids, @illustration_id, @border_color, @frame, @frame_effects, @security_stamp, @full_art, @textless, @booster, @story_spotlight, @edhrec_rank, @preview, @prices, @related_uris, @purchase_uris
        )
      `);

      insert.run({
        id: card.id,
        oracle_id: card.oracle_id,
        name: card.name,
        lang: card.lang,
        released_at: card.released_at,
        uri: card.uri,
        scryfall_uri: card.scryfall_uri,
        layout: card.layout,
        highres_image: card.highres_image ? 1 : 0,
        image_status: card.image_status,
        mana_cost: card.mana_cost,
        cmc: card.cmc,
        type_line: card.type_line,
        oracle_text: card.oracle_text,
        power: card.power,
        toughness: card.toughness,
        colors: JSON.stringify(card.colors),
        color_identity: JSON.stringify(card.color_identity),
        keywords: JSON.stringify(card.keywords),
        legalities: JSON.stringify(card.legalities),
        games: JSON.stringify(card.games),
        reserved: card.reserved ? 1 : 0,
        game_changer: card.game_changer ? 1 : 0,
        foil: card.foil ? 1 : 0,
        nonfoil: card.nonfoil ? 1 : 0,
        finishes: JSON.stringify(card.finishes),
        oversized: card.oversized ? 1 : 0,
        promo: card.promo ? 1 : 0,
        reprint: card.reprint ? 1 : 0,
        variation: card.variation ? 1 : 0,
        set_id: card.set_id,
        set: card.set,
        set_name: card.set_name,
        set_type: card.set_type,
        collector_number: card.collector_number,
        digital: card.digital ? 1 : 0,
        rarity: card.rarity,
        watermark: card.watermark,
        flavor_text: card.flavor_text,
        card_back_id: card.card_back_id,
        artist: card.artist,
        artist_ids: JSON.stringify(card.artist_ids),
        illustration_id: card.illustration_id,
        border_color: card.border_color,
        frame: card.frame,
        frame_effects: JSON.stringify(card.frame_effects),
        security_stamp: card.security_stamp,
        full_art: card.full_art ? 1 : 0,
        textless: card.textless ? 1 : 0,
        booster: card.booster ? 1 : 0,
        story_spotlight: card.story_spotlight ? 1 : 0,
        edhrec_rank: card.edhrec_rank,
        preview: JSON.stringify(card.preview),
        prices: JSON.stringify(card.prices),
        related_uris: JSON.stringify(card.related_uris),
        purchase_uris: JSON.stringify(card.purchase_uris),
      });
    } catch (error) {
      console.error("Error inserting card into database:", error);
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
