import { describe, it, expect } from "vitest";
import { json2csv } from "../src/formatters/json2csv";

describe("json2csv", () => {
    it("converts array of objects to csv", () => {
        const json = JSON.stringify([
            { a: "1", b: "2" },
            { a: "3", b: "4" }
        ]);
        const csv = json2csv(json);
        expect(csv).toContain("a");
        expect(csv).toContain("b");
        expect(csv).toContain("1");
    });

    it("flattens one nested { root: { tag: [ rows ] } } to csv rows (xml2json style)", () => {
        const json = JSON.stringify({
            invoices: {
                invoice: [
                    { id: "1", v: "x" },
                    { id: "2", v: "y" }
                ]
            }
        });
        const csv = json2csv(json);
        expect(csv).toContain("id");
        expect(csv).toContain("1");
        expect(csv).toContain("2");
    });
});
