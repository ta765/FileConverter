import { describe, it, expect } from "vitest";
import { xml2csv } from "../src/formatters/xml2csv";

describe("xml2csv", () => {
    it("yields a column named after a single leaf when the document is a lone empty element", () => {
        const csv = xml2csv("<a/>");
        const lines = csv.trim().split(/\r?\n/);
        expect(lines[0]).toBe("a");
    });

    it("produces a tabular result for repeated child elements in one wrapper", () => {
        const xml = `
<items>
  <item><sku>A</sku><qty>1</qty></item>
  <item><sku>B</sku><qty>2</qty></item>
</items>`;
        const csv = xml2csv(xml);
        expect(csv).toContain("A");
        expect(csv).toContain("B");
        expect(csv).toMatch(/sku/);
    });
});
