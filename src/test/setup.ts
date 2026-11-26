import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach } from "vitest";
import { resetMockAdmin } from "@/api/mock/db/admin";
import { resetMockBilling } from "@/api/mock/db/billing";
import { resetMockCommerce } from "@/api/mock/db/commerce";
import { resetMockLearning } from "@/api/mock/db/learning";
import { resetMockQuizzes } from "@/api/mock/db/quizzes";
import { resetMockUsers } from "@/api/mock/db/users";
import { useAuthStore } from "@/stores/authStore";
import { useShopStore } from "@/stores/shopStore";

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  resetMockUsers();
  resetMockLearning();
  resetMockCommerce();
  resetMockBilling();
  resetMockAdmin();
  resetMockQuizzes();
  useAuthStore.setState({ token: null, user: null, pendingEmail: null, remember: true, sessionExpired: false });
  useShopStore.setState({ wishlist: [], cart: [] });
});

afterEach(() => {
  cleanup();
});
