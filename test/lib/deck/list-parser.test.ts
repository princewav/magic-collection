import { parseDeckList, parseCardLine } from '../../../src/lib/deck/list-parser';

describe('parseDeckList', () => {
  it('should parse main deck cards', () => {
    const input = `
4 Seachrome Coast (ONE) 258
2 Split Up (DSK) 32
2 Day of Judgment`;
    const result = parseDeckList(input);
    expect(result.mainDeck).toEqual([
      { name: 'Seachrome Coast', set: 'ONE', quantity: 4, setNumber: 258 },
      { name: 'Split Up', set: 'DSK', quantity: 2, setNumber: 32 },
      { name: 'Day of Judgment', set: '', quantity: 2, setNumber: 0 },
    ]);
    expect(result.sideboard).toEqual([]);
  });

  it('should parse sideboard cards', () => {
    const input = `
Sideboard
2 Elspeth's Smite (MOM) 13`;
    const result = parseDeckList(input);
    expect(result.mainDeck).toEqual([]);
    expect(result.sideboard).toEqual([
      { name: "Elspeth's Smite", set: 'MOM', quantity: 2, setNumber: 13 },
    ]);
  });

  it('should parse both main deck and sideboard', () => {
    const input = `
4 Seachrome Coast (ONE) 258
Sideboard
2 Elspeth's Smite (MOM) 13`;
    const result = parseDeckList(input);
    expect(result.mainDeck).toEqual([
      { name: 'Seachrome Coast', set: 'ONE', quantity: 4, setNumber: 258 },
    ]);
    expect(result.sideboard).toEqual([
      { name: "Elspeth's Smite", set: 'MOM', quantity: 2, setNumber: 13 },
    ]);
  });

  it('should ignore empty lines', () => {
    const input = `

4 Seachrome Coast (ONE) 258

`;
    const result = parseDeckList(input);
    expect(result.mainDeck).toEqual([
      { name: 'Seachrome Coast', set: 'ONE', quantity: 4, setNumber: 258 },
    ]);
  });

  it('should throw error for invalid card line format', () => {
    expect(() => parseCardLine('invalid format')).toThrow('Invalid card line format');
  });

  it('should include invalid line in parseCardLine error message', () => {
    const invalidLine = 'invalid card line';
    expect(() => parseCardLine(invalidLine)).toThrow(`Invalid card line format: '${invalidLine}'`);
  });

  it('should include example invalid line in parseDeckList error message', () => {
    const invalidList = 'invalid line\nanother invalid line';
    expect(() => parseDeckList(invalidList)).toThrow(/Example invalid line: 'invalid line'/);
  });

  it('should parse valid lines and throw error for invalid lines', () => {
    const input = `1 Plains\ninvalid line`;
  
    // Parse the deck list and verify valid line
    const result = parseDeckList(input);
    expect(result.mainDeck).toHaveLength(1);
    expect(result.mainDeck[0].name).toBe('Plains');
  
    // Verify error was thrown for invalid line
    expect(() => parseCardLine('invalid line')).toThrow(/Invalid card line format/);
  });

  
  it('should include all invalid lines in errors', () => {
    const invalidList = 'invalid line\n1 Plains\nanother invalid line';
    const result = parseDeckList(invalidList);
    expect(result.errors).toEqual(['Invalid card: invalid line', 'Invalid card: another invalid line']);
  });

});
