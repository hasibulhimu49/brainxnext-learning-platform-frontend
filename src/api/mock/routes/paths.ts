import { API_ERROR_CODES as CODES } from "../../envelope";
import { PATHS } from "../db/paths";
import { fail, ok, type MockRoute } from "../http";

/** Learning paths (F-008, PROVISIONAL). Public; prices and progress come from the catalog and enrolment endpoints. */
export const pathRoutes: MockRoute[] = [
  { method: "GET", path: "/paths", handler: () => ok(PATHS) },
  {
    method: "GET",
    path: "/paths/:id",
    handler: (req) => {
      const path = PATHS.find((p) => p.id === req.params.id);
      return path ? ok(path) : fail(404, CODES.notFound, "That learning path doesn't exist.");
    },
  },
];
