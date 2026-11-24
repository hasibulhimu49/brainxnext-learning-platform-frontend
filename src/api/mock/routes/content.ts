import { contactSchema } from "@/schemas/account";
import { API_ERROR_CODES as CODES } from "../../envelope";
import { HANDBOOKS, NOTE_HIGHLIGHTS } from "../db/courses";
import { fail, ok, type MockRoute } from "../http";
import { invalid } from "./shared";
import { tickets } from "../db/commerce";
import { findCertificate, toPublicCertificate } from "../db/learning";
import { newId } from "../db/store";

/** Public content: handbooks, notes, certificate lookup and the contact form. */
export const contentRoutes: MockRoute[] = [
  { method: "GET", path: "/handbooks", handler: () => ok(HANDBOOKS) },
  { method: "GET", path: "/notes/highlights", handler: () => ok(NOTE_HIGHLIGHTS) },
  {
    method: "GET",
    path: "/certificates/:id",
    handler: (req) => {
      // public: anyone with the id can verify it (the holder's email is never returned)
      const cert = findCertificate(req.params.id ?? "");
      return cert
        ? ok(toPublicCertificate(cert))
        : fail(404, CODES.notFound, "No certificate found with that ID. Check for typos — IDs look like BXN-2026-SQ-08412.");
    },
  },
  {
    method: "POST",
    path: "/contact",
    handler: (req) => {
      const parsed = contactSchema.safeParse(req.body);
      if (!parsed.success) return invalid(parsed.error.issues);
      // the admin inbox reads these tickets
      const ticketId = newId("TCK");
      tickets.add({ id: ticketId, ...parsed.data, createdAt: new Date().toISOString(), status: "open", replies: [] });
      return ok({ ticketId }, 201);
    },
  },
];
