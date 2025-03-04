import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Card from '../../../src/app/components/Card';

describe('Card Component', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('displays "Card not found" message when the API returns a 404 error', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false, status: 404 })));

    render(<Card id="test-id" />);

    await waitFor(() => {
      expect(screen.getByText('Card not found.')).to.be.ok;
    });
  });
});
