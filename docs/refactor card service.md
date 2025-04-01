# Refactor CardService

**Analisi e Code Smells Identificati:**

1.  **Duplicazione Logica (Filtering/Sorting)**: I metodi `getFilteredCards` e `getFilteredCardsWithPagination` condividono quasi interamente la logica di costruzione della query (`applyFilters`) e della pipeline di aggregazione (gestione dell'ordinamento standard e personalizzato tramite `needsCustomSorting`, `buildCustomSortStages`, `buildSortStage`). La differenza principale sta nell'aggiunta di `$skip` e `$limit` e nella gestione del conteggio totale/stimato nella versione paginata.
2.  **Metodo Lungo (`getFilteredCardsWithPagination`)**: Questo metodo gestisce la costruzione della query, l'esecuzione parallela di due query (conteggio e dati), la deduplicazione e la logica di stima del conteggio totale. Potrebbe essere suddiviso per migliorare la leggibilità e la separazione delle responsabilità.
3.  **Metodo Lungo/Complessità (`deduplicateCardsByName` / `getCardNormalityScore`)**: La logica di scoring per la deduplicazione, sebbene incapsulata in `getCardNormalityScore`, contiene diversi "magic numbers" e una logica specifica che potrebbe essere resa più chiara o configurabile. L'intero processo di deduplicazione è abbastanza complesso.
4.  **Magic Strings/Numbers**:
    *   `rarityOrder` e `colorOrder`: Sebbene definiti come costanti all'inizio, vengono usati direttamente nelle pipeline.
    *   Stringhe di layout (`'normal'`, `'split'`, etc.) e rarità (`'common'`, etc.) usate nella funzione di scoring.
    *   Il `fetchMultiplier` (valore `3`) in `getFilteredCardsWithPagination` non è spiegato o definito come costante.
    *   Numeri usati per il calcolo dello score in `getCardNormalityScore` (100, 50, 40, 30, 10, 10000, 100, 10000000000).
5.  **Potenziale Violazione SRP**: La classe gestisce recupero dati, logica di business complessa (deduplicazione con scoring), filtraggio avanzato e paginazione. La logica di deduplicazione, in particolare, potrebbe essere abbastanza distinta da giustificare una propria classe o utility.
6.  **Logica di Ricerca Complessa (`getByNameAndSet`)**: L'approccio a strategie multiple è funzionale ma potrebbe diventare complesso da mantenere se le strategie aumentassero.

**Piano di Refactoring Strutturato:**

1.  **Consolidare la Logica di Costruzione della Pipeline:**
    *   **Azione**: Estrarre la logica comune per costruire le fasi principali della pipeline di aggregazione (`$match`, `$addFields` per sorting custom, `$sort`) in un nuovo metodo privato, ad esempio `buildBaseAggregationPipeline(filters: FilterOptions): Document[]`.
    *   **Obiettivo**: Eliminare la duplicazione tra `getFilteredCards` e `getFilteredCardsWithPagination`. Entrambi i metodi chiameranno questo nuovo helper e aggiungeranno le fasi specifiche (come `$skip`, `$limit`, `$project`).

2.  **Semplificare `getFilteredCardsWithPagination`:**
    *   **Azione**: Suddividere il metodo. Potrebbe esserci un metodo per recuperare i dati paginati (che usa `buildBaseAggregationPipeline`) e un altro helper per gestire la logica di stima del totale quando la deduplicazione è attiva.
    *   **Azione**: Estrarre il `fetchMultiplier` (3) in una costante nominata all'interno della classe (es. `DEDUPLICATION_FETCH_MULTIPLIER`).
    *   **Obiettivo**: Migliorare la leggibilità e ridurre la complessità del metodo singolo. Separare la logica di recupero dati dalla logica di stima del conteggio.

3.  **Refactoring della Logica di Deduplicazione:**
    *   **Azione**: Estrarre la funzione `getCardNormalityScore` in un metodo privato separato e più evidente, o potenzialmente in una classe/utility helper dedicata (es. `CardDeduplicationScorer`) se la logica dovesse diventare ancora più complessa o riutilizzabile altrove.
    *   **Azione**: Sostituire i "magic numbers" nello scoring con costanti nominate (es. `NORMAL_RARITY_SCORE`, `COMMON_RARITY_WEIGHT`, `NORMAL_LAYOUT_SCORE`, `RECENT_SET_DATE_DIVISOR`, etc.) definite all'interno della classe o del nuovo helper.
    *   **Azione**: Sostituire le stringhe di layout e rarità usate nello scoring con riferimenti a costanti o enum (se appropriato nel contesto del progetto).
    *   **Obiettivo**: Migliorare la leggibilità, la manutenibilità e la testabilità della logica di scoring e deduplicazione. Rendere più chiaro il significato dei valori utilizzati.

4.  **Utilizzare Costanti/Enum:**
    *   **Azione**: Definire costanti per le stringhe di rarità, colori e layout usate frequentemente, specialmente quelle usate nella logica di scoring e filtraggio. Valutare l'uso di `enum` TypeScript se si preferisce una maggiore type safety.
    *   **Azione**: Assicurarsi che `rarityOrder` e `colorOrder` siano usati in modo consistente, magari referenziandoli tramite le costanti definite.
    *   **Obiettivo**: Ridurre il rischio di errori di battitura, migliorare la leggibilità e centralizzare la definizione di questi valori.

5.  **Migliorare la Chiarezza della Ricerca (`getByNameAndSet`)**:
    *   **Azione**: Anche se non strettamente un code smell grave, considerare l'aggiunta di commenti più chiari per spiegare *perché* le strategie sono ordinate in quel modo, se non è ovvio. (Nessuna modifica al codice necessaria se la logica attuale è considerata sufficientemente chiara).
    *   **Obiettivo**: Assicurare che la logica di ricerca rimanga comprensibile.

**Ordine Suggerito per il Refactoring:**

1.  Iniziare con il **Consolidamento della Logica di Pipeline** (Passo 1) poiché elimina la duplicazione più evidente.
2.  Procedere con il **Refactoring della Logica di Deduplicazione** (Passo 3) per migliorare la chiarezza e la manutenibilità dello scoring.
3.  Introdurre **Costanti/Enum** (Passo 4) per ripulire magic strings/numbers, inclusi quelli nello scoring.
4.  Infine, **Semplificare `getFilteredCardsWithPagination`** (Passo 2), sfruttando la pipeline consolidata e le costanti definite.

Questo piano mira a rendere la classe `CardService` più snella, più facile da capire, modificare e testare, aderendo ai principi DRY e SRP.
