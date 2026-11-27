import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { COURSES, HANDBOOKS } from "@/api/mock/db/courses";
import { renderWithProviders } from "@/test/render";
import Home from "./Home";

describe("<Home />", { timeout: 15000 }, () => {
  it("shows catalog counts instead of hard-coded numbers", async () => {
    renderWithProviders(<Home />, { route: "/" });
    const free = COURSES.filter((c) => c.free).length;
    expect(await screen.findByText(`${free} COURSES FREE FOREVER`, { exact: false }, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByText(`of ${COURSES.length} courses`, { exact: false })).toBeInTheDocument();
  });

  it("previews the same handbooks as /notes", async () => {
    renderWithProviders(<Home />, { route: "/" });
    const first = HANDBOOKS[0];
    if (!first) throw new Error("no handbooks in the mock");
    expect(await screen.findByText(`${first.name} Handbook`, {}, { timeout: 5000 })).toBeInTheDocument();
  });

  it("“Get started” takes the email to sign-up", async () => {
    renderWithProviders(<Home />, { route: "/", path: "/", stubs: ["/register"] });
    const form = screen.getByRole("button", { name: "Get started" }).closest("form");
    if (!form) throw new Error("no form");
    fireEvent.change(within(form).getByRole("textbox", { name: "Email address" }), { target: { value: "new@learner.com" } });
    fireEvent.click(within(form).getByRole("button", { name: "Get started" }));
    expect(await screen.findByText("Stub: /register /register?email=new%40learner.com", {}, { timeout: 5000 })).toBeInTheDocument();
  });
});
