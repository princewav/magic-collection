import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Card from '../../../../src/app/components/Card';

vi.mock('node-fetch');

const mockedFetch = vi.mocked(vi.fn());

describe('Card Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays an error message when the API call fails', async () => {
    mockedFetch.mockImplementation(() =>
      Promise.reject(new Error('API Error'))
    );

    render(<Card id="test-id" />);

    await waitFor(() => {
      expect(screen.getByText('Error: API Error')).to.be.ok;
    });
  });
});
