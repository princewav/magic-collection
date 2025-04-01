Ok, ecco una descrizione della classe `CardService` e dei suoi metodi basata sul codice fornito:

**Panoramica della Classe `CardService`**

La classe `CardService` estende `BaseService` ed è progettata per interagire con una collezione MongoDB chiamata 'cards'. Fornisce metodi per recuperare dati sulle carte Magic: The Gathering con varie opzioni di filtraggio, ordinamento e recupero. Utilizza un'istanza di `RepoCls<Card>` per le operazioni dirette sul database.

**Metodi Pubblici:**

1.  **`getByNameAndSet(name: string, set: string, setNumber: string = '')`**:
    *   **Scopo**: Trova carte basandosi sul nome e sul set. Opzionalmente, può includere il `collector_number` (numero di collezionista) per una corrispondenza più precisa.
    *   **Funzionamento**:
        *   Utilizza una serie di strategie di ricerca, partendo dalla più specifica (corrispondenza esatta di nome, set e numero di collezionista) fino alla meno specifica (corrispondenza parziale/"fuzzy" del nome e del set, senza numero di collezionista).
        *   Normalizza il nome del set in minuscolo per la ricerca.
        *   Restituisce il primo set di risultati trovato tra le varie strategie. Se nessuna strategia produce risultati, restituisce un array vuoto.

2.  **`getAll(limit: number): Promise<Card[]>`**:
    *   **Scopo**: Recupera un numero limitato di carte dalla collezione.
    *   **Funzionamento**: Esegue una semplice query `find()` sulla collezione con un `limit()` specificato e restituisce i documenti come array di oggetti `Card`.

3.  **`getByName(name: string)`**:
    *   **Scopo**: Trova carte basandosi sul nome.
    *   **Funzionamento**:
        *   Prima cerca una corrispondenza esatta del nome.
        *   Se non trova corrispondenze esatte, esegue una ricerca "fuzzy" (case-insensitive) utilizzando un'espressione regolare.

4.  **`getByCardId(ids: string[]): Promise<Card[] | null>`**:
    *   **Scopo**: Recupera carte specifiche basandosi su un array di `cardId` (presumibilmente ID Scryfall univoci per ogni stampa di carta).
    *   **Funzionamento**: Utilizza l'operatore `$in` di MongoDB per trovare tutte le carte il cui campo `cardId` corrisponde a uno degli ID forniti.

5.  **`getFilteredCards(filters: FilterOptions, deduplicate: boolean = true): Promise<Card[]>`**:
    *   **Scopo**: Recupera un elenco di carte applicando vari filtri (colori, costo di mana convertito (CMC), rarità, set) e opzioni di ordinamento. Offre la possibilità di deduplicare i risultati per nome.
    *   **Funzionamento**:
        *   Costruisce una query MongoDB basata sui filtri forniti (`FilterOptions`).
        *   Supporta filtri per:
            *   `colors`: Corrispondenza esatta o inclusiva.
            *   `cmcRange`: Intervallo di costo di mana.
            *   `rarities`: Elenco di rarità.
            *   `sets`: Elenco di set (normalizzati in minuscolo).
        *   Gestisce l'ordinamento personalizzato per i campi `colors` e `rarity` utilizzando una pipeline di aggregazione MongoDB (aggiungendo campi temporanei per l'ordinamento). Per altri campi, utilizza l'ordinamento standard.
        *   Se `deduplicate` è `true` (impostazione predefinita), chiama il metodo `deduplicateCardsByName` per rimuovere le stampe multiple della stessa carta.
        *   Restituisce l'array di carte filtrato (e potenzialmente deduplicato).

6.  **`getFilteredCardsWithPagination(filters: FilterOptions, page: number = 1, pageSize: number = 50, deduplicate: boolean = true): Promise<{ cards: Card[]; total: number }>`**:
    *   **Scopo**: Simile a `getFilteredCards`, ma aggiunge la paginazione e restituisce sia l'elenco delle carte per la pagina corrente sia il numero totale stimato di carte che corrispondono ai filtri.
    *   **Funzionamento**:
        *   Applica filtri e ordinamento come `getFilteredCards`.
        *   Utilizza una pipeline di aggregazione MongoDB con `$skip` e `$limit` per recuperare solo le carte per la pagina specificata.
        *   Se `deduplicate` è `true`:
            *   Recupera un numero maggiore di carte (`pageSize * fetchMultiplier`) per avere abbastanza carte uniche dopo la deduplicazione.
            *   Esegue la deduplicazione e limita i risultati a `pageSize`.
            *   **Stima del totale**: Se è la prima pagina, calcola un rapporto di deduplicazione basato sui risultati recuperati e lo applica al conteggio totale dei documenti non deduplicati per stimare il numero totale di carte *uniche*. Altrimenti, restituisce il conteggio totale non deduplicato.
        *   Se `deduplicate` è `false`, restituisce semplicemente la pagina di risultati e il conteggio totale dei documenti corrispondenti ai filtri.
        *   Esegue la query per il conteggio totale e la query per i documenti della pagina in parallelo (`Promise.all`).

7.  **`deduplicateCardsByName(cards: Card[]): Card[]`**:
    *   **Scopo**: Data una lista di carte, restituisce una nuova lista contenente solo una versione per ogni nome di carta unico.
    *   **Funzionamento**:
        *   Utilizza una `Map` per tenere traccia della "migliore" versione trovata finora per ogni nome di carta.
        *   Definisce una funzione `getCardNormalityScore` per assegnare un punteggio a ciascuna carta basato su criteri che definiscono quanto "normale" o "standard" sia una stampa:
            *   Priorità a rarità non speciali (comune, non comune, rara, mitica).
            *   Priorità a rarità più basse.
            *   Priorità a layout "normal".
            *   Priorità a numeri di collezionista più bassi (preferendo la stampa originale nel set).
            *   Priorità a set più recenti (per artwork/template aggiornati).
        *   Itera sulla lista di carte in input. Per ogni carta, confronta il suo punteggio con quello della carta attualmente salvata nella `Map` per quel nome (se esiste). Se la nuova carta ha un punteggio più alto o se non c'era ancora una carta per quel nome, la inserisce/sostituisce nella `Map`.
        *   Infine, restituisce i valori della `Map` come array.

**Metodi Privati (Helpers):**

*   **`applyFilters`**: Applica i criteri di filtro all'oggetto query MongoDB.
*   **`needsCustomSorting`**: Determina se è necessario un ordinamento personalizzato (basato su `colors` o `rarity`).
*   **`buildCustomSortStages`**: Costruisce le fasi `$addFields` necessarie per l'ordinamento personalizzato nella pipeline di aggregazione.
*   **`buildSortStage`**: Costruisce l'oggetto `$sort` per la pipeline di aggregazione o la query `find`, includendo sempre `name` come criterio di ordinamento secondario predefinito.
