import { describe, it, expect } from "vitest";
import { csv2json } from "../src/formatters/csv2json";

describe("csv2json", () => {
    it("converts header row to json array of objects", () => {
        const csv = "name,score\nAlice,10\nBob,20\n";
        const out = JSON.parse(csv2json(csv));
        expect(out).toEqual([
            { name: "Alice", score: "10" },
            { name: "Bob", score: "20" }
        ]);
    });
});
