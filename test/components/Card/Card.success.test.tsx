import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, beforeEach, vi } from 'vitest';
import Card from '../../../src/app/components/Card';
import { expect } from 'chai';

describe('Card Component', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders card data correctly when the API call is successful', async () => {
    const mockCardData = {
      name: 'Test Card',
      mana_cost: '{1}{W}',
      type_line: 'Creature — Human Soldier',
      oracle_text: 'Test oracle text',
      power: '1',
      toughness: '1',
      image_uris: {
        normal: 'https://example.com/test-image.jpg',
      },
    };

    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCardData),
      })
    ));

    render(<Card id="test-id" />);

    await waitFor(() => {
      expect(screen.getByText('Test Card')).to.exist;
      expect(screen.getByText('{1}{W}')).to.exist;
      expect(screen.getByText('Creature — Human Soldier')).to.exist;
      expect(screen.getByText('Test oracle text')).to.exist;
      expect(screen.getByText('1/1')).to.exist;
      const image = screen.getByRole('img') as HTMLImageElement;
      const src = image.getAttribute('src');
      expect(src).to.match(/^/_next\/image\?url=https%3A%2F%2Fexample\.com%2Ftest-image\.jpg&w=\d+&q=\d+/);
    });
  });
});
