import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@/test/render";
import Contact from "./Contact";

const checkedTopic = () => screen.getByRole("radio", { checked: true });

describe("<Contact /> topic preselect", () => {
  it.each([
    ["teams", "Teams"],
    ["teach", "Teach with us"],
    ["billing", "Billing"],
    ["course", "Course question"],
    ["other", "Other"],
    ["TEAMS", "Teams"],
  ])("?topic=%s selects “%s”", (param, label) => {
    renderWithProviders(<Contact />, { route: `/contact?topic=${param}` });
    expect(checkedTopic()).toHaveAccessibleName(label);
  });

  it("falls back to “Course question” for a missing or unknown topic", () => {
    renderWithProviders(<Contact />, { route: "/contact?topic=nope" });
    expect(checkedTopic()).toHaveAccessibleName("Course question");
  });

  it("opens Discord and YouTube in a new tab", () => {
    renderWithProviders(<Contact />, { route: "/contact" });
    const discord = screen.getByRole("link", { name: /Community/ });
    expect(discord).toHaveAttribute("href", "https://discord.gg/brainxnext");
    expect(discord).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("link", { name: /YouTube/ })).toHaveAttribute("rel", "noreferrer");
  });
});
