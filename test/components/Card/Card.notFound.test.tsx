import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, beforeEach, vi } from 'vitest';
import Card from '../../../src/app/components/Card';
import { expect } from 'chai'; // Import expect from chai

describe('Card Component', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('displays "Card not found" message when the API returns a 404 error', async () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        text: () => Promise.resolve('Card not found.'), // Simulate the response body
      })
    ));

    render(<Card id="test-id" />);

    await waitFor(() => {
      expect(screen.getByText('Error: Card not found.')).to.exist;
    });
  });
});
