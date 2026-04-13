import { describe, it, expect } from "vitest";
import { xml2json } from "../src/formatters/xml2json";

describe("xml2json", () => {
    it("converts xml elements", () => {
        const xml = "<root><name>Adam</name><age>30</age></root>";
        const result = JSON.parse(xml2json(xml));
        expect(result.root.name).toBe("Adam");
        expect(result.root.age).toBe(30);
    });

    it("handles nested elements", () => {
        const xml = "<company><employee><name>Adam</name></employee></company>";
        const result = JSON.parse(xml2json(xml));
        expect(result.company.employee.name).toBe("Adam");
    });

    it("outputs indented json", () => {
        const xml = "<root><name>Adam</name></root>";
        const json = xml2json(xml);
        expect(json).toContain("\n");
        expect(json).toContain("  ");
    });
});