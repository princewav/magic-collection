import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Card from './Card';
import { expect } from 'chai';

vi.mock('node-fetch', () => ({
  default: vi.fn(),
}));

describe('Card Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  // make this function simpler, more readable ai!
  it('displays loading state while fetching data', () => {
    (global.fetch as any).mockImplementation((): Promise<Response> =>
      Promise.resolve({
        ok: true,
        json: () => new Promise(() => {}), // Never resolves
      })
    );

    render(<Card id="test-id" />);
    expect(screen.getByText('Loading...')).to.exist;
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

    (global.fetch as any).mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCardData),
      })
    );

    render(<Card id="test-id" />);

    await waitFor(() => {
      expect(screen.getByText('Test Card')).to.be.ok;
      expect(screen.getByText('{1}{W}')).to.be.ok;
      expect(screen.getByText('Creature — Human Soldier')).to.be.ok;
      expect(screen.getByText('Test oracle text')).to.be.ok;
      expect(screen.getByText('1/1')).to.be.ok;
      const image = screen.getByRole('img') as HTMLImageElement;
      expect(image.src).to.equal('https://example.com/test-image.jpg');
    });
  });

  it('displays an error message when the API call fails', async () => {
    (global.fetch as any).mockImplementation(() =>
      Promise.reject(new Error('API Error'))
    );

    render(<Card id="test-id" />);

    await waitFor(() => {
      expect(screen.getByText('Error: API Error')).to.be.ok;
    });
  });

  it('displays "Card not found" message when the API returns a 404 error', async () => {
    (global.fetch as any).mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 404,
      })
    );

    render(<Card id="test-id" />);

    await waitFor(() => {
      expect(screen.getByText('Card not found.')).to.be.ok;
    });
  });
});
