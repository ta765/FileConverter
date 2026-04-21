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
        const res = await format(makeRequest({ text: "hello" }), ctx);
        expect(res.status).toBe(400);
        expect((res.jsonBody as any).error).toContain("filename");
    });

    it("rejects empty text", async () => {
        const res = await format(makeRequest({ filename: "test.xml", text: "" }), ctx);
        expect(res.status).toBe(400);
        expect((res.jsonBody as any).error).toContain("text");
    });

    it("rejects oversized text", async () => {
        const big = "x".repeat(200_001);
        const res = await format(makeRequest({ filename: "test.xml", text: big }), ctx);
        expect(res.status).toBe(413);
    });

    it("rejects unsupported file type", async () => {
        const res = await format(makeRequest({ filename: "file.pdf", text: "data" }), ctx);
        expect(res.status).toBe(400);
        expect((res.jsonBody as any).error).toContain("determine");
    });

    it("routes .xml files past validation to storage step", async () => {
        const xml = "<root><item>test</item></root>";
        const res = await format(makeRequest({ filename: "data.xml", text: xml }), ctx);
        expect(res.status).toBe(500);
        expect((res.jsonBody as any).error).toContain("FILES_STORAGE");
    });

    it("routes .json files past validation to storage step", async () => {
        const json = JSON.stringify({ root: { item: "test" } });
        const res = await format(makeRequest({ filename: "data.json", text: json }), ctx);
        expect(res.status).toBe(500);
        expect((res.jsonBody as any).error).toContain("FILES_STORAGE");
    });
});