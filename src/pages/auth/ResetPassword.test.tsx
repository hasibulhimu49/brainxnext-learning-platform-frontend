import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { issueResetToken } from "@/api/mock/db/users";
import { renderWithProviders } from "@/test/render";
import ResetPassword from "./ResetPassword";

const submit = async (password: string) => {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("New password"), password);
  await user.type(screen.getByLabelText("Confirm new password"), password);
  await user.click(screen.getByRole("button", { name: "Reset password" }));
};

describe("<ResetPassword />", () => {
  it("shows the invalid-link state without a token", () => {
    renderWithProviders(<ResetPassword />, { route: "/reset-password" });
    expect(screen.getByRole("heading", { name: "This reset link isn't valid" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Request a new link/ })).toHaveAttribute("href", "/forgot-password");
  });

  it("switches to the invalid-link state when the server rejects the token", async () => {
    renderWithProviders(<ResetPassword />, { route: "/reset-password?token=bogus" });
    await submit("newpassword1");
    expect(await screen.findByRole("heading", { name: "This reset link isn't valid" })).toBeInTheDocument();
  });

  it("resets the password with a valid token", async () => {
    const token = issueResetToken("hasibulx26@gmail.com");
    renderWithProviders(<ResetPassword />, { route: `/reset-password?token=${token}` });
    await submit("newpassword1");
    expect(await screen.findByRole("heading", { name: "Password updated!" })).toBeInTheDocument();
  });
});
