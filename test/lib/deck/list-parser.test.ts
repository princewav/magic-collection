import { parseDeckList } from '../../../src/lib/deck/list-parser';

describe('parseDeckList', () => {
  it('should parse main deck cards', () => {
    const input = `
4 Seachrome Coast (ONE) 258
2 Split Up (DSK) 32`;
    const result = parseDeckList(input);
    expect(result.mainDeck).toEqual([
      { name: 'Seachrome Coast', set: 'ONE', quantity: 4, setNumber: 258 },
      { name: 'Split Up', set: 'DSK', quantity: 2, setNumber: 32 },
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
});
