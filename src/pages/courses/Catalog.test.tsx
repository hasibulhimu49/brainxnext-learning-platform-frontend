import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@/test/render";
import Catalog from "./Catalog";

describe("<Catalog />", () => {
  it("loads courses through the API and filters them by search", async () => {
    renderWithProviders(<Catalog />, { route: "/courses" });

    expect(await screen.findByText("Python for Data Analysis")).toBeInTheDocument();
    expect(screen.getByText("16 courses — all tracks")).toBeInTheDocument();
    // prices in whole Taka; free courses say "Free"
    expect(screen.getByText("৳4,900")).toBeInTheDocument();
    expect(screen.getAllByText("Free").length).toBeGreaterThan(0);

    await userEvent.setup().type(screen.getByLabelText("Search courses"), "sql");
    expect(screen.getByText("SQL From Query to Model")).toBeInTheDocument();
    expect(screen.queryByText("Python for Data Analysis")).not.toBeInTheDocument();
    expect(screen.getByText("1 course found")).toBeInTheDocument();
  });

  it("shows an empty state when nothing matches", async () => {
    renderWithProviders(<Catalog />, { route: "/courses" });
    await screen.findByText("Python for Data Analysis");
    await userEvent.setup().type(screen.getByLabelText("Search courses"), "zzzz");
    expect(screen.getByText('No courses match "zzzz"')).toBeInTheDocument();
  });
});
