import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser();

export function xml2json(input: string): string {
  const obj = parser.parse(input);
  return JSON.stringify(obj, null, 2);
}
