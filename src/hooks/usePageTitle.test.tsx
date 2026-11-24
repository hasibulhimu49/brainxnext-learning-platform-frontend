import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import usePageTitle, { HOME_TITLE } from "./usePageTitle";

describe("usePageTitle", () => {
  afterEach(() => {
    document.title = "";
  });

  it("formats the page title with the site name", () => {
    renderHook(() => usePageTitle("Pricing"));
    expect(document.title).toBe("Pricing · BrainXNext");
  });

  it("uses the home title when no title is given", () => {
    renderHook(() => usePageTitle());
    expect(document.title).toBe(HOME_TITLE);
  });

  it("updates when the title changes and restores the previous title on unmount", () => {
    document.title = "Before";
    const { rerender, unmount } = renderHook(({ t }) => usePageTitle(t), { initialProps: { t: "Help" } });
    expect(document.title).toBe("Help · BrainXNext");
    rerender({ t: "Terms" });
    expect(document.title).toBe("Terms · BrainXNext");
    unmount();
    expect(document.title).toBe("Before");
  });
});
