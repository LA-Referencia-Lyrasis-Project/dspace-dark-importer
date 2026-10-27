import { describe, expect, it } from "vitest";
import { createItemsDarksCsv } from "@/lib/report";
import type { ImportReportRow } from "@/types";

const row = (status: ImportReportRow["status"], itemUuid = "item-1"): ImportReportRow => ({
  oai_identifier: "oai:example.org:123/456",
  generated_uri: "https://example.org/handle/123/456",
  dark: "dark:example",
  item_uuid: itemUuid,
  item_handle: "123/456",
  status,
  message: "test"
});

describe("createItemsDarksCsv", () => {
  it("exports only uniquely matched items", () => {
    expect(createItemsDarksCsv([row("READY FOR EXPORT"), row("NOT FOUND"), row("MULTIPLE MATCHES")])).toBe(
      "id,dc.identifier.dark\r\nitem-1,dark:example"
    );
  });
});
