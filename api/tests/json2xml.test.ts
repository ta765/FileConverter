import { describe, it, expect } from "vitest";
import { json2xml } from "../src/formatters/json2xml";

describe("json2xml", () => {
    it("converts a simple json object to xml", () => {
        const json = JSON.stringify({ root: { name: "Alice", age: 30 } });
        const xml = json2xml(json);
        expect(xml).toContain("<name>Alice</name>");
        expect(xml).toContain("<age>30</age>");
    });

    it("handles nested objects", () => {
        const json = JSON.stringify({ company: { employee: { name: "Bob" } } });
        const xml = json2xml(json);
        expect(xml).toContain("<employee>");
        expect(xml).toContain("<name>Bob</name>");
    });

    it("throws on invalid json", () => {
        expect(() => json2xml("not json")).toThrow();
    });
});
