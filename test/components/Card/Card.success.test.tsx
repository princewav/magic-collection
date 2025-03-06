import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, beforeEach, vi } from 'vitest';
import Card from '@/components/Card';
import { expect } from 'chai';
import { CardModalProvider } from '@/context/CardModalContext';

describe('Card Component', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders card data correctly when the API call is successful', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              name: 'Test Card',
              mana_cost: '{1}{W}',
              type_line: 'Creature — Human Soldier',
              oracle_text: 'Test oracle text',
              power: '1',
              toughness: '1',
              image_uris: {
                normal: 'http://example.com/image.jpg',
              },
            }),
        }),
      ),
    );

    render(
      <CardModalProvider>
        <Card id="test-id" />
      </CardModalProvider>,
    );

    screen.debug();
    await waitFor(() => {
      expect(screen.getByAltText('Card Test Card')).to.exist;
    });
  });
});
