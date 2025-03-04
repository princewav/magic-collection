import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Card from '../../../src/app/components/Card';

describe('Card Component', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('displays an error message when the API call fails', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('API Error'))));

    render(<Card id="test-id" />);

    await waitFor(() => {
      expect(screen.getByText('Error: API Error')).to.be.ok;
    });
  });
});
