import type { MockRoute } from "../http";
import { adminRoutes } from "./admin";
import { assistantRoutes } from "./assistant";
import { authRoutes } from "./auth";
import { catalogRoutes } from "./catalog";
import { checkoutRoutes } from "./checkout";
import { contentRoutes } from "./content";
import { learnerRoutes } from "./learner";
import { pathRoutes } from "./paths";
import { quizRoutes } from "./quizzes";
import { reviewRoutes } from "./reviews";

/**
 * Every mock endpoint, one module per area so features can be worked on in parallel.
 * Endpoints, fields and error codes are provisional placeholders (see CLAUDE.md §3).
 */
export const routes: MockRoute[] = [
  ...authRoutes,
  ...catalogRoutes,
  ...learnerRoutes,
  ...checkoutRoutes,
  ...contentRoutes,
  ...adminRoutes,
  ...assistantRoutes,
  ...reviewRoutes,
  ...quizRoutes,
  ...pathRoutes,
];
