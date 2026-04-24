import { XMLParser } from "fast-xml-parser";
import { valueToCsv } from "./json2csv";

const parser = new XMLParser({ ignoreAttributes: true });

function prepareParsedObject(obj: Record<string, unknown>): unknown {
  const o: Record<string, unknown> = { ...obj };
  delete o["?xml"];

  const keys = Object.keys(o);
  if (keys.length <= 1) {
    return o;
  }
  for (const k of keys) {
    if (k.startsWith("?")) continue;
    const v = o[k];
    if (v && typeof v === "object" && !Array.isArray(v)) {
      return { [k]: v };
    }
  }
  return o;
}

export function xml2csv(input: string): string {
  const raw = parser.parse(input) as Record<string, unknown>;
  const forRows = prepareParsedObject(raw);
  return valueToCsv(forRows);
}
