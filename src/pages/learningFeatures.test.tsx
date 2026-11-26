import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import CourseReviews from "@/components/course/CourseReviews";
import { authService } from "@/services/authService";
import { courseService } from "@/services/courseService";
import { useAuthStore } from "@/stores/authStore";
import { renderWithProviders } from "@/test/render";
import ModuleQuiz from "./courses/ModuleQuiz";
import PathDetail from "./marketing/PathDetail";
import Paths from "./marketing/Paths";

const asStudent = async () => useAuthStore.getState().setSession(await authService.login("hasibulx26@gmail.com", "12345678"));

describe("learning features (F-006 – F-008)", () => {
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

  it("takes a module quiz and shows the score with explanations", async () => {
    await asStudent();
    const user = userEvent.setup();
    renderWithProviders(<ModuleQuiz />, { route: "/learn/java-generics/quiz/2", path: "/learn/:courseId/quiz/:module" });
    expect(await screen.findByText("Module 2 quiz")).toBeInTheDocument();
    for (let q = 1; q <= 4; q++) {
      const group = screen.getByRole("radiogroup", { name: `Question ${q}` });
      await user.click(group.querySelectorAll("button")[1] as HTMLElement);
    }
    await user.click(screen.getByRole("button", { name: "Submit answers" }));
    expect(await screen.findByText("4/4 — Passed!")).toBeInTheDocument();
    expect(screen.getAllByText("Correct.")).toHaveLength(4);
    expect(screen.getByRole("link", { name: /Start module 3/ })).toHaveAttribute("href", "/learn/java-generics/3-1");
  });

  it("lists learning paths and shows a path's steps with progress", async () => {
    await asStudent();
    renderWithProviders(<Paths />, { route: "/paths" });
    expect(await screen.findByText("Backend Developer")).toBeInTheDocument();
    expect(screen.getByText("Data Analyst")).toBeInTheDocument();
  });

  it("a path page offers to add its paid courses to the cart", async () => {
    renderWithProviders(<PathDetail />, { route: "/paths/product-designer", path: "/paths/:pathId" });
    expect(await screen.findByRole("heading", { name: "Product Designer" })).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: /Add 3 paid courses to cart/ })).toBeInTheDocument();
  });
});
