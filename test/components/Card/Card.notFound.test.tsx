import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, beforeEach, vi } from "vitest";
import Card from "@/components/Card";
import { expect } from "chai";
import { CardModalProvider } from "../../../src/contexts/CardModalContext";

describe("Card Component", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('displays "Card not found" message when the API returns a 404 error', async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          json: () => Promise.resolve({ message: "Card not found" }), // Simulate the API returning an error message
        })
      )
    );

    render(
      <CardModalProvider>
        <Card id="test-id" />
      </CardModalProvider>
    );

    await waitFor(() => {
      expect(screen.getByText((content) => content?.includes("Card not found")))
        .to.exist;
    });
  });
});
