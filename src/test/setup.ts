import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach } from "vitest";
import { resetMockAdmin } from "@/api/mock/db/admin";
import { resetMockBilling } from "@/api/mock/db/billing";
import { resetMockCommerce } from "@/api/mock/db/commerce";
import { resetMockLearning } from "@/api/mock/db/learning";
import { resetMockUsers } from "@/api/mock/db/users";
import { useAuthStore } from "@/stores/authStore";

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  resetMockUsers();
  resetMockLearning();
  resetMockCommerce();
  resetMockBilling();
  resetMockAdmin();
  useAuthStore.setState({ token: null, user: null, pendingEmail: null, remember: true, sessionExpired: false });
});

afterEach(() => {
  cleanup();
});
