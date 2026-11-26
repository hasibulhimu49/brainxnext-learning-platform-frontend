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

  it("opens Facebook and YouTube in a new tab", () => {
    renderWithProviders(<Contact />, { route: "/contact" });
    const facebook = screen.getByRole("link", { name: /Facebook/ });
    expect(facebook).toHaveAttribute("href", "https://www.facebook.com/brainxnext");
    expect(facebook).toHaveAttribute("target", "_blank");
    const youtube = screen.getByRole("link", { name: /YouTube/ });
    expect(youtube).toHaveAttribute("href", "https://www.youtube.com/@brainxnext");
    expect(youtube).toHaveAttribute("rel", "noreferrer");
  });
});
