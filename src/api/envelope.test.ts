import { describe, expect, it } from "vitest";
import { z } from "zod";
import { API_ERROR_CODES, ApiError, errorMessage, parseEnvelope, unwrap } from "./envelope";

describe("response envelope", () => {
  it("returns data from a success envelope", () => {
    expect(unwrap<{ id: number }>({ success: true, data: { id: 7 } }, 200)).toEqual({ id: 7 });
  });

  it("throws ApiError with the server code for a failure envelope", () => {
    const body = { success: false, error: { code: "EMAIL_TAKEN", message: "Already registered" } };
    expect(() => unwrap(body, 409)).toThrow(ApiError);
    try {
      unwrap(body, 409);
    } catch (e) {
      expect(e).toMatchObject({ code: "EMAIL_TAKEN", message: "Already registered", status: 409 });
    }
  });

  it("rejects bodies that are not an envelope", () => {
    expect(parseEnvelope({ id: 1 })).toBeNull();
    expect(() => unwrap({ id: 1 })).toThrow(expect.objectContaining({ code: API_ERROR_CODES.invalidEnvelope }));
  });

  it("validates the payload when a schema is given", () => {
    const schema = z.object({ id: z.number() });
    expect(unwrap({ success: true, data: { id: 1 } }, 200, schema)).toEqual({ id: 1 });
    expect(() => unwrap({ success: true, data: { id: "1" } }, 200, schema)).toThrow(
      expect.objectContaining({ code: API_ERROR_CODES.invalidResponse })
    );
  });

  it("gives a readable message for unknown errors", () => {
    expect(errorMessage(new ApiError("X", "Boom"))).toBe("Boom");
    expect(errorMessage(new Error("internal"))).toBe("Something went wrong. Please try again.");
  });
});
