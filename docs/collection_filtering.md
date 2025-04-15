# Technical Design Document: Collection Card Display & Filtering (Aggregation Only)

**Version:** 1.0
**Date:** 2023-10-27

**1. Overview**

This document outlines the technical approach for implementing a feature to display a user's collection of `CollectionCard` documents stored in MongoDB. The feature must support filtering based on criteria present in both the `CollectionCard` documents themselves and related `Card` documents (e.g., `colors`, `cmc`, `rarity`). The design prioritizes performing this efficiently on the database server using MongoDB's aggregation framework and avoids data duplication.

**2. Data Models**

We have two primary MongoDB collections involved:

*   **`cards`**: Contains detailed static information about individual Magic: The Gathering cards, sourced potentially from Scryfall. Key fields for filtering include `cardId`, `colors`, `cmc`, `rarity`, `name`, `set_name`.
    ```typescript
    // Relevant fields from Card type
    type Card = {
      id: string; // MongoDB _id
      cardId: string; // Scryfall ID (Unique identifier for card print)
      name: string;
      cmc: number;
      colors: string[]; // e.g., ['W', 'U']
      rarity: string; // e.g., 'common', 'rare'
      // ... other fields
    };
    ```
*   **`collectionCards`**: Represents cards owned by users in their collection. Contains quantity, condition, foil status, etc., and references the specific card print via `cardId`.
    ```typescript
    // Relevant fields from CollectionCard type
    type CollectionCard = {
      id: string; // MongoDB _id
      cardId: string; // Reference to Card.cardId
      quantity: number;
      foil: 'normal' | 'foil' | 'etched';
      rarity: 'common' | 'uncommon' | 'rare' | 'mythic' | 'special'; // Note: Rarity also exists here, could be used for pre-filtering
      // ... other user-specific fields (binderName, condition, etc.)
    };
    ```

**3. Core Problem: Cross-Collection Filtering**

The primary challenge is filtering `collectionCards` based on attributes (`colors`, `cmc`, `rarity`) that exist only within the corresponding `cards` documents. Performing this efficiently without duplicating card data into the collection is essential.

**4. Solution: MongoDB Aggregation Pipeline with `$lookup`**

The recommended solution is to use MongoDB's aggregation framework, specifically the `$lookup` stage, to perform a server-side join between `collectionCards` and `cards` at query time. This allows filtering and shaping of the data directly within the database before returning it to the application.

**4.1. Aggregation Pipeline Stages**

The pipeline will be dynamically constructed based on user-provided filters and pagination parameters:

1.  **`$match` (Optional, Pre-lookup):**
    *   **Purpose:** Filter `collectionCards` based on criteria *intrinsic* to the `CollectionCard` document *before* the join. This reduces the number of documents entering the more expensive `$lookup` stage.
    *   **Examples:** Filter by `binderName`, `foil`, `condition`, `quantity: { $gt: 0 }`.
    *   **Implementation:** Add this stage only if relevant `collectionCards` filters are provided.

2.  **`$lookup`:**
    *   **Purpose:** Perform a left outer join from `collectionCards` to the `cards` collection.
    *   **Implementation:**
        ```javascript
        {
          $lookup: {
            from: "cards",             // Target collection to join with
            localField: "cardId",      // Field from collectionCards
            foreignField: "cardId",    // Field from cards (ensure this matches Card.cardId)
            as: "cardDetails"        // Name of the new array field containing matched card(s)
          }
        }
        ```

3.  **`$unwind`:**
    *   **Purpose:** Deconstruct the `cardDetails` array created by `$lookup`. Since `cardId` should uniquely identify a card print, this array will contain zero or one element. `$unwind` promotes the single nested `Card` document into the main document structure for easier access.
    *   **Implementation:**
        ```javascript
        {
          $unwind: {
            path: "$cardDetails",
            // Set to true ONLY if you want to keep collectionCards even if the
            // corresponding card is somehow missing from the 'cards' collection.
            // Generally, this should be false for data integrity.
            preserveNullAndEmptyArrays: false
          }
        }
        ```

4.  **`$match` (Post-lookup):**
    *   **Purpose:** Filter the results based on criteria from the joined `cardDetails` (the original `Card` data).
    *   **Examples:** Filter by `cardDetails.colors`, `cardDetails.cmc`, `cardDetails.rarity`.
    *   **Implementation:**
        ```javascript
        // Example: Filtering for White OR Blue cards (using $in)
        // { $match: { 'cardDetails.colors': { $in: ['W', 'U'] } } }

        // Example: Filtering for cards containing BOTH White AND Blue (using $all)
        // { $match: { 'cardDetails.colors': { $all: ['W', 'U'] } } }

        // Example: Filtering for CMC less than or equal to 3
        // { $match: { 'cardDetails.cmc': { $lte: 3 } } }

        // Example: Filtering for specific rarity
        // { $match: { 'cardDetails.rarity': 'rare' } }
        ```
        *Combine multiple conditions within a single `$match` stage using implicit AND.*

5.  **`$sort`:**
    *   **Purpose:** Order the results consistently. Essential for reliable pagination/infinite scrolling.
    *   **Implementation:** Sort by fields from either the original `collectionCards` or the joined `cardDetails`. Common sorts might include `cardDetails.name`, `cardDetails.cmc`, `cardDetails.released_at`, `quantity`.
        ```javascript
        { $sort: { 'cardDetails.name': 1, 'cardDetails.cmc': 1 } } // Example sort
        ```

6.  **`$skip`:**
    *   **Purpose:** Skip a specified number of documents. Used for pagination.
    *   **Implementation:** `(pageNumber - 1) * itemsPerPage`.
        ```javascript
        { $skip: 0 } // For page 1 (assuming 50 items per page)
        { $skip: 50 } // For page 2
        ```

7.  **`$limit`:**
    *   **Purpose:** Limit the number of documents returned per page/request.
    *   **Implementation:** Set to `itemsPerPage`.
        ```javascript
        { $limit: 50 } // Example limit
        ```

8.  **`$project` (Optional):**
    *   **Purpose:** Reshape the output documents. Select only necessary fields, rename fields for clarity in the API response, or combine fields.
    *   **Implementation:** Explicitly include desired fields.
        ```javascript
        {
          $project: {
            _id: 0, // Exclude MongoDB default _id
            collectionId: "$_id", // Keep original collectionCard _id
            quantity: 1,
            foil: 1,
            condition: 1,
            // Fields from joined card data
            cardName: "$cardDetails.name",
            cmc: "$cardDetails.cmc",
            colors: "$cardDetails.colors",
            rarity: "$cardDetails.rarity",
            setName: "$cardDetails.set_name",
            imageUrl: "$cardDetails.image_uris.normal",
            //... include other needed fields
          }
        }
        ```

**4.2. Indexing Strategy**

Proper indexing is CRITICAL for the performance of this aggregation pipeline. Ensure the following indexes exist:

*   **`collectionCards` Collection:**
    *   `{ cardId: 1 }`: Essential for the `$lookup`'s `localField`.
    *   Indexes on any fields used in the *pre-lookup* `$match` stage (e.g., `{ binderName: 1 }`, `{ foil: 1 }`).
*   **`cards` Collection:**
    *   `{ cardId: 1 }`: Essential for the `$lookup`'s `foreignField`. Must be unique if `cardId` truly represents a unique card print.
    *   Indexes on any fields used in the *post-lookup* `$match` stage (e.g., `{ colors: 1 }`, `{ cmc: 1 }`, `{ rarity: 1 }`).
    *   Indexes on any fields used in the `$sort` stage (e.g., `{ name: 1 }`, `{ cmc: 1 }`). Compound indexes might be beneficial if sorting on multiple fields frequently (e.g., `{ name: 1, cmc: 1 }`).

**5. API Endpoint Design Example**

```
GET /api/v1/collection/cards

Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 50)
  - sort: string (e.g., "name_asc", "cmc_desc", default: "name_asc")
  - colors: string (comma-separated, e.g., "W,U") - Use $all or $in logic based on requirement
  - cmc_lte: number
  - cmc_gte: number
  - cmc_eq: number
  - rarity: string (e.g., "rare")
  - foil: string (e.g., "foil")
  - binderName: string
  // ... other filter parameters for CollectionCard fields

Response (Success - 200 OK):
{
  "data": [
    // Array of projected/formatted collection card objects
    {
      "collectionId": "...",
      "quantity": 2,
      "foil": "normal",
      "condition": "near_mint",
      "cardName": "Opt",
      "cmc": 1,
      "colors": ["U"],
      "rarity": "common",
      "setName": "Ixalan",
      "imageUrl": "..."
    },
    // ... more items
  ],
  "pagination": {
    "currentPage": 1,
    "itemsPerPage": 50,
    "totalItems": 1234, // Requires an additional count aggregation if needed
    "totalPages": 25   // Calculated from totalItems / itemsPerPage
  }
}

Response (Error - e.g., 400 Bad Request, 500 Internal Server Error)
{
  "error": "...",
  "message": "..."
}
```
*Note: Getting `totalItems` for pagination requires running a separate `count` aggregation with the same `$match` filters but without `$sort`, `$skip`, `$limit`. Ensure this count operation is also performant, potentially using the same pre-lookup and post-lookup `$match` stages.*

**6. Considerations**

*   **Performance:** While aggregation is efficient, complex pipelines on very large datasets can still be resource-intensive. Proper indexing is paramount. Performance will depend heavily on dataset size, query complexity, and server resources.
*   **Database Load:** Every request (including subsequent page loads in infinite scrolling or applying new filters) will execute a query against the MongoDB database. Without caching, this can lead to high database load under heavy usage.
*   **Data Consistency:** `$lookup` provides results consistent with the state of the collections at the time of the query.
*   **Complexity:** The aggregation pipeline adds complexity compared to simple `find` queries on a denormalized structure.
*   **Error Handling:** Implement robust error handling for database operations.

**7. Conclusion**

Using MongoDB's aggregation framework (`$lookup`) provides a robust method for querying and filtering `collectionCards` based on related `cards` data without resorting to data duplication. This approach centralizes the join logic within the database, potentially offering good performance, especially when coupled with appropriate indexing. However, be mindful that every user request translates to a database query, and consider performance implications under heavy load or for very large collections. For high-traffic scenarios or where response time is critical, adding a caching layer (as detailed in a separate design) would be the next logical optimization step.

---
