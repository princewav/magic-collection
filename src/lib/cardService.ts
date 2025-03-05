'use server'

import { Card } from "@/app/models/Card";
import { promises as fs } from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

const dbPath = path.join(process.cwd(), 'data', 'card.db');

async function initializeDatabase(filePath: string) {
  const db = new Database(dbPath);

  // Check if the cards table exists
  const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='cards';").get();

  if (!tableCheck) {
    console.log("Creating cards table");
    // Create the cards table
    db.prepare(`
      CREATE TABLE cards (
        id TEXT PRIMARY KEY,
        oracle_id TEXT,
        name TEXT,
        lang TEXT,
        released_at TEXT,
        uri TEXT,
        scryfall_uri TEXT,
        layout TEXT,
        highres_image INTEGER,
        image_status TEXT,
        mana_cost TEXT,
        cmc REAL,
        type_line TEXT,
        oracle_text TEXT,
        power TEXT,
        toughness TEXT,
        colors TEXT,
        color_identity TEXT,
        keywords TEXT,
        legalities TEXT,
        games TEXT,
        reserved INTEGER,
        game_changer INTEGER,
        foil INTEGER,
        nonfoil INTEGER,
        finishes TEXT,
        oversized INTEGER,
        promo INTEGER,
        reprint INTEGER,
        variation INTEGER,
        set_id TEXT,
        set_code TEXT,
        set_name TEXT,
        set_type TEXT,
        collector_number TEXT,
        digital INTEGER,
        rarity TEXT,
        watermark TEXT,
        flavor_text TEXT,
        card_back_id TEXT,
        artist TEXT,
        artist_ids TEXT,
        illustration_id TEXT,
        border_color TEXT,
        frame TEXT,
        frame_effects TEXT,
        security_stamp TEXT,
        full_art INTEGER,
        textless INTEGER,
        booster INTEGER,
        story_spotlight INTEGER,
        edhrec_rank INTEGER,
        preview TEXT,
        prices TEXT,
        related_uris TEXT,
        purchase_uris TEXT
      )
    `).run();

    // Load data from JSON and insert into the database
    const data = await fs.readFile(filePath, 'utf-8');
    const cards: Card[] = JSON.parse(data);

    const insert = db.prepare(`
      INSERT INTO cards (
        id, oracle_id, name, lang, released_at, uri, scryfall_uri, layout, highres_image, image_status,
        mana_cost, cmc, type_line, oracle_text, power, toughness, colors, color_identity, keywords, legalities,
        games, reserved, game_changer, foil, nonfoil, finishes, oversized, promo, reprint, variation, set_id, set_code, set_name,
        set_type, collector_number, digital, rarity, watermark, flavor_text, card_back_id, artist, artist_ids, illustration_id, border_color, frame, frame_effects, security_stamp, full_art, textless, booster, story_spotlight, edhrec_rank, preview, prices, related_uris, purchase_uris
      ) VALUES (
        @id, @oracle_id, @name, @lang, @released_at, @uri, @scryfall_uri, @layout, @highres_image, @image_status,
        @mana_cost, @cmc, @type_line, @oracle_text, @power, @toughness, @colors, @color_identity, @keywords, @legalities,
        @games, @reserved, @game_changer, @foil, @nonfoil, @finishes, @oversized, @promo, @reprint, @variation, @set_id, @set_code, @set_name,
        @set_type, @collector_number, @digital, @rarity, @watermark, @flavor_text, @card_back_id, @artist, @artist_ids, @illustration_id, @border_color, @frame, frame_effects, @security_stamp, @full_art, @textless, @booster, @story_spotlight, @edhrec_rank, @preview, @prices, @related_uris, @purchase_uris
      )
    `);

    const transaction = db.transaction((cards: Card[]) => {
      for (const card of cards) {
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
          set_code: card.set,
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
      }
    });

    transaction(cards);
    console.log("Cards table populated");
  } else {
    console.log("Cards table already exists");
  }

  db.close();
}

// add a func to load cards from a json in CARD_DATA_PATH ai!

export async function loadCardsData(filePath: string): Promise<Card[]> {
  try {
    await initializeDatabase(filePath);

    const db = new Database(dbPath);
    const stmt = db.prepare('SELECT * FROM cards');
    const rows = stmt.all() as any[];
     const cards: Card[] = rows.map(row => ({
            ...row,
            highres_image: !!row.highres_image,
            reserved: !!row.reserved,
            game_changer: !!row.game_changer,
            foil: !!row.foil,
            nonfoil: !!row.nonfoil,
            oversized: !!row.oversized,
            promo: !!row.promo,
            reprint: !!row.reprint,
            variation: !!row.variation,
            digital: !!row.digital,
            full_art: !!row.full_art,
            textless: !!row.textless,
            booster: !!row.booster,
            story_spotlight: !!row.story_spotlight,
            colors: JSON.parse(row.colors),
            color_identity: JSON.parse(row.color_identity),
            keywords: JSON.parse(row.keywords),
            legalities: JSON.parse(row.legalities),
            games: JSON.parse(row.games),
            finishes: JSON.parse(row.finishes),
            preview: JSON.parse(row.preview),
            prices: JSON.parse(row.prices),
            related_uris: JSON.parse(row.related_uris),
            purchase_uris: JSON.parse(row.purchase_uris),
            artist_ids: JSON.parse(row.artist_ids),
            frame_effects: JSON.parse(row.frame_effects),
        }));
    db.close();
    return cards;
  } catch (error) {
    console.error("Error loading cards from database:", error);
    return [];
  }
}

export async function loadCardsDataJSON(filePath: string): Promise<Card[]> {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    const cards: Card[] = JSON.parse(data);
    return cards;
  } catch (error) {
    console.error("Error loading cards from JSON:", error);
    return [];
  }
}
