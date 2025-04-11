# Active Context

## Current Focus

Implementing and testing wishlist creation from missing cards feature, relying on the newly refactored missing cards logic.

## Recent Changes

- Added server action for creating wishlists from missing cards
- Updated MissingCardsModal to include wishlist creation button
- Added proper error handling and user feedback
- **Refactored `getMissingCards` action (`src/actions/deck/missing-cards.ts`):**
  - Now correctly calculates missing quantities for cards the user doesn't own at all.
  - Fetches full `Card` details for all missing cards using a new action.
  - Removed placeholder logic for unowned cards.
- **Added `getCardsByNames` method to `CardService` (`src/db/services/CardService.ts`):**
  - Fetches full `Card` details from the main database based on a list of names, prioritizing the latest printing.
- **Added `loadCardDetailsByNames` server action (`src/actions/load-cards.ts`):**
  - Exposes the `getCardsByNames` service method as a server action.

## Next Steps

- Test the refactored `getMissingCards` logic thoroughly.
- Test the wishlist creation feature (which depends on `getMissingCards`).
- Ensure proper error handling
- Verify wishlist creation works as expected
- Check UI responsiveness

## Active Decisions

- Using deck's image and colors for the created wishlist
- Naming wishlists as "Missing - {deckName}"
- Maintaining card quantities from missing cards
- Redirecting to wishlists page after creation
