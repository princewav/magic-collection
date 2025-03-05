"use server";

import { JSONCardRepository } from "@/app/repositories/JSONCardRepository";
import { SQLiteCardRepository } from "@/app/repositories/SQLiteCardRepository";
import { CARD_DATA_PATH } from "@/constants";

export async function populateDatabase() {
  const jsonRepo = new JSONCardRepository();
  const sqliteRepo = new SQLiteCardRepository();

  try {
    const cards = await jsonRepo.getAllCards();

    for (const card of cards) {
      // Check if card already exists before inserting
      const existingCard = await sqliteRepo.getCardById(card.id);
      if (!existingCard) {
        try {
          await sqliteRepo.insertCard(card); // Assuming you have an insertCard method
          // console.log(`Inserted card: ${card.name}`);
        } catch (error: any) {
          if (error.message.includes("UNIQUE constraint failed")) {
            // Log more details about the conflict to help debug
            console.warn(
              `Skipped card ${card.name} (ID: ${card.id}) due to unique constraint violation. Existing card might have the same ID but different properties. Investigate!`
            );

            // Optionally, if you want to update the existing card instead of skipping:
            // console.log(`Attempting to update card: ${card.name}`);
            // try {
            //   await sqliteRepo.updateCard(card); // Assuming you have an updateCard method
            //   console.log(`Updated card: ${card.name}`);
            // } catch (updateError) {
            //   console.error(`Error updating card ${card.name}:`, updateError);
            // }
          } else {
            console.error(`Error inserting card ${card.name}:`, error);
          }
        }
      } else {
        
      }
    }

    console.log("Database population complete.");
  } catch (error) {
    console.error("Error populating database:", error);
    throw error;
  }
}
