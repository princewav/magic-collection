import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, beforeEach, vi } from 'vitest';
import Card from '@/components/Card';
import { expect } from 'chai';
import { CardModalProvider } from '../../../src/context/CardModalContext';

describe('Card Component', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('displays "Card not found" message when the API call fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('API Error'))),
    );

    render(
      <CardModalProvider>
        <Card id="test-id" />
      </CardModalProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText((content) => content?.includes('Card not found')))
        .to.exist;
    });
  });
});
