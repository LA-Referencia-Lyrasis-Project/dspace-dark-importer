import { describe, expect, it } from "vitest";
import { buildHandleUri, extractHandleSuffix, normalizeHandleBaseUrl } from "@/lib/oai";

describe("buildHandleUri", () => {
  it("builds a Handle URI for Deposita identifiers", () => {
    expect(buildHandleUri("oai:deposita.ibict.br:deposita/635", "https://deposita.ibict.br/handle/")).toBe(
      "https://deposita.ibict.br/handle/deposita/635"
    );
  });

  it("uses the configured base URL instead of inferring protocol or path", () => {
    expect(buildHandleUri("oai:repositorio.bc.ufg.br:tede/10757", "http://repositorio.bc.ufg.br/tede/handle")).toBe(
      "http://repositorio.bc.ufg.br/tede/handle/tede/10757"
    );
  });

  it("normalizes duplicate slashes and preserves the origin", () => {
    expect(normalizeHandleBaseUrl("https://example.org//handle///")).toBe("https://example.org/handle/");
  });

  it("extracts the handle suffix after the repository identifier", () => {
    expect(extractHandleSuffix("oai:example.org:123456789/42")).toBe("123456789/42");
  });

  it("supports local OAI repository identifiers that include a port", () => {
    expect(buildHandleUri("oai:localhost:4000:123456789/268", "http://localhost:4000/handle")).toBe(
      "http://localhost:4000/handle/123456789/268"
    );
  });

  it("throws a descriptive error for malformed identifiers", () => {
    expect(() => buildHandleUri("not-an-oai", "https://example.org/handle/")).toThrow("Expected format");
  });

  it("throws when the handle suffix is missing a slash", () => {
    expect(() => buildHandleUri("oai:example.org:missingSlash", "https://example.org/handle/")).toThrow("Handle suffix must include a slash");
  });
});
