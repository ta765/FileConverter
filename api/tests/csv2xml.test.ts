import { describe, it, expect } from "vitest";
import { csv2xml } from "../src/formatters/csv2xml";

describe("csv2xml", () => {
    it("wraps header rows in root/row and writes element per column", () => {
        const csv = "name,age\nAdam,30\n";
        const xml = csv2xml(csv);
        expect(xml).toContain("<root>");
        expect(xml).toContain("<row>");
        expect(xml).toContain("<name>Adam</name>");
        expect(xml).toContain("<age>30</age>");
    });

    it("emits a row per data line", () => {
        const csv = "a,b\n1,2\n3,4\n";
        const xml = csv2xml(csv);
        const rowCount = (xml.match(/<row>/g) ?? []).length;
        expect(rowCount).toBe(2);
    });

    it("throws on bad csv like json2xml throws on bad json (parse errors from Papa)", () => {
        const bad = "unclosed\n\"field";
        expect(() => csv2xml(bad)).toThrow();
    });
});
