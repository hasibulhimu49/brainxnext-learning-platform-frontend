import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@/test/render";
import ThankYou from "./ThankYou";

describe("<ThankYou />", () => {
  it("shows an allowed amount", () => {
    renderWithProviders(<ThankYou />, { route: "/thank-you?amount=149", path: "/thank-you", stubs: ["/support"] });
    expect(screen.getByText(/৳149 contribution/)).toBeInTheDocument();
  });

  it.each(["", "?amount=50", "?amount=abc", "?amount=-99"])("redirects %s to /support", (search) => {
    renderWithProviders(<ThankYou />, { route: `/thank-you${search}`, path: "/thank-you", stubs: ["/support"] });
    expect(screen.getByText(/Stub: \/support/)).toBeInTheDocument();
  });
});
