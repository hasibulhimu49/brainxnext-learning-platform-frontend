import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { authService } from "@/services/authService";
import { courseService } from "@/services/courseService";
import { useAuthStore } from "@/stores/authStore";
import { renderWithProviders } from "@/test/render";
import CourseReviews from "./CourseReviews";

const asStudent = async () => useAuthStore.getState().setSession(await authService.login("hasibulx26@gmail.com", "12345678"));

describe("<CourseReviews /> (F-006)", () => {
  it("a learner rates a course: validation, then the review is posted", async () => {
    await asStudent();
    const user = userEvent.setup();
    const course = await courseService.detail("python-data-analysis");
    renderWithProviders(<CourseReviews course={course} />, { route: "/courses/python-data-analysis" });
    expect(await screen.findByText("Rate this course")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Post review" }));
    expect(await screen.findByText("Pick a star rating")).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "4 stars" }));
    await user.type(screen.getByLabelText("Your review"), "Pandas finally clicked for me — great real dataset.");
    await user.click(screen.getByRole("button", { name: "Post review" }));
    expect(await screen.findByText("YOUR REVIEW")).toBeInTheDocument();
  });

  it("guests are asked to log in to review", async () => {
    const course = await courseService.detail("java-generics");
    renderWithProviders(<CourseReviews course={course} />, { route: "/courses/java-generics" });
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login?next=%2Fcourses%2Fjava-generics");
    expect(screen.getByText(/Mohammad Hasibul Hasan/)).toBeInTheDocument();
  });
});
