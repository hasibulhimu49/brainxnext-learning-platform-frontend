import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";
import { renderWithProviders } from "@/test/render";
import NotificationsMenu from "./NotificationsMenu";

beforeEach(async () => {
  useAuthStore.getState().setSession(await authService.login("hasibulx26@gmail.com", "12345678"));
});

describe("<NotificationsMenu />", () => {
  it("opens the list, shows unread state and marks all read", async () => {
    const user = userEvent.setup();
    renderWithProviders(<NotificationsMenu />);
    const bell = await screen.findByRole("button", { name: /Notifications \(\d+ unread\)/ });
    await user.click(bell);
    const panel = screen.getByRole("dialog", { name: "Notifications" });
    expect(within(panel).getByText("Project approved")).toBeInTheDocument();
    expect(within(panel).getAllByLabelText("Unread").length).toBeGreaterThan(0);
    await user.click(within(panel).getByRole("button", { name: "Mark all read" }));
    await waitFor(() => expect(within(panel).queryAllByLabelText("Unread")).toHaveLength(0));
    expect(screen.getByRole("button", { name: "Notifications" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
