import { ApiRequestError } from "./api";

describe("ApiRequestError", () => {
  it("carries status", () => {
    const err = new ApiRequestError(401, "nope");
    expect(err.status).toBe(401);
    expect(err.message).toBe("nope");
  });
});
