import { describe, it, expect } from "vitest";
import { format } from "../src/functions/format";
import { HttpRequest, InvocationContext } from "@azure/functions";

function makeRequest(body: object): HttpRequest {
    return {
        json: async () => body
    } as unknown as HttpRequest;
}

const ctx = { error: () => {} } as unknown as InvocationContext;

describe("format handler validation", () => {
    it("rejects missing filename", async () => {
        const res = await format(makeRequest({ text: "hello", target: "json" }), ctx);
        expect(res.status).toBe(400);
        expect((res.jsonBody as { error: string }).error).toContain("filename");
    });

    it("rejects empty text", async () => {
        const res = await format(
            makeRequest({ filename: "test.xml", text: "", target: "json" }),
            ctx
        );
        expect(res.status).toBe(400);
        expect((res.jsonBody as { error: string }).error).toContain("text");
    });

    it("rejects missing or invalid target", async () => {
        const res = await format(makeRequest({ filename: "test.xml", text: "<a/>" }), ctx);
        expect(res.status).toBe(400);
        expect((res.jsonBody as { error: string }).error).toContain("target");
    });

    it("rejects oversized text", async () => {
        const big = "x".repeat(200_001);
        const res = await format(
            makeRequest({ filename: "test.xml", text: big, target: "json" }),
            ctx
        );
        expect(res.status).toBe(413);
    });

    it("rejects unsupported file type", async () => {
        const res = await format(
            makeRequest({ filename: "file.pdf", text: "data", target: "json" }),
            ctx
        );
        expect(res.status).toBe(400);
        expect((res.jsonBody as { error: string }).error).toContain("Unsupported");
    });

    it("rejects same source and target format", async () => {
        const res = await format(
            makeRequest({ filename: "a.json", text: "{}", target: "json" }),
            ctx
        );
        expect(res.status).toBe(400);
        expect((res.jsonBody as { error: string }).error).toContain("same");
    });

    it("routes .xml past validation to storage step", async () => {
        const xml = "<root><item>test</item></root>";
        const res = await format(
            makeRequest({ filename: "data.xml", text: xml, target: "json" }),
            ctx
        );
        expect(res.status).toBe(500);
        expect((res.jsonBody as { error: string }).error).toContain("FILES_STORAGE");
    });

    it("routes .json past validation to storage step", async () => {
        const json = JSON.stringify({ root: { item: "test" } });
        const res = await format(
            makeRequest({ filename: "data.json", text: json, target: "xml" }),
            ctx
        );
        expect(res.status).toBe(500);
        expect((res.jsonBody as { error: string }).error).toContain("FILES_STORAGE");
    });

    it("routes .csv past validation to storage step", async () => {
        const csv = "name,age\nAlice,30\n";
        const res = await format(
            makeRequest({ filename: "data.csv", text: csv, target: "json" }),
            ctx
        );
        expect(res.status).toBe(500);
        expect((res.jsonBody as { error: string }).error).toContain("FILES_STORAGE");
    });
});
