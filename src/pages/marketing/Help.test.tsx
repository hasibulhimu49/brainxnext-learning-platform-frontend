import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { filterHelpQuestions, HELP_QUESTIONS } from "@/constants/help";
import { renderWithProviders } from "@/test/render";
import Help from "./Help";

const questionButtons = () => screen.queryAllByRole("button", { expanded: false });

describe("filterHelpQuestions", () => {
  it("matches question and answer text, ignoring case and whitespace", () => {
    const hits = filterHelpQuestions(HELP_QUESTIONS, "  REFUND ");
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.every((h) => `${h.q} ${h.a}`.toLowerCase().includes("refund"))).toBe(true);
  });

  it("limits results to a category", () => {
    const hits = filterHelpQuestions(HELP_QUESTIONS, "", "certificates");
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.every((h) => h.category === "certificates")).toBe(true);
  });
});

describe("<Help />", () => {
  beforeAll(() => {
    // jsdom has no scrollIntoView
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("shows every question by default", () => {
    renderWithProviders(<Help />, { route: "/help" });
    expect(questionButtons()).toHaveLength(HELP_QUESTIONS.length);
  });

  it("filters questions as you type and shows an empty state", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Help />, { route: "/help" });
    const search = screen.getByRole("searchbox", { name: "Search help articles" });

    await user.type(search, "bkash");
    expect(screen.getByRole("button", { name: "How can I pay?" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "How do I create an account?" })).not.toBeInTheDocument();

    await user.clear(search);
    await user.type(search, "zzzz-nothing");
    expect(screen.getByRole("heading", { name: "No matching questions" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("0 questions found");
  });

  it("filters by category chip and opens an answer", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Help />, { route: "/help" });
    await user.click(screen.getByRole("radio", { name: "Certificates" }));
    const expected = HELP_QUESTIONS.filter((q) => q.category === "certificates");
    expect(questionButtons()).toHaveLength(expected.length);

    const first = screen.getByRole("button", { name: expected[0]?.q });
    await user.click(first);
    expect(first).toHaveAttribute("aria-expanded", "true");
    expect(within(first.parentElement as HTMLElement).getByText(expected[0]?.a ?? "")).toBeInTheDocument();
  });

  it("preselects the category from the URL hash", () => {
    renderWithProviders(<Help />, { route: "/help#mentor-review" });
    expect(screen.getByRole("radio", { name: "Mentor review" })).toHaveAttribute("aria-checked", "true");
  });
});
