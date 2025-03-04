import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, beforeEach, vi } from 'vitest';
import Card from '../../../src/app/components/Card';
import { expect } from 'chai';
import { CardModalProvider } from '../../../src/app/contexts/CardModalContext';

describe('Card Component', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('displays loading state while fetching data', async () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));

    render(
      <CardModalProvider>
        <Card id="test-id" />
      </CardModalProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Loading...')).to.exist;
    });
  });
});
