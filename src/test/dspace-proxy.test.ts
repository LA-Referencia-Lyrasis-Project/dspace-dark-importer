import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/dspace/proxy/route";

describe("DSpace proxy route", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("forwards CSRF 204 responses without constructing an invalid response body", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, {
        status: 204,
        headers: {
          "DSPACE-XSRF-TOKEN": "csrf-token"
        }
      })
    );

    const request = new NextRequest("http://localhost/api/dspace/proxy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        restApiUrl: "https://gfplab.ddns.net/server",
        path: "/api/security/csrf",
        method: "GET",
        headers: {
          Accept: "application/json"
        }
      })
    });

    const response = await POST(request);

    expect(response.status).toBe(204);
    expect(response.headers.get("DSPACE-XSRF-TOKEN")).toBe("csrf-token");
    expect(await response.text()).toBe("");
  });
});
