import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Card from '../../../src/app/components/Card';

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
      expect(screen.getByText('Test Card')).to.be.ok;
      expect(screen.getByText('{1}{W}')).to.be.ok;
      expect(screen.getByText('Creature — Human Soldier')).to.be.ok;
      expect(screen.getByText('Test oracle text')).to.be.ok;
      expect(screen.getByText('1/1')).to.be.ok;
      const image = screen.getByRole('img') as HTMLImageElement;
      expect(image.getAttribute('src')).toContain('https://example.com/test-image.jpg');
    });
  });
});
